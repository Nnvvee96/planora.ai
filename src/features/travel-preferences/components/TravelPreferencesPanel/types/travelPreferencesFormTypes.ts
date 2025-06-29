/**
 * Travel Preferences Form Types and Schema
 * 
 * Form validation schema and TypeScript types for the travel preferences panel
 */

import { z } from 'zod';

/**
 * Form schema that exactly matches the onboarding flow
 */
export const travelPreferencesSchema = z.object({
  // 1. Budget Range (from Onboarding)
  budgetRange: z.object({
    min: z.number().min(1),
    max: z.number().min(1)
  }),
  
  // 2. Budget Flexibility (from Onboarding)
  budgetFlexibility: z.number().min(0).max(25),
  
  // 3. Travel Duration (from Onboarding)
  travelDuration: z.enum(['weekend', 'week', 'two-weeks', 'longer']),
  
  // 4. Date Flexibility (from Onboarding)
  dateFlexibility: z.enum(['flexible-few', 'flexible-week', 'fixed', 'very-flexible']),
  customDateFlexibility: z.string().optional(),
  
  // 5. Planning Intent (from Onboarding)
  planningIntent: z.enum(['exploring', 'planning']),
  
  // 6. Accommodation Types (from Onboarding)
  accommodationTypes: z.array(
    z.enum(['hotel', 'apartment', 'hostel', 'resort'])
  ).min(1, "Please select at least one accommodation type"),
  
  // 7. Accommodation Comfort (from Onboarding)
  accommodationComfort: z.array(
    z.enum(['private-room', 'shared-room', 'private-bathroom', 'shared-bathroom', 'luxury'])
  ).min(1, "Please select at least one comfort preference"),
  
  // 8. Comfort Level (from Onboarding)
  comfortLevel: z.enum(['budget', 'standard', 'premium', 'luxury']),
  
  // 9. Location Preference (from Onboarding)
  locationPreference: z.enum(['center', 'beach', 'anywhere']),
  
  // 10. City Distance Preference (from Onboarding - conditional)
  cityDistancePreference: z.enum(['very-close', 'up-to-5km', 'up-to-10km', 'more-than-10km']).optional(),
  
  // 11. Flight Preferences (from Onboarding)
  flightType: z.enum(['direct', 'any']),
  preferCheaperWithStopover: z.boolean(),
  priceVsConvenience: z.enum(['price', 'balanced', 'convenience']),
  
  // 12. Departure Location (from Onboarding)
  departureCountry: z.string().min(1, "Please select a departure country"),
  departureCity: z.string().min(1, "Please select a departure city"),
  customDepartureCity: z.string().optional()
});

// Type derived from schema
export type TravelPreferencesFormValues = z.infer<typeof travelPreferencesSchema>; 