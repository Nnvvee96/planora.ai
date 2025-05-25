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
export enum TravelDurationType {
  WEEKEND = 'weekend',
  WEEK = 'week',
  TWO_WEEKS = 'two-weeks',
  LONGER = 'longer'
}

/**
 * Date flexibility from Onboarding - "Date Flexibility"
 * 
 * Complete mapping between UI options and database values:
 * - Fixed Dates → 'fixed' - User has specific travel dates with no flexibility
 * - ± 3 Days → 'flexible-few' - User can travel 3 days before or after their preferred dates
 * - ± 1 Week → 'flexible-week' - User can travel up to 1 week before or after their preferred dates
 * - Very Flexible → 'very-flexible' - User is completely flexible with travel dates
 *
 * For custom flexibility (when travel duration is 'longer'):
 * - The date_flexibility field still uses one of these enum values
 * - The custom_date_flexibility field stores the numeric value entered by the user
 *
 * Example:
 * When user selects "± 3 Days" with custom value of "40" for a longer trip:
 * {
 *   date_flexibility: 'flexible-few',  // From the enum
 *   custom_date_flexibility: '40'      // Custom numeric value
 * }
 */
export enum DateFlexibilityType {
  FLEXIBLE_FEW = 'flexible-few',
  FLEXIBLE_WEEK = 'flexible-week',
  FIXED = 'fixed',
  VERY_FLEXIBLE = 'very-flexible'
}

// Accommodation types from Onboarding - "Where do you prefer to stay?"
export enum AccommodationType {
  HOTEL = 'hotel',
  APARTMENT = 'apartment',
  HOSTEL = 'hostel',
  RESORT = 'resort'
}

// Comfort preferences from Onboarding - "What are your accommodation preferences?"
export enum ComfortPreference {
  PRIVATE_ROOM = 'private-room',
  SHARED_ROOM = 'shared-room',
  PRIVATE_BATHROOM = 'private-bathroom',
  SHARED_BATHROOM = 'shared-bathroom',
  LUXURY = 'luxury'
}

// Planning intent from Onboarding - "Are you dreaming or planning?"
export enum PlanningIntent {
  EXPLORING = 'exploring',
  PLANNING = 'planning'
}

// Location preference from Onboarding - "Preferred distance from city center?"
export enum LocationPreference {
  CENTER = 'center',
  NEAR = 'near',
  OUTSKIRTS = 'outskirts',
  ANYWHERE = 'anywhere'
}

export enum FlightType {
  DIRECT = 'direct',
  ANY = 'any'
}

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
