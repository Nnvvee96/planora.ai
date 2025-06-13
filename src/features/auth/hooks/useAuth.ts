/**
 * Auth Hook
 * 
 * Custom React hook for authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

// Import directly from services to avoid circular dependencies
import { supabaseAuthService } from '../services/supabaseAuthService';

// Import types directly from the types folder
import type { AppUser, AuthResponse, AuthService } from '../types/authTypes';

// User mapping function - implemented directly to avoid circular dependency
const mapUserToAppUser = (user: User | null): AppUser | null => {
  if (!user) return null;
  
  // Extract user metadata or use empty object if undefined
  const metadata = user.user_metadata || {};
  
  return {
    id: user.id,
    email: user.email || '',
    username: metadata.username || '',
    firstName: metadata.first_name || '',
    lastName: metadata.last_name || '',
    avatarUrl: metadata.avatar_url || '',
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
  // Initialize auth service using factory function
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const navigate = useNavigate();
  
  // Set auth service directly on component mount
  useEffect(() => {
    // Create adapter for supabaseAuthService to match AuthService interface
    const authServiceAdapter: AuthService = {
      ...supabaseAuthService,
      // Adapt method names and signatures to match our interface
      logout: supabaseAuthService.signOut,
      getCurrentUser: async () => {
        const user = await supabaseAuthService.getCurrentUser();
        return mapUserToAppUser(user);
      },
      // Ensure the initiateSignup signature matches the AuthService interface
      initiateSignup: (email: string, password_raw: string) => 
        supabaseAuthService.initiateSignup(email, password_raw),
    };
    
    setAuthService(authServiceAdapter);
  }, []);

  // Check auth status after auth service is initialized
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!authService) return;
        
        setLoading(true);
        setError(null);
        
        // Get current user - already mapped by our adapter
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setUser(null);
        setIsAuthenticated(false);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [authService]);
  
  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      
      setLoading(true);
      setError(null);
      
      await authService.signInWithGoogle();
      // Note: The redirect will happen automatically by Supabase,
      // so we don't need to update state here
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err.message : 'Authentication error');
      setLoading(false);
    }
  }, [authService]);
  
  /**
   * Sign out user
   */
  const logout = useCallback(async () => {
    try {
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      
      setLoading(true);
      setError(null);
      
      await authService.logout();
      
      // Update auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Logout error');
    } finally {
      setLoading(false);
    }
  }, [authService, navigate]);
  
  /**
   * Handle authentication callback
   * Used after the Google authentication redirect
   */
  const handleAuthCallback = useCallback(async (): Promise<AuthResponse> => {
    try {
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      
      setLoading(true);
      setError(null);
      
      const response = await authService.handleAuthCallback();
      
      if (!response.success || !response.user) {
        throw new Error(response.error || 'Authentication failed');
      }
      
      // Check registration status
      if (response.registrationStatus === 'new_user' || 
          response.registrationStatus === 'incomplete_onboarding') {
        // New user or incomplete onboarding - redirect to onboarding
        navigate('/onboarding');
      } else {
        // Returning user - redirect to dashboard
        navigate('/dashboard');
      }
      
      // Update auth state with the mapped user data
      if (response.user) {
        const mappedUser = await authService.getCurrentUser();
        setUser(mappedUser);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (err) {
      console.error('Error in auth callback:', err);
      setUser(null);
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Authentication error');
      
      // Navigate to home page on error
      navigate('/');
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authService, navigate]);
  
  /**
   * Update onboarding status for user
   */
  const updateOnboardingStatus = useCallback(async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      
      const success = await authService.updateOnboardingStatus(userId, hasCompleted);
      
      if (success && hasCompleted && user) {
        // If onboarding was completed, update user state
        setUser({
          ...user,
          hasCompletedOnboarding: true
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      return false;
    }
  }, [authService, user]);
  
  /**
   * Refreshes the current user data from the server.
   */
  const refreshUser = useCallback(async () => {
    try {
      if (!authService) return;

      setLoading(true);
      // First, refresh the session to get the latest data from Supabase Auth
      await supabaseAuthService.refreshSession();
      
      // Then, get the updated user data
      const refreshedUser = await authService.getCurrentUser();
      
      if (refreshedUser) {
        setUser(refreshedUser);
        setIsAuthenticated(true);
      } else {
        // If no user is found after refresh, treat as logged out
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      // Don't clear user state on refresh error to avoid logging out on transient network issues
    } finally {
      setLoading(false);
    }
  }, [authService]);
  
  /**
   * Get the auth service instance
   * Provides access to the full auth service API
   */
  const getAuthServiceInstance = useCallback(() => {
    if (!authService) {
      // Create adapter if authService is null
      const authServiceAdapter: AuthService = {
        ...supabaseAuthService,
        logout: supabaseAuthService.signOut,
        getCurrentUser: async () => {
          const user = await supabaseAuthService.getCurrentUser();
          return mapUserToAppUser(user);
        },
        // Ensure the initiateSignup signature matches the AuthService interface
        initiateSignup: (email: string, password_raw: string) => 
          supabaseAuthService.initiateSignup(email, password_raw),
      };
      return authServiceAdapter;
    }
    return authService;
  }, [authService]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    handleAuthCallback,
    updateOnboardingStatus,
    refreshUser,
    authService: getAuthServiceInstance(),
  };
};
