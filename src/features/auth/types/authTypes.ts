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
