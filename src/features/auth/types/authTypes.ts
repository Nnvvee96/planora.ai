/**
 * Auth Types
 * 
 * Type definitions for authentication related functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

import { User } from '@supabase/supabase-js';

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
  hasCompletedOnboarding: boolean; // Required to match authApi.ts interface
  avatarUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app_metadata?: Record<string, any>;
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
 * User registration status to manage onboarding flow
 */
export enum UserRegistrationStatus {
  NEW_USER = 'new_user',         // First time sign-in, needs onboarding
  RETURNING_USER = 'returning_user',  // Existing user, go to dashboard
  INCOMPLETE_ONBOARDING = 'incomplete_onboarding', // Started but not completed onboarding
  ERROR = 'error'                // Authentication error occurred
}

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
 * Authentication response interface
 */
export interface AuthResponse {
  success: boolean;
  user: User | null;
  error?: string;
  registrationStatus?: UserRegistrationStatus;
}

/**
 * Google auth credentials interface for typing auth requests
 */
export interface GoogleAuthCredentials {
  token?: string;
  code?: string;
  redirectTo?: string;
}

/**
 * Session information interface
 */
export interface SessionInfo {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: User | null;
}

/**
 * Registration data interface
 * Used for user registration process
 */
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  metadata?: {
    city?: string;
    country?: string;
    birthdate?: string;
    [key: string]: unknown;
  };
}

/**
 * Verification code response interface
 * Used for email verification code process
 */
export interface VerificationCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string; // Optional code returned for testing purposes
}

/**
 * Verification code status interface
 * Used to check the status of a verification code
 */
export interface VerificationCodeStatus {
  isValid: boolean;
  isExpired: boolean;
  message?: string;
}

/**
 * Authentication Service interface
 * Defines the contract for auth service implementations
 */
/**
 * Response from initiating signup via Edge Function
 */
export interface InitiateSignupResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  details?: string; // For more detailed error messages from Edge Function
  status?: number; // HTTP status code from Edge Function response
}

/**
 * Payload for completing signup via Edge Function
 */
export interface CompleteSignupPayload {
  email: string;
  code: string;
  password_raw: string; // Matching the Edge Function
  firstName: string;
  lastName: string;
  metadata?: {
    city: string;
    country: string;
    birthdate: string;
  };
}

/**
 * Response from completing signup via Edge Function
 */
export interface CompleteSignupResponse {
  success: boolean;
  message?: string;
  userId?: string;
  error?: string;
  errorCode?: string;
  details?: string; // For more detailed error messages from Edge Function
  status?: number; // HTTP status code from Edge Function response
}


/**
 * Authentication Service interface
 * Defines the contract for auth service implementations
 */
export interface AuthService {
  signInWithGoogle(): Promise<void>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: Error | null }>;
  updateUserMetadata(metadata: Record<string, unknown>): Promise<void>;
  getCurrentUser(): Promise<AppUser | null>;
  logout(): Promise<void>;
  handleAuthCallback(): Promise<AuthResponse>;
  register(data: RegisterData): Promise<{ user: User | null, emailConfirmationRequired: boolean }>;
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
  refreshSession(): Promise<void>;
  checkUserRegistrationStatus(userId: string): Promise<{
    isNewUser: boolean;
    hasProfile: boolean;
    hasCompletedOnboarding: boolean;
    hasTravelPreferences: boolean;
    registrationStatus: UserRegistrationStatus;
  }>;

  // New methods for the new signup flow
  initiateSignup(email: string, password_raw: string): Promise<InitiateSignupResponse>;
  completeSignup(payload: CompleteSignupPayload): Promise<CompleteSignupResponse>;
}
