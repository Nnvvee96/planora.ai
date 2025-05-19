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
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

/**
 * Protected route component that redirects unauthenticated users
 * Can also check if onboarding is completed when requireOnboarding is true
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false 
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
        // Check local storage first (client-side state)
        const localStorageOnboarding = localStorage.getItem('hasCompletedInitialFlow') === 'true';
        
        if (localStorageOnboarding) {
          console.log('Onboarding verified via localStorage');
          // Update user context if needed (done through context, not auth provider direct update)
          setIsVerifying(false);
          setHasCompletedInitialCheck(true);
          return;
        }

        // Check for travel preferences (direct DB check)
        const { data: travelPrefs } = await supabase
          .from('travel_preferences')
          .select('id')
          .limit(1);

        if (travelPrefs && travelPrefs.length > 0) {
          console.log('Onboarding verified via travel preferences existence');
          // Set local storage for future checks
          localStorage.setItem('hasCompletedInitialFlow', 'true');
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-lg">{loading ? 'Checking authentication...' : 'Verifying user status...'}</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
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
