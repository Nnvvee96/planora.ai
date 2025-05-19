/**
 * Authentication Callback Component
 * 
 * Minimal implementation that handles OAuth callbacks from Google sign-in.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { checkTravelPreferencesExist } from '@/features/travel-preferences/api';
import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Auth Callback Component
 * Handles the callback from authentication providers
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log for debugging
    console.log('Auth callback component mounted');
    
    // Handle the authentication process
    const handleAuthentication = async (): Promise<void> => {
      try {
        console.log('Starting authentication verification');
        
        // STEP 1: Get the session (Supabase automatically processes auth code)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error.message);
          throw new Error('Authentication failed');
        }
        
        if (!data?.session) {
          console.error('No session found');
          throw new Error('No authenticated session found');
        }
        
        console.log('Session verified successfully');
        
        // STEP 2: Get the user data
        const user = await authService.getCurrentUser();
        
        if (!user) {
          console.error('No user found');
          throw new Error('User not found');
        }
        
        console.log('User retrieved successfully:', user.id);
        
        // STEP 3: Check for travel preferences
        let hasTravelPreferences = false;
        
        try {
          hasTravelPreferences = await checkTravelPreferencesExist(user.id);
          console.log('Travel preferences check:', hasTravelPreferences);
        } catch (preferencesError) {
          console.error('Error checking travel preferences:', preferencesError);
        }
        
        // STEP 4: Ensure profile exists
        let hasProfile = false;
        
        try {
          hasProfile = await userProfileService.checkProfileExists(user.id);
          console.log('Profile check:', hasProfile);
          
          if (!hasProfile) {
            console.log('Creating profile for user');
            await userProfileService.ensureProfileExists(user.id);
          }
        } catch (profileError) {
          console.error('Error with profile operations:', profileError);
        }
        
        // STEP 5: Determine where to redirect
        let redirectPath = '/onboarding';
        
        if (hasTravelPreferences) {
          // If user has travel preferences, they're fully onboarded
          redirectPath = '/dashboard';
          localStorage.setItem('hasCompletedInitialFlow', 'true');
          
          if (!user.hasCompletedOnboarding) {
            await authService.updateUserMetadata({ has_completed_onboarding: true });
          }
        } else if (hasProfile && user.hasCompletedOnboarding) {
          // If user has profile and is marked as onboarded
          redirectPath = '/dashboard';
          localStorage.setItem('hasCompletedInitialFlow', 'true');
        }
        
        console.log('Redirecting to:', redirectPath);
        setLoading(false);
        navigate(redirectPath, { replace: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        console.error('Authentication error:', errorMessage);
        
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a delay
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    };

    handleAuthentication();
  }, [navigate]);

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
          <p className="mt-2 text-sm text-white/70">Redirecting to login page...</p>
        </div>
      ) : null}
    </div>
  );
};

export { AuthCallback };
