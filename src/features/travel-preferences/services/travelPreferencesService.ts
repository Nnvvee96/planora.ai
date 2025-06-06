/**
 * Travel Preferences Service
 * 
 * Service for managing travel preferences data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/database/databaseApi';
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
import { AppUser } from "@/features/auth/types/authTypes";

/**
 * Initializes the module and sets up auto-migration of travel preferences
 * This ensures any user who completed onboarding has preferences in the database
 */
const initializePreferencesModule = async () => {
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Check if user has completed onboarding
    const user = session.user;
    const hasCompleted = 
      user.user_metadata?.has_completed_onboarding === true || 
      localStorage.getItem('hasCompletedInitialFlow') === 'true';
      
    if (!hasCompleted) return;
    
    // Check if travel preferences exist in the database
    const { data: existingPrefs } = await supabase
      .from('travel_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    // If preferences already exist, no need to migrate
    if (existingPrefs) return;
    
    // No preferences in database but user completed onboarding
    // Try to migrate from user metadata or localStorage
    console.log('⚠️ User completed onboarding but has no travel preferences - attempting migration');
    
    // Check metadata first
    const metadataPrefs = user.user_metadata?.travel_preferences;
    
    // Check localStorage as fallback
    const localPrefs = localStorage.getItem('userTravelPreferences');
    const parsedLocalPrefs = localPrefs ? JSON.parse(localPrefs) : null;
    
    // Prepare data for insertion
    const prefsToSave = metadataPrefs || parsedLocalPrefs || {
      // Default values if nothing found
      accommodation_types: ['hotel'],
      accommodation_comfort: ['private-room'],
      budget_range: { min: 500, max: 2000 },
      budget_tolerance: 10,
      travel_duration: 'week',
      date_flexibility: 'flexible-few',
      planning_intent: 'exploring',
      location_preference: 'center',
      flight_type: 'direct',
      prefer_cheaper_with_stopover: false,
      departure_city: 'Berlin'
    };
    
    // Insert the preferences
    const insertResult = await supabase
      .from('travel_preferences')
      .insert({
        user_id: user.id,
        budget_min: prefsToSave.budget_range?.min || 500,
        budget_max: prefsToSave.budget_range?.max || 2000,
        budget_flexibility: prefsToSave.budget_tolerance || 10,
        travel_duration: prefsToSave.travel_duration || 'week',
        date_flexibility: prefsToSave.date_flexibility || 'flexible-few',
        planning_intent: prefsToSave.planning_intent || 'exploring',
        accommodation_types: prefsToSave.accommodation_types || ['hotel'],
        accommodation_comfort: prefsToSave.accommodation_comfort || ['private-room'],
        location_preference: prefsToSave.location_preference || 'center',
        flight_type: prefsToSave.flight_type || 'direct',
        prefer_cheaper_with_stopover: Boolean(prefsToSave.prefer_cheaper_with_stopover),
        departure_city: prefsToSave.departure_city || prefsToSave.departure_location || 'Berlin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertResult.error) {
      console.error('Failed to migrate travel preferences:', insertResult.error);
    } else {
      console.log('✅ Successfully migrated travel preferences for user', user.id);
    }
  } catch (error) {
    console.error('Error in travel preferences auto-migration:', error);
  }
};

// Run the initialization when the module loads
initializePreferencesModule();

/**
 * Maps database snake_case to application camelCase
 */
const mapDbToTravelPreferences = (dbData: Record<string, unknown>): TravelPreferences => {
  // Set default values that match our enums exactly
  const defaultTravelDuration = TravelDurationType.WEEK;
  const defaultDateFlexibility = DateFlexibilityType.FLEXIBLE_FEW;
  const defaultPlanningIntent = PlanningIntent.EXPLORING;
  const defaultLocationPreference = LocationPreference.CENTER;
  const defaultFlightType = FlightType.DIRECT;
  
  // Helper to safely cast string to enum or use default
  const safeEnumCast = <T extends string>(value: unknown, enumObj: Record<string, T>, defaultValue: T): T => {
    if (typeof value === 'string' && Object.values(enumObj).includes(value as T)) {
      return value as T;
    }
    return defaultValue;
  };
  
  return {
    id: String(dbData.id || ''),
    userId: String(dbData.user_id || ''),
    budgetRange: {
      min: Number(dbData.budget_min || 0),
      max: Number(dbData.budget_max || 0)
    },
    budgetFlexibility: Number(dbData.budget_flexibility || 0),
    travelDuration: safeEnumCast(dbData.travel_duration, TravelDurationType, defaultTravelDuration),
    dateFlexibility: safeEnumCast(dbData.date_flexibility, DateFlexibilityType, defaultDateFlexibility),
    customDateFlexibility: dbData.custom_date_flexibility ? String(dbData.custom_date_flexibility) : undefined,
    planningIntent: safeEnumCast(dbData.planning_intent, PlanningIntent, defaultPlanningIntent),
    accommodationTypes: Array.isArray(dbData.accommodation_types) ? 
      dbData.accommodation_types.filter((type): type is AccommodationType => 
        typeof type === 'string' && Object.values(AccommodationType).includes(type as AccommodationType)) : [],
    accommodationComfort: Array.isArray(dbData.accommodation_comfort) ? 
      dbData.accommodation_comfort.filter((type): type is ComfortPreference => 
        typeof type === 'string' && Object.values(ComfortPreference).includes(type as ComfortPreference)) : [],
    locationPreference: safeEnumCast(dbData.location_preference, LocationPreference, defaultLocationPreference),
    flightType: safeEnumCast(dbData.flight_type, FlightType, defaultFlightType),
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
      
      // Force supabase to refresh the auth token to ensure we have the latest session
      // This is important when working with RLS policies
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        } else {
          console.log('Session refreshed successfully');
        }
      } catch (sessionErr) {
        console.error('Error refreshing session:', sessionErr);
      }
      
      // Check if preferences already exist
      const exists = await travelPreferencesService.checkTravelPreferencesExist(userId);
      console.log('Existing preferences found:', exists);
      
      // Create a properly formatted preferences object with userId
      const prefsWithUserId: Partial<TravelPreferences> = {
        userId,
        // Explicitly handle each field to ensure proper typing
        budgetRange: preferences.budgetRange ? {
          min: Number(preferences.budgetRange.min || 0),
          max: Number(preferences.budgetRange.max || 0)
        } : undefined,
        budgetFlexibility: preferences.budgetFlexibility !== undefined ? 
          Number(preferences.budgetFlexibility) : undefined,
        travelDuration: preferences.travelDuration,
        dateFlexibility: preferences.dateFlexibility,
        customDateFlexibility: preferences.customDateFlexibility,
        planningIntent: preferences.planningIntent,
        accommodationTypes: preferences.accommodationTypes,
        accommodationComfort: preferences.accommodationComfort,
        locationPreference: preferences.locationPreference,
        flightType: preferences.flightType,
        preferCheaperWithStopover: preferences.preferCheaperWithStopover,
        departureCity: preferences.departureCity
      };
      
      // Map to database format with snake_case fields
      const dbPrefs = mapToDbTravelPreferences(prefsWithUserId);
      console.log('Mapped DB preferences for insertion:', dbPrefs);
      
      // Use database column names directly to ensure matching with SQL schema
      // IMPORTANT: Only include fields that actually exist in the database
      // The custom_date_flexibility column has been added to the database schema
      const dbRecord = {
        user_id: userId,
        budget_min: dbPrefs.budget_min ?? 0,
        budget_max: dbPrefs.budget_max ?? 0,
        budget_flexibility: dbPrefs.budget_flexibility ?? 0,
        travel_duration: dbPrefs.travel_duration ?? 'week',
        date_flexibility: dbPrefs.date_flexibility ?? 'flexible-few',
        custom_date_flexibility: dbPrefs.custom_date_flexibility ?? '',
        planning_intent: dbPrefs.planning_intent ?? 'exploring',
        accommodation_types: dbPrefs.accommodation_types ?? ['hotel'],
        accommodation_comfort: dbPrefs.accommodation_comfort ?? ['private-room'],
        location_preference: dbPrefs.location_preference ?? 'center',
        flight_type: dbPrefs.flight_type ?? 'direct',
        prefer_cheaper_with_stopover: typeof dbPrefs.prefer_cheaper_with_stopover === 'boolean' ? 
          dbPrefs.prefer_cheaper_with_stopover : false,
        departure_city: dbPrefs.departure_city ?? 'Berlin',
        updated_at: new Date().toISOString()
      };
      
      console.log('Final DB record for insertion:', dbRecord);
      
      // Use UPSERT with onConflict strategy - this is the most reliable approach with RLS
      console.log('Using upsert strategy for saving preferences');
      const result = await supabase
        .from('travel_preferences')
        .upsert({
          ...dbRecord,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      console.log('Upsert result:', result);
      
      if (result.error) {
        console.error('Error saving travel preferences:', result.error);
        
        // Special handling for RLS-related errors
        if (result.error.code === '42501' || result.error.message.includes('permission denied')) {
          console.error('This appears to be a Row Level Security (RLS) error');
          console.log('Attempting to verify RLS policies are set correctly...');
          
          // Confirm user authentication status
          const { data: authData } = await supabase.auth.getUser();
          console.log('Current auth user:', authData);
          
          // Make one more attempt with explicit user ID check
          console.log('Attempting alternative approach...');
          try {
            // First create a new row for the user if it doesn't exist yet
            const tempData = {
              user_id: userId,
              budget_min: 1000,
              budget_max: 5000,
              departure_city: 'Berlin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Try inserting a minimal record first if it doesn't exist
            if (!exists) {
              const preInsert = await supabase
                .from('travel_preferences')
                .insert(tempData);
                
              console.log('Pre-insert result:', preInsert);
            }
            
            // Then try updating specific fields one by one
            const updateOps = [];
            for (const [key, value] of Object.entries(dbRecord)) {
              if (key !== 'user_id' && key !== 'created_at') {
                const fieldUpdate = await supabase
                  .from('travel_preferences')
                  .update({ [key]: value })
                  .eq('user_id', userId);
                  
                updateOps.push({ field: key, result: fieldUpdate });
              }
            }
            
            console.log('Individual field updates:', updateOps);
            
            // Check if at least some updates succeeded
            const someSucceeded = updateOps.some(op => !op.result.error);
            if (someSucceeded) {
              console.log('Some fields were successfully updated');
              return true;
            }
          } catch (err) {
            console.error('Alternative approach also failed:', err);
          }
        }
        
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
