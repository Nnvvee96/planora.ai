/**
 * Auth Profile Integration Hook
 *
 * Integration layer between auth and profile features specifically.
 * Following Planora's architectural principles with feature-first organization.
 * This hook resolves circular dependencies by providing a single integration point.
 */

import { useCallback } from "react";
import { getAuthService } from "../authApi";
import { userProfileService } from "@/features/user-profile/userProfileApi";
import type { AppUser } from "../types/authTypes";

/**
 * Hook for integrating auth with profile features
 * Provides methods for auth-profile operations that interact between features
 */
export const useAuthProfileIntegration = () => {
  /**
   * Update user profile after successful authentication
   * @param user The authenticated user
   * @returns True if profile was successfully updated
   */
  const updateUserProfileAfterAuth = useCallback(
    async (user: AppUser): Promise<boolean> => {
      try {
        if (!user || !user.id) {
          console.error("Cannot update profile: No valid user provided");
          return false;
        }

        // First check if profile exists
        const profileExists = await userProfileService.checkProfileExists(
          user.id,
        );

        if (!profileExists) {
          // Create new profile with data from auth user
          const success = await userProfileService.updateUserProfile(user.id, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          });

          return !!success;
        } else {
          // Ensure profile is up-to-date with auth data
          const result = await userProfileService.updateUserProfile(user.id, {
            email: user.email,
          });
          return !!result;
        }
      } catch (error) {
        console.error("Error updating user profile after auth:", error);
        return false;
      }
    },
    [],
  );

  /**
   * Complete onboarding process by updating both auth and profile records
   * @param userId The user ID to update
   * @param hasCompleted Whether onboarding has been completed
   * @returns True if both auth and profile were successfully updated
   */
  const completeOnboarding = useCallback(
    async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
      try {
        if (!userId) {
          console.error("Cannot complete onboarding: No user ID provided");
          return false;
        }

        // Get auth service via factory function
        const authService = getAuthService();

        // Update auth record
        const authSuccess = await authService.updateOnboardingStatus(
          userId,
          hasCompleted,
        );

        // Update profile record
        const profileResult = await userProfileService.updateOnboardingStatus(
          userId,
          hasCompleted,
        );

        return authSuccess && !!profileResult;
      } catch (error) {
        console.error("Error completing onboarding:", error);
        return false;
      }
    },
    [],
  );

  /**
   * Get complete user data by combining auth user and profile data
   * @param userId The user ID to get data for
   * @returns Combined user data or null if not found
   */
  const getUserWithProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.error("Cannot get user with profile: No user ID provided");
        return null;
      }

      // Get auth service via factory function
      const authService = getAuthService();

      // Get auth user
      const authUser = await authService.getCurrentUser();

      if (!authUser) {
        console.error("Cannot get user with profile: No authenticated user");
        return null;
      }

      // Get user profile
      const userProfile = await userProfileService.getUserProfile(userId);

      if (!userProfile) {
        console.warn(
          "User has auth record but no profile, returning auth data only",
        );
        return authUser;
      }

      // Combine data with profile data taking precedence
      return {
        ...authUser,
        ...userProfile,
      };
    } catch (error) {
      console.error("Error getting user with profile:", error);
      return null;
    }
  }, []);

  return {
    updateUserProfileAfterAuth,
    completeOnboarding,
    getUserWithProfile,
  };
};
