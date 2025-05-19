/**
 * Auth Hook
 * 
 * Custom React hook for authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

import { useState, useEffect, useCallback } from 'react';
import { AppUser, AuthState, authService, AuthResponse } from '../api';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for authentication operations
 * Provides state and methods for authentication throughout the application
 */
export const useAuth = () => {
  const navigate = useNavigate();
  
  // Initialize auth state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });
  
  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // getCurrentUser already returns our mapped User type
        const user = await authService.getCurrentUser();
        
        if (user) {
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Authentication error'
        });
      }
    };
    
    checkAuthStatus();
  }, []);
  
  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signInWithGoogle();
      // Note: The redirect will happen automatically by Supabase,
      // so we don't need to update state here
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Authentication error'
      }));
    }
  }, []);
  
  /**
   * Sign out user
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.logout();
      
      // Update auth state
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Logout error'
      }));
    }
  }, [navigate]);
  
  /**
   * Handle authentication callback
   * Used after the Google authentication redirect
   */
  const handleAuthCallback = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
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
        const mappedUser = authService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          user: await mappedUser,
          loading: false,
          error: null
        });
      }
      
      return response;
    } catch (err) {
      console.error('Error in auth callback:', err);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Authentication error'
      });
      
      // Navigate to home page on error
      navigate('/');
      
      throw err;
    }
  }, [navigate]);
  
  /**
   * Update onboarding status for user
   */
  const updateOnboardingStatus = useCallback(async (userId: string, hasCompleted: boolean = true) => {
    try {
      const success = await authService.updateOnboardingStatus(userId, hasCompleted);
      
      if (success && hasCompleted) {
        // If onboarding was completed, update user state
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, hasCompletedOnboarding: true } : null
        }));
      }
      
      return success;
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      return false;
    }
  }, []);
  
  return {
    ...authState,
    signInWithGoogle,
    logout,
    handleAuthCallback,
    updateOnboardingStatus
  };
};
