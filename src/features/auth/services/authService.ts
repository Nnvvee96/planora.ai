/**
 * Authentication Service
 * 
 * Responsible for handling authentication-related operations like login, registration, etc.
 * This service does NOT directly import any UI components, maintaining separation of concerns.
 * 
 * Uses adapters to abstract provider-specific implementations for better maintainability.
 */

import { supabaseAuthAdapter } from '../adapters/supabaseAuthAdapter';
import { googleAuthAdapter } from '../adapters/googleAuthAdapter';
import type { LoginCredentials, RegisterData, User } from '../types/authTypes';

/**
 * Auth Service
 * 
 * This service provides authentication functionality to the application.
 * It uses an adapter pattern to abstract away the specific authentication provider,
 * allowing for easier switching of providers in the future if needed.
 */
export const authService = {
  /**
   * Attempts to login user with provided credentials
   * @param {LoginCredentials} credentials - User credentials
   * @returns {Promise<User>} User data
   * @throws {Error} If login fails
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Call the adapter implementation
      const user = await supabaseAuthAdapter.signInWithCredentials(credentials);
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Registers a new user with provided data
   * @param {RegisterData} data - Registration data
   * @returns {Promise<User>} New user data
   * @throws {Error} If registration fails
   */
  register: async (data: RegisterData): Promise<User> => {
    try {
      // Call the adapter implementation
      return await supabaseAuthAdapter.registerUser(data);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   * @throws {Error} If logout fails
   */
  logout: async (): Promise<void> => {
    try {
      // Call the adapter implementation
      await supabaseAuthAdapter.signOut();
      
      // Clear local storage
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Checks if user is currently authenticated
   * @returns {Promise<User|null>} User data if authenticated, null otherwise
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Call the adapter implementation
      return await supabaseAuthAdapter.getCurrentUser();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Authenticates with Google
   * @returns {Promise<void>}
   * @throws {Error} If authentication fails
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      // CRITICAL FIX: Use the simplified Google auth adapter
      // This follows Supabase documentation exactly
      await googleAuthAdapter.signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Don't throw - authentication redirects the browser
    }
  },
  
  /**
   * Verifies email with token
   * @param {string} token - Email verification token
   * @returns {Promise<User>} User data
   * @throws {Error} If verification fails
   */
  verifyEmail: async (token: string): Promise<User> => {
    try {
      // Call the adapter implementation
      return await supabaseAuthAdapter.verifyEmail(token);
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },
  
  /**
   * Resets password with email
   * @param {string} email - User email
   * @returns {Promise<void>}
   * @throws {Error} If reset fails
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      // Call the adapter implementation
      await supabaseAuthAdapter.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Updates the user's password
   * @param {string} currentPassword - User's current password
   * @param {string} newPassword - User's new password
   * @returns {Promise<User>} Updated user data
   * @throws {Error} If password update fails
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<User> => {
    try {
      // Call the adapter implementation
      return await supabaseAuthAdapter.updatePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },
  
  /**
   * Updates the user's metadata
   * @param {Record<string, unknown>} metadata - Metadata to update
   * @returns {Promise<User>} Updated user data
   * @throws {Error} If metadata update fails
   */
  updateUserMetadata: async (metadata: Record<string, unknown>): Promise<User> => {
    try {
      // Call the adapter implementation
      return await supabaseAuthAdapter.updateUserMetadata(metadata);
    } catch (error) {
      console.error('Metadata update error:', error);
      throw error;
    }
  },
  
  /**
   * Specifically resets a user's onboarding status to false
   * @param {string} userId - User ID to reset onboarding status for
   * @returns {Promise<{error?: Error}>} Result of the operation
   */
  resetOnboardingStatus: async (userId: string): Promise<{error?: Error}> => {
    try {
      // Use the updateUserMetadata method to set has_completed_onboarding to false
      await supabaseAuthAdapter.updateUserMetadata({
        has_completed_onboarding: false
      });
      
      console.log('Successfully reset onboarding status for user:', userId);
      return {}; // Success
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
      return { error: error as Error };
    }
  }
};
