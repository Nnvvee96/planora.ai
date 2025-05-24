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
import { getAuthService, AuthService } from '../../auth/authApi';

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
  
  // Initialize auth service using factory function
  const [authService, setAuthService] = useState<AuthService | null>(null);
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);
  
  // Load preferences on mount
  const loadPreferences = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if auth service is initialized
      if (!authService) {
        setError(new Error('Authentication service not available'));
        return;
      }
      
      // Get the current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        // Not logged in
        setPreferences(null);
        return;
      }
      
      // Get preferences from the database or API
      // This would be an API call in a real app
      // In our mock version, just set some defaults
      // This is a placeholder implementation
      const { getUserTravelPreferences } = await import('../travelPreferencesApi');
      const userPreferences = await getUserTravelPreferences(currentUser.id);
      setPreferences(userPreferences);
    } catch (err) {
      console.error('Error loading travel preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [authService]);
  
  // Call loadPreferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Function to save preferences
  const savePreferences = async (data: Partial<TravelPreferences>): Promise<void> => {
    if (!authService) {
      throw new Error('Auth service not available');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Dynamic imports to avoid circular dependencies (Planora architectural principle)
      const { saveTravelPreferences, updateOnboardingStatus } = await import('../travelPreferencesApi');
      
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
        departureCity: data.departureCity || 'New York'
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
