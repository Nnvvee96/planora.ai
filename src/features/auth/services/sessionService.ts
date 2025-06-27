/**
 * Session Service
 *
 * Handles user session management and authentication state
 * Part of the auth service refactoring to improve maintainability
 */

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

/**
 * Session management service
 * Handles user sessions, authentication state, and logout functionality
 */
export const sessionService = {
  /**
   * Get current user from session
   * @returns Promise<User | null> Current authenticated user or null
   */
  getCurrentUser: async (): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Sign out user
   * Clears the current session and redirects user
   * @returns Promise<void>
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  /**
   * Get current session
   * @returns Promise<Session | null> Current session or null
   */
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      throw error;
    }

    return session;
  },

  /**
   * Check if user is authenticated
   * @returns Promise<boolean> True if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const user = await sessionService.getCurrentUser();
    return !!user;
  },
}; 