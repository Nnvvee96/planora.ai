/**
 * useTravelPreferencesIntegration hook
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * This is an integration hook that provides a clean interface to the travel-preferences feature.
 * Following Planora's architectural principles with feature-first organization.
 */

// Import only from the feature's public API
import { 
  TravelPreferences,
  getUserTravelPreferences,
  saveTravelPreferences
} from '@/features/travel-preferences/api';
import { useState, useEffect } from 'react';
import { useAuthIntegration } from './useAuthIntegration';

/**
 * useTravelPreferencesIntegration
 * 
 * @returns Interface to interact with the travel-preferences feature
 */
export function useTravelPreferencesIntegration() {
  // Get auth info to know which user's preferences to load
  const { user, isAuthenticated } = useAuthIntegration();
  
  // Set up state
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load preferences when user is authenticated
  useEffect(() => {
    const loadPreferences = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          const prefs = await getUserTravelPreferences(user.id);
          setPreferences(prefs);
          setError(null);
        } catch (err) {
          setError('Failed to load travel preferences');
          console.error('MOCK: Error loading preferences', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadPreferences();
  }, [isAuthenticated, user]);
  
  // Save preferences function
  const savePrefs = async (newPreferences: TravelPreferences) => {
    if (!user) {
      setError('Must be logged in to save preferences');
      return false;
    }
    
    setIsLoading(true);
    try {
      await saveTravelPreferences(user.id, newPreferences);
      setPreferences(newPreferences);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to save travel preferences');
      console.error('MOCK: Error saving preferences', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh function to reload preferences
  const refresh = async () => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      try {
        const prefs = await getUserTravelPreferences(user.id);
        setPreferences(prefs);
        setError(null);
      } catch (err) {
        setError('Failed to refresh travel preferences');
        console.error('MOCK: Error refreshing preferences', err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    preferences,
    isLoading,
    error,
    savePreferences: savePrefs,
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
