/**
 * Travel Preferences Form Service
 * 
 * Handles form data transformation and business logic for travel preferences
 */

import { 
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType
} from '../../../types/travelPreferencesTypes';
import { TravelPreferencesFormValues } from '../types/travelPreferencesFormTypes';

// Type for saved preferences from the backend
interface SavedPreferences {
  budgetRange?: { min?: number; max?: number };
  budgetFlexibility?: number;
  travelDuration?: string;
  dateFlexibility?: string;
  customDateFlexibility?: string;
  planningIntent?: string;
  accommodationTypes?: string[];
  accommodationComfort?: string[];
  comfortLevel?: string;
  locationPreference?: string;
  cityDistancePreference?: string;
  departureCountry?: string;
  departureCity?: string;
  flightType?: string;
  preferCheaperWithStopover?: boolean;
  priceVsConvenience?: 'price' | 'balanced' | 'convenience';
}

/**
 * Creates default form values for the travel preferences form
 */
export const createDefaultFormValues = (): TravelPreferencesFormValues => ({
  budgetRange: { min: 1000, max: 2000 },
  budgetFlexibility: 10,
  travelDuration: 'week',
  dateFlexibility: 'flexible-few',
  customDateFlexibility: '',
  planningIntent: 'exploring',
  accommodationTypes: ['hotel'],
  accommodationComfort: ['private-room', 'private-bathroom'],
  comfortLevel: 'standard',
  locationPreference: 'anywhere',
  cityDistancePreference: undefined,
  departureCountry: '',
  departureCity: '',
  customDepartureCity: '',
  flightType: 'direct',
  preferCheaperWithStopover: true,
  priceVsConvenience: 'balanced'
});

/**
 * Transforms saved preferences into form values with proper defaults
 */
export const transformPreferencesToFormValues = (preferences: SavedPreferences): TravelPreferencesFormValues => {
  return {
    budgetRange: {
      min: Number(preferences.budgetRange && preferences.budgetRange.min ? preferences.budgetRange.min : 500),
      max: Number(preferences.budgetRange && preferences.budgetRange.max ? preferences.budgetRange.max : 2000)
    },
    budgetFlexibility: Number(preferences.budgetFlexibility || 10),
    travelDuration: (preferences.travelDuration as TravelDurationType) || 'week',
    dateFlexibility: (preferences.dateFlexibility as DateFlexibilityType) || 'flexible-few',
    customDateFlexibility: preferences.customDateFlexibility || '',
    planningIntent: (preferences.planningIntent as PlanningIntent) || 'exploring',
    accommodationTypes: Array.isArray(preferences.accommodationTypes) 
      ? preferences.accommodationTypes.filter(type => ['hotel', 'apartment', 'hostel', 'resort'].includes(type as string)) as AccommodationType[]
      : ['hotel'],
    accommodationComfort: Array.isArray(preferences.accommodationComfort) 
      ? preferences.accommodationComfort.filter(pref => ['private-room', 'shared-room', 'private-bathroom', 'shared-bathroom', 'luxury'].includes(pref as string)) as ComfortPreference[]
      : ['private-room'],
    comfortLevel: (preferences.comfortLevel as 'budget' | 'standard' | 'premium' | 'luxury') || 'standard',
    locationPreference: (preferences.locationPreference as 'center' | 'beach' | 'anywhere') || 'anywhere',
    cityDistancePreference: preferences.cityDistancePreference as 'very-close' | 'up-to-5km' | 'up-to-10km' | 'more-than-10km' | undefined,
    departureCountry: preferences.departureCountry || '',
    departureCity: preferences.departureCity || '',
    customDepartureCity: '',
    flightType: (preferences.flightType as FlightType) || 'direct',
    preferCheaperWithStopover: preferences.preferCheaperWithStopover === undefined ? true : preferences.preferCheaperWithStopover,
    priceVsConvenience: (preferences.priceVsConvenience as 'price' | 'balanced' | 'convenience') || 'balanced'
  };
};

/**
 * Prepares form data for saving with proper type conversion and cleanup
 */
export const prepareFormDataForSaving = (formData: TravelPreferencesFormValues) => {
  // Clear customDateFlexibility if not needed
  const shouldClearCustomDateFlexibility = formData.travelDuration !== 'longer';
  
  // Clear cityDistancePreference if not City Center
  const shouldClearCityDistancePreference = formData.locationPreference !== 'center';
  
  if (import.meta.env.DEV) {
    console.log('🔧 prepareFormDataForSaving Debug:');
    console.log('- locationPreference:', formData.locationPreference);
    console.log('- cityDistancePreference:', formData.cityDistancePreference);
    console.log('- shouldClearCityDistancePreference:', shouldClearCityDistancePreference);
  }
  
  // Create a complete object with all required fields to match TravelPreferencesFormValues
  const result = {
    budgetRange: {
      min: Number(formData.budgetRange?.min ?? 500),
      max: Number(formData.budgetRange?.max ?? 2000)
    },
    budgetFlexibility: Number(formData.budgetFlexibility ?? 10),
    travelDuration: formData.travelDuration as TravelDurationType,
    dateFlexibility: formData.dateFlexibility as DateFlexibilityType,
    // Clear customDateFlexibility if not needed
    customDateFlexibility: shouldClearCustomDateFlexibility ? '' : (formData.customDateFlexibility ?? ''),
    planningIntent: formData.planningIntent as PlanningIntent,
    accommodationTypes: Array.isArray(formData.accommodationTypes) 
      ? formData.accommodationTypes.filter(type => 
          Object.values(AccommodationType).includes(type as AccommodationType)
        ) as AccommodationType[]
      : [AccommodationType.HOTEL],
    accommodationComfort: Array.isArray(formData.accommodationComfort) 
      ? formData.accommodationComfort.filter(pref => 
          Object.values(ComfortPreference).includes(pref as ComfortPreference)
        ) as ComfortPreference[]
      : [ComfortPreference.PRIVATE_ROOM],
    comfortLevel: formData.comfortLevel || 'standard',
    locationPreference: formData.locationPreference as LocationPreference,
    // Clear cityDistancePreference if not needed
    cityDistancePreference: shouldClearCityDistancePreference ? undefined : formData.cityDistancePreference,
    departureCountry: formData.departureCountry || '',
    departureCity: formData.departureCity === 'Other' ? (formData.customDepartureCity || '') : (formData.departureCity || ''),
    flightType: formData.flightType as FlightType,
    preferCheaperWithStopover: formData.preferCheaperWithStopover !== false,
    priceVsConvenience: formData.priceVsConvenience || 'balanced'
  };
  
  if (import.meta.env.DEV) {
    console.log('- Final cityDistancePreference:', result.cityDistancePreference);
  }
  
  return result;
}; 