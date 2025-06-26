/**
 * Auth Callback Component
 * 
 * Handles OAuth callbacks from various providers
 * Following Planora's architectural principles with proper service layer usage
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { googleAuthHelper } from '../helpers/googleAuthHelper';
import { supabaseAuthService } from '../services/supabaseAuthService';

export function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        if (!isMounted) return;
        
        // Get the full URL
        const currentUrl = window.location.href;
        
        // Check if there are any auth errors in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorParam) {
          console.error('❌ Auth callback error:', errorParam, errorDescription);
          
          // Special handling for Google auth errors
          if (errorDescription?.includes('Database error saving new user')) {
            console.log('🔄 Attempting Google auth recovery...');
            const recovered = await googleAuthHelper.verifyAndRecoverGoogleAuth(currentUrl);
            
            if (recovered && isMounted) {
              console.log('✅ Google auth recovery successful!');
              toast.success('Account created successfully! Redirecting...');
              
              // Give time for the profile to be created and refresh user data
              await new Promise(resolve => setTimeout(resolve, 1500));
              await refreshUser();
              
              navigate('/onboarding');
              return;
            }
          }
          
          // Generic error handling
          if (isMounted) {
            const errorMessage = errorDescription || errorParam;
            toast.error(`Authentication failed: ${errorMessage}`);
            navigate('/login');
          }
          return;
        }
        
        // No error, proceed with normal flow
        console.log('✅ Auth callback successful, checking user status...');
        
        // CRITICAL FIX: Call the proper handleAuthCallback method that includes Google name extraction
        console.log('🔄 Calling supabaseAuthService.handleAuthCallback()...');
        const authResponse = await supabaseAuthService.handleAuthCallback();
        
        if (!authResponse.success || !authResponse.user) {
          console.error('❌ Auth callback failed:', authResponse.error);
          if (isMounted) {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
          }
          return;
        }
        
        const currentUser = authResponse.user;
        
        if (!currentUser) {
          console.error('❌ No user found after auth callback');
          if (isMounted) {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
          }
          return;
        }
        
        console.log('✅ User authenticated:', currentUser.email);
        console.log('🔍 Auth response:', authResponse);
        
        // The handleAuthCallback method already processed Google profile extraction
        // No need for duplicate processing here
        
        // Refresh user data to ensure we have the latest
        await refreshUser();
        
        // Use the registration status from the auth response
        console.log('📋 Registration status from auth callback:', authResponse.registrationStatus);
        
        if (isMounted) {
          if (authResponse.registrationStatus === 'new_user' || authResponse.registrationStatus === 'incomplete_onboarding') {
            console.log('📝 New user or incomplete onboarding, redirecting to onboarding');
            toast.success('Welcome! Let\'s set up your travel profile.');
            navigate('/onboarding');
          } else {
            console.log('🏠 Returning user, redirecting to dashboard');
            toast.success('Welcome back!');
            navigate('/dashboard');
          }
        }
        
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        if (isMounted) {
          toast.error('An unexpected error occurred. Please try again.');
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    handleCallback();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, refreshUser]);

  if (!isProcessing) {
    return null; // Component will unmount after navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-planora-purple-dark">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planora-accent-purple mx-auto"></div>
        <p className="text-white/60 mt-4">This may take a moment...</p>
      </div>
    </div>
  );
}
