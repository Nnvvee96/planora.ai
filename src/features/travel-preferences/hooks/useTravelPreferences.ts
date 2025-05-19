/**
 * Custom hook for managing travel preferences
 * 
 * This hook provides access to the user's travel preferences with
 * functions to fetch, update, and manage preference data.
 * Following Planora's architectural principles of feature-first organization
 * and proper separation of concerns.
 */

import { useState, useEffect } from 'react';
import { TravelPreferences } from '../api';
import { authService } from '../../auth/api';

// Define the return type for our hook
interface UseTravelPreferencesResult {
  /** The user's travel preferences */
  preferences: TravelPreferences | null;
  /** Whether preferences are currently being loaded */
  isLoading: boolean;
  /** Any error that occurred while loading preferences */
  error: Error | null;
  /** Function to save or update preferences */
  savePreferences: (data: Partial<TravelPreferences>) => Promise<void>;
  /** Function to refresh the preferences data */
  refresh: () => Promise<void>;
}

/**
 * Hook for accessing and managing travel preferences
 * @returns Object with preferences data and management functions
 */
export const useTravelPreferences = (): UseTravelPreferencesResult => {
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load preferences on mount
  const loadPreferences = async (): Promise<void> => {
    if (!authService) {
      console.error('Auth service not available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get preferences - import directly from API for clean architecture
      // following Planora's principles
      const { getUserTravelPreferences } = await import('../api');
      const userPreferences = await getUserTravelPreferences(currentUser.id);
      
      // Update state - using a direct state update for simplicity
      setPreferences(userPreferences);
    } catch (err) {
      console.error('Error loading travel preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);
  
  // Function to save preferences
  const savePreferences = async (data: Partial<TravelPreferences>): Promise<void> => {
    if (!authService) {
      throw new Error('Auth service not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Dynamic imports to avoid circular dependencies (Planora architectural principle)
      const { saveTravelPreferences, updateOnboardingStatus } = await import('../api');
      
      // Create a complete TravelPreferences object from partial data to satisfy type constraints
      const completePreferences: TravelPreferences = {
        destinations: data.destinations || ['Default Destination'],
        preferredActivities: data.preferredActivities || ['Default Activity'],
        travelStyle: data.travelStyle || 'Default Style',
        budget: data.budget,
        tripDuration: data.tripDuration,
        seasonPreference: data.seasonPreference
      };
      
      // Save preferences according to the API contract
      await saveTravelPreferences(currentUser.id, completePreferences);
      
      // Mark onboarding as completed
      await updateOnboardingStatus(currentUser.id, true);
      
      // Refresh preferences
      await loadPreferences();
    } catch (err) {
      console.error('Error saving travel preferences:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    refresh: loadPreferences
  };
};
