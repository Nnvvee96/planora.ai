/**
 * Custom hook for managing travel preferences
 * 
 * This hook provides access to the user's travel preferences with
 * functions to fetch, update, and manage preference data.
 */

import { useState, useEffect } from 'react';
import { TravelPreferences, TravelPreferencesFormValues } from '../types/travelPreferencesTypes';
import { getUserTravelPreferences, saveTravelPreferences, updateOnboardingStatus } from '../services/travelPreferencesService';
import { authService } from '@/features/auth/api';

interface UseTravelPreferencesResult {
  /** The user's travel preferences */
  preferences: TravelPreferences | null;
  /** Whether preferences are currently being loaded */
  isLoading: boolean;
  /** Any error that occurred while loading preferences */
  error: Error | null;
  /** Function to save or update preferences */
  savePreferences: (data: Partial<TravelPreferencesFormValues>) => Promise<TravelPreferences>;
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
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get preferences for current user
      const userPreferences = await getUserTravelPreferences(currentUser.id);
      setPreferences(userPreferences);
    } catch (err) {
      console.error('Error loading travel preferences:', err);
      setError(err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load preferences when component mounts
  useEffect(() => {
    loadPreferences();
  }, []);
  
  /**
   * Save or update travel preferences
   * @param data The form data to save
   * @returns The saved preferences
   */
  const savePreferences = async (data: Partial<TravelPreferencesFormValues>): Promise<TravelPreferences> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Ensure data has all required properties with non-null values
      // Use correct types as defined in travelPreferencesTypes.ts
      const sanitizedData: TravelPreferencesFormValues = {
        budgetRange: {
          min: Number(data.budgetRange?.min || 500),
          max: Number(data.budgetRange?.max || 2000)
        },
        budgetFlexibility: Number(data.budgetFlexibility || 10),
        travelDuration: data.travelDuration || 'week',
        dateFlexibility: data.dateFlexibility || 'flexible-few',
        customDateFlexibility: data.customDateFlexibility || '',
        planningIntent: data.planningIntent || 'exploring',
        accommodationTypes: Array.isArray(data.accommodationTypes) ? data.accommodationTypes : ['hotel'],
        accommodationComfort: Array.isArray(data.accommodationComfort) ? data.accommodationComfort : ['private-room'],
        locationPreference: data.locationPreference || 'anywhere',
        departureCity: data.departureCity || '',
        flightType: data.flightType || 'direct',
        preferCheaperWithStopover: data.preferCheaperWithStopover === undefined ? true : data.preferCheaperWithStopover
      };
      
      // Save preferences with sanitized data - corrected parameter order
      const savedPreferences = await saveTravelPreferences(sanitizedData, currentUser.id);
      
      // Mark onboarding as completed
      await updateOnboardingStatus(currentUser.id, true);
      
      // Update state
      setPreferences(savedPreferences);
      
      return savedPreferences;
    } catch (err) {
      console.error('Error saving travel preferences:', err);
      const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Refresh preferences data
   */
  const refresh = async (): Promise<void> => {
    await loadPreferences();
  };
  
  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    refresh
  };
};
