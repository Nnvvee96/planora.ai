/**
 * Protected Route Component
 * 
 * HOC to protect routes that require authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import type { AppUser } from '../types/authTypes';
import { Loader2 } from 'lucide-react';
// Import supabase directly to handle edge cases
import { supabase } from '@/database/databaseExports';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireAuth?: boolean;
  redirectToIfAuthenticated?: string;
}

/**
 * Protected route component that redirects unauthenticated users
 * Can also check if onboarding is completed when requireOnboarding is true
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false,
  requireAuth = true,
  redirectToIfAuthenticated
}) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [hasCompletedInitialCheck, setHasCompletedInitialCheck] = React.useState(false);
  
  // Enhanced check for authentication and onboarding status using multiple sources
  React.useEffect(() => {
    const verifyAuthAndOnboardingStatus = async () => {
      // Always reset to verifying state when dependencies change
      setIsVerifying(true);
      
      // Skip full verification if we're still loading auth context
      if (loading) {
        return;
      }
      
      try {
        // STEP 1: First, explicitly check session with Supabase directly
        // This ensures we have the most up-to-date session status
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const hasValidSession = !!sessionData?.session;
        
        console.log('Session verification result:', { 
          hasValidSession, 
          sessionError: sessionError?.message || 'none',
          contextAuth: isAuthenticated
        });
        
        // STEP 2: If requireAuth and no session, redirect to login
        if (requireAuth && !hasValidSession) {
          console.log('No valid session found, authentication required');
          setIsVerifying(false);
          setHasCompletedInitialCheck(true);
          return; // The rendering logic will handle redirect
        }
        
        // STEP 3: If not requireAuth or we have a valid session, continue with onboarding check
        // But only if onboarding check is required and we've got a valid user ID
        if (requireOnboarding && hasValidSession) {
          // Get user ID from session or context
          const userId = sessionData?.session?.user?.id || user?.id;
          
          if (!userId) {
            console.error('Valid session but no user ID found');
            setIsVerifying(false);
            setHasCompletedInitialCheck(true);
            return;
          }
          
          // Use multiple sources to verify onboarding status (most reliable first)
          
          // 1. Check local storage first (fastest client-side state)
          const localStorageOnboarding = localStorage.getItem('has_completed_onboarding') === 'true' || 
                                        localStorage.getItem('hasCompletedInitialFlow') === 'true';
          
          if (localStorageOnboarding) {
            console.log('Onboarding verified via localStorage');
            setIsVerifying(false);
            setHasCompletedInitialCheck(true);
            return;
          }

          // 2. Check profiles table for onboarding status
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('has_completed_onboarding')
              .eq('id', userId)
              .single();
            
            if (profileError) {
              console.warn('Error checking profile data:', profileError.message);
            } else if (profileData?.has_completed_onboarding) {
              console.log('Onboarding verified via profile record');
              localStorage.setItem('has_completed_onboarding', 'true');
              setIsVerifying(false);
              setHasCompletedInitialCheck(true);
              return;
            }
          } catch (profileCheckError) {
            console.error('Exception during profile check:', profileCheckError);
          }
          
          // 3. Check auth metadata for onboarding status
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.warn('Error getting user data:', userError.message);
            } else if (userData?.user?.user_metadata?.has_completed_onboarding === true) {
              console.log('Onboarding verified via user metadata');
              localStorage.setItem('has_completed_onboarding', 'true');
              setIsVerifying(false);
              setHasCompletedInitialCheck(true);
              return;
            }
          } catch (userDataError) {
            console.error('Exception during user metadata check:', userDataError);
          }

          // 4. Check for travel preferences (existence implies completed onboarding)
          try {
            const { data: travelPrefs, error: prefsError } = await supabase
              .from('travel_preferences')
              .select('id')
              .eq('user_id', userId)
              .limit(1);

            if (prefsError) {
              console.warn('Error checking travel preferences:', prefsError.message);
            } else if (travelPrefs && travelPrefs.length > 0) {
              console.log('Onboarding verified via travel preferences existence');
              localStorage.setItem('has_completed_onboarding', 'true');
              setIsVerifying(false);
              setHasCompletedInitialCheck(true);
              return;
            }
          } catch (prefsCheckError) {
            console.error('Exception during travel preferences check:', prefsCheckError);
          }
        }
        
        // STEP 4: If we get here, either onboarding is not required or it is required but not completed
        // Either way, we're done verifying
        setIsVerifying(false);
        setHasCompletedInitialCheck(true);
      } catch (error) {
        console.error('Error in authentication verification:', error);
        setIsVerifying(false);
        setHasCompletedInitialCheck(true);
      }
    };

    verifyAuthAndOnboardingStatus();
  }, [isAuthenticated, loading, requireAuth, requireOnboarding, user?.id]);

  // Show loading state while checking authentication or verifying status
  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-planora-background">
        <Loader2 className="h-8 w-8 animate-spin text-planora-accent-purple" />
      </div>
    );
  }

  // Handle authenticated user trying to access public pages
  if (isAuthenticated && redirectToIfAuthenticated) {
    return <Navigate to={redirectToIfAuthenticated} replace />;
  }

  // Check if the user is authenticated (only if authentication is required)
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If onboarding is required and not completed
  const onboardingCompleted = (
    user?.hasCompletedOnboarding === true || 
    localStorage.getItem('hasCompletedInitialFlow') === 'true'
  );
  
  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and meets onboarding requirements
  // Wrap children in Suspense to handle any lazy-loaded components
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-lg">Loading application...</p>
      </div>
    }>
      {children}
    </Suspense>
  );
};
