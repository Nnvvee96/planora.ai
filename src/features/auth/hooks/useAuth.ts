/**
 * Auth Hook
 *
 * Custom React hook for authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

// Import directly from services to avoid circular dependencies
import { supabaseAuthService } from "../services/supabaseAuthService";
// Import Supabase client for auth state listener
import { supabase } from "@/lib/supabase/client";

// Import types directly from the types folder
import type { AppUser, AuthResponse, AuthService } from "../types/authTypes";

// User mapping function - implemented directly to avoid circular dependency
const mapUserToAppUser = (user: User | null): AppUser | null => {
  if (!user) return null;

  // Extract user metadata or use empty object if undefined
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || "",
    username: metadata.username || "",
    firstName: metadata.first_name || "",
    lastName: metadata.last_name || "",
    avatarUrl: metadata.avatar_url || "",
    hasCompletedOnboarding: metadata.has_completed_onboarding === true,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
  };
};

/**
 * Custom hook for authentication operations
 * Provides state and methods for authentication throughout the application
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();
  const authServiceRef = useRef<AuthService | null>(null);

  // Create auth service adapter only once
  const getAuthService = useCallback(() => {
    if (!authServiceRef.current) {
      authServiceRef.current = {
        ...supabaseAuthService,
        logout: supabaseAuthService.signOut,
        getCurrentUser: async () => {
          const user = await supabaseAuthService.getCurrentUser();
          return mapUserToAppUser(user);
        },
        initiateSignup: (email: string, password_raw: string) =>
          supabaseAuthService.initiateSignup(email, password_raw),
      };
    }
    return authServiceRef.current;
  }, []);

  // Initialize auth state and set up session listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔑 Initializing auth state...");
        }

        if (!isMounted) return;

        setLoading(true);
        setError(null);

        // Get current session first
        const currentUser = await supabaseAuthService.getCurrentUser();

        if (isMounted) {
          if (currentUser) {
            const mappedUser = mapUserToAppUser(currentUser);
            setUser(mappedUser);
            setIsAuthenticated(true);
            if (import.meta.env.DEV) {
              console.log("✅ User authenticated:", mappedUser?.email);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
            if (import.meta.env.DEV) {
              console.log("🚫 No authenticated user");
            }
          }

          setIsInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error initializing auth:", err);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setError(err instanceof Error ? err.message : "Authentication error");
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log(
          "🔄 Auth state change:",
          event,
          session?.user?.email || "no user",
        );
      }

      if (!isMounted) return;

      if (session?.user) {
        const mappedUser = mapUserToAppUser(session.user);
        setUser(mappedUser);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      if (isInitialized) {
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Starting Google sign-in...");
      }
      setLoading(true);
      setError(null);

      const authService = getAuthService();
      await authService.signInWithGoogle();
      // Note: The redirect will happen automatically by Supabase
    } catch (err) {
      console.error("❌ Error signing in with Google:", err);
      setError(err instanceof Error ? err.message : "Authentication error");
      setLoading(false);
    }
  }, [getAuthService]);

  /**
   * Sign out user
   */
  const logout = useCallback(async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Signing out...");
      }
      setLoading(true);
      setError(null);

      const authService = getAuthService();
      await authService.logout();

      // State will be updated by the auth state change listener
      navigate("/");
    } catch (err) {
      console.error("❌ Error signing out:", err);
      setError(err instanceof Error ? err.message : "Logout error");
    } finally {
      setLoading(false);
    }
  }, [getAuthService, navigate]);

  /**
   * Handle authentication callback
   * Used after the Google authentication redirect
   */
  const handleAuthCallback = useCallback(async (): Promise<AuthResponse> => {
    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Processing auth callback...");
      }
      setLoading(true);
      setError(null);

      const authService = getAuthService();
      const response = await authService.handleAuthCallback();

      if (!response.success || !response.user) {
        throw new Error(response.error || "Authentication failed");
      }

      if (import.meta.env.DEV) {
        console.log("✅ Auth callback successful:", response.registrationStatus);
      }

      // Don't manually update state here - let the auth state listener handle it
      return response;
    } catch (err) {
      console.error("❌ Error in auth callback:", err);
      setError(err instanceof Error ? err.message : "Authentication error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthService]);

  /**
   * Update onboarding status for user
   */
  const updateOnboardingStatus = useCallback(
    async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
      try {
        const authService = getAuthService();
        const success = await authService.updateOnboardingStatus(
          userId,
          hasCompleted,
        );

        if (success && hasCompleted && user) {
          // Update user state locally
          setUser({
            ...user,
            hasCompletedOnboarding: true,
          });

          // Also update localStorage for persistence
          localStorage.setItem("has_completed_onboarding", "true");
        }

        return success;
      } catch (err) {
        console.error("❌ Error updating onboarding status:", err);
        return false;
      }
    },
    [getAuthService, user],
  );

  /**
   * Refreshes the current user data from the server.
   */
  const refreshUser = useCallback(async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Refreshing user data...");
      }

      // Refresh the session to get the latest data from Supabase Auth
      await supabaseAuthService.refreshSession();

      // Get the updated user data
      const authService = getAuthService();
      const refreshedUser = await authService.getCurrentUser();

      if (refreshedUser) {
        setUser(refreshedUser);
        setIsAuthenticated(true);
        if (import.meta.env.DEV) {
          console.log("✅ User data refreshed:", refreshedUser.email);
        }
      } else {
        // If no user is found after refresh, treat as logged out
        setUser(null);
        setIsAuthenticated(false);
        if (import.meta.env.DEV) {
          console.log("🚫 No user found after refresh");
        }
      }
    } catch (err) {
      console.error("❌ Error refreshing user data:", err);
      // Don't clear user state on refresh error to avoid logging out on transient network issues
    }
  }, [getAuthService]);

  return {
    isAuthenticated,
    user,
    loading: loading && !isInitialized, // Only show loading while not initialized
    error,
    signInWithGoogle,
    logout,
    handleAuthCallback,
    updateOnboardingStatus,
    refreshUser,
    authService: getAuthService(),
  };
};
