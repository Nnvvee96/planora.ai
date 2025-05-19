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
