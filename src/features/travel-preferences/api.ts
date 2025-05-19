/**
 * Travel Preferences API
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * Following Planora's architectural principles with feature-first organization
 */

/**
 * Travel Preferences interface
 * Properly typed according to Planora's architectural principles
 */
export interface TravelPreferences {
  destinations: string[];
  preferredActivities: string[];
  travelStyle: string;
  budget?: string;
  tripDuration?: string;
  seasonPreference?: string;
}

/**
 * Travel Preferences Form Values
 * Used for form input of travel preferences
 */
export interface TravelPreferencesFormValues {
  destinations: string[];
  preferredActivities: string[];
  travelStyle: string;
  budget: string;
  tripDuration: string;
  seasonPreference: string;
}

/**
 * Travel Duration Type Enum
 */
export enum TravelDurationType {
  WEEKEND = 'weekend',
  SHORT_TRIP = 'short_trip',
  EXTENDED_VACATION = 'extended_vacation',
  LONG_TERM = 'long_term'
}

/**
 * Date Flexibility Type Enum
 */
export enum DateFlexibilityType {
  EXACT = 'exact',
  FLEXIBLE_DAYS = 'flexible_days',
  FLEXIBLE_WEEKS = 'flexible_weeks',
  FLEXIBLE_MONTHS = 'flexible_months',
  CUSTOM = 'custom'
}

/**
 * Planning Intent Enum
 */
export enum PlanningIntent {
  RELAXATION = 'relaxation',
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  BUSINESS = 'business',
  FAMILY = 'family'
}

/**
 * Accommodation Type Enum
 */
export enum AccommodationType {
  HOTEL = 'hotel',
  HOSTEL = 'hostel',
  APARTMENT = 'apartment',
  RESORT = 'resort',
  CAMPING = 'camping'
}

/**
 * Comfort Preference Enum
 */
export enum ComfortPreference {
  BUDGET = 'budget',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  LUXURY = 'luxury'
}

/**
 * Location Preference Enum
 */
export enum LocationPreference {
  CITY_CENTER = 'city_center',
  NEAR_ATTRACTIONS = 'near_attractions',
  QUIET_AREA = 'quiet_area',
  BUDGET_FRIENDLY = 'budget_friendly'
}

/**
 * Flight Type Enum
 */
export enum FlightType {
  DIRECT_ONLY = 'direct_only',
  ONE_STOP_MAX = 'one_stop_max',
  NO_PREFERENCE = 'no_preference'
}

/**
 * Mock travel preferences checking function
 * Always returns that preferences exist
 */
export const checkTravelPreferencesExist = async (_userId: string): Promise<boolean> => {
  console.log('MOCK: Checking travel preferences');
  return true;
};

/**
 * Mock get travel preferences function
 * Returns dummy data
 */
export const getUserTravelPreferences = async (_userId: string): Promise<TravelPreferences> => {
  console.log('MOCK: Getting travel preferences');
  return {
    destinations: ['Paris', 'Tokyo', 'New York'],
    preferredActivities: ['Sightseeing', 'Food Tours', 'Museums'],
    travelStyle: 'Explorer'
  };
};

/**
 * Mock save travel preferences function
 * Doesn't actually save anything
 */
export const saveTravelPreferences = async (_userId: string, _preferences: TravelPreferences): Promise<void> => {
  console.log('MOCK: Saving travel preferences');
  // Just redirect to dashboard in mock mode
  window.location.href = '/dashboard';
};

/**
 * Mock update onboarding status function
 * Doesn't actually update anything in the database
 */
export const updateOnboardingStatus = async (_userId: string, _hasCompleted: boolean = true): Promise<void> => {
  console.log('MOCK: Updating onboarding status to completed');
  // In mock mode, we don't actually update any database
  // Just store in localStorage for mock persistence
  localStorage.setItem('hasCompletedOnboarding', 'true');
};
