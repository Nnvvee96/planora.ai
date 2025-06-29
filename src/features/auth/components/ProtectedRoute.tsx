/**
 * Protected Route Component
 *
 * HOC to protect routes that require authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

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
const _safeGetLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

/**
 * Simple loader component to show while auth is initializing
 */
const AuthLoader = () => (
  <div className="flex items-center justify-center h-screen bg-planora-background">
    <Loader2 className="h-8 w-8 animate-spin text-planora-accent-purple" />
    <p className="ml-2 text-planora-accent-purple">Authenticating...</p>
  </div>
);

export const ProtectedRoute = ({
  children,
  requireOnboarding = false,
  requireAuth = true,
  redirectToIfAuthenticated,
}: ProtectedRouteProps) => {
  // Get auth state ONLY from the context - no direct Supabase calls
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  // Track client-side mounting to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check if onboarding is completed based on user data
  const hasCompletedOnboarding = React.useMemo(() => {
    if (!isMounted || !user) return false;

    // User must complete onboarding to access protected routes
    return user?.hasCompletedOnboarding === true;
  }, [user, isMounted]);

  // Check if user's email is verified (for new flow)
  const isEmailVerified = React.useMemo(() => {
    if (!isMounted || !user) return false;
    
    // For now, we'll assume all authenticated users have verified emails
    // This will be updated when we implement the new auth flow
    return true;
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
    // Only redirect if we're sure the user is not authenticated (not loading)
    if (!loading) {
      if (import.meta.env.DEV) {
        console.log(
          "🔒 Access denied: User not authenticated, redirecting to login",
        );
      }
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Still loading, show loader
    return <AuthLoader />;
  }

  // For authenticated users, check email verification status
  if (isAuthenticated && !isEmailVerified) {
    if (import.meta.env.DEV) {
      console.log("📧 Email verification required, redirecting to verification");
    }
    return <Navigate to="/login?message=verify-email" replace />;
  }

  // If onboarding is required and not completed (only for authenticated users)
  if (requireOnboarding && isAuthenticated && isEmailVerified && !hasCompletedOnboarding) {
    if (import.meta.env.DEV) {
      console.log("📝 Onboarding required, redirecting to onboarding");
    }
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated, email verified, and meets all requirements
  if (import.meta.env.DEV) {
    console.log("✅ Access granted to protected route");
  }
  return <>{children}</>;
};
