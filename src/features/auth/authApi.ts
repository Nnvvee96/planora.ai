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
  RegisterData,
  VerificationCodeResponse,
  VerificationCodeStatus
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
 * Authentication Provider Types
 * Used to identify the method of authentication for a user
 */
export enum AuthProviderType {
  EMAIL = 'email',        // Email/password login
  GOOGLE = 'google',      // Google OAuth
  ANONYMOUS = 'anonymous' // No authentication or unknown
}

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
  register(data: RegisterData): Promise<{ user: SupabaseUser | null, emailConfirmationRequired: boolean }>;
  verifyEmail(token: string): Promise<boolean>;
  resendVerificationEmail(email: string): Promise<boolean>;
  sendPasswordResetEmail(email: string): Promise<boolean>;
  resetPassword(newPassword: string): Promise<boolean>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  updateEmail(newEmail: string, password?: string): Promise<void>;
  getAuthProvider(userId?: string): Promise<AuthProviderType>;
  checkOnboardingStatus(userId: string): Promise<boolean>;
  updateOnboardingStatus(userId: string, hasCompleted?: boolean): Promise<boolean>;
  checkEmailVerificationStatus(userId: string): Promise<boolean>;
  sendVerificationCode(userId: string, email: string): Promise<VerificationCodeResponse>;
  verifyCode(userId: string, code: string): Promise<VerificationCodeResponse>;
  checkCodeStatus(userId: string, code: string): Promise<VerificationCodeStatus>;
  /**
   * Determine the authentication provider used by a user
   * @param userId Optional user ID to check (uses current user if not provided)
   * @returns The detected authentication provider type
   */
  getAuthProvider(userId?: string): Promise<AuthProviderType>;
  checkUserRegistrationStatus(userId: string): Promise<{
    isNewUser: boolean;
    hasProfile: boolean;
    hasCompletedOnboarding: boolean;
    hasTravelPreferences: boolean;
    registrationStatus: UserRegistrationStatus;
  }>;
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
   * Verify email address using token
   * @param token The verification token from email link
   */
  verifyEmail: async (token: string): Promise<boolean> => {
    return supabaseAuthService.verifyEmail(token);
  },
  
  /**
   * Resend verification email
   * @param email The email address to resend verification to
   */
  resendVerificationEmail: async (email: string): Promise<boolean> => {
    return supabaseAuthService.resendVerificationEmail(email);
  },
  
  /**
   * Check if a user's email is verified
   * @param userId The user ID to check verification status for
   */
  checkEmailVerificationStatus: async (userId: string): Promise<boolean> => {
    return supabaseAuthService.checkEmailVerificationStatus(userId);
  },
  
  /**
   * Send password reset email
   * @param email The email address to send password reset to
   */
  sendPasswordResetEmail: async (email: string): Promise<boolean> => {
    return supabaseAuthService.sendPasswordResetEmail(email);
  },
  
  /**
   * Reset password with reset token
   * @param newPassword The new password to set
   */
  resetPassword: async (newPassword: string): Promise<boolean> => {
    return supabaseAuthService.resetPassword(newPassword);
  },
  
  /**
   * Check user registration status
   * Comprehensive function that checks multiple sources to determine user status
   * @param userId User ID to check
   */
  checkUserRegistrationStatus: async (userId: string) => {
    return supabaseAuthService.checkUserRegistrationStatus(userId);
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
   * @param data Registration data including email, password, and profile information
   * @returns Object with user data and email confirmation status
   */
  register: async (data: RegisterData): Promise<{ user: SupabaseUser | null, emailConfirmationRequired: boolean }> => {
    return supabaseAuthService.register(data);
  },

  /**
   * Update user password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return supabaseAuthService.updatePassword(currentPassword, newPassword);
  },
  
  /**
   * Update the user's email address
   * @param newEmail The new email address
   * @param password Optional password to set when converting from Google auth to email/password
   */
  updateEmail: async (newEmail: string, password?: string): Promise<void> => {
    return supabaseAuthService.updateEmail(newEmail, password);
  },
  
  /**
   * Determine the authentication provider used by a user
   * @param userId Optional user ID to check (uses current user if not provided)
   * @returns The detected authentication provider type
   */
  getAuthProvider: async (userId?: string): Promise<AuthProviderType> => {
    return supabaseAuthService.getAuthProvider(userId);
  },
  
  /**
   * Send verification code to user's email
   * @param userId User ID
   * @param email Email address to send code to
   * @returns Response indicating success or failure
   */
  sendVerificationCode: async (userId: string, email: string): Promise<VerificationCodeResponse> => {
    return supabaseAuthService.sendVerificationCode(userId, email);
  },
  
  /**
   * Verify a code entered by the user
   * @param userId User ID
   * @param code Verification code
   * @returns Response indicating success or failure
   */
  verifyCode: async (userId: string, code: string): Promise<VerificationCodeResponse> => {
    return supabaseAuthService.verifyCode(userId, code);
  },
  
  /**
   * Check verification code status
   * @param userId User ID
   * @param code Verification code
   * @returns Status of the verification code
   */
  checkCodeStatus: async (userId: string, code: string): Promise<VerificationCodeStatus> => {
    return supabaseAuthService.checkCodeStatus(userId, code);
  }
};
