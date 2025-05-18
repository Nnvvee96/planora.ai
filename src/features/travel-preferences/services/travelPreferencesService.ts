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
const transformDbToFrontend = (data: TravelPreferencesDatabase | null): TravelPreferences => {
  if (!data) return null;
  
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
    
    // Transform database response to frontend format
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
      // Transform to frontend format before returning
      return transformDbToFrontend(data[0]);
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
      // Transform to frontend format before returning
      return transformDbToFrontend(data[0]);
    }
  } catch (error) {
    console.error('Error saving travel preferences:', error);
    throw error;
  }
};

/**
 * Updates the user's onboarding completion status in auth metadata
 * @param userId The ID of the user
 * @param completed Whether onboarding is completed
 */
export const updateOnboardingStatus = async (userId: string, completed: boolean): Promise<void> => {
  try {
    // Update user metadata to mark onboarding as completed
    const { error } = await supabase.auth.updateUser({
      data: { has_completed_onboarding: completed }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
};
