/**
 * Travel Preferences Types
 * 
 * This file defines the types used throughout the travel preferences feature,
 * ensuring type safety and consistency across components.
 * Aligned perfectly with the onboarding flow structure.
 */

export interface BudgetRange {
  min: number;
  max: number;
}

// Travel duration options from onboarding
/**
 * These type definitions exactly match the options shown in the Onboarding flow
 * Any changes here must be synchronized with Onboarding.tsx
 */

// Travel duration from Onboarding - "How long are your trips?"
export type TravelDurationType = 'weekend' | 'week' | 'two-weeks' | 'longer';

// Date flexibility from Onboarding - "Date Flexibility"
export type DateFlexibilityType = 'flexible-few' | 'flexible-week' | 'fixed' | 'very-flexible';

// Accommodation types from Onboarding - "Where do you prefer to stay?"
export type AccommodationType = 'hotel' | 'apartment' | 'hostel' | 'resort';

// Comfort preferences from Onboarding - "What are your accommodation preferences?"
export type ComfortPreference = 'private-room' | 'shared-room' | 'private-bathroom' | 'shared-bathroom' | 'luxury';

// Planning intent from Onboarding - "Are you dreaming or planning?"
export type PlanningIntent = 'exploring' | 'planning';

// Location preference from Onboarding - "Preferred distance from city center?"
export type LocationPreference = 'center' | 'near' | 'outskirts' | 'anywhere';
export type FlightType = 'direct' | 'any';

/**
 * Travel Preferences Form values
 * Used in forms when creating or updating preferences
 * Exactly mirrors the onboarding flow structure
 */
export interface TravelPreferencesFormValues {
  // 1. Budget Range
  budgetRange: BudgetRange;
  // 2. Budget Flexibility (tolerance)
  budgetFlexibility: number;
  // 3. Travel Duration
  travelDuration: TravelDurationType;
  // 4. Date Flexibility
  dateFlexibility: DateFlexibilityType;
  customDateFlexibility?: string;
  // 5. Planning Intent 
  planningIntent: PlanningIntent;
  // 6. Accommodation Types
  accommodationTypes: AccommodationType[];
  // 7. Accommodation Comfort
  accommodationComfort: ComfortPreference[];
  // 8. Location Preference
  locationPreference: LocationPreference;
  // 9. Flight Preferences
  flightType: FlightType;
  preferCheaperWithStopover: boolean;
  // 10. Departure Location
  departureCity: string;
}

/**
 * Core Travel Preferences model
 * Exactly aligned with the onboarding flow structure
 */
export interface TravelPreferences {
  // Database fields
  id?: string; // Optional as it might not exist before saving
  userId: string;
  
  // 1. Budget preferences
  budgetRange: BudgetRange;
  // 2. Budget flexibility 
  budgetFlexibility: number; // Percentage (0-50%)
  
  // 3. Trip Duration and Flexibility
  travelDuration: TravelDurationType;
  dateFlexibility: DateFlexibilityType;
  customDateFlexibility?: string;
  
  // 4. Planning Intent
  planningIntent: PlanningIntent;
  
  // 5. Accommodation Types
  accommodationTypes: AccommodationType[];
  // 6. Accommodation Comfort
  accommodationComfort: ComfortPreference[];
  
  // 7. Location preference
  locationPreference: LocationPreference;
  
  // 8. Flight preferences
  flightType: FlightType;
  preferCheaperWithStopover: boolean;
  
  // 9. Departure location
  departureCity: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// NOTE: TravelPreferencesFormValues is fully defined above with all fields from onboarding
