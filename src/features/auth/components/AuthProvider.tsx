/**
 * Auth Provider
 * 
 * React context provider for authentication state.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { AppUser, AuthState, AuthResponse, UserRegistrationStatus } from '../api';

// Define the auth context type for better type safety
export interface AuthContextType {
  isAuthenticated: boolean;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthCallback: () => Promise<AuthResponse>;
  updateOnboardingStatus: (userId: string, hasCompleted?: boolean) => Promise<boolean>;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  handleAuthCallback: async () => ({ success: false, user: null, registrationStatus: 'new_user' as UserRegistrationStatus, error: null }),
  updateOnboardingStatus: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component
 * Provides authentication state and methods to the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use our custom auth hook
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for accessing auth context
 * Provides a convenient way to access auth state and methods
 */
export const useAuthContext = () => useContext(AuthContext);
