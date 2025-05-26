/**
 * Travel Preferences API
 * 
 * Public API for travel preferences functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

// Export all types, interfaces, and enums directly from the types module
export * from './types/travelPreferencesTypes';

// Instead of direct exports for UI components and hooks, use the lazy loading pattern
// to avoid circular dependencies
import { lazy } from 'react';

// Export factory functions that return lazy-loaded components
export const getTravelPreferencesPanelComponent = () => {
  return lazy(() => import('./components/TravelPreferencesPanel').then(module => ({
    default: module.TravelPreferencesPanel
  })));
};

// For hooks, we'll create a factory function that dynamically imports
export const getTravelPreferencesHook = async () => {
  const module = await import('./hooks/useTravelPreferences');
  return module.useTravelPreferences;
};

// Import and export the travel preferences service
import { travelPreferencesService } from './services/travelPreferencesService';
export { travelPreferencesService };

/**
 * Export direct functions for convenience
 * These are the actual service implementations, not mock versions
 */
export const checkTravelPreferencesExist = travelPreferencesService.checkTravelPreferencesExist;
export const getUserTravelPreferences = travelPreferencesService.getUserTravelPreferences;
export const saveTravelPreferences = travelPreferencesService.saveTravelPreferences;
export const updateOnboardingStatus = travelPreferencesService.updateOnboardingStatus;
