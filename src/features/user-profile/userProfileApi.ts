/**
 * User Profile API
 *
 * Public API for user profile functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import types
import type { UserProfile, DbUserProfile } from "./types/profileTypes";
import { lazy } from "react";

// Import services
import { userProfileService as userProfileServiceImpl } from "./services/userProfileService";

// Re-export types
export type { UserProfile, DbUserProfile };

// Type for the UserProfileMenu props - redefined here to avoid circular import
export interface UserProfileMenuProps {
  className?: string;
}

// Create factory functions for lazy-loaded components
// This avoids circular dependencies by dynamically importing components only when needed

// UserProfileMenu component factory
export const getUserProfileMenuComponent = () => {
  return lazy(() =>
    import("./components/UserProfileMenu").then((module) => ({
      default: module.UserProfileMenu,
    })),
  );
};

// ProfileDialog component factory
export const getProfileDialogComponent = () => {
  return lazy(() =>
    import("./components/dialogs/ProfileDialog").then((module) => ({
      default: module.ProfileDialog,
    })),
  );
};

// SettingsDialog component factory
export const getSettingsDialogComponent = () => {
  return lazy(() =>
    import("./components/dialogs/SettingsDialog").then((module) => ({
      default: module.SettingsDialog,
    })),
  );
};

// DeleteAccountDialog component factory
export const getDeleteAccountDialogComponent = () => {
  return lazy(() =>
    import("./components/dialogs/DeleteAccountDialog").then((module) => ({
      default: module.DeleteAccountDialog,
    })),
  );
};

export { UserProfileMenu } from "./components/UserProfileMenu";
export { SettingsDialog } from "./components/dialogs/SettingsDialog";
export { ProfileDialog } from "./components/dialogs/ProfileDialog";
export { DeleteAccountDialog } from "./components/dialogs/DeleteAccountDialog";

/**
 * User profile service
 * Public API for user profile functionality
 */
export const userProfileService = {
  /**
   * Update profile with Google user data
   * @param user Supabase user object
   * @returns True if update was successful
   */
  updateProfileWithGoogleData: async (user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }): Promise<boolean> => {
    return userProfileServiceImpl.updateProfileWithGoogleData(user);
  },

  /**
   * Check if a profile exists for a user
   * @param userId The user ID to check
   */
  checkProfileExists: async (userId: string): Promise<boolean> => {
    return userProfileServiceImpl.checkProfileExists(userId);
  },

  /**
   * Ensure a profile exists for a user
   * Creates a profile if one doesn't exist
   * @param userId The user ID to check/create profile for
   */
  ensureProfileExists: async (userId: string): Promise<boolean> => {
    return userProfileServiceImpl.ensureProfileExists(userId);
  },

  /**
   * Get a user's profile
   * @param userId The user ID to get profile for
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    return userProfileServiceImpl.getUserProfile(userId);
  },

  /**
   * Update a user's profile
   * @param userId The user ID to update profile for
   * @param profileData The profile data to update
   */
  updateUserProfile: async (
    userId: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile | null> => {
    return userProfileServiceImpl.updateUserProfile(userId, profileData);
  },

  /**
   * Update onboarding status
   * @param userId The user ID to update
   * @param hasCompleted Whether onboarding is completed
   */
  updateOnboardingStatus: async (
    userId: string,
    hasCompleted: boolean = true,
  ): Promise<UserProfile | null> => {
    return userProfileServiceImpl.updateUserProfile(userId, {
      hasCompletedOnboarding: hasCompleted,
    });
  },

  /**
   * Delete a user's profile and account
   * @param userId The user ID to delete
   * @returns Object with success status and optional error
   */
  deleteUserProfile: async (
    userId: string,
  ): Promise<{ success: boolean; error?: Error }> => {
    return userProfileServiceImpl.deleteUserProfile(userId);
  },

  /**
   * Delete the current user's profile and account
   * This is a convenience method that gets the current user and deletes their profile
   * @returns Object with success status and optional error
   */
  deleteCurrentUserProfile: async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    const profile = await userProfileServiceImpl.getCurrentUser();
    if (!profile) {
      console.error(
        "Cannot delete current user profile: No authenticated user",
      );
      return { success: false, error: new Error("No authenticated user") };
    }
    return userProfileServiceImpl.deleteUserProfile(profile.id);
  },

  /**
   * Check if database connection is working
   * @returns True if database connection is successful
   */
  checkDatabaseConnection: async (): Promise<boolean> => {
    try {
      // Try to fetch a count of profiles as a simple connection test
      return await userProfileServiceImpl.checkDatabaseConnection();
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  },

  /**
   * Complete the email change process for a user
   * @param userId The user ID to complete the email change for
   * @returns True if the email change was successfully completed
   */
  completeEmailChange: async (
    userId: string,
    newEmail: string,
  ): Promise<boolean> => {
    try {
      return await userProfileServiceImpl.completeEmailChange(userId, newEmail);
    } catch (error) {
      console.error("Error completing email change:", error);
      return false;
    }
  },
};

// Export services as a single API object
export const userProfileApi = {
  ...userProfileServiceImpl,
};

// Export hooks
export { useUserProfileIntegration } from "./hooks/useUserProfileIntegration";
export { useUserProfile } from "./hooks/useUserProfile";
export { UserProfileProvider } from "./components/UserProfileProvider";
export { mapDbUserToAppUser } from "./utils/userProfileMappers";
