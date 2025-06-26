/**
 * Google Auth Helper
 * 
 * Helper functions for Google authentication flow
 * Following Planora's architectural principles with feature-first organization
 */

import { supabaseAuthService } from '../services/supabaseAuthService';

/**
 * Helper to fix common issues with Google authentication
 * Provides recovery mechanisms for various failure scenarios
 */
export const googleAuthHelper = {
  /**
   * Verify and recover Google authentication
   * This handles cases where the auth flow succeeded but profile creation failed
   * @param url The full URL from the OAuth callback
   */
  verifyAndRecoverGoogleAuth: async (url: string): Promise<boolean> => {
    const result = await supabaseAuthService.handleGoogleAuthCallback(url);
    return result.success;
  }
};
