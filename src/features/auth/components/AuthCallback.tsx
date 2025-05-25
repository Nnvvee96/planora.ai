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
        
        // Process the authentication callback
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
