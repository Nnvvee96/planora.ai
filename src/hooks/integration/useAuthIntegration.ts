/**
 * useAuthIntegration hook
 * 
 * This is an integration hook that provides a clean interface to the auth feature.
 * It isolates the implementation details of the auth feature and provides only what other
 * features need to know about authentication.
 */

// Import only from the feature's public API
import { useAuth, User } from '@/features/auth/api';

/**
 * useAuthIntegration
 * 
 * @returns Interface to interact with the auth feature
 */
export function useAuthIntegration() {
  // Use the auth feature's public hook
  const { user, isAuthenticated, loading, logout } = useAuth();
  
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
