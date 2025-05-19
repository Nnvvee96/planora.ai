/**
 * useAuthIntegration hook
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * This is an integration hook that provides a clean interface to the auth feature.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import only from the feature's public API
import { authService, User } from '@/features/auth/api';
import { useState, useEffect } from 'react';

/**
 * Mock useAuthIntegration hook
 * 
 * @returns Interface to interact with the auth feature
 */
export function useAuthIntegration() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Simulate fetching user on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(!!userData);
      setLoading(false);
    };
    
    fetchUser();
  }, []);
  
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
