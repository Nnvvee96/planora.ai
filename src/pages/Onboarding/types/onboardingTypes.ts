/**
 * Onboarding Types
 * 
 * Type definitions for the onboarding flow
 */

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Raw Supabase user interface for direct metadata access
export interface SupabaseRawUser {
  id: string;
  email?: string;
  user_metadata?: {
    has_completed_onboarding?: boolean;
    country?: string;
    city?: string;
    customCity?: string;
    [key: string]: unknown;
  };
}

// Zod schema for form validation
export const onboardingSchema = z.object({
  departureCountry: z.string().min(1, "Please select a departure country"),
  departureCity: z.string().min(1, "Please select a departure city"),
  customDepartureCity: z.string().optional(),
  budgetRange: z.object({
    min: z.number().min(100, "Minimum budget must be at least €100"),
    max: z.number().min(200, "Maximum budget must be at least €200"),
  }),
  budgetTolerance: z.number().min(0).max(50),
  travelDuration: z.string().min(1, "Please select a travel duration"),
  dateFlexibility: z.string().nullable(),
  customDateFlexibility: z.string().optional(),
  planningIntent: z.string().min(1, "Please select your planning intent"),
  accommodationTypes: z.array(z.string()).min(1, "Please select at least one accommodation type"),
  accommodationComfort: z.array(z.string()),
  comfortLevel: z.string().min(1, "Please select a comfort level"),
  locationPreference: z.string().min(1, "Please select a location preference"),
  cityDistancePreference: z.string().optional(),
  flightType: z.string().min(1, "Please select a flight type"),
  priceConvenience: z.string().min(1, "Please select price vs convenience preference"),
  preferCheaperWithStopover: z.boolean(),
});

export interface OnboardingFormData {
  departureCountry: string;
  departureCity: string;
  customDepartureCity?: string;
  budgetRange: { min: number; max: number };
  budgetTolerance: number;
  travelDuration: string;
  dateFlexibility: string | null;
  customDateFlexibility?: string;
  planningIntent: string;
  accommodationTypes: string[];
  accommodationComfort: string[];
  comfortLevel: string;
  locationPreference: string;
  cityDistancePreference?: string;
  flightType: string;
  priceConvenience: string;
  preferCheaperWithStopover: boolean;
}

// Props for step components
export interface OnboardingStepProps {
  form: UseFormReturn<OnboardingFormData>;
  onNext: () => void;
  onPrevious: () => void;
  isModifyingPreferences?: boolean;
}

// Props for utility components
export interface OptionItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  field: string[];
  onChange: (value: string) => void;
}

export interface LabelProps {
  value: string;
  field: { value: string };
  children: React.ReactNode;
}

export interface CheckboxCardProps {
  label: string;
  value: string;
  field: string[];
  onChange: (value: string) => void;
} 