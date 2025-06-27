/**
 * User Profile Auth Integration Hook
 *
 * Integration layer between user-profile and auth features specifically.
 * Following Planora's architectural principles with feature-first organization.
 * This hook resolves circular dependencies by providing a single integration point.
 */

import { useCallback } from "react";
import { userProfileService } from "../services/userProfileService";
import { useAuthIntegration } from "@/hooks/integration/useAuthIntegration";

/**
 * Hook for integrating user profile with auth features
 * Provides methods for user profile-auth operations that interact between features
 */
export const useUserProfileAuthIntegration = () => {
  const { user, isAuthenticated } = useAuthIntegration();

  /**
   * Handle email change request
   * Ensures proper flow between auth and profile for email changes
   * @param userId User ID requesting email change
   * @param newEmail New email address
   * @returns Success status with message
   */
  const handleEmailChangeRequest = useCallback(
    async (
      userId: string,
      newEmail: string,
    ): Promise<{ success: boolean; message: string }> => {
      try {
        if (!userId || !newEmail) {
          return {
            success: false,
            message: "User ID and new email are required",
          };
        }

        if (!isAuthenticated || !user) {
          return {
            success: false,
            message: "User must be authenticated to change email",
          };
        }

        // For now, just update the profile and return a message
        // In a full implementation, this would trigger the auth service
        const profileUpdated = await userProfileService.updateUserProfile(
          userId,
          {
            emailVerified: false,
          },
        );

        if (!profileUpdated) {
          return {
            success: false,
            message: "Failed to update profile for email change",
          };
        }

        return {
          success: true,
          message:
            "Email change initiated. Please check your inbox for the verification link.",
        };
      } catch (error) {
        console.error("Error handling email change request:", error);
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unknown error during email change request",
        };
      }
    },
    [user, isAuthenticated],
  );

  /**
   * Get complete user data by combining auth user and profile data
   * @param userId The user ID to get data for
   * @returns Combined user data or null if not found
   */
  const getUserWithProfile = useCallback(
    async (userId: string) => {
      try {
        if (!userId) {
          console.error("Cannot get user with profile: No user ID provided");
          return null;
        }

        // First, get the auth user directly to avoid auth state issues
        let authUser = user;
        if (!authUser) {
          console.warn(
            "No user in auth integration, attempting direct auth service call",
          );
          try {
            const { getAuthService } = await import("@/features/auth/authApi");
            const authService = getAuthService();
            authUser = await authService.getCurrentUser();
          } catch (authError) {
            console.error("Could not get auth user:", authError);
            return null;
          }
        }

        if (!authUser) {
          console.error(
            "Cannot get user with profile: No authenticated user found",
          );
          return null;
        }

        // Get user profile with improved error handling
        let userProfile = null;
        try {
          userProfile = await userProfileService.getUserProfile(userId);
          if (import.meta.env.DEV) {
        console.log("Profile service returned:", userProfile);
      }
        } catch (profileError) {
          console.warn(
            "Profile service failed, will use auth data only:",
            profileError,
          );
          // Don't throw here - we'll use auth data as fallback
        }

        // If profile is null or empty, create a minimal profile from auth data
        if (!userProfile) {
          if (import.meta.env.DEV) {
          console.log("Creating profile from auth data for user:", userId);
        }
          return {
            id: authUser.id,
            email: authUser.email,
            username: authUser.username,
            firstName: authUser.firstName || "",
            lastName: authUser.lastName || "",
            birthdate: null,
            avatarUrl: authUser.avatarUrl || null,
            country: null,
            city: null,
            customCity: null,
            hasCompletedOnboarding: authUser.hasCompletedOnboarding || false,
            emailVerified: false, // Default value since not in AppUser
            isBetaTester: false,
            createdAt: new Date().toISOString(), // Default value since not in AppUser
            updatedAt: new Date().toISOString(), // Default value since not in AppUser
          };
        }

        // Combine auth user data with profile data, ensuring auth data takes precedence for core fields
        return {
          ...userProfile,
          ...authUser,
          // Ensure profile data is used for profile-specific fields
          firstName: userProfile.firstName || authUser.firstName || "",
          lastName: userProfile.lastName || authUser.lastName || "",
          birthdate: userProfile.birthdate,
          avatarUrl: userProfile.avatarUrl,
          country: userProfile.country,
          city: userProfile.city,
          customCity: userProfile.customCity,
          isBetaTester: userProfile.isBetaTester || false,
        };
      } catch (error) {
        console.error("Error getting user with profile:", error);
        // Return null instead of throwing to prevent component crashes
        return null;
      }
    },
    [user],
  );

  return {
    handleEmailChangeRequest,
    getUserWithProfile,
    // Expose auth state for convenience
    isAuthenticated,
    user,
  };
};
