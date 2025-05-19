/**
 * Auth API
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * This is just a placeholder API that simulates authentication flow
 * without actually connecting to any backend services.
 * Following Planora's architectural principles with feature-first organization.
 */

// Non-functional mock user type
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  hasCompletedOnboarding: boolean;
  avatarUrl?: string;
}

// Auth state interface for state management
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth service mock - non-functional placeholder
 */
export const authService = {
  // Mock login with email/password, doesn't actually authenticate
  login: async (credentials: LoginCredentials): Promise<User> => {
    console.log('MOCK: Login requested with:', credentials);
    // Return mock user and redirect to dashboard
    const mockUser = {
      id: 'mock-user-id',
      email: credentials.email,
      username: credentials.email.split('@')[0],
      firstName: 'Mock',
      lastName: 'User',
      hasCompletedOnboarding: true
    };
    return mockUser;
  },
  
  // Mock sign-in with Google, doesn't actually authenticate
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
