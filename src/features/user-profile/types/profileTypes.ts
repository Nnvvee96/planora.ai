/**
 * User Profile Types
 * 
 * Shared types and interfaces for the user profile feature
 * Following Planora's architectural principles with feature-first organization
 */

// Database user profile interface - matching Supabase schema
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  birthdate?: string; // Standard field for birth date information
  country?: string; // User's country
  city?: string; // User's city
  customCity?: string; // Custom city input when city is "Other"
  isBetaTester: boolean;
  hasCompletedOnboarding: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Onboarding-specific location data (one-way sync)
  onboardingDepartureCountry?: string;
  onboardingDepartureCity?: string;
}

// Database representation uses snake_case
export interface DbUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  birthdate?: string; // Standard field for birth date information
  country?: string; // User's country
  city?: string; // User's city
  custom_city?: string; // Custom city input when city is "Other"
  is_beta_tester: boolean;
  has_completed_onboarding: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  // Onboarding-specific location data (one-way sync)
  onboarding_departure_country?: string;
  onboarding_departure_city?: string;
}

// Common profile data interface for form inputs
export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
  country?: string;
  city?: string;
  customCity?: string;
}

// Dialog props interfaces
export interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  onProfileUpdate?: (data: ProfileFormData) => void;
}

export interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
