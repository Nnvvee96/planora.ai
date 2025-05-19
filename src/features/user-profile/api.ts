/**
 * User Profile API
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * Following Planora's architectural principles with feature-first organization
 */

// Re-export the UserProfileMenu component for pages to use through the API boundary
// We need to fully export this for the page API boundary pattern
export { UserProfileMenu } from './components/UserProfileMenu';
export type { UserProfileMenuProps } from './components/UserProfileMenu';

/**
 * User Profile interface
 * Properly typed according to Planora's architectural principles
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  username?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  hasCompletedOnboarding?: boolean;
}

/**
 * Mock user profile service
 * Provides dummy implementations for profile-related functionality
 */
export const userProfileService = {
  /**
   * Check if a profile exists for a user
   * Always returns true in mock mode
   */
  checkProfileExists: async (_userId: string): Promise<boolean> => {
    console.log('MOCK: Checking if profile exists');
    return true;
  },

  /**
   * Ensure a profile exists for a user
   * Does nothing in mock mode
   */
  ensureProfileExists: async (_userId: string): Promise<boolean> => {
    console.log('MOCK: Ensuring profile exists');
    return true;
  },

  /**
   * Get a user's profile
   * Returns dummy data in mock mode
   */
  getUserProfile: async (_userId: string): Promise<UserProfile> => {
    console.log('MOCK: Getting user profile');
    return {
      id: 'mock-user-id',
      firstName: 'Mock',
      lastName: 'User',
      email: 'mockuser@example.com'
    };
  },

  /**
   * Update a user's profile
   * Does nothing in mock mode
   */
  updateUserProfile: async (_userId: string, _profileData: Partial<UserProfile>): Promise<boolean> => {
    console.log('MOCK: Updating user profile');
    return true;
  }
};
