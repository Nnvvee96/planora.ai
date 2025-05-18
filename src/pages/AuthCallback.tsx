import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
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
      [key: string]: string | number | boolean | undefined;
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
    [key: string]: any; // Allow other metadata properties
  };
}

/**
 * Auth Callback Page
 * 
 * This page handles authentication callbacks from Supabase for:
 * - Email verification
 * - OAuth provider redirects (Google)
 * - Password reset flows
 */
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if URL has auth hash parameters (direct redirect from Google)
      const hasAuthParams = window.location.hash && window.location.hash.includes('access_token');
      try {
        setLoading(true);
        console.log('Auth callback triggered', { hash: location.hash, search: location.search, hasAuthParams });
        
        // If we have auth params in URL hash, process them first
        if (hasAuthParams) {
          console.log('Processing auth parameters from URL hash');
          // Use the current hash to set the session
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            try {
              // Set the session using the access token
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || '',
              });
              
              if (error) {
                console.error('Error setting session from URL hash:', error);
              } else if (data) {
                console.log('Successfully set session from URL hash');
              }
            } catch (error) {
              console.error('Error processing auth hash:', error);
            }
          }
        }
        
        // Get the current user
        const user = await authService.getCurrentUser() as ExtendedUser;
        
        if (!user) {
          console.log('No authenticated user found');
          throw new Error('Authentication failed or no user found');
        }

        console.log('Authentication successful, user:', user);
        
        // Process Google sign-in data if present
        if (user.identities?.some(identity => identity.provider === 'google')) {
          console.log('Processing Google authentication data');
          
          const googleIdentity = user.identities.find(identity => identity.provider === 'google');
          
          if (googleIdentity?.identity_data) {
            const identityData = googleIdentity.identity_data;
            console.log('Google identity data:', identityData);
            
            const userMetadata = user.user_metadata || {};
            
            try {
              // CRITICAL FIX: First ensure a profile exists for this user
              // This will create a minimal profile if one doesn't exist yet
              console.log('Ensuring profile exists before updating with Google data');
              const profileExists = await userProfileService.ensureProfileExists(user.id);
              
              if (profileExists) {
                console.log('Profile exists or was created successfully, proceeding with update');
                
                // Now update the profile with Google data
                const profileData = {
                  username: userMetadata.username || identityData.name?.toLowerCase().replace(/\s+/g, '') || '',
                  first_name: userMetadata.first_name || identityData.given_name || '',
                  last_name: userMetadata.last_name || identityData.family_name || '',
                  full_name: userMetadata.full_name || identityData.name || '',
                  email: userMetadata.email || user.email || identityData.email || '',
                  birthdate: identityData.birthdate || '',
                  city: identityData.locale?.split('_')[1] || '',
                  country: identityData.locale?.split('_')[0] || '',
                  avatar_url: typeof userMetadata.avatar_url === 'string' ? userMetadata.avatar_url : '',
                  updated_at: new Date().toISOString()
                };
                
                const profileResult = await userProfileService.updateUserProfile(user.id, profileData);
                  
                if (!profileResult) {
                  console.error('Error updating profile with Google data');
                } else {
                  console.log('Successfully updated profile with Google data');
                  
                  // Also update the user metadata to indicate profile has been created
                  await authService.updateUserMetadata({
                    has_profile_created: true,
                    profile_created_at: new Date().toISOString()
                  } as Record<string, any>); // Use type assertion to avoid errors
                }
              } else {
                console.error('Failed to ensure profile exists - this is a critical issue');
              }
            } catch (error) {
              console.error('Failed to update profile table:', error);
              // Continue even if profile update fails
            }
          } else {
            console.error('No identity data found in Google account information');
          }
        }
                // This function determines where to redirect the user based on their authentication state
        const determineRedirect = async (user: ExtendedUser): Promise<string> => {
          console.log('Determining redirect for user:', JSON.stringify(user, null, 2));
          
          try {
            // First, check if this is a Google sign-in
            const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
            
            // Check both Supabase metadata and localStorage
            const hasCompletedInitialFlow = localStorage.getItem('hasCompletedInitialFlow') === 'true';
            const hasCompletedOnboardingInMetadata = user.user_metadata?.has_completed_onboarding === true;
            const hasProfileCreated = user.user_metadata?.has_profile_created === true;
            
            // Check directly if a profile exists in the database
            let hasProfileInDatabase = false;
            try {
              const profile = await userProfileService.getUserProfile(user.id);
              hasProfileInDatabase = !!profile;
              console.log('Profile database check result:', hasProfileInDatabase ? 'Found profile' : 'No profile found');
            } catch (profileError) {
              console.error('Error checking profile in database:', profileError);
            }
            
            console.log('Onboarding status check:', {
              isGoogleAuth,
              email: user.email,
              hasCompletedInitialFlow,
              hasCompletedOnboardingInMetadata,
              hasProfileCreated,
              hasProfileInDatabase
            });
            
            // If we have completed onboarding according to metadata but no profile, force profile creation
            if (isGoogleAuth && hasCompletedOnboardingInMetadata && !hasProfileInDatabase) {
              console.log('User has completed onboarding but has no profile. Creating profile now.');
              await userProfileService.ensureProfileExists(user.id);
              
              // Recheck if profile exists now
              try {
                const profile = await userProfileService.getUserProfile(user.id);
                hasProfileInDatabase = !!profile;
              } catch (recheckError) {
                console.log('Error rechecking profile after creation:', recheckError);
              }
            }
            
            // IMPORTANT: For Google sign-in, we prioritize the Supabase metadata over localStorage
            // This fixes the cross-domain issue where localStorage is empty but user exists in Supabase
            // We also ensure a profile exists before sending to dashboard
            if (isGoogleAuth && hasCompletedOnboardingInMetadata && hasProfileInDatabase) {
              console.log('Google user has completed onboarding according to Supabase - directing to dashboard');
              
              // Sync localStorage with Supabase metadata
              localStorage.setItem('hasCompletedInitialFlow', 'true');
              console.log('Set hasCompletedInitialFlow in localStorage to true');
              return '/dashboard';
            }
            
            // For non-Google auth or if user has completed onboarding according to localStorage
            if (hasCompletedInitialFlow) {
              console.log('User has completed onboarding according to localStorage - directing to dashboard');
              
              // Sync the Supabase metadata if it doesn't match localStorage
              if (!hasCompletedOnboardingInMetadata) {
                console.log('Syncing Supabase metadata with localStorage (completed onboarding)');
                await authService.updateUserMetadata({
                  has_completed_onboarding: true
                });
              }
              
              return '/dashboard';
            }
            
            // Force reset for test account if needed
            // Uncomment this block to force specific test accounts to go through onboarding again
            /*
            if (user.email === 'navyug.singh1996@gmail.com' && isGoogleAuth) {
              console.log('Detected test account - forcing onboarding');
              localStorage.removeItem('hasCompletedInitialFlow');
              await authService.resetOnboardingStatus(user.id);
              return '/onboarding';
            }
            */
            
            // New users or users who haven't completed onboarding
            console.log('User needs to complete onboarding');
            return '/onboarding';
          } catch (error) {
            console.error('Error determining redirect:', error);
            // Default to onboarding if anything goes wrong
            return '/onboarding';
          }
        };
        
        const redirectPath = await determineRedirect(user);
        console.log('AuthCallback: Determined redirect path:', redirectPath);
        
        // Force log the user state to help with debugging
        console.log('User state before redirect:', {
          id: user.id,
          email: user.email,
          hasCompletedOnboardingInMetadata: user.user_metadata?.has_completed_onboarding === true,
          hasCompletedInitialFlow: localStorage.getItem('hasCompletedInitialFlow') === 'true'
        });
        
        // Check for special cases (password reset, etc.)
        if (location.search) {
          const params = new URLSearchParams(location.search);
          const type = params.get('type');
          
          if (type === 'recovery') {
            // Password reset flow
            setLoading(false);
            navigate('/reset-password', { replace: true });
            return;
          }
        }
        
        // Perform the redirect
        setLoading(false);
        console.log(`Redirecting to: ${redirectPath}`);
        
        // Ensure the redirect happens with a slight delay to allow console logs to be visible
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      
      } catch (error) {
        console.error('Auth callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-planora-purple-dark p-4 text-center">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-planora-accent-purple border-t-transparent"></div>
          <h2 className="mt-6 text-xl font-semibold text-white">Completing authentication...</h2>
          <p className="mt-2 text-sm text-white/70">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-planora-purple-dark p-4 text-center">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-white">Authentication Failed</h2>
          <p className="mt-2 text-sm text-white/70">{error}</p>
          <p className="mt-4 text-sm text-white/50">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export { AuthCallback };
