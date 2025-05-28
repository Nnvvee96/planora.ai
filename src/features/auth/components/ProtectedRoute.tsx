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
  
  // Enhanced check for onboarding status using multiple sources
  React.useEffect(() => {
    const verifyOnboardingStatus = async () => {
      // Skip if loading, not authenticated, or already verified
      if (loading || !isAuthenticated || hasCompletedInitialCheck) {
        setIsVerifying(false);
        return;
      }

      try {
        // Check if user is authenticated
        if (!user?.id) {
          // Force a session check to handle potential timing issues
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            console.log('No active session found in database check');
            setIsVerifying(false);
            setHasCompletedInitialCheck(true);
            return;
          }
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
        if (user?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('has_completed_onboarding, email_verified')
            .eq('id', user.id)
            .single();
          
          if (profileData?.has_completed_onboarding) {
            console.log('Onboarding verified via profile record');
            localStorage.setItem('has_completed_onboarding', 'true');
            setIsVerifying(false);
            setHasCompletedInitialCheck(true);
            return;
          }
        }
        
        // 3. Check auth metadata for onboarding status
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.user_metadata?.has_completed_onboarding === true) {
          console.log('Onboarding verified via user metadata');
          localStorage.setItem('has_completed_onboarding', 'true');
          setIsVerifying(false);
          setHasCompletedInitialCheck(true);
          return;
        }

        // 4. Check for travel preferences (existence implies completed onboarding)
        const { data: travelPrefs } = await supabase
          .from('travel_preferences')
          .select('id')
          .limit(1);

        if (travelPrefs && travelPrefs.length > 0) {
          console.log('Onboarding verified via travel preferences existence');
          localStorage.setItem('has_completed_onboarding', 'true');
          setIsVerifying(false);
          setHasCompletedInitialCheck(true);
          return;
        }
        
        // Finally, fall back to the user object from context
        setIsVerifying(false);
        setHasCompletedInitialCheck(true);
      } catch (error) {
        console.error('Error verifying onboarding status:', error);
        setIsVerifying(false);
        setHasCompletedInitialCheck(true);
      }
    };

    verifyOnboardingStatus();
  }, [isAuthenticated, loading, hasCompletedInitialCheck]);

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
