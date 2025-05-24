/**
 * useAuthIntegration hook
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * This is an integration hook that provides a clean interface to the auth feature.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import only from the feature's public API
import { getAuthService, AuthService } from '@/features/auth/authApi';
import { AppUser } from '@/features/auth/types/authTypes';
import { useState, useEffect } from 'react';

// For backward compatibility
type User = AppUser;

/**
 * Mock useAuthIntegration hook
 * 
 * @returns Interface to interact with the auth feature
 */
export function useAuthIntegration() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize auth service
  const [authService, setAuthService] = useState<AuthService | null>(null);
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);

  // Fetch user after auth service is initialized
  useEffect(() => {
    if (!authService) return;
    
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(!!userData);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [authService]);
  
  // Mock logout function
  const logout = async () => {
    console.log('MOCK: Logout requested');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };
  
  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    isAuthenticated,
    loading,
    user,
    logout,
    // Add derived data that might be useful for other features
    userName: user?.username || '',
    userInitial: user?.username ? user.username.charAt(0).toUpperCase() : '',
    userEmail: user?.email || '',
  };
}
