/**
 * Auth Hook
 * 
 * Custom React hook for authentication operations.
 * Following Planora's architectural principles with feature-first organization.
 */

import { useState, useEffect, useCallback } from 'react';
import { AppUser, getAuthService, AuthResponse, AuthService } from '../authApi';
import { useNavigate } from 'react-router-dom';

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
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);

  // Check auth status after auth service is initialized
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!authService) return;
        
        setLoading(true);
        setError(null);
        
        // getCurrentUser already returns our mapped User type
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
  
  return {
    isAuthenticated,
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    handleAuthCallback,
    updateOnboardingStatus
  };
};
