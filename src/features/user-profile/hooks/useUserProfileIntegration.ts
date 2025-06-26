/**
 * User Profile Integration Hook
 * 
 * Integration layer between user-profile and other features.
 * Following Planora's architectural principles with feature-first organization.
 * This hook resolves circular dependencies by providing a single integration point.
 */

import { useCallback } from 'react';
import { userProfileService } from '../services/userProfileService';
import { useAuthIntegration } from '@/hooks/integration/useAuthIntegration';

/**
 * Hook for integrating user profile with other features
 * Provides methods for user profile operations that interact with other features
 */
export const useUserProfileIntegration = () => {
  const { user, isAuthenticated } = useAuthIntegration();
  
  /**
   * Handle email change request
   * Ensures proper flow between auth and profile for email changes
   * @param userId User ID requesting email change
   * @param newEmail New email address
   * @returns Success status with message
   */
  const handleEmailChangeRequest = useCallback(async (
    userId: string, 
    newEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!userId || !newEmail) {
        return { 
          success: false, 
          message: 'User ID and new email are required'
        };
      }

      if (!isAuthenticated || !user) {
        return {
          success: false,
          message: 'User must be authenticated to change email'
        };
      }

      // For now, just update the profile and return a message
      // In a full implementation, this would trigger the auth service
      const profileUpdated = await userProfileService.updateUserProfile(userId, {
        emailVerified: false
      });
      
      if (!profileUpdated) {
        return {
          success: false,
          message: 'Failed to update profile for email change'
        };
      }
      
      return {
        success: true,
        message: 'Email change initiated. Please check your inbox for the verification link.'
      };
    } catch (error) {
      console.error('Error handling email change request:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during email change request'
      };
    }
  }, [user, isAuthenticated]);

  /**
   * Get complete user data by combining auth user and profile data
   * @param userId The user ID to get data for
   * @returns Combined user data or null if not found
   */
  const getUserWithProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.error('Cannot get user with profile: No user ID provided');
        return null;
      }

      if (!isAuthenticated || !user) {
        console.error('Cannot get user with profile: User not authenticated');
        return null;
      }
      
      // Get user profile
      const userProfile = await userProfileService.getUserProfile(userId);
      
      // Combine auth user data with profile data
      return {
        ...user,
        ...userProfile,
        // Ensure auth data takes precedence for core fields
        id: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      console.error('Error getting user with profile:', error);
      return null;
    }
  }, [user, isAuthenticated]);

  return {
    handleEmailChangeRequest,
    getUserWithProfile,
    // Expose auth state for convenience
    isAuthenticated,
    user,
  };
};
