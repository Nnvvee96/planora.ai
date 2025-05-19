/**
 * Authentication Callback Component
 * 
 * This component handles the callback from OAuth providers with proper token handling.
 * It focuses on resolving the critical Google Auth flow issues by correctly
 * parsing and managing authentication tokens.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { checkTravelPreferencesExist } from '@/features/travel-preferences/api';
import { supabase } from '@/lib/supabase/supabaseClient';

// Extended User type for auth callback handling
interface ExtendedUser {
  id: string;
  email?: string;
  provider?: string;
  avatarUrl?: string;
  identities?: Array<{
    provider: string;
    identity_data?: {
      name?: string;
      given_name?: string;
      family_name?: string;
      email?: string;
      locale?: string;
      birthdate?: string;
      [key: string]: string | number | boolean | null | undefined;
    };
  }>;
  user_metadata?: {
    has_completed_onboarding?: boolean;
    has_profile_created?: boolean;
    profile_created_at?: string;
    avatar_url?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

/**
 * Auth Callback Component
 * Handles redirects from authentication providers and determines where to send the user
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async (): Promise<void> => {
      console.log('Auth callback initiated');
      setLoading(true);
      setError(null);

      try {
        // CRITICAL FIX: Use Supabase's built-in URL parser to extract auth data 
        // This method correctly handles code exchange for OAuth flows
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // If we already have a session, we can skip code exchange
        if (sessionData?.session) {
          console.log('Existing session found, skipping code exchange');
        } 
        // Otherwise try to exchange code in URL for a session
        else {
          console.log('No existing session, checking URL for auth code');
          
          // Check if this is a callback with code or tokens
          const hasAuthParams = location.hash || 
                              location.search.includes('code=') || 
                              location.search.includes('access_token') || 
                              location.search.includes('refresh_token');
                              
          if (hasAuthParams) {
            console.log('Auth parameters detected in URL:', { 
              hasHash: !!location.hash, 
              hasSearch: !!location.search
            });
            
            try {
              // CRITICAL FIX: Use Supabase's exchangeCodeForSession method to handle the OAuth code
              const { data, error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
              );
                
              if (error) {
                console.error('Error exchanging code for session:', error.message);
                throw error;
              }
                  
              if (!data?.session) {
                console.error('No session returned from code exchange');
                throw new Error('Authentication failed: No session created');
              }
                
              console.log('Successfully exchanged code for session');
            } catch (exchangeError) {
              console.error('Failed during code exchange:', exchangeError);
              setError('Authentication failed. Please try again.');
              setLoading(false);
              
              // Redirect to login after a delay
              setTimeout(() => navigate('/', { replace: true }), 3000);
              return;
            }
          } else {
            console.error('No auth parameters found in URL');
            setError('Authentication failed. No auth parameters found.');
            setLoading(false);
            
            // Redirect to login after a delay
            setTimeout(() => navigate('/', { replace: true }), 3000);
            return;
          }
        }
        
        // At this point, we should have a valid session
        // Refresh the session to make sure we have the latest data
        const { data: refreshData } = await supabase.auth.getSession();
        if (!refreshData?.session) {
          console.error('No session found after code exchange');
          throw new Error('No session found after authentication');
        }
        
        // Get the user data
        const user = await authService.getCurrentUser() as ExtendedUser;
        if (!user) {
          console.error('No user found in session');
          throw new Error('Authentication failed: Unable to retrieve user data');
        }
        
        console.log('Successfully retrieved user:', user.id, user.email);
        
        // Detect if this is a Google sign-in and ensure profile exists
        const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
        console.log('Is Google authentication:', isGoogleAuth);
        
        if (isGoogleAuth) {
          try {
            // Check if profile exists
            const profileExists = await userProfileService.checkProfileExists(user.id);
            console.log('Profile exists check:', profileExists);
            
            if (!profileExists) {
              console.log('Profile does not exist, creating new profile');
              
              // Create profile with retry logic
              const profileCreated = await userProfileService.ensureProfileExists(user.id);
              console.log('Profile creation result:', profileCreated);
              
              if (!profileCreated) {
                console.error('Failed to create profile after retries');
              }
            }
          } catch (profileError) {
            console.error('Error checking/creating profile:', profileError);
            // Continue with the flow even if profile creation fails
          }
        }
        
        // Determine where to redirect the user
        const redirectPath = await determineRedirectPath(user);
        console.log('Final redirect destination:', redirectPath);
        
        setLoading(false);
        
        // Redirect to the appropriate page
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      } catch (finalError) {
        const errorMessage = finalError instanceof Error ? finalError.message : 'Authentication failed';
        console.error('Auth callback error:', finalError);
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };
    
    /**
     * Determines where to redirect the user after authentication
     * 
     * @param user The authenticated user
     * @returns The path to redirect to
     */
    async function determineRedirectPath(user: ExtendedUser): Promise<string> {
      try {
        console.log('Determining redirect destination for user:', user.id, user.email);
        
        // Check all indicators of user state
        const userMetadata = user.user_metadata || {};
        const hasCompletedOnboardingInMetadata = userMetadata.has_completed_onboarding === true;
        const hasCompletedInitialFlow = localStorage.getItem('hasCompletedInitialFlow') === 'true';
        
        // Check if profile exists in database
        let hasProfileInDatabase = false;
        try {
          hasProfileInDatabase = await userProfileService.checkProfileExists(user.id);
        } catch (error) {
          console.error('Error checking profile existence:', error);
          // If we can't check, try to create one anyway to be safe
          await userProfileService.ensureProfileExists(user.id);
        }
        
        // Check for travel preferences
        let hasTravelPreferences = false;
        try {
          hasTravelPreferences = await checkTravelPreferencesExist(user.id);
        } catch (error) {
          console.error('Error checking travel preferences:', error);
        }
        
        // Log current state
        console.log('User state analysis:', {
          userId: user.id,
          email: user.email,
          hasCompletedOnboardingInMetadata,
          hasCompletedInitialFlow,
          hasProfileInDatabase,
          hasTravelPreferences
        });
        
        // Apply decision logic with priority order
        
        // CASE 1: User has travel preferences - fully onboarded
        if (hasTravelPreferences) {
          console.log('User has travel preferences - directing to dashboard');
          localStorage.setItem('hasCompletedInitialFlow', 'true');
          
          if (!hasCompletedOnboardingInMetadata) {
            await authService.updateUserMetadata({ has_completed_onboarding: true });
          }
          
          return '/dashboard';
        }
        
        // CASE 2: User has profile but no preferences
        if (hasProfileInDatabase) {
          console.log('User has profile but no preferences');
          
          // For existing users with onboarding flag - go to dashboard
          if (hasCompletedOnboardingInMetadata || hasCompletedInitialFlow) {
            localStorage.setItem('hasCompletedInitialFlow', 'true');
            return '/dashboard';
          }
          
          // For new users with just a profile - go to onboarding
          return '/onboarding';
        }
        
        // CASE 3: New user (especially Google users)
        console.log('New user detected - directing to onboarding');
        
        // Try to create profile for new user
        try {
          await userProfileService.ensureProfileExists(user.id);
        } catch (createError) {
          console.error('Error creating profile for new user:', createError);
        }
        
        return '/onboarding';
      } catch (error) {
        console.error('Error determining redirect path:', error);
        // Default to onboarding on any error
        return '/onboarding';
      }
    }

    handleAuthCallback();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 bg-planora-purple-dark">
      {loading ? (
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-planora-accent-purple border-t-transparent"></div>
          <h2 className="mt-6 text-xl font-semibold text-white">Authenticating...</h2>
          <p className="mt-2 text-sm text-white/70">Please wait while we verify your credentials.</p>
        </div>
      ) : error ? (
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <p className="text-xl font-semibold text-red-400">{error}</p>
          <p className="mt-2 text-sm text-white/70">Redirecting to login...</p>
        </div>
      ) : null}
    </div>
  );
};

export { AuthCallback };
