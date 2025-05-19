/**
 * Travel Preferences API
 * 
 * This file serves as the public API boundary for the travel-preferences feature.
 * It exports only what should be accessible to other parts of the application,
 * enforcing proper feature isolation and encapsulation.
 */

// Export types that are needed by other features
export type { 
  TravelPreferences,
  TravelPreferencesFormValues,
  AccommodationType,
  ComfortPreference,
  DateFlexibilityType,
  TravelDurationType,
  PlanningIntent,
  LocationPreference,
  FlightType,
  BudgetRange
} from './types/travelPreferencesTypes';

// Export components that should be used by pages
export { TravelPreferencesPanel } from './components/TravelPreferencesPanel';

// Export hooks for integration
export { useTravelPreferences } from './hooks/useTravelPreferences';

// Export service functions that need to be accessed from outside
export { 
  getUserTravelPreferences,
  saveTravelPreferences,
  updateOnboardingStatus
} from './services/travelPreferencesService';

// Export utility functions
export {
  checkTravelPreferencesExist
} from './services/travelPreferencesUtils';
