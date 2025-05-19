/**
 * Travel Preferences Service
 * 
 * Service for managing travel preferences data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/lib/supabase';
import { 
  TravelPreferences,
  TravelPreferencesFormValues,
  BudgetRange,
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType
} from '../types/travelPreferencesTypes';

/**
 * Maps database snake_case to application camelCase
 */
const mapDbToTravelPreferences = (dbData: Record<string, unknown>): TravelPreferences => {
  return {
    id: String(dbData.id || ''),
    userId: String(dbData.user_id || ''),
    budgetRange: {
      min: Number(dbData.budget_min || 0),
      max: Number(dbData.budget_max || 0)
    },
    budgetFlexibility: Number(dbData.budget_flexibility || 0),
    travelDuration: (dbData.travel_duration as TravelDurationType) || 'week',
    dateFlexibility: (dbData.date_flexibility as DateFlexibilityType) || 'flexible-few',
    customDateFlexibility: dbData.custom_date_flexibility ? String(dbData.custom_date_flexibility) : undefined,
    planningIntent: (dbData.planning_intent as PlanningIntent) || 'exploring',
    accommodationTypes: Array.isArray(dbData.accommodation_types) ? dbData.accommodation_types as AccommodationType[] : [],
    accommodationComfort: Array.isArray(dbData.accommodation_comfort) ? dbData.accommodation_comfort as ComfortPreference[] : [],
    locationPreference: (dbData.location_preference as LocationPreference) || 'center',
    flightType: (dbData.flight_type as FlightType) || 'direct',
    preferCheaperWithStopover: Boolean(dbData.prefer_cheaper_with_stopover),
    departureCity: String(dbData.departure_city || ''),
    createdAt: dbData.created_at ? String(dbData.created_at) : undefined,
    updatedAt: dbData.updated_at ? String(dbData.updated_at) : undefined
  };
};

/**
 * Maps application camelCase to database snake_case
 */
const mapToDbTravelPreferences = (prefs: Partial<TravelPreferences>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};
  
  if (prefs.userId !== undefined) dbData.user_id = prefs.userId;
  
  if (prefs.budgetRange !== undefined) {
    dbData.budget_min = prefs.budgetRange.min;
    dbData.budget_max = prefs.budgetRange.max;
  }
  
  if (prefs.budgetFlexibility !== undefined) dbData.budget_flexibility = prefs.budgetFlexibility;
  if (prefs.travelDuration !== undefined) dbData.travel_duration = prefs.travelDuration;
  if (prefs.dateFlexibility !== undefined) dbData.date_flexibility = prefs.dateFlexibility;
  if (prefs.customDateFlexibility !== undefined) dbData.custom_date_flexibility = prefs.customDateFlexibility;
  if (prefs.planningIntent !== undefined) dbData.planning_intent = prefs.planningIntent;
  if (prefs.accommodationTypes !== undefined) dbData.accommodation_types = prefs.accommodationTypes;
  if (prefs.accommodationComfort !== undefined) dbData.accommodation_comfort = prefs.accommodationComfort;
  if (prefs.locationPreference !== undefined) dbData.location_preference = prefs.locationPreference;
  if (prefs.flightType !== undefined) dbData.flight_type = prefs.flightType;
  if (prefs.preferCheaperWithStopover !== undefined) dbData.prefer_cheaper_with_stopover = prefs.preferCheaperWithStopover;
  if (prefs.departureCity !== undefined) dbData.departure_city = prefs.departureCity;
  
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
        .from('travel_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error checking travel preferences existence:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking travel preferences existence:', error);
      return false;
    }
  },
  
  /**
   * Get travel preferences for user
   * @param userId The user ID to get preferences for
   * @returns Travel preferences or null if not found
   */
  getUserTravelPreferences: async (userId: string): Promise<TravelPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from('travel_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching travel preferences:', error);
        return null;
      }
      
      return data ? mapDbToTravelPreferences(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('Error fetching travel preferences:', error);
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
  saveTravelPreferences: async (userId: string, preferences: Partial<TravelPreferencesFormValues>): Promise<boolean> => {
    try {
      console.log('Saving travel preferences for user:', userId);
      console.log('Preferences data:', JSON.stringify(preferences, null, 2));
      
      if (!userId) {
        console.error('Cannot save travel preferences: Missing user ID');
        return false;
      }
      
      // Check if preferences already exist
      const exists = await travelPreferencesService.checkTravelPreferencesExist(userId);
      console.log('Existing preferences found:', exists);
      
      // Convert to database format with explicit type handling
      const prefsWithUserId = {
        ...preferences,
        userId
      };
      
      // Ensure budget values are properly converted to numbers
      if (preferences.budgetRange) {
        preferences.budgetRange.min = Number(preferences.budgetRange.min);
        preferences.budgetRange.max = Number(preferences.budgetRange.max);
      }
      
      if (preferences.budgetFlexibility) {
        preferences.budgetFlexibility = Number(preferences.budgetFlexibility);
      }
      
      const dbPrefs = mapToDbTravelPreferences(prefsWithUserId);
      console.log('Mapped DB preferences:', dbPrefs);
      
      let error: Error | null = null;
      
      if (exists) {
        // Update existing preferences
        console.log('Updating existing travel preferences');
        const result = await supabase
          .from('travel_preferences')
          .update({
            ...dbPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        error = result.error;
      } else {
        // Create new preferences
        console.log('Creating new travel preferences');
        const timestamp = new Date().toISOString();
        
        const result = await supabase
          .from('travel_preferences')
          .insert({
            ...dbPrefs,
            user_id: userId,
            created_at: timestamp,
            updated_at: timestamp
          });
        
        error = result.error;
      }
      
      if (error) {
        console.error('Error saving travel preferences:', error);
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      console.error('Error saving travel preferences:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  },
  
  /**
   * Update onboarding status for user
   * @param userId The user ID to update
   * @param hasCompleted Whether onboarding is completed
   * @returns True if update was successful
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: hasCompleted })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating onboarding status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return false;
    }
  }
};
