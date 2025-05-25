/**
 * User Profile API
 * 
 * Public API for user profile functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

// Instead of directly re-exporting the UserProfileMenu, we'll create a factory function
// This breaks the circular dependency
import type { FC } from 'react';

// Type for the UserProfileMenu props - redefined here to avoid circular import
export interface UserProfileMenuProps {
  className?: string;
}

// Import types
import type { UserProfile, DbUserProfile } from './types/profileTypes';

// Re-export types
export type { UserProfile, DbUserProfile };

// Import the user profile service
import { userProfileService as userProfileServiceImpl } from './services/userProfileService';
import { lazy } from 'react';

// Create a lazy-loaded UserProfileMenu component
// This avoids circular dependencies by dynamically importing the component only when needed
export const getUserProfileMenuComponent = () => {
  return lazy(() => import('./components/UserProfileMenu').then(module => ({ 
    default: module.UserProfileMenu 
  })));
};

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
  updateProfileWithGoogleData: async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<boolean> => {
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
  },

  /**
   * Delete a user's profile and account
   * @param userId The user ID to delete
   * @param deleteAuth Whether to delete the auth record too (requires admin privileges)
   * @returns True if deletion was successful
   */
  deleteUserProfile: async (userId: string, deleteAuth: boolean = false): Promise<boolean> => {
    return userProfileServiceImpl.deleteUserProfile(userId, deleteAuth);
  },

  /**
   * Delete the current user's profile and account
   * This is a convenience method that gets the current user and deletes their profile
   * @param deleteAuth Whether to delete the auth record too (requires admin privileges)
   * @returns True if deletion was successful
   */
  deleteCurrentUserProfile: async (deleteAuth: boolean = false): Promise<boolean> => {
    const profile = await userProfileServiceImpl.getCurrentUser();
    if (!profile) {
      console.error('Cannot delete current user profile: No authenticated user');
      return false;
    }
    return userProfileServiceImpl.deleteUserProfile(profile.id, deleteAuth);
  }
};
