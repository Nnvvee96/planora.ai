import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { getUserTravelPreferences } from '@/features/travel-preferences/api';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow other metadata properties from different auth providers
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
        
        // Declare user variable at this scope so it's available throughout the function
        let user: ExtendedUser | null = null;
        
        // Try to get the current user
        try {
          user = await authService.getCurrentUser() as ExtendedUser;
          
          if (!user) {
            console.log('No authenticated user found. Redirecting to login page');
            navigate('/');
            return;
          }
          
          console.log('Authentication successful, user found:', user);
        } catch (authError) {
          console.error('Error retrieving authenticated user:', authError);
          
          // Special handling for case where user was deleted from Supabase but still exists in Google
          // This happens when the user deletes their account and tries to sign up again
          if (hasAuthParams) {
            console.log('Auth parameters detected but user retrieval failed - likely a deleted user trying to sign up again');
            
            try {
              // Extract tokens from hash params
              const hashParams = new URLSearchParams(window.location.hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              
              if (accessToken && refreshToken) {
                console.log('Attempting to recreate session with OAuth tokens');
                
                // Try to use the tokens to sign in again, which should recreate the user in Supabase
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (error) {
                  console.error('Failed to recreate session:', error);
                  navigate('/');
                  return;
                }
                
                if (data?.user) {
                  console.log('Successfully recreated user session from OAuth tokens');
                  // Continue with the normal flow
                  const user = await authService.getCurrentUser() as ExtendedUser;
                  if (user) {
                    console.log('User successfully recreated:', user);
                  } else {
                    console.error('Failed to get user after recreating session');
                    navigate('/');
                    return;
                  }
                } else {
                  console.error('No user data after recreating session');
                  navigate('/');
                  return;
                }
              } else {
                console.error('Missing tokens in auth parameters');
                navigate('/');
                return;
              }
            } catch (sessionError) {
              console.error('Failed to handle deleted user case:', sessionError);
              navigate('/');
              return;
            }
          } else {
            // No auth parameters, nothing we can do
            console.error('No auth parameters available to recreate session');
            navigate('/');
            return;
          }
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
              // CRITICAL FIX: First check if a profile exists using a direct method
              // that's more resilient against RLS policy issues
              console.log('Checking if profile exists using reliable method');
              
              // First try with the count approach instead of single() to avoid the 406 error
              const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .eq('id', user.id as any);
              
              let profileExists = false;
              if (countError) {
                console.warn('Profile count check failed:', countError.message);
                // Try a different approach
              } else if (count && count > 0) {
                console.log('Profile exists check: profile found for user');
                profileExists = true;
              }
              
              // Prepare profile data from Google identity
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
              
              // If profile doesn't exist, try multiple methods to create it
              if (!profileExists) {
                console.log('No profile found. Attempting to create profile with multiple methods');
                
                // Method 1: Standard insert
                try {
                  const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                      id: user.id,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      username: profileData.username,
                      email: profileData.email,
                      first_name: profileData.first_name,
                      last_name: profileData.last_name,
                      full_name: profileData.full_name,
                      avatar_url: profileData.avatar_url
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any);
                  
                  if (!insertError) {
                    console.log('Successfully created profile (standard insert)');
                    profileExists = true;
                  } else {
                    console.warn('Standard insert failed:', insertError.message);
                  }
                } catch (e) {
                  console.warn('Exception in standard insert:', e);
                }
                
                // Method 2: Try with upsert if insert failed
                if (!profileExists) {
                  try {
                    const { error: upsertError } = await supabase
                      .from('profiles')
                      .upsert({
                        id: user.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        username: profileData.username,
                        email: profileData.email,
                        first_name: profileData.first_name,
                        last_name: profileData.last_name,
                        full_name: profileData.full_name,
                        avatar_url: profileData.avatar_url
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } as any, { onConflict: 'id' });
                    
                    if (!upsertError) {
                      console.log('Successfully created profile (upsert)');
                      profileExists = true;
                    } else {
                      console.warn('Upsert failed:', upsertError.message);
                    }
                  } catch (e) {
                    console.warn('Exception in upsert:', e);
                  }
                }
                
                // Method 3: Try REST API directly to bypass potential RLS issues
                if (!profileExists) {
                  try {
                    // Get the session token for authenticated API call
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData?.session?.access_token) {
                      const response = await fetch(`${window.location.origin}/api/create-profile`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          profileData: {
                            id: user.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            username: profileData.username,
                            email: profileData.email,
                            first_name: profileData.first_name,
                            last_name: profileData.last_name,
                            full_name: profileData.full_name,
                            avatar_url: profileData.avatar_url
                          },
                          token: sessionData.session.access_token
                        })
                      });
                      
                      if (response.ok) {
                        console.log('Successfully created profile (with API endpoint)');
                        profileExists = true;
                      } else {
                        console.warn('API endpoint approach failed:', await response.text());
                      }
                    }
                  } catch (e) {
                    console.warn('Exception in API endpoint approach:', e);
                  }
                }
              }
              
              // Update metadata regardless of profile creation result to avoid endless loop
              try {
                await authService.updateUserMetadata({
                  has_profile_created: true,
                  profile_created_at: new Date().toISOString()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as Record<string, any>);
                console.log('Updated user metadata with profile creation status');
              } catch (metadataError) {
                console.error('Failed to update user metadata:', metadataError);
              }
              
              if (profileExists) {
                console.log('Profile exists, updating with Google data');
                const profileResult = await userProfileService.updateUserProfile(user.id, profileData);
                  
                if (!profileResult) {
                  console.error('Error updating profile with Google data');
                } else {
                  console.log('Successfully updated profile with Google data');
                }
              } else {
                console.error('Failed to ensure profile exists after multiple attempts - this is a critical issue');
                // Continue despite error - we'll try again on next login
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
            let hasCompletedOnboardingInMetadata = user.user_metadata?.has_completed_onboarding === true;
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
            
            // Enhanced logging to debug onboarding redirection issue
            console.log('%c CRITICAL DEBUG - Onboarding Status Check', 'background: #ff0000; color: white; font-size: 20px;');
            console.log('Onboarding status check:', {
              isGoogleAuth,
              email: user.email,
              hasCompletedInitialFlow,
              hasCompletedOnboardingInMetadata,
              hasProfileCreated,
              hasProfileInDatabase,
              user_metadata: user.user_metadata,
              localStorage_hasCompletedInitialFlow: localStorage.getItem('hasCompletedInitialFlow')
            });
            
            // Check travel preferences and use them for onboarding decision
            let hasTravelPreferences = false;
            try {
              const travelPreferences = await getUserTravelPreferences(user.id);
              hasTravelPreferences = !!travelPreferences;
              console.log('Travel preferences check:', hasTravelPreferences ? 'Found preferences' : 'No preferences found');
              if (travelPreferences) {
                console.log('Travel preferences details:', JSON.stringify(travelPreferences, null, 2));
              }
            } catch (travelPrefsError) {
              console.error('Error checking travel preferences:', travelPrefsError);
            }
            
            // CRITICAL FIX: For Google Sign-In users, we implement a more aggressive approach
            // This is designed to break the onboarding loop for Google users
            if (isGoogleAuth) {
              console.log('🔍 GOOGLE AUTH DETECTED - Special handling for Google Sign-In');
              
              // First, check if we have travel preferences - strongest indicator of completed onboarding
              if (hasTravelPreferences) {
                console.log('✅ Google user has travel preferences - directing to dashboard');
                
                // Fix metadata and profile
                try {
                  // Update onboarding status in metadata if needed
                  if (!hasCompletedOnboardingInMetadata) {
                    console.log('Fixing metadata - updating onboarding flag');
                    await authService.updateUserMetadata({
                      has_completed_onboarding: true
                    });
                    hasCompletedOnboardingInMetadata = true;
                  }
                  
                  // Ensure profile exists
                  if (!hasProfileInDatabase) {
                    console.log('Creating profile for user with travel preferences');
                    await userProfileService.ensureProfileExists(user.id);
                    hasProfileInDatabase = true;
                  }
                  
                  // Always set localStorage flag
                  localStorage.setItem('hasCompletedInitialFlow', 'true');
                  
                  console.log('⭐ PROFILE EXISTS + PREFERENCES - Redirecting to dashboard');
                  return '/dashboard';
                } catch (error) {
                  console.error('Error fixing user state, but continuing to dashboard:', error);
                  // Still redirect to dashboard even with errors
                  localStorage.setItem('hasCompletedInitialFlow', 'true');
                  return '/dashboard';
                }
              }
              
              // Next, check if the user has a profile in the database
              if (hasProfileInDatabase) {
                console.log('✅ Google user has profile in database - directing to dashboard');
                
                try {
                  // Update onboarding status in metadata if needed
                  if (!hasCompletedOnboardingInMetadata) {
                    await authService.updateUserMetadata({
                      has_completed_onboarding: true
                    });
                  }
                  
                  // Set localStorage flag
                  localStorage.setItem('hasCompletedInitialFlow', 'true');
                  
                  return '/dashboard';
                } catch (error) {
                  console.error('Error updating metadata, but continuing to dashboard:', error);
                  // Still redirect to dashboard
                  localStorage.setItem('hasCompletedInitialFlow', 'true');
                  return '/dashboard';
                }
              }
              
              // If user has onboarding metadata flag but no profile, create profile
              if (hasCompletedOnboardingInMetadata) {
                console.log('✅ User has completed onboarding in metadata - creating profile');
                
                try {
                  await userProfileService.ensureProfileExists(user.id);
                  localStorage.setItem('hasCompletedInitialFlow', 'true');
                  return '/dashboard';
                } catch (error) {
                  console.error('Failed to create profile despite metadata flags:', error);
                  // Fall through to onboarding only if we failed to create a profile
                }
              }
              
              // If we reach here, user is probably new or has incomplete data
              // We'll proceed to onboarding to collect necessary information
              console.log('⚠️ Google user needs to complete onboarding - proceeding to onboarding flow');
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
