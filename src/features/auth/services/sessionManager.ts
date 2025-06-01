/**
 * Session Manager Service
 * 
 * Central service for managing auth sessions and authenticated operations.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabaseAuthService } from './supabaseAuthService';
import { supabase } from '@/database/databaseApi';

/**
 * Session Manager Service
 * Provides centralized functions for session management
 */
export const sessionManager = {
  /**
   * Ensure the current session is valid before performing an authenticated operation
   * Refreshes the session if needed
   * @returns The current session data
   */
  ensureAuthenticatedOperation: async () => {
    return supabaseAuthService.refreshSession();
  },
  
  /**
   * Get the current authenticated user ID
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId: async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  },
  
  /**
   * Check if user is currently authenticated
   * @returns True if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }
};
