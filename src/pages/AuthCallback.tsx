import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@/features/auth/api';

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
    // This function determines where to redirect the user based on their authentication state
    const determineRedirect = async (user: any): Promise<string> => {
      // Check if the user has completed onboarding
      const hasCompletedOnboarding = user.user_metadata?.has_completed_onboarding === true;
      
      // If user has completed onboarding, redirect to dashboard
      if (hasCompletedOnboarding) {
        return '/dashboard';
      }
      
      // For new users (who haven't completed onboarding), redirect to onboarding
      return '/onboarding';
    };
    
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log('Auth callback triggered', { hash: location.hash, search: location.search });

        // For simplicity and consistency, let's always check for the current user
        const { data, error } = await supabase.auth.getUser();
        
        // If we couldn't get the user data, we have no authentication
        if (error || !data?.user) {
          console.log('No authenticated user found', error);
          throw new Error('Authentication failed or no user found');
        }

        console.log('Authentication successful, user:', data.user);
        
        // For users authenticating with Google, ensure we extract and store their profile information
        if (data.user.app_metadata?.provider === 'google') {
          // Extract identities information from Google
          const identities = data.user.identities || [];
          const googleIdentity = identities.find((identity: any) => identity.provider === 'google');
          
          if (googleIdentity?.identity_data) {
            const identityData = googleIdentity.identity_data;
            console.log('Google identity data:', identityData);
            
            // Log the full identity data for debugging
            console.log('Full Google identity data:', JSON.stringify(identityData, null, 2));
            
            // Extract name parts from Google identity data with careful handling
            // Google sometimes puts full name in 'name' but not always in 'given_name/family_name'
            let firstName = '', lastName = '';
            
            // Try to get names from specific fields first
            if (identityData.given_name) {
              firstName = identityData.given_name;
            }
            
            if (identityData.family_name) {
              lastName = identityData.family_name;
            }
            
            // If either is missing, try to extract from full name
            if ((!firstName || !lastName) && identityData.name) {
              const nameParts = identityData.name.split(' ');
              if (nameParts.length > 0 && !firstName) {
                firstName = nameParts[0];
              }
              if (nameParts.length > 1 && !lastName) {
                lastName = nameParts.slice(1).join(' ');
              }
            }
            
            // If we still don't have a name, use email as a fallback
            if (!firstName && identityData.email) {
              firstName = identityData.email.split('@')[0];
            }
            
            console.log(`Extracted name parts: firstName='${firstName}', lastName='${lastName}'`);
            
            // Prepare user metadata with Google profile information
            const userMetadata = {
              // Ensure onboarding flag is set for new users
              has_completed_onboarding: data.user.user_metadata?.has_completed_onboarding || false,
              
              // Use extracted Google profile data
              first_name: firstName,
              last_name: lastName,
              full_name: identityData.name || `${firstName} ${lastName}`.trim(),
              avatar_url: identityData.picture || identityData.avatar_url || '',
              
              // Email and location if available
              email: data.user.email || identityData.email || '',
              location: identityData.locale || '',
              
              // Demographics if available (like birthdate)
              birthdate: identityData.birthdate || ''
            };
            
            console.log('Updating user metadata with Google profile:', userMetadata);
            
            // Update the user metadata
            const { error: updateError } = await supabase.auth.updateUser({
              data: userMetadata
            });
            
            if (updateError) {
              console.error('Error updating user metadata:', updateError);
            }
            
            // Also update the profiles table to ensure consistency
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: data.user.id,
                    username: identityData.email?.split('@')[0] || '',
                    first_name: firstName,
                    last_name: lastName,
                    full_name: identityData.name || `${firstName} ${lastName}`.trim(),
                    email: identityData.email || data.user.email,
                    birthdate: identityData.birthdate || '',
                    city: identityData.locale?.split('_')[1] || '',
                    country: identityData.locale?.split('_')[0] || '',
                    avatar_url: identityData.picture || '',
                    updated_at: new Date().toISOString()
                  }
                ], { onConflict: 'id' });
                
              if (profileError) {
                console.error('Error updating profile with Google data:', profileError);
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
        
        // Determine where to redirect based on user state
        const redirectPath = await determineRedirect(data.user);
        console.log('Redirecting user to:', redirectPath);
        
        // Handle query parameters for special flows like password reset
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
        
        // Complete the authentication process
        setLoading(false);
        navigate(redirectPath, { replace: true });
      
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || 'Authentication failed');
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

export default AuthCallback;
