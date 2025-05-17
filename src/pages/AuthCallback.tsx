import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';

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
    avatar_url?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
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
      try {
        setLoading(true);
        console.log('Auth callback triggered', { hash: location.hash, search: location.search });

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
              // Update the user profile with Google data
              const profileData = {
                id: user.id,
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
              }
            } catch (error) {
              console.error('Failed to update profile table:', error);
              // Continue even if profile update fails
            }
          } else {
            console.error('No identity data found in Google account information');
          }
        }
        
        // Determine where to redirect
        const determineRedirect = async (user: ExtendedUser): Promise<string> => {
          console.log('Determining redirect for user:', JSON.stringify(user, null, 2));
          
          // TEMPORARY: Force all sign-ins to onboarding for debugging
          console.log('OVERRIDE: Directing all users to onboarding page');
          return '/onboarding';
          
          /*
          // Normal logic - commented out during debugging
          const hasCompletedOnboarding = user.user_metadata?.has_completed_onboarding === true;
          
          // Check if user authenticated via Google
          const isGoogleAuth = user.identities?.some(identity => identity.provider === 'google');
          const isNewUser = !localStorage.getItem('hasCompletedInitialFlow');
          
          console.log('Auth state:', { 
            isGoogleAuth, 
            isNewUser,
            hasCompletedOnboarding,
            metadata: user.user_metadata
          });
          
          // New Google users always go to onboarding
          if (isGoogleAuth && isNewUser) {
            console.log('New Google user detected, redirecting to onboarding');
            return '/onboarding';
          }
          
          // Users who completed onboarding go to dashboard
          if (hasCompletedOnboarding) {
            console.log('User has completed onboarding, redirecting to dashboard');
            return '/dashboard';
          }
          
          // Default: Send to onboarding
          console.log('User has not completed onboarding, redirecting to onboarding');
          return '/onboarding';
          */
        };
        
        const redirectPath = await determineRedirect(user);
        console.log('Redirecting user to:', redirectPath);
        
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
        navigate(redirectPath, { replace: true });
      
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
