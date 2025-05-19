/**
 * Google Auth Adapter
 * 
 * Following Planora's architectural principles:
 * - Separation of concerns
 * - Feature-first organization
 * - Clean code with proper typing
 */

import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Get the site URL for authentication redirects
 */
const getSiteUrl = (): string => {
  // In production use the exact URL registered with Google
  if (import.meta.env.PROD) {
    return 'https://planora-ai-beta.vercel.app';
  }
  
  // In development use localhost
  return window.location.origin || 'http://localhost:5173';
};

/**
 * Clean implementation of Google Sign-in following Supabase docs exactly
 */
export const googleAuthAdapter = {
  /**
   * Initiate Google OAuth sign-in
   * Following Supabase's recommended implementation
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      // Get callback URL
      const redirectTo = `${getSiteUrl()}/auth/callback`;
      console.log('📣 Initiating Google sign-in with redirect to:', redirectTo);
      
      // Call Supabase OAuth with minimal configuration
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      
      // No need to handle response - Supabase redirects browser automatically
    } catch (error) {
      console.error('🔴 Google sign-in error:', error);
      // Don't throw as browser will be redirected
    }
  }
};
