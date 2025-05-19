/**
 * Authentication Callback Component
 * 
 * This component handles OAuth callbacks and authentication redirects.
 * Following Planora's architectural principles with clean code and proper type safety.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { checkTravelPreferencesExist } from '@/features/travel-preferences/api';
import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Extended User type for auth callback handling
 * Type-safety is essential for Planora's architecture
 */
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
 * Log with timestamp and context
 * Helps identify issues in the auth flow
 */
const logWithContext = (message: string, data?: Record<string, unknown>): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔐 Auth: ${message}`, data || '');
};

/**
 * Auth Callback Component
 * Handles redirects and authentication verification
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the authentication callback process
    const handleAuthCallback = async (): Promise<void> => {
      logWithContext('Starting auth callback handler');
      setLoading(true);
      setError(null);

      try {
        // === STEP 1: Wait for Supabase to process the auth code from the URL ===
        // We're purposely not doing anything here - Supabase automatically processes the code on init
        logWithContext('Waiting for Supabase to process auth code');
        
        // Give Supabase time to process the auth code
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // === STEP 2: Now check if we have a valid session ===
        logWithContext('Checking for authenticated session');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logWithContext('Error getting session', { error: sessionError.message });
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData.session) {
          // Check if we're in a silent refresh scenario (no code but an existing session might exist)
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            logWithContext('No session in URL but current user exists');
            // Still got a user, so proceed with that
          } else {
            logWithContext('No active session established', { sessionData });
            throw new Error('Failed to establish authentication session');
          }
        } else {
          logWithContext('Valid session found', { userId: sessionData.session.user.id });
        }
        
        // === STEP 3: Get user data ===
        logWithContext('Retrieving user data');
        const user = await authService.getCurrentUser() as ExtendedUser | null;
        
        if (!user) {
          logWithContext('No user found after session verification');
          throw new Error('Unable to retrieve user data');
        }
        
        logWithContext('User retrieved successfully', { userId: user.id });
        
        // === STEP 4: Ensure user profile exists ===
        // Critical for new Google sign-ins to work properly
        let profileExists = false;
        
        try {
          logWithContext('Checking if user profile exists');
          profileExists = await userProfileService.checkProfileExists(user.id);
          
          if (!profileExists) {
            logWithContext('Creating user profile');
            await userProfileService.ensureProfileExists(user.id);
            logWithContext('Profile created successfully');
          } else {
            logWithContext('User profile already exists');
          }
        } catch (profileError) {
          // Log but continue - this isn't a fatal error
          logWithContext('Error with profile operations', { error: profileError });
        }
        
        // === STEP 5: Determine redirect path ===
        logWithContext('Determining redirect path');
        const redirectPath = await determineRedirectPath(user);
        logWithContext('Redirect path determined', { path: redirectPath });
        
        // === STEP 6: Complete and redirect ===
        setLoading(false);
        navigate(redirectPath, { replace: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        logWithContext('Authentication process failed', { error: errorMessage });
        
        setError(errorMessage);
        setLoading(false);
        
        // Redirect to login after a delay
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    };
    
    /**
     * Determines where to redirect the user after authentication
     * Simplified logic prioritizing the most reliable indicators of user state
     */
    async function determineRedirectPath(user: ExtendedUser): Promise<string> {
      try {
        logWithContext('Analyzing user state to determine redirect', {
          userId: user.id,
          email: user.email
        });
        
        // === RELIABLE INDICATOR 1: Check for travel preferences ===
        let hasTravelPreferences = false;
        try {
          hasTravelPreferences = await checkTravelPreferencesExist(user.id);
          logWithContext('Travel preferences check', { exists: hasTravelPreferences });
        } catch (error) {
          logWithContext('Error checking travel preferences', { error });
          // Continue even if this check fails
        }
        
        // === RELIABLE INDICATOR 2: Check user profile existence ===
        let hasProfileInDatabase = false;
        try {
          hasProfileInDatabase = await userProfileService.checkProfileExists(user.id);
          logWithContext('Profile exists check', { exists: hasProfileInDatabase });
        } catch (error) {
          logWithContext('Error checking profile existence', { error });
          // If we can't check, continue with evaluation
        }
        
        // === SECONDARY INDICATORS: Check metadata and localStorage ===
        const userMetadata = user.user_metadata || {};
        const hasCompletedOnboardingInMetadata = userMetadata.has_completed_onboarding === true;
        const hasCompletedInitialFlow = localStorage.getItem('hasCompletedInitialFlow') === 'true';
        
        // Log all state checks for debugging
        logWithContext('Complete user state analysis', {
          userId: user.id,
          hasTravelPreferences,
          hasProfileInDatabase,
          hasCompletedOnboardingInMetadata,
          hasCompletedInitialFlow
        });
        
        // === DECISION LOGIC: Prioritized from most to least reliable ===
        
        // CASE 1: User has completed travel preferences - fully onboarded
        if (hasTravelPreferences) {
          logWithContext('Redirecting to dashboard - user has travel preferences');
          
          // Ensure state consistency
          localStorage.setItem('hasCompletedInitialFlow', 'true');
          
          // Update metadata if needed
          if (!hasCompletedOnboardingInMetadata) {
            await authService.updateUserMetadata({ has_completed_onboarding: true });
          }
          
          return '/dashboard';
        }
        
        // CASE 2: User has profile - partially onboarded
        if (hasProfileInDatabase) {
          // For existing users who have been onboarded
          if (hasCompletedOnboardingInMetadata || hasCompletedInitialFlow) {
            logWithContext('Redirecting to dashboard - user has profile and onboarding flags');
            localStorage.setItem('hasCompletedInitialFlow', 'true');
            return '/dashboard';
          }
          
          // For new users who have profile but need onboarding
          logWithContext('Redirecting to onboarding - user has profile but needs preferences');
          return '/onboarding';
        }
        
        // CASE 3: New user - needs onboarding
        logWithContext('Redirecting to onboarding - new user');
        return '/onboarding';
      } catch (error) {
        logWithContext('Error determining redirect path', { error });
        // Default to onboarding on error
        return '/onboarding';
      }
    }

    // Execute the handler when the component mounts
    handleAuthCallback();
  }, [location, navigate]);

  // Simple, visually appealing loading and error UI
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

// Use named exports as per Planora's architectural principles
export { AuthCallback };
