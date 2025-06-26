/**
 * Protected Route Component
 * 
 * HOC to protect routes that require authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

// DO NOT import supabase directly - rely on auth context instead to prevent race conditions

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
/**
 * Safe access to localStorage that works in both server and client environments
 */
const safeGetLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

/**
 * Simple loader component to show while auth is initializing
 */
const AuthLoader: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-planora-background">
    <Loader2 className="h-8 w-8 animate-spin text-planora-accent-purple" />
    <p className="ml-2 text-planora-accent-purple">Authenticating...</p>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false,
  requireAuth = true,
  redirectToIfAuthenticated
}) => {
  // Get auth state ONLY from the context - no direct Supabase calls
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  
  // Track client-side mounting to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Check if onboarding is completed based on user data and localStorage
  const hasCompletedOnboarding = React.useMemo(() => {
    if (!isMounted) return false;
    
    // Use multiple sources to determine onboarding status
    return (
      // From user object in auth context
      user?.hasCompletedOnboarding === true ||
      // From localStorage (client-side only)
      safeGetLocalStorage('has_completed_onboarding') === 'true' ||
      safeGetLocalStorage('hasCompletedInitialFlow') === 'true'
    );
  }, [user, isMounted]);

  // Don't render anything during server-side rendering or while auth is loading
  if (!isMounted || loading) {
    return <AuthLoader />;
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
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and meets onboarding requirements
  // Use direct rendering without nested Suspense to avoid race conditions
  return <>{children}</>;

};
