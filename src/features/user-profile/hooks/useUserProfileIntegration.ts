/**
 * User Profile Integration Hook
 * 
 * Integration layer between user-profile and other features.
 * Following Planora's architectural principles with feature-first organization.
 * This hook resolves circular dependencies by providing a single integration point.
 */

import { useCallback } from 'react';
import { userProfileService } from '../services/userProfileService';
import { getAuthService } from '@/features/auth/authApi';
import type { UserProfile } from '../types/profileTypes';
import type { AppUser } from '@/features/auth/types/authTypes';

/**
 * Hook for integrating user profile with other features
 * Provides methods for user profile operations that interact with other features
 */
export const useUserProfileIntegration = () => {
  /**
   * Sync user profile with auth data
   * Ensures profile data is consistent with auth data
   * @param userId User ID to sync
   * @returns True if sync was successful
   */
  const syncProfileWithAuth = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (!userId) {
        console.error('Cannot sync profile: No user ID provided');
        return false;
      }

      // Get auth service via factory function to avoid circular dependencies
      const authService = getAuthService();
      
      // Get current auth user
      const authUser = await authService.getCurrentUser();
      
      if (!authUser) {
        console.error('Cannot sync profile: No authenticated user');
        return false;
      }
      
      // Update profile with auth data
      return await userProfileService.updateUserProfile(userId, {
        email: authUser.email,
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        avatarUrl: authUser.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error syncing profile with auth:', error);
      return false;
    }
  }, []);

  /**
   * Validate and fix onboarding status across auth and profile
   * Ensures consistent onboarding status between auth and profile
   * @param userId User ID to validate
   * @returns Object with validated status and whether a fix was applied
   */
  const validateOnboardingStatus = useCallback(async (userId: string): Promise<{
    hasCompletedOnboarding: boolean;
    wasFixed: boolean;
  }> => {
    try {
      if (!userId) {
        console.error('Cannot validate onboarding status: No user ID provided');
        return { hasCompletedOnboarding: false, wasFixed: false };
      }

      // Get auth service via factory function
      const authService = getAuthService();
      
      // Get current auth user
      const authUser = await authService.getCurrentUser();
      
      if (!authUser) {
        console.error('Cannot validate onboarding status: No authenticated user');
        return { hasCompletedOnboarding: false, wasFixed: false };
      }
      
      // Get user profile
      const userProfile = await userProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        console.warn('User has auth record but no profile, creating profile');
        // Create profile with auth data
        await userProfileService.updateUserProfile(userId, {
          email: authUser.email,
          firstName: authUser.firstName || '',
          lastName: authUser.lastName || '',
          avatarUrl: authUser.avatarUrl || '',
          hasCompletedOnboarding: authUser.hasCompletedOnboarding
        });
        return { 
          hasCompletedOnboarding: authUser.hasCompletedOnboarding, 
          wasFixed: true 
        };
      }
      
      // Check for mismatch between auth and profile
      if (authUser.hasCompletedOnboarding !== userProfile.hasCompletedOnboarding) {
        console.warn('Onboarding status mismatch detected between auth and profile');
        
        // Trust profile over auth data
        const shouldBeCompleted = userProfile.hasCompletedOnboarding;
        
        // Update auth record to match profile
        await authService.updateOnboardingStatus(userId, shouldBeCompleted);
        
        return { 
          hasCompletedOnboarding: shouldBeCompleted, 
          wasFixed: true 
        };
      }
      
      return { 
        hasCompletedOnboarding: userProfile.hasCompletedOnboarding, 
        wasFixed: false 
      };
    } catch (error) {
      console.error('Error validating onboarding status:', error);
      return { hasCompletedOnboarding: false, wasFixed: false };
    }
  }, []);

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

      // Get auth service via factory function
      const authService = getAuthService();
      
      try {
        // Request email change through auth service
        // The updateEmail method returns void, so we need to catch any thrown errors
        await authService.updateEmail(newEmail);
        
        // If we get here, the email change was initiated successfully
        // Update pending email change in profile
        const profileUpdated = await userProfileService.updateUserProfile(userId, {
          // Don't update email directly - it will be updated after verification
          // Just track that a change is pending
          emailVerified: false
        });
        
        if (!profileUpdated) {
          return {
            success: true, // Auth change succeeded
            message: 'Email change initiated but profile could not be updated. Verification is still required.'
          };
        }
        
        return {
          success: true,
          message: 'Email change initiated. Please check your inbox for the verification link.'
        };
      } catch (updateError) {
        // If updateEmail throws an error, handle it here
        return {
          success: false,
          message: updateError instanceof Error ? updateError.message : 'Email change failed'
        };
      }
    } catch (error) {
      console.error('Error handling email change request:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during email change request'
      };
    }
  }, []);

  /**
   * Get complete user data by combining auth user and profile data
   * @param userId The user ID to get data for
   * @returns Combined user data or null if not found
   */
  const getUserWithProfile = useCallback(async (userId: string): Promise<(AppUser & Partial<UserProfile>) | null> => {
    try {
      if (!userId) {
        console.error('Cannot get user with profile: No user ID provided');
        return null;
      }

      // Get auth service via factory function
      const authService = getAuthService();
      
      // Get auth user
      const authUser = await authService.getCurrentUser();
      
      if (!authUser) {
        console.error('Cannot get user with profile: No authenticated user');
        return null;
      }
      
      // Get user profile
      const userProfile = await userProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        console.warn('User has auth record but no profile, returning auth data only');
        return authUser;
      }
      
      // Combine data with profile data taking precedence
      return {
        ...authUser,
        ...userProfile
      };
    } catch (error) {
      console.error('Error getting user with profile:', error);
      return null;
    }
  }, []);

  return {
    syncProfileWithAuth,
    validateOnboardingStatus,
    handleEmailChangeRequest,
    getUserWithProfile
  };
};
