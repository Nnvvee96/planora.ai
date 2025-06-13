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
  VerificationCodeResponse,
  VerificationCodeStatus,
  RegisterData,
  InitiateSignupResponse,
  CompleteSignupPayload,
  CompleteSignupResponse
} from './types/authTypes';

// Export types for use throughout the application
export type { 
  AuthResponse, 
  UserRegistrationStatus,
  GoogleAuthCredentials,
  SessionInfo,
  VerificationCodeResponse,
  VerificationCodeStatus,
  RegisterData,
  CompleteSignupPayload, // Added for two-phase signup
  InitiateSignupResponse, // Added for two-phase signup
  CompleteSignupResponse // Added for two-phase signup
} from './types/authTypes';

// Re-export useAuth hook to ensure pages can import it through the API boundary
export { useAuth } from './hooks/useAuth';

// Re-export components
export { AuthCallback } from './components/AuthCallback';
export { GoogleLoginButton } from './components/GoogleLoginButton';

// Import the auth service directly to prevent circular dependencies
import { supabaseAuthService } from './services/supabaseAuthService';
import { sessionManager } from './services/sessionManager';

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

// Types are exported at the top of the file

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
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: Error | null }>;
  updateUserMetadata(metadata: Record<string, unknown>): Promise<void>;
  getCurrentUser(): Promise<AppUser | null>;
  logout(): Promise<void>;
  handleAuthCallback(): Promise<AuthResponse>;

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
  refreshSession(): Promise<{session: any, error: Error | null}>;
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
  initiateSignup(email: string): Promise<InitiateSignupResponse>;
  completeSignup(payload: CompleteSignupPayload): Promise<CompleteSignupResponse>;
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

export const getEmailConfirmationComponent = () => {
  return lazy(() => import('./components/EmailConfirmation').then(module => ({
    default: module.EmailConfirmation
  })));
};

export const getEmailChangeVerificationComponent = () => {
  return lazy(() => import('./components/EmailChangeVerification').then(module => ({
    default: module.EmailChangeVerification
  })));
};

export const getForgotPasswordComponent = () => {
  return lazy(() => import('./components/ForgotPassword').then(module => ({
    default: module.ForgotPassword
  })));
};

export const getResetPasswordComponent = () => {
  return lazy(() => import('./components/ResetPassword').then(module => ({
    default: module.ResetPassword
  })));
};

export const getVerificationDialogComponent = () => {
  return lazy(() => import('./components/VerificationDialog').then(module => ({
    default: module.VerificationDialog
  })));
};

// Export auth context hook with a factory function
// This returns the hook directly, not as a promise
export const getAuthContextHook = () => {
  // We import this synchronously to avoid async issues with hooks
  // Since this is a hook and must be called at the top level, we can't use lazy loading
  // This is an architectural compromise to maintain React's rules of hooks
  return require('./components/AuthProvider').useAuthContext;
};

// Note: We've removed the getAuthRoutes function to break circular dependency
// Routes should be imported directly where needed

// Export session manager
export { sessionManager };

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
    // Check if userId is provided, if not, pass undefined to the service
    if (userId) {
      return supabaseAuthService.getAuthProvider(userId);
    } else {
      return supabaseAuthService.getAuthProvider();
    }
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
  },
  
  /**
   * Refresh the current session
   * Ensures we have the latest session data after auth changes
   * @returns Updated session data
   */
  refreshSession: async () => {
    return supabaseAuthService.refreshSession();
  },
  
  /**
   * Sign in with email and password
   * @param credentials Email and password credentials
   * @returns Authentication result with data and error
   */
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    try {
      // Use supabaseAuthService to implement this functionality
      const { data, error } = await supabaseAuthService.signInWithPassword(credentials);
      return { data, error };
    } catch (err) {
      console.error('Login error:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error during login') };
    }
  },

  /**
   * Initiate two-phase signup
   * Sends a verification code to the user's email.
   * Does not create a user account at this stage.
   * @param data Registration data including email, password, and profile information
   */
  initiateSignup: async (email: string): Promise<InitiateSignupResponse> => {
    // This will call the actual implementation in supabaseAuthService
    // which in turn calls the Supabase Edge Function
    return supabaseAuthService.initiateSignup(email);
  },

  /**
   * Complete two-phase signup
   * Verifies the code, creates the user, and their profile.
   * @param payload Payload containing the verification code and original registration data
   */
  completeSignup: async (payload: CompleteSignupPayload): Promise<CompleteSignupResponse> => {
    // This will call the actual implementation in supabaseAuthService
    // which in turn calls the Supabase Edge Function
    return supabaseAuthService.completeSignup(payload);
  }
};

export { useAuthContext } from './components/AuthProvider';

// Export components
export { AuthProvider } from './components/AuthProvider';
