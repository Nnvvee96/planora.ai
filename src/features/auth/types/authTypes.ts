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
  avatarUrl?: string;
  hasCompletedOnboarding?: boolean;
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
