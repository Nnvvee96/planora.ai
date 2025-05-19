/**
 * Auth API
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * This is just a placeholder API that simulates authentication flow
 * without actually connecting to any backend services.
 */

// Non-functional mock user type
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  hasCompletedOnboarding: boolean;
}

/**
 * Auth service mock - non-functional placeholder
 */
export const authService = {
  // Mock sign-in, doesn't actually authenticate
  signInWithGoogle: async (): Promise<void> => {
    console.log('MOCK: Google sign-in requested');
    // Redirect directly to onboarding in mock mode
    window.location.href = '/onboarding';
  },
  
  // Mock current user
  getCurrentUser: async (): Promise<User | null> => {
    console.log('MOCK: Get current user');
    // Always return a mock user
    return {
      id: 'mock-user-id',
      email: 'mockuser@example.com',
      username: 'mockuser',
      firstName: 'Mock',
      lastName: 'User',
      hasCompletedOnboarding: false
    };
  },
  
  // Mock logout
  logout: async (): Promise<void> => {
    console.log('MOCK: Logout requested');
    window.location.href = '/';
  },
  
  // Mock update user metadata
  updateUserMetadata: async (): Promise<User> => {
    console.log('MOCK: Update user metadata');
    return {
      id: 'mock-user-id',
      email: 'mockuser@example.com',
      username: 'mockuser',
      firstName: 'Mock',
      lastName: 'User',
      hasCompletedOnboarding: true
    };
  }
};
