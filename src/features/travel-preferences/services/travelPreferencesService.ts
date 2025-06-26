/**
 * Travel Preferences Service
 *
 * Service for managing travel preferences data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from "@/lib/supabase/client";
import {
  TravelPreferences,
  TravelPreferencesFormValues,
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType,
} from "../types/travelPreferencesTypes";
import { User } from "@supabase/supabase-js";

/**
 * Maps database snake_case to application camelCase
 */
const mapDbToTravelPreferences = (
  dbData: Record<string, unknown>,
): TravelPreferences => {
  // Set default values that match our enums exactly
  const defaultTravelDuration = TravelDurationType.WEEKEND;
  const defaultDateFlexibility = DateFlexibilityType.FIXED;
  const defaultPlanningIntent = PlanningIntent.EXPLORING;
  const defaultAccommodationType = AccommodationType.HOTEL;
  const defaultComfortPreference = ComfortPreference.PRIVATE_ROOM;
  const defaultLocationPreference = LocationPreference.CENTER;
  const defaultFlightType = FlightType.DIRECT;

  // Helper to safely cast string to enum or use default
  const safeEnumCast = <T extends string>(
    value: unknown,
    enumObj: Record<string, T>,
    defaultValue: T,
  ): T => {
    if (
      typeof value === "string" &&
      Object.values(enumObj).includes(value as T)
    ) {
      return value as T;
    }
    return defaultValue;
  };

  return {
    id: String(dbData.id || ""),
    userId: String(dbData.user_id || ""),
    budgetRange: {
      min: Number(dbData.budget_min || 0),
      max: Number(dbData.budget_max || 0),
    },
    budgetFlexibility: Number(dbData.budget_flexibility || 0),
    travelDuration: safeEnumCast(
      dbData.travel_duration,
      TravelDurationType,
      defaultTravelDuration,
    ),
    dateFlexibility: safeEnumCast(
      dbData.date_flexibility,
      DateFlexibilityType,
      defaultDateFlexibility,
    ),
    customDateFlexibility: dbData.custom_date_flexibility
      ? String(dbData.custom_date_flexibility)
      : undefined,
    planningIntent: safeEnumCast(
      dbData.planning_intent,
      PlanningIntent,
      defaultPlanningIntent,
    ),
    accommodationTypes: Array.isArray(dbData.accommodation_types)
      ? dbData.accommodation_types.map((t) =>
          safeEnumCast(t, AccommodationType, defaultAccommodationType),
        )
      : [defaultAccommodationType],
    accommodationComfort: Array.isArray(dbData.accommodation_comfort)
      ? dbData.accommodation_comfort.map((c) =>
          safeEnumCast(c, ComfortPreference, defaultComfortPreference),
        )
      : [defaultComfortPreference],
    locationPreference: safeEnumCast(
      dbData.location_preference,
      LocationPreference,
      defaultLocationPreference,
    ),
    flightType: safeEnumCast(dbData.flight_type, FlightType, defaultFlightType),
    preferCheaperWithStopover: Boolean(dbData.prefer_cheaper_with_stopover),
    departureCity: String(dbData.departure_city || ""),
    departureCountry: String(dbData.departure_country || ""),
    createdAt: dbData.created_at ? String(dbData.created_at) : undefined,
    updatedAt: dbData.updated_at ? String(dbData.updated_at) : undefined,
  };
};

/**
 * Maps application camelCase to database snake_case
 */
const mapToDbTravelPreferences = (
  prefs: Partial<TravelPreferences>,
): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};

  if (prefs.userId !== undefined) dbData.user_id = prefs.userId;

  if (prefs.budgetRange !== undefined) {
    dbData.budget_min = prefs.budgetRange.min;
    dbData.budget_max = prefs.budgetRange.max;
  }

  if (prefs.budgetFlexibility !== undefined)
    dbData.budget_flexibility = prefs.budgetFlexibility;
  if (prefs.travelDuration !== undefined)
    dbData.travel_duration = prefs.travelDuration;
  if (prefs.dateFlexibility !== undefined)
    dbData.date_flexibility = prefs.dateFlexibility;
  if (prefs.customDateFlexibility !== undefined)
    dbData.custom_date_flexibility = prefs.customDateFlexibility;
  if (prefs.planningIntent !== undefined)
    dbData.planning_intent = prefs.planningIntent;
  if (prefs.accommodationTypes !== undefined)
    dbData.accommodation_types = prefs.accommodationTypes;
  if (prefs.accommodationComfort !== undefined)
    dbData.accommodation_comfort = prefs.accommodationComfort;
  if (prefs.locationPreference !== undefined)
    dbData.location_preference = prefs.locationPreference;
  if (prefs.flightType !== undefined) dbData.flight_type = prefs.flightType;
  if (prefs.preferCheaperWithStopover !== undefined)
    dbData.prefer_cheaper_with_stopover = prefs.preferCheaperWithStopover;
  if (prefs.departureCity !== undefined)
    dbData.departure_city = prefs.departureCity;
  if (prefs.departureCountry !== undefined)
    dbData.departure_country = prefs.departureCountry;

  // Add updated timestamp
  dbData.updated_at = new Date().toISOString();

  return dbData;
};

/**
 * Travel preferences service
 * Provides methods for travel preferences operations
 */
export const travelPreferencesService = {
  /**
   * Check if travel preferences exist for user
   * @param userId The user ID to check
   * @returns True if preferences exist
   */
  checkTravelPreferencesExist: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("travel_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error checking travel preferences existence:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking travel preferences existence:", error);
      return false;
    }
  },

  /**
   * Get travel preferences for user
   * @param userId The user ID to get preferences for
   * @returns Travel preferences or null if not found
   */
  getUserTravelPreferences: async (
    userId: string,
  ): Promise<TravelPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from("travel_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching travel preferences:", error);
        return null;
      }

      return data
        ? mapDbToTravelPreferences(data as Record<string, unknown>)
        : null;
    } catch (error) {
      console.error("Error fetching travel preferences:", error);
      return null;
    }
  },

  /**
   * Save travel preferences for user
   * If preferences exist, they are updated; otherwise, they are created
   * @param userId The user ID to save preferences for
   * @param preferences The preferences to save
   * @returns True if save was successful
   */
  saveTravelPreferences: async (
    userId: string,
    preferences: Partial<TravelPreferencesFormValues>,
  ): Promise<boolean> => {
    try {
      const dbPrefs = mapToDbTravelPreferences({
        ...preferences,
        userId: userId,
      });

      const { error } = await supabase
        .from("travel_preferences")
        .upsert(dbPrefs, { onConflict: "user_id" });

      if (error) {
        console.error("Error saving travel preferences:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving travel preferences:", error);
      return false;
    }
  },

  /**
   * Migrate travel preferences from user metadata or localStorage to the database
   * @param user The user object
   * @returns True if migration was successful
   */
  migrateTravelPreferences: async (user: User): Promise<boolean> => {
    try {
      const { data: existingPrefs } = await supabase
        .from("travel_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingPrefs) {
        return true;
      }

      const metadataPrefs = user.user_metadata?.travel_preferences;
      const localPrefs = localStorage.getItem("userTravelPreferences");
      const parsedLocalPrefs = localPrefs ? JSON.parse(localPrefs) : null;

      const prefsToSave = metadataPrefs || parsedLocalPrefs;

      if (prefsToSave) {
        return travelPreferencesService.saveTravelPreferences(
          user.id,
          prefsToSave,
        );
      }

      return false;
    } catch (error) {
      console.error("Error migrating travel preferences:", error);
      return false;
    }
  },

  /**
   * Update onboarding status for user
   * @param userId The user ID to update
   * @param hasCompleted Whether onboarding is completed
   * @returns True if update was successful
   */
  updateOnboardingStatus: async (
    userId: string,
    hasCompleted: boolean = true,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: hasCompleted })
        .eq("id", userId);

      if (error) {
        console.error("Error updating onboarding status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      return false;
    }
  },

  /**
   * Deletes all travel preferences for a specific user.
   * @param userId The ID of the user whose preferences should be deleted.
   * @returns A promise that resolves when the operation is complete.
   */
  deleteUserTravelPreferences: async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("travel_preferences")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(
          `Error deleting travel preferences for user ${userId}:`,
          error,
        );
        throw error;
      }
    } catch (error) {
      console.error(
        `Unexpected error deleting travel preferences for user ${userId}:`,
        error,
      );
      throw error;
    }
  },
};
