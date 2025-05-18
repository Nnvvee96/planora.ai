/**
 * Type definitions for the auth feature
 */

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  hasCompletedOnboarding?: boolean;
  user_metadata?: {
    has_completed_onboarding?: boolean;
    [key: string]: unknown;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>; // Using 'unknown' instead of 'any' for better type safety
}
