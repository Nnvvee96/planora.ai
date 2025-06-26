/**
 * User Data Integration Hook
 *
 * Integration hook for coordinating user profile and travel preferences data.
 * Following Planora's architectural principles with proper feature boundaries.
 */

import { useCallback } from "react";
import {
  userProfileService,
  type UserProfile,
} from "@/features/user-profile/userProfileApi";
import {
  travelPreferencesService,
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType,
} from "@/features/travel-preferences/travelPreferencesApi";

/**
 * Integration hook for managing user data across profile and travel preferences
 */
export function useUserDataIntegration() {
  // Use service functions directly for cross-feature operations

  /**
   * Synchronize location data between profile and travel preferences when onboarding completes
   */
  const syncLocationDataOnOnboardingComplete = useCallback(
    async (
      userId: string,
      profileData: Partial<UserProfile>,
    ): Promise<UserProfile | null> => {
      try {
        // If marking onboarding as complete, sync location data
        if (profileData.hasCompletedOnboarding === true) {
          const currentProfile =
            await userProfileService.getUserProfile(userId);

          if (currentProfile) {
            // Add onboarding departure location to the update
            const updatedProfileData = {
              ...profileData,
              onboardingDepartureCountry: currentProfile.country,
              onboardingDepartureCity: currentProfile.city,
            };

            return await userProfileService.updateUserProfile(
              userId,
              updatedProfileData,
            );
          }
        }

        // Regular profile update without sync
        return await userProfileService.updateUserProfile(userId, profileData);
      } catch (error) {
        console.error(
          "Error syncing location data on onboarding complete:",
          error,
        );
        return null;
      }
    },
    [],
  );

  /**
   * Ensure travel preferences exist for a user
   */
  const ensureTravelPreferencesExist = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const prefsExist =
          await travelPreferencesService.checkTravelPreferencesExist(userId);

        if (!prefsExist) {
          const currentPrefs =
            await travelPreferencesService.getUserTravelPreferences(userId);

          if (!currentPrefs) {
            // Create default travel preferences
            await travelPreferencesService.saveTravelPreferences(userId, {
              budgetRange: { min: 500, max: 2000 },
              budgetFlexibility: 10,
              travelDuration: TravelDurationType.WEEK,
              dateFlexibility: DateFlexibilityType.FLEXIBLE_FEW,
              planningIntent: PlanningIntent.EXPLORING,
              accommodationTypes: [AccommodationType.HOTEL],
              accommodationComfort: [ComfortPreference.PRIVATE_ROOM],
              locationPreference: LocationPreference.ANYWHERE,
              flightType: FlightType.DIRECT,
              preferCheaperWithStopover: false,
              departureCountry: "",
              departureCity: "",
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error ensuring travel preferences exist:", error);
        return false;
      }
    },
    [],
  );

  /**
   * Delete all user data (profile and travel preferences)
   */
  const deleteAllUserData = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        // Delete travel preferences first
        await travelPreferencesService.deleteUserTravelPreferences(userId);

        // Then delete profile
        const result = await userProfileService.deleteUserProfile(userId);

        return result.success;
      } catch (error) {
        console.error("Error deleting all user data:", error);
        return false;
      }
    },
    [],
  );

  return {
    syncLocationDataOnOnboardingComplete,
    ensureTravelPreferencesExist,
    deleteAllUserData,
  };
}
