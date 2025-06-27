/**
 * Onboarding Types
 * 
 * Type definitions for the onboarding flow
 */

import { UseFormReturn } from "react-hook-form";

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
  locationPreference: string;
  flightType: string;
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