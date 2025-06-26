/**
 * useAuthIntegration hook
 * 
 * Integration hook that provides a clean interface to the auth feature.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import the main auth hook 
import { useAuth } from '@/features/auth/authApi';
import type { AppUser } from '@/features/auth/types/authTypes';

// For backward compatibility
type User = AppUser;

/**
 * useAuthIntegration hook
 * 
 * @returns Interface to interact with the auth feature
 */
export function useAuthIntegration() {
  // Use the main auth hook to ensure consistency
  const { user, loading, logout: authLogout, isAuthenticated: _isAuthenticated } = useAuth();
  
  // Ensure isAuthenticated is properly derived
  const isAuthenticated = !!user && !loading;
  
  // Mock logout function that uses the real auth logout
  const logout = async () => {
    try {
      await authLogout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback - still redirect
      window.location.href = '/';
    }
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
    userInitial: user?.username ? user.username.charAt(0).toUpperCase() : (user?.firstName ? user.firstName.charAt(0).toUpperCase() : ''),
    userEmail: user?.email || '',
  };
}
