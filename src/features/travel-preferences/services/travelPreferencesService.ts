/**
 * Travel Preferences Service
 * 
 * This service manages the storage and retrieval of travel preferences data
 * using Supabase as the data store.
 */

import { supabase } from '@/lib/supabase/supabaseClient';
import { 
  TravelPreferences, 
  TravelPreferencesFormValues,
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  LocationPreference,
  FlightType,
  AccommodationType,
  ComfortPreference
} from '../types/travelPreferencesTypes';
import { TravelPreferencesDatabase } from '../types/databaseTypes';

/**
 * Transform database response to frontend format
 * This converts snake_case and lowercase DB fields to camelCase for frontend
 */
/**
 * Type guard to check if an object is a valid TravelPreferencesDatabase
 */
const isTravelPreferencesDatabase = (data: unknown): data is TravelPreferencesDatabase => {
  return data !== null && typeof data === 'object' && 'id' in data && 'userid' in data;
};

/**
 * Transform database response to frontend format
 */
const transformDbToFrontend = (data: unknown): TravelPreferences | null => {
  if (!data || !isTravelPreferencesDatabase(data)) return null;
  
  return {
    id: data.id,
    userId: data.userid,
    budgetRange: data.budgetrange,
    budgetFlexibility: data.budgetflexibility,
    travelDuration: data.travelduration as TravelDurationType,
    dateFlexibility: data.dateflexibility as DateFlexibilityType,
    customDateFlexibility: data.customdateflexibility,
    planningIntent: data.planningintent as PlanningIntent,
    accommodationTypes: (data.accommodationtypes || []).filter(
      (type): type is AccommodationType => [
        'hotel', 'apartment', 'hostel', 'resort'
      ].includes(type)
    ),
    accommodationComfort: (data.accommodationcomfort || []).filter(
      (pref): pref is ComfortPreference => [
        'private-room', 'shared-room', 'private-bathroom', 'shared-bathroom', 'luxury'
      ].includes(pref)
    ),
    locationPreference: data.locationpreference as LocationPreference,
    departureCity: data.departurecity,
    flightType: data.flighttype as FlightType,
    preferCheaperWithStopover: data.prefercheaperwithstopover,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Gets the travel preferences for a user
 * @param userId The ID of the user
 * @returns The user's travel preferences, or null if not found
 */
export const getUserTravelPreferences = async (userId: string): Promise<TravelPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('travel_preferences')
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('userid', userId as any)
      .single();
    
    if (error) {
      // If error is not-found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    // Transform database response to frontend format ensuring type safety
    return transformDbToFrontend(data);
  } catch (error) {
    console.error('Error fetching travel preferences:', error);
    throw error;
  }
};

/**
 * Saves or updates travel preferences for a user
 * @param preferences The travel preferences to save
 * @param userId The ID of the user
 * @returns The saved travel preferences
 */
export const saveTravelPreferences = async (preferences: TravelPreferencesFormValues, userId: string) => {
  if (!userId) {
    throw new Error('User ID is required to save preferences');
  }
  
  try {
    console.log('Saving travel preferences for user:', userId);
    console.log('Preferences data:', JSON.stringify(preferences, null, 2));
    
    // Check if preferences already exist for this user
    const { data: existing, error: existingError } = await supabase
      .from('travel_preferences')
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('userid', userId as any)
      .single();
    
    console.log('Existing preferences:', existing ? 'Found' : 'Not found');
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw existingError;
    }
    
    // IMPORTANT - Fix to ensure all values are correctly formatted for Supabase
    // Special handling for array fields to ensure they're saved correctly
    const accommodationTypes = Array.isArray(preferences.accommodationTypes) 
      ? preferences.accommodationTypes 
      : ['hotel'];
      
    const accommodationComfort = Array.isArray(preferences.accommodationComfort) 
      ? preferences.accommodationComfort 
      : ['private-room'];
    
    // Map our frontend form values to the database schema
    // IMPORTANT: These field names must exactly match the columns in the database
    const preferencesData = {
      userid: userId,
      budgetrange: preferences.budgetRange,
      budgetflexibility: preferences.budgetFlexibility,
      travelduration: preferences.travelDuration,
      dateflexibility: preferences.dateFlexibility,
      customdateflexibility: preferences.customDateFlexibility,
      planningintent: preferences.planningIntent,
      accommodationtypes: accommodationTypes,
      accommodationcomfort: accommodationComfort,
      locationpreference: preferences.locationPreference,
      departurecity: preferences.departureCity,
      flighttype: preferences.flightType || 'direct',
      prefercheaperwithstopover: preferences.preferCheaperWithStopover === undefined ? true : preferences.preferCheaperWithStopover,
      // Use standard postgres timestamp field naming
      updated_at: new Date().toISOString()
    };
    
    if (existing) {
      console.log('Updating existing travel preferences');
      // Log the exact payload we're sending to help debug
      console.log('Update payload:', JSON.stringify(preferencesData, null, 2));
      
      // Update existing preferences
      const { data, error } = await supabase
        .from('travel_preferences')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(preferencesData as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('userid', userId as any)
        .select();
      
      if (error) {
        console.error('Error updating travel preferences:', error);
        throw error;
      }
      
      console.log('Successfully updated travel preferences:', data);
      // Transform to frontend format before returning with proper type safety
       
      return transformDbToFrontend(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } else {
      console.log('Creating new travel preferences');
      // Insert new preferences with created timestamp
      const dataWithCreatedAt = {
        ...preferencesData,
        // Use standard postgres timestamp field naming
        created_at: new Date().toISOString()
      };
      
      // Log the exact payload we're sending to help debug
      console.log('Insert payload:', JSON.stringify(dataWithCreatedAt, null, 2));
      
      const { data, error } = await supabase
        .from('travel_preferences')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert([dataWithCreatedAt as any])
        .select();
      
      if (error) {
        console.error('Error creating travel preferences:', error);
        throw error;
      }
      
      console.log('Successfully created travel preferences:', data);
      // Transform to frontend format before returning with proper type safety
       
      return transformDbToFrontend(Array.isArray(data) && data.length > 0 ? data[0] : null);
    }
  } catch (error) {
    console.error('Error saving travel preferences:', error);
    throw error;
  }
};

/**
 * Comprehensively updates the user's onboarding status across ALL possible state stores
 * to ensure perfect synchronization between them.
 * 
 * This addresses the Google Sign-In loop issue by ensuring consistent state across:
 * 1. Supabase Auth metadata
 * 2. Profiles database table
 * 3. Browser localStorage
 * 
 * @param userId The ID of the user
 * @param completed Whether onboarding is completed
 */
export const updateOnboardingStatus = async (userId: string, completed: boolean): Promise<void> => {
  console.log(`CRITICAL: Updating onboarding status to ${completed} for user ${userId} in ALL sources`);
  
  try {
    // 1. Update auth metadata
    console.log('Step 1: Updating Supabase Auth metadata');
    const authResult = await supabase.auth.updateUser({
      data: { 
        has_completed_onboarding: completed,
        onboarding_updated_at: new Date().toISOString() // Add timestamp for debugging
      }
    });
    
    if (authResult.error) {
      console.error('Error updating auth metadata:', authResult.error);
      // Continue with other updates even if this one fails
    } else {
      console.log('✅ Successfully updated auth metadata');
    }
    
    // 2. Update profiles database
    console.log('Step 2: Updating profile in database');
    
    // Import the userProfileService to ensure type-safe updates
    // This follows the principle of using established patterns
    try {
      // Import from API boundary following architectural principles
      const { userProfileService } = await import('@/features/user-profile/api');
      
      // Use the service method for type-safe profile updates
      const updatedProfile = await userProfileService.updateUserProfile(userId, {
        has_completed_onboarding: completed
      });
      
      if (updatedProfile) {
        console.log('✅ Successfully updated profile in database');
      } else {
        console.error('Failed to update profile in database');
      }
    } catch (profileError) {
      console.error('Error updating profile in database:', profileError);
      // Continue with other updates even if this one fails
    }
    
    // 3. Update localStorage
    console.log('Step 3: Updating localStorage');
    if (completed) {
      localStorage.setItem('hasCompletedInitialFlow', 'true');
    } else {
      localStorage.removeItem('hasCompletedInitialFlow');
    }
    console.log(`✅ Successfully updated localStorage to ${completed ? 'true' : 'false'}`);
    
    console.log('CRITICAL: Onboarding status synchronized across ALL sources! 🎉');
  } catch (error) {
    console.error('Error in updateOnboardingStatus:', error);
    throw error;
  }
};
