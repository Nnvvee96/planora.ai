/**
 * useTravelPreferencesIntegration hook
 * 
 * This is an integration hook that provides a clean interface to the travel-preferences feature.
 * It isolates the implementation details of the travel-preferences feature and provides only what other
 * features need to know about travel preferences.
 */

// Import only from the feature's public API
import { 
  useTravelPreferences, 
  TravelPreferences, 
  TravelPreferencesFormValues 
} from '@/features/travel-preferences/api';

/**
 * useTravelPreferencesIntegration
 * 
 * @returns Interface to interact with the travel-preferences feature
 */
export function useTravelPreferencesIntegration() {
  // Use the travel-preferences feature's public hook
  const { 
    preferences, 
    isLoading, 
    error, 
    savePreferences, 
    refresh 
  } = useTravelPreferences();
  
  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    preferences,
    isLoading,
    error,
    savePreferences,
    refresh,
    
    // Add derived data that might be useful for other features
    hasPreferences: !!preferences,
    budgetMinimum: preferences?.budgetRange?.min || 0,
    budgetMaximum: preferences?.budgetRange?.max || 0,
    travelDuration: preferences?.travelDuration || '',
    preferredAccommodations: preferences?.accommodationTypes || [],
  };
}

// Export types that might be needed by consumers of this integration hook
export type { TravelPreferences, TravelPreferencesFormValues };
