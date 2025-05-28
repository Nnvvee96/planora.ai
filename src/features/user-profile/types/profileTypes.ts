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
  hasCompletedOnboarding: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Database representation uses snake_case
export interface DbUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  birthdate?: string; // Standard field for birth date information
  has_completed_onboarding: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Common profile data interface for form inputs
export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
}

// Modal props interfaces
export interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  onProfileUpdate?: (data: ProfileFormData) => void;
}

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
