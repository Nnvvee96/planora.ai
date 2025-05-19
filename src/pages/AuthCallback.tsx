/**
 * Authentication Callback Component
 * 
 * This component handles the callback from OAuth providers with proper token handling.
 * CRITICAL FIX: Completely reworked to properly handle the PKCE flow for Google Auth
 * Following the official Supabase v2 approach for handling authentication
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
      console.log('Auth callback initiated with new PKCE flow handler');
      setLoading(true);
      setError(null);

      try {
        // CRITICAL FIX: Simplify the auth flow to follow Supabase's documentation exactly
        console.log('Getting auth session state...');
        
        // First check existing session - DON'T try to get/set the session when we don't need to
        const { data: existingSession } = await supabase.auth.getSession();
        
        // If we don't have a session yet, we need to parse the URL for auth code
        if (!existingSession?.session) {
          console.log('No existing session, checking URL parameters...');
          
          // Check if we have a code in the URL (used by PKCE flow)
          const hasCode = location.search.includes('code=');
          
          if (hasCode) {
            console.log('Auth code detected in URL, proceeding with PKCE flow');
            
            // DONT manually call exchangeCodeForSession
            // Let Supabase's internal mechanisms handle this!
            // Supabase initializes and automatically handles the code exchange
          } else {
            console.error('No auth code found in URL');
            throw new Error('No authentication code found. Please try signing in again.');
          }
        } else {
          console.log('Existing session found, proceeding with user data retrieval');
        }
        
        // Wait briefly to ensure Supabase's internal code exchange completes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now get the current session (which should be established by now)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError.message);
          throw sessionError;
        }
        
        if (!sessionData?.session) {
          console.error('No session established after auth flow');
          throw new Error('Failed to establish authenticated session');
        }
        
        console.log('Session successfully established');
        
        // Get the authenticated user data
        const user = await authService.getCurrentUser() as ExtendedUser;
        if (!user) {
          console.error('No user found in session');
          throw new Error('Authentication succeeded but user data is unavailable');
        }
        
        console.log('Successfully retrieved user:', user.id);
        
        // Detect if this is a Google sign-in
        const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
        console.log('Is Google authentication:', isGoogleAuth);
        
        // Ensure user profile exists
        let profileExists = false;
        try {
          profileExists = await userProfileService.checkProfileExists(user.id);
          console.log('Profile exists check:', profileExists);
          
          if (!profileExists) {
            console.log('Creating new user profile...');
            const profileCreated = await userProfileService.ensureProfileExists(user.id);
            console.log('Profile creation result:', profileCreated);
            
            if (!profileCreated) {
              console.error('Failed to create user profile');
            }
          }
        } catch (profileError) {
          console.error('Error with profile operations:', profileError);
        }
        
        // Determine where to redirect the user
        const redirectPath = await determineRedirectPath(user);
        console.log('Redirecting user to:', redirectPath);
        
        setLoading(false);
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Authentication callback failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a delay
        setTimeout(() => navigate('/', { replace: true }), 2000);
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
