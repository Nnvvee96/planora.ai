/**
 * User Profile API
 * 
 * Public API for user profile functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

// Re-export the UserProfileMenu component for pages to use through the API boundary
// We need to fully export this for the page API boundary pattern
export { UserProfileMenu } from './components/UserProfileMenu';
export type { UserProfileMenuProps } from './components/UserProfileMenu';

// Import types
import type { UserProfile, DbUserProfile } from './types/profileTypes';

// Re-export types
export type { UserProfile, DbUserProfile };

// Import the user profile service
import { userProfileService as userProfileServiceImpl } from './services/userProfileService';

/**
 * User profile service
 * Public API for user profile functionality
 */
export const userProfileService = {
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
  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
    return userProfileServiceImpl.updateUserProfile(userId, profileData);
  },
  
  /**
   * Update onboarding status
   * @param userId The user ID to update
   * @param hasCompleted Whether onboarding is completed
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    return userProfileServiceImpl.updateUserProfile(userId, { hasCompletedOnboarding: hasCompleted });
  }
};
