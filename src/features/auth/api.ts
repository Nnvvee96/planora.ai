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
  SessionInfo,
  RegisterData
} from './types/authTypes';

// Import the auth service directly to prevent circular dependencies
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

/**
 * AuthService interface
 * Defines the shape of authentication service for type safety
 */
export interface AuthService {
  signInWithGoogle(): Promise<void>;
  updateUserMetadata(metadata: Record<string, unknown>): Promise<void>;
  getCurrentUser(): Promise<AppUser | null>;
  logout(): Promise<void>;
  handleAuthCallback(): Promise<AuthResponse>;
  register(data: RegisterData): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  checkOnboardingStatus(userId: string): Promise<boolean>;
  updateOnboardingStatus(userId: string, hasCompleted?: boolean): Promise<boolean>;
}

// Import lazy for component lazy loading
import { lazy } from 'react';

// Export factory functions for authentication components to avoid circular dependencies
export const getAuthCallbackComponent = () => {
  return lazy(() => import('./components/AuthCallback').then(module => ({
    default: module.AuthCallback
  })));
};

export const getProtectedRouteComponent = () => {
  return lazy(() => import('./components/ProtectedRoute').then(module => ({
    default: module.ProtectedRoute
  })));
};

export const getGoogleLoginButtonComponent = () => {
  return lazy(() => import('./components/GoogleLoginButton').then(module => ({
    default: module.GoogleLoginButton
  })));
};

export const getAuthProviderComponent = () => {
  return lazy(() => import('./components/AuthProvider').then(module => ({
    default: module.AuthProvider
  })));
};

// Export auth context hook with a factory function
export const getAuthContextHook = async () => {
  const module = await import('./components/AuthProvider');
  return module.useAuthContext;
};

// Export routes
export { authRoutes } from './routes/authRoutes';

/**
 * Factory function for auth service
 * Provides authentication functionality while avoiding circular dependencies
 * @returns An AuthService instance with authentication functionality
 */
export const getAuthService = (): AuthService => {
  return {
    ...authService
  };
};

/**
 * Auth service object
 * Provides authentication functionality
 * Private implementation, not directly exported
 */
const authService = {
  /**
   * Sign in with Google
   * Initiates Google OAuth flow
   */
  signInWithGoogle: async (): Promise<void> => {
    return supabaseAuthService.signInWithGoogle();
  },
  
  /**
   * Update user metadata
   * Updates the user's metadata in Supabase
   */
  updateUserMetadata: async (metadata: Record<string, unknown>): Promise<void> => {
    return supabaseAuthService.updateUserMetadata(metadata);
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
    try {
      await supabaseAuthService.updateUserMetadata({ hasCompletedOnboarding: hasCompleted });
      return true;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return false;
    }
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<void> => {
    return supabaseAuthService.register(data);
  },

  /**
   * Update user password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return supabaseAuthService.updatePassword(currentPassword, newPassword);
  }
};
