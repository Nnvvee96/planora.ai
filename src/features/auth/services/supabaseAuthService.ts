/**
 * Supabase Auth Service (Orchestrator)
 *
 * Main authentication service that orchestrates specialized auth services.
 * Following Planora's architectural principles with feature-first organization.
 * 
 * This service maintains the same public API while delegating to specialized services:
 * - sessionService: Session management
 * - googleAuthService: Google OAuth flows
 * - emailAuthService: Email/password authentication
 * - emailVerificationService: Email verification utilities
 * - authCallbackService: Authentication callbacks
 * - authProviderService: Provider detection
 * - authProfileService: Profile operations
 */

import { User, Session } from "@supabase/supabase-js";
import {
  AuthResponse,
  RegisterData,
  AuthProviderType,
  VerificationCodeResponse,
  VerificationCodeStatus,
  InitiateSignupResponse,
  CompleteSignupPayload,
  CompleteSignupResponse,
} from "../types/authTypes";

// Import specialized services
import { sessionService } from "./sessionService";
import { googleAuthService } from "./googleAuthService";
import { emailAuthService } from "./emailAuthService";
import { emailVerificationService } from "./emailVerificationService";
import { authCallbackService } from "./authCallbackService";
import { authProviderService } from "./authProviderService";
import { authProfileService } from "./authProfileService";

/**
 * Main Supabase authentication service (Orchestrator)
 * Delegates to specialized services while maintaining backward compatibility
 */
export const supabaseAuthService = {
  // === SESSION MANAGEMENT ===
  /**
   * Get current user from session
   */
  getCurrentUser: async (): Promise<User | null> => {
    return sessionService.getCurrentUser();
  },

  /**
   * Sign out user
   */
  signOut: async (): Promise<void> => {
    return sessionService.signOut();
  },

  /**
   * Get current session
   */
  getCurrentSession: async () => {
    return sessionService.getCurrentSession();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    return sessionService.isAuthenticated();
  },

  // === GOOGLE AUTHENTICATION ===
  /**
   * Sign in with Google
   * Initiates Google OAuth flow
   */
  signInWithGoogle: async (): Promise<void> => {
    return googleAuthService.signInWithGoogle();
  },

  /**
   * Handle Google authentication callback and profile creation
   */
  handleGoogleAuthCallback: async (
    url: string,
  ): Promise<{ success: boolean; error?: string }> => {
    return googleAuthService.handleGoogleAuthCallback(url);
  },

  /**
   * Create a profile for a Google-authenticated user
   */
  createGoogleUserProfile: async (
    userId: string,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<boolean> => {
    return googleAuthService.createGoogleUserProfile(userId, email, metadata);
  },

  /**
   * Extract first name from Google metadata
   */
  extractFirstName: (metadata: Record<string, unknown>): string => {
    return googleAuthService.extractFirstName(metadata);
  },

  /**
   * Extract last name from Google metadata
   */
  extractLastName: (metadata: Record<string, unknown>): string => {
    return googleAuthService.extractLastName(metadata);
  },

  // === EMAIL AUTHENTICATION ===
  /**
   * Initiates the first step of the two-phase signup process
   */
  initiateSignup: async (
    email: string,
    password_raw: string,
  ): Promise<InitiateSignupResponse> => {
    return emailAuthService.initiateSignup(email, password_raw);
  },

  /**
   * Completes the second step of the two-phase signup process
   */
  completeSignup: async (
    payload: CompleteSignupPayload,
  ): Promise<CompleteSignupResponse> => {
    return emailAuthService.completeSignup(payload);
  },

  /**
   * Sign in with email and password
   */
  signInWithPassword: async (credentials: {
    email: string;
    password: string;
  }) => {
    return emailAuthService.signInWithPassword(credentials);
  },

  /**
   * Update user password
   */
  updatePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    return emailAuthService.updatePassword(currentPassword, newPassword);
  },

  /**
   * Update email address
   */
  updateEmail: async (newEmail: string, password?: string): Promise<void> => {
    return emailAuthService.updateEmail(newEmail, password);
  },

  /**
   * Register a new user
   */
  register: async (
    data: RegisterData,
  ): Promise<{ user: User | null; emailConfirmationRequired: boolean }> => {
    return emailAuthService.register(data);
  },

  /**
   * Send verification code to user's email
   */
  sendVerificationCode: async (
    userId: string,
    email: string,
  ): Promise<VerificationCodeResponse> => {
    return emailAuthService.sendVerificationCode(userId, email);
  },

  /**
   * Verify a code entered by the user
   */
  verifyCode: async (
    userId: string,
    code: string,
  ): Promise<VerificationCodeResponse> => {
    return emailAuthService.verifyCode(userId, code);
  },

  /**
   * Check verification code status
   */
  checkCodeStatus: async (
    userId: string,
    code: string,
  ): Promise<VerificationCodeStatus> => {
    return emailAuthService.checkCodeStatus(userId, code);
  },

  // === EMAIL VERIFICATION ===
  /**
   * Get a redirect URL for email verification flows
   */
  getEmailVerificationRedirectUrl: (route: string): string => {
    return emailVerificationService.getEmailVerificationRedirectUrl(route);
  },

  /**
   * Get redirect URL for email change verification
   */
  getEmailChangeRedirectUrl: (): string => {
    return emailVerificationService.getEmailChangeRedirectUrl();
  },

  /**
   * Get redirect URL for password reset
   */
  getPasswordResetRedirectUrl: (): string => {
    return emailVerificationService.getPasswordResetRedirectUrl();
  },

  /**
   * Get redirect URL for email confirmation
   */
  getEmailConfirmationRedirectUrl: (): string => {
    return emailVerificationService.getEmailConfirmationRedirectUrl();
  },

  // === AUTHENTICATION CALLBACKS ===
  /**
   * Handle authentication callback from providers
   * Determines if user is new or returning
   */
  handleAuthCallback: async (): Promise<AuthResponse> => {
    return authCallbackService.handleAuthCallback();
  },

  /**
   * Subscribe to authentication state changes
   */
  subscribeToAuthChanges: (
    callback: (event: string, session: Session | null) => void,
  ) => {
    return authCallbackService.subscribeToAuthChanges(callback);
  },

  /**
   * Update user onboarding status
   */
  updateOnboardingStatus: async (
    userId: string,
    hasCompleted: boolean = true,
  ): Promise<boolean> => {
    return authCallbackService.updateOnboardingStatus(userId, hasCompleted);
  },

  /**
   * Refresh session to ensure we have the latest authentication state
   */
  refreshSession: async (): Promise<void> => {
    return authCallbackService.refreshSession();
  },

  /**
   * Check user registration status
   */
  checkUserRegistrationStatus: async (userId: string) => {
    return authCallbackService.checkUserRegistrationStatus(userId);
  },

  // === PROVIDER DETECTION ===
  /**
   * Determine the authentication provider used by a user
   */
  getAuthProvider: async (userId?: string): Promise<AuthProviderType> => {
    return authProviderService.getAuthProvider(userId);
  },

  // === PROFILE OPERATIONS ===
  /**
   * Update user metadata
   */
  updateUserMetadata: async (
    metadata: Record<string, unknown>,
  ): Promise<void> => {
    return authProfileService.updateUserMetadata(metadata);
  },

  /**
   * Check if user has completed onboarding
   */
  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    return authProfileService.checkOnboardingStatus(userId);
  },
};
