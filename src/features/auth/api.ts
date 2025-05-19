/**
 * Auth API
 * 
 * Public API for authentication functionality.
 * Exports services, types, and utilities for authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import Supabase User type
import { User as SupabaseUser } from '@supabase/supabase-js';

// Import types from types directory
import type { 
  AuthResponse, 
  UserRegistrationStatus,
  GoogleAuthCredentials,
  SessionInfo
} from './types/authTypes';

// Import the auth service
import { supabaseAuthService } from './services/supabaseAuthService';

/**
 * Application User interface
 * Maps the Supabase User to our application's expectations
 */
export interface AppUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  hasCompletedOnboarding: boolean;
  avatarUrl?: string;
}

/**
 * Auth state interface for state management
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Map Supabase user to our AppUser interface
 */
export const mapSupabaseUser = (user: SupabaseUser): AppUser => {
  const { user_metadata } = user;
  return {
    id: user.id,
    email: user.email || '',
    username: user_metadata?.username || user.email?.split('@')[0] || '',
    firstName: user_metadata?.given_name || user_metadata?.first_name || '',
    lastName: user_metadata?.family_name || user_metadata?.last_name || '',
    hasCompletedOnboarding: user_metadata?.has_completed_onboarding || false,
    avatarUrl: user_metadata?.avatar_url || user_metadata?.picture || ''
  };
};

// Export the auth types for use throughout the application
export type { AuthResponse, UserRegistrationStatus, GoogleAuthCredentials, SessionInfo };

// Export authentication components for use in the app
export { AuthCallback } from './components/AuthCallback';
export { ProtectedRoute } from './components/ProtectedRoute';
export { GoogleLoginButton } from './components/GoogleLoginButton';
export { AuthProvider, useAuthContext } from './components/AuthProvider';

// Export authentication routes
export { authRoutes } from './routes/authRoutes';

/**
 * Auth service for application use
 * Provides methods for authentication operations
 */
export const authService = {
  /**
   * Sign in with Google
   * Initiates Google OAuth flow
   */
  signInWithGoogle: async (): Promise<void> => {
    return supabaseAuthService.signInWithGoogle();
  },
  
  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<AppUser | null> => {
    const user = await supabaseAuthService.getCurrentUser();
    return user ? mapSupabaseUser(user) : null;
  },
  
  /**
   * Sign out user
   */
  logout: async (): Promise<void> => {
    return supabaseAuthService.signOut();
  },
  
  /**
   * Handle authentication callback
   * Determines if user is new or returning
   */
  handleAuthCallback: async (): Promise<AuthResponse> => {
    return supabaseAuthService.handleAuthCallback();
  },
  
  /**
   * Check if user has completed onboarding
   */
  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    return supabaseAuthService.checkOnboardingStatus(userId);
  },
  
  /**
   * Update onboarding status
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    return supabaseAuthService.updateOnboardingStatus(userId);
  }
};
