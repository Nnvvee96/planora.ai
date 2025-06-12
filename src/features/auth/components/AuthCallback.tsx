/**
 * Auth Callback Component
 * 
 * Component to handle OAuth callback.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { UserRegistrationStatus } from '../types/authTypes';
import { AuthRedirect } from './AuthRedirect';
import { googleAuthHelper } from '../helpers/googleAuthHelper';
import { supabase } from '../services/supabaseClient';
// Import service directly to avoid circular dependency
import { supabaseAuthService } from '../services/supabaseAuthService';

/**
 * Component that handles OAuth callback
 * Displays a loading state while processing the auth callback
 */
export const AuthCallback: React.FC = () => {
  const { handleAuthCallback } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState('Processing your sign-in...');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Auth callback component mounted, processing...');
        setIsProcessing(true);
        
        // Gather debug info
        const envInfo = {
          isProd: import.meta.env.PROD,
          isDev: import.meta.env.DEV,
          mode: import.meta.env.MODE,
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
        };
        setDebugInfo(envInfo);
        console.log('Auth env debug:', envInfo);
        
        // Clean up any auth flow tracking from localStorage
        const authFlowStarted = localStorage.getItem('auth_flow_started');
        if (authFlowStarted) {
          console.log('Auth flow was previously started, cleaning up tracking data');
          localStorage.removeItem('auth_flow_started');
          localStorage.removeItem('auth_flow_timestamp');
        }
        
        // Extract auth data from URL and detect email verification redirects
        const accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
        const refreshToken = new URLSearchParams(window.location.hash.substring(1)).get('refresh_token');
        
        // Check for Supabase email verification token types
        const emailVerificationToken = 
          new URLSearchParams(window.location.search).get('token') || 
          new URLSearchParams(window.location.search).get('confirmation_token') || 
          new URLSearchParams(window.location.search).get('t');
        
        // Check if this is an email verification redirect
        const isEmailVerification = !!emailVerificationToken &&
          (window.location.search.includes('type=signup') || 
           window.location.search.includes('type=email'));
            
        // Check if we have a complete hash-based auth response
        const hasHashAuth = accessToken && refreshToken;
        
        // Check for error patterns in URL
        const hasAuthError = window.location.search.includes('error=') || 
                           window.location.hash.includes('error=');
        
        const hasDbError = window.location.search.includes('error_description=Database+error+saving+new+user') ||
                         window.location.hash.includes('error_description=Database+error+saving+new+user');
        
        console.log('Auth callback analysis:', { 
          hasHashAuth, 
          hasAuthError, 
          hasDbError,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          isEmailVerification,
          hasEmailVerificationToken: !!emailVerificationToken
        });
        
        // If this is an email verification redirect, handle it explicitly
        if (isEmailVerification && emailVerificationToken) {
          console.log('Handling email verification redirect with token');
          try {
            // Use service directly to avoid circular dependency
            const success = await supabaseAuthService.verifyEmail(emailVerificationToken);
            
            if (success) {
              console.log('Email verification successful');
              setRedirectMessage('Email verification successful! Redirecting you to login...');
              // Wait a moment to show the success message
              setTimeout(() => {
                setRedirectPath('/login');
              }, 2000);
            } else {
              console.log('Email verification failed');
              setRedirectMessage('Email verification failed. Please try again or contact support.');
              setError('Failed to verify email. The verification link may have expired.');
              setRedirectPath('/login');
            }
            
            setIsProcessing(false);
            return;
          } catch (verifyError) {
            console.error('Error during email verification:', verifyError);
            setError('An error occurred during email verification');
            setRedirectPath('/login');
            setIsProcessing(false);
            return;
          }
        }
        
        // Try to verify if we have an active session regardless of URL parameters
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session?.user) {
          console.log('Active session found for user:', sessionData.session.user.id);
          
          // We have a valid session, check if user has completed onboarding using multi-source approach
          try {
            // 1. Try to get data from profiles table
            const { data: profileData } = await supabase
              .from('profiles')
              .select('has_completed_onboarding, email_verified, auth_provider')
              .eq('id', sessionData.session.user.id)
              .single();
            
            // 2. Check user metadata for onboarding status as alternate source
            const { data: userData } = await supabase.auth.getUser();
            const metadataCompletedOnboarding = userData?.user?.user_metadata?.has_completed_onboarding;
            const isGoogleUser = userData?.user?.app_metadata?.provider === 'google';
            
            console.log('User profile check:', { 
              profileExists: !!profileData,
              profileOnboardingStatus: profileData?.has_completed_onboarding,
              metadataOnboardingStatus: metadataCompletedOnboarding,
              isGoogleUser
            });
            
            // 3. If we're a Google user and the profile doesn't have email_verified, update it
            if (profileData && isGoogleUser && profileData.email_verified === false) {
              console.log('Updating email verification status for Google user');
              
              // Mark email as verified for Google users
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  email_verified: true,
                  updated_at: new Date().toISOString() 
                })
                .eq('id', sessionData.session.user.id);
                
              if (updateError) {
                console.error('Error updating email verification status:', updateError);
              }
            }
            
            // 4. Determine where to redirect based on onboarding status from EITHER source
            // Trust metadata if profiles table is missing data
            const hasCompletedOnboarding = 
              profileData?.has_completed_onboarding || 
              metadataCompletedOnboarding === true;
              
            // Store onboarding status in localStorage as fallback mechanism
            if (hasCompletedOnboarding) {
              localStorage.setItem('has_completed_onboarding', 'true');
              console.log('User has completed onboarding, redirecting to dashboard');
              setRedirectPath('/dashboard');
              setRedirectMessage('Welcome back! Taking you to your dashboard...');
            } else {
              console.log('User needs to complete onboarding, redirecting to onboarding');
              setRedirectPath('/onboarding');
              setRedirectMessage('Please complete your profile setup...');
            }
            
            setIsProcessing(false);
            return;
          } catch (profileError) {
            console.error('Error checking profile data:', profileError);
          }
        }
        
        // Handle database error recovery if needed
        if (hasAuthError && hasDbError) {
          console.log('🔄 Attempting Google auth recovery for database error...');
          
          // Try our recovery mechanism with the full URL
          const recoverySuccess = await googleAuthHelper.verifyAndRecoverGoogleAuth(window.location.href);
          
          if (recoverySuccess) {
            console.log('✅ Recovery successful, redirecting to onboarding...');
            setRedirectPath('/onboarding');
            setRedirectMessage('Welcome to Planora! Setting up your account...');
            setIsProcessing(false);
            return;
          }
          
          // If we get here, recovery failed - provide clear instructions
          console.log('❌ Recovery failed, suggesting manual sign in');
          setError('We encountered an issue creating your account. Please try signing in again.');
          setIsProcessing(false);
          return;
        }
        
        // Process the standard authentication callback
        const authResponse = await handleAuthCallback();
        console.log('Auth callback response:', authResponse);
        
        if (authResponse.success) {
          // Determine where to redirect based on registration status
          if (authResponse.registrationStatus === UserRegistrationStatus.NEW_USER) {
            console.log('New user detected, redirecting to onboarding...');
            setRedirectPath('/onboarding');
            setRedirectMessage('Welcome to Planora! Setting up your account...');
          } else if (authResponse.registrationStatus === UserRegistrationStatus.INCOMPLETE_ONBOARDING) {
            console.log('Returning user with incomplete onboarding, redirecting to onboarding...');
            setRedirectPath('/onboarding?returning=true');
            setRedirectMessage('Welcome back! Finalizing your onboarding...');
          } else {
            console.log('Returning user with completed onboarding, redirecting to dashboard...');
            setRedirectPath('/dashboard');
            setRedirectMessage('Welcome back! Taking you to your dashboard...');
          }
        } else if (authResponse.error) {
          console.error('Auth callback returned error:', authResponse.error);
          setError(authResponse.error);
        }
        
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };
    
    processCallback();
  }, [handleAuthCallback, navigate]);
  
  // Handle redirection after processing is complete
  useEffect(() => {
    if (!isProcessing && redirectPath && !error) {
      // Use a short delay for stability
      console.log(`Redirecting to ${redirectPath}`);
    }
  }, [isProcessing, redirectPath, error, navigate]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg bg-red-50 border border-red-200 max-w-2xl w-full">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          <div className="my-4 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          
          <div className="flex gap-3 mt-6">
            <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
              Return to Home
            </a>
            <a href="/debug" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md">
              Go to Debug Screen
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // If not in error state and we have a redirect path, show the redirect animation
  if (!isProcessing && redirectPath) {
    return <AuthRedirect message={redirectMessage} redirectTo={redirectPath} delay={2000} />;
  }
  
  // Show initial loading state while processing
  return <AuthRedirect message="Processing your sign-in..." />;
};
