/**
 * Admin Service
 *
 * Handles all administrative operations with proper error handling
 * and database abstraction. Follows Planora's architectural principles.
 */

import { supabase } from "@/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export interface AdminCheckResult {
  isAdmin: boolean;
  isEditor: boolean;
  error: PostgrestError | null;
}

export interface AdminUserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_beta_tester: boolean;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean;
}

class AdminService {
  /**
   * Check if the current user has admin or editor privileges
   */
  async checkAdminPrivileges(userId: string): Promise<AdminCheckResult> {
    try {
      // Check admin role
      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_user_in_role",
        {
          user_id: userId,
          role_name: "admin",
        },
      );

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        return { isAdmin: false, isEditor: false, error: adminError };
      }

      // Check editor role
      const { data: isEditor, error: editorError } = await supabase.rpc(
        "is_user_in_role",
        {
          user_id: userId,
          role_name: "editor",
        },
      );

      if (editorError) {
        console.error("Error checking editor role:", editorError);
        return {
          isAdmin: isAdmin || false,
          isEditor: false,
          error: editorError,
        };
      }

      return {
        isAdmin: isAdmin || false,
        isEditor: isEditor || false,
        error: null,
      };
    } catch (error) {
      console.error("Unexpected error checking admin privileges:", error);
      return {
        isAdmin: false,
        isEditor: false,
        error: error as PostgrestError,
      };
    }
  }

  /**
   * Fetch all user profiles for admin management
   */
  async fetchAllUserProfiles(): Promise<{
    data: AdminUserProfile[] | null;
    error: PostgrestError | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user profiles:", error);
        return { data: null, error };
      }

      return { data: data as AdminUserProfile[], error: null };
    } catch (error) {
      console.error("Unexpected error fetching user profiles:", error);
      return { data: null, error: error as PostgrestError };
    }
  }

  /**
   * Update a user's beta tester status
   */
  async updateBetaTesterStatus(
    userId: string,
    isBetaTester: boolean,
  ): Promise<{ success: boolean; error: PostgrestError | null }> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_beta_tester: isBetaTester })
        .eq("id", userId);

      if (error) {
        console.error("Error updating beta tester status:", error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Unexpected error updating beta tester status:", error);
      return { success: false, error: error as PostgrestError };
    }
  }

  /**
   * Delete a user profile (admin only)
   */
  async deleteUserProfile(
    userId: string,
  ): Promise<{ success: boolean; error: PostgrestError | null }> {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error deleting user profile:", error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Unexpected error deleting user profile:", error);
      return { success: false, error: error as PostgrestError };
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
