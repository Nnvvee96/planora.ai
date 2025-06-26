/**
 * Auth Callback Component
 * 
 * Handles OAuth callbacks from various providers
 * Following Planora's architectural principles with proper service layer usage
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { googleAuthHelper } from '../helpers/googleAuthHelper';
import { supabaseAuthService } from '../services/supabaseAuthService';

export function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the full URL
        const currentUrl = window.location.href;
        
        // First, check if there are any auth errors in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorParam) {
          console.error('Auth callback error:', errorParam, errorDescription);
          
          // Special handling for Google auth errors
          if (errorDescription?.includes('Database error saving new user')) {
            console.log('Attempting Google auth recovery...');
            const recovered = await googleAuthHelper.verifyAndRecoverGoogleAuth(currentUrl);
            
            if (recovered) {
              console.log('Google auth recovery successful!');
              toast.success('Account created successfully! Redirecting...');
              // Give a moment for the profile to be fully created
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Refresh user data
              await refreshUser();
              navigate('/onboarding');
              return;
            }
          }
          
          // Generic error handling
          const errorMessage = errorDescription || errorParam;
          toast.error(`Authentication failed: ${errorMessage}`);
          navigate('/login');
          return;
        }
        
        // No error, proceed with normal flow
        console.log('Auth callback successful, checking user status...');
        
        // Get current user to ensure we're authenticated
        const currentUser = await supabaseAuthService.getCurrentUser();
        
        if (!currentUser) {
          console.error('No user found after auth callback');
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }
        
        // Refresh user data to ensure we have the latest
        await refreshUser();
        
        // Check onboarding status
        const registrationStatus = await supabaseAuthService.checkUserRegistrationStatus(currentUser.id);
        
        if (registrationStatus.isNewUser || !registrationStatus.hasCompletedOnboarding) {
          toast.success('Welcome! Let\'s set up your travel profile.');
          navigate('/onboarding');
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
        
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('An unexpected error occurred. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planora-accent-purple mx-auto"></div>
      </div>
    </div>
  );
}
