/**
 * Custom hook for managing travel preferences
 * 
 * This hook provides access to the user's travel preferences with
 * functions to fetch, update, and manage preference data.
 * Following Planora's architectural principles of feature-first organization
 * and proper separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  TravelPreferences, 
  TravelDurationType, 
  DateFlexibilityType, 
  AccommodationType, 
  ComfortPreference, 
  LocationPreference, 
  FlightType, 
  PlanningIntent 
} from '../types/travelPreferencesTypes';
// Import service directly to avoid circular dependency
import { supabaseAuthService } from '../../auth/services/supabaseAuthService';
// Import AuthService interface from authApi where it's defined
import type { AuthService } from '../../auth/authApi';
import { travelPreferencesService } from '../services/travelPreferencesService';

// Define the return type for our hook
interface UseTravelPreferencesResult {
  /** The user's travel preferences */
  preferences: TravelPreferences | null;
  /** Whether preferences are currently being loaded */
  loading: boolean;
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
export function useTravelPreferences(): UseTravelPreferencesResult {
  // State variables
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use auth service directly to avoid circular dependency
  
  // Load preferences on mount
  const loadPreferences = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current user directly from the service
      const currentUser = await supabaseAuthService.getCurrentUser();
      if (!currentUser) {
        // Not logged in
        setPreferences(null);
        return;
      }
      
      // Get preferences directly from the service
      // This avoids circular dependency with travelPreferencesApi
      const userPreferences = await travelPreferencesService.getUserTravelPreferences(currentUser.id);
      setPreferences(userPreferences);
    } catch (err) {
      console.error('Error loading travel preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Call loadPreferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Function to save preferences
  const savePreferences = async (data: Partial<TravelPreferences>): Promise<void> => {
    
    try {
      setLoading(true);
      setError(null);
      
      // Get current user directly from the service
      const currentUser = await supabaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Using directly imported service to avoid circular dependencies (Planora architectural principle)
      
      // Create a complete TravelPreferences object from partial data to satisfy type constraints
      // We ensure all required fields have a default value if not provided
      const completePreferences: TravelPreferences = {
        userId: currentUser.id,
        budgetRange: data.budgetRange || { min: 1000, max: 5000 },
        budgetFlexibility: data.budgetFlexibility || 0,
        travelDuration: data.travelDuration || TravelDurationType.WEEK,
        dateFlexibility: data.dateFlexibility || DateFlexibilityType.FLEXIBLE_WEEK,
        customDateFlexibility: data.customDateFlexibility || '',
        planningIntent: data.planningIntent || PlanningIntent.PLANNING,
        accommodationTypes: data.accommodationTypes || [AccommodationType.HOTEL],
        accommodationComfort: data.accommodationComfort || [ComfortPreference.PRIVATE_ROOM],
        locationPreference: data.locationPreference || LocationPreference.CENTER,
        flightType: data.flightType || FlightType.DIRECT,
        preferCheaperWithStopover: data.preferCheaperWithStopover || false,
        departureCity: data.departureCity || 'New York',
        departureCountry: data.departureCountry || 'United States'
      };
      
      // Save preferences according to the API contract
      await travelPreferencesService.saveTravelPreferences(currentUser.id, completePreferences);
      
      // Mark onboarding as completed
      await travelPreferencesService.updateOnboardingStatus(currentUser.id, true);
      
      // Refresh preferences
      await loadPreferences();
    } catch (err) {
      console.error('Error saving travel preferences:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(new Error(error.message || 'An error occurred loading preferences'));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    preferences,
    loading,
    error,
    savePreferences,
    refresh: loadPreferences
  };
};
