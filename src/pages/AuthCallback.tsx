/**
 * Authentication Callback Component
 * 
 * This component handles the callback from various authentication flows:
 * - OAuth providers (Google, Apple)
 * - Email verification
 * - Password reset
 * 
 * It determines where to redirect users based on their authentication state
 * and ensures profiles are properly created and maintained.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { getUserTravelPreferences, checkTravelPreferencesExist } from '@/features/travel-preferences/api';
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
      try {
        // Check for auth parameters in URL
        const hasAuthParams = location.hash || location.search.includes('access_token') || location.search.includes('refresh_token');
        console.log('Auth callback start, hasAuthParams:', hasAuthParams, 'hash:', location.hash);
        
        setLoading(true);
        setError(null);
        
        // Step 1: Process auth callback data (crucial for Google OAuth)
        if (location.hash) {
          console.log('Processing hash parameters from OAuth provider');
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              console.error('Error getting session from hash:', error.message);
              throw error;
            }
            console.log('Successfully retrieved session from hash');
          } catch (hashError) {
            console.error('Error processing auth hash:', hashError);
            // Don't exit here, try to continue with the flow
          }
        }
        
        // Step 2: Verify the user is authenticated
        let user: ExtendedUser | null = null;
        
        try {
          // First, get the current user session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            console.error('No active session found');
            throw new Error('No active session');
          }
          
          // Then get the current user
          user = await authService.getCurrentUser() as ExtendedUser;
          
          if (!user) {
            console.error('No authenticated user found');
            throw new Error('No authenticated user');
          }
          
          console.log('Successfully retrieved authenticated user:', user.id, user.email);
        } catch (authError) {
          console.error('Error retrieving authenticated user:', authError);
          
          // Special handling for case where user was deleted from Supabase but still exists in Google
          if (hasAuthParams) {
            console.log('Handling potential deleted user case (auth params present but no user)');
            
            try {
              // Extract tokens from hash params
              const hashParams = new URLSearchParams(window.location.hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              
              if (accessToken && refreshToken) {
                console.log('Found OAuth tokens, attempting to recreate session');
                
                // Try to establish a new session with the tokens
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (error) {
                  console.error('Failed to recreate session with tokens:', error);
                  throw error;
                }
                
                if (data?.user) {
                  console.log('Successfully recreated user session:', data.user.id);
                  user = await authService.getCurrentUser() as ExtendedUser;
                  
                  if (!user) {
                    console.error('User recreation succeeded but getCurrentUser failed');
                    throw new Error('User recreation succeeded but getCurrentUser failed');
                  }
                } else {
                  console.error('Session recreation succeeded but no user data returned');
                  throw new Error('No user data after session recreation');
                }
              } else {
                console.error('Auth params present but no OAuth tokens found');
                throw new Error('Missing OAuth tokens');
              }
            } catch (recreationError) {
              console.error('Failed to handle deleted user case:', recreationError);
              setError('Authentication failed. Please try again.');
              setLoading(false);
              
              // Redirect to login after a brief delay
              setTimeout(() => navigate('/', { replace: true }), 2000);
              return;
            }
          } else {
            console.error('Authentication failed and no auth parameters to recover with');
            setError('Authentication failed. Please try again.');
            setLoading(false);
            
            // Redirect to login
            setTimeout(() => navigate('/', { replace: true }), 2000);
            return;
          }
        }
        
        // Step 3: Process user data and determine redirect path
        if (!user) {
          console.error('Critical error: User still null after all recovery attempts');
          setError('Authentication failed. Please try again.');
          setLoading(false);
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }
        
        console.log('Processing authenticated user:', user.id, user.email);
        
        // Detect if this is a Google sign-in
        const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
        console.log('Is Google authentication:', isGoogleAuth);
        
        if (isGoogleAuth) {
          const googleIdentity = user.identities?.find(identity => identity.provider === 'google');
          const identityData = googleIdentity?.identity_data;
          console.log('Google identity data available:', !!identityData);
          
          // Step 4: Ensure user profile exists
          try {
            // Check if profile exists
            const profileExists = await userProfileService.checkProfileExists(user.id);
            console.log('Profile exists check:', profileExists);
            
            if (!profileExists) {
              console.log('Profile does not exist, creating new profile');
              
              // Try to create profile with retry logic
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
        
        // Step 5: Determine where to redirect the user
        const redirectPath = await determineRedirectPath(user);
        console.log('Final redirect destination:', redirectPath);
        
        // Step 6: Perform the redirect
        setLoading(false);
        console.log(`Redirecting to: ${redirectPath}`);
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      } catch (finalError) {
        console.error('Unhandled auth callback error:', finalError);
        const errorMessage = finalError instanceof Error ? finalError.message : 'Authentication failed';
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };
    
    /**
     * Determines where to redirect the user after authentication
     * Simplified logic to reliably route users to the correct destination
     * 
     * @param user The authenticated user
     * @returns The path to redirect to
     */
    async function determineRedirectPath(user: ExtendedUser): Promise<string> {
      try {
        console.log('Determining redirect destination for user:', user.id, user.email);
        
        // STEP 1: Check if this is a Google sign-in
        const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
        
        // STEP 2: Check all possible indicators of user state
        const userMetadata = user.user_metadata || {};
        const hasCompletedOnboardingInMetadata = userMetadata.has_completed_onboarding === true;
        const hasCompletedInitialFlow = localStorage.getItem('hasCompletedInitialFlow') === 'true';
        
        // STEP 3: Check if profile exists in database (most reliable indicator)
        let hasProfileInDatabase = false;
        try {
          hasProfileInDatabase = await userProfileService.checkProfileExists(user.id);
        } catch (error) {
          console.error('Error checking profile existence:', error);
          // If we can't check, try to create one anyway to be safe
          await userProfileService.ensureProfileExists(user.id);
        }
        
        // STEP 4: Check for travel preferences (strongest indicator of completed onboarding)
        let hasTravelPreferences = false;
        try {
          // Use imported function directly, following Planora's architectural principles
          hasTravelPreferences = await checkTravelPreferencesExist(user.id);
        } catch (error) {
          console.error('Error checking travel preferences:', error);
        }
        
        // Log current state for debugging
        console.log('User state analysis:', {
          userId: user.id,
          email: user.email,
          isGoogleAuth,
          hasCompletedOnboardingInMetadata,
          hasCompletedInitialFlow,
          hasProfileInDatabase,
          hasTravelPreferences,
          timestamps: {
            googleAuthStarted: localStorage.getItem('googleAuthStarted'),
            now: Date.now()
          }
        });
        
        // STEP 5: Apply decision logic with priority order
        
        // CASE 1: User is fully onboarded - has travel preferences
        if (hasTravelPreferences) {
          console.log('User has travel preferences - directing to dashboard');
          
          // Ensure state consistency
          localStorage.setItem('hasCompletedInitialFlow', 'true');
          if (!hasCompletedOnboardingInMetadata) {
            await authService.updateUserMetadata({ has_completed_onboarding: true });
          }
          
          return '/dashboard';
        }
        
        // CASE 2: User has profile but hasn't completed onboarding with preferences
        if (hasProfileInDatabase) {
          console.log('User has profile but no preferences - ');
          
          // For existing users - go to dashboard
          if (hasCompletedOnboardingInMetadata || hasCompletedInitialFlow) {
            localStorage.setItem('hasCompletedInitialFlow', 'true');
            return '/dashboard';
          }
          
          // For new users with just a profile - go to onboarding
          return '/onboarding';
        }
        
        // CASE 3: Google user with first sign-in (special case)
        if (isGoogleAuth && !hasProfileInDatabase && !hasCompletedInitialFlow) {
          console.log('New Google user detected - creating profile and directing to onboarding');
          
          // Create profile for new Google user
          try {
            await userProfileService.ensureProfileExists(user.id);
          } catch (createError) {
            console.error('Error creating profile for new Google user:', createError);
          }
          
          return '/onboarding';
        }
        
        // CASE 4: Default for questionable states - cautiously direct to onboarding
        console.log('Unrecognized user state - directing to onboarding for safety');
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
