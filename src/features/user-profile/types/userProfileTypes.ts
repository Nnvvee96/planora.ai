/**
 * Type definitions for the user-profile feature
 * 
 * Following architecture principles:
 * - Feature-First Organization: Types specific to the user-profile feature
 * - Clean Code: Clear type definitions with proper documentation
 * - Separation of Concerns: Separating database schema from application types
 * 
 * This file contains application-level types used throughout the UI
 * and feature components, transformed from database types as needed.
 */

import { ProfilesRow } from '@/lib/supabase/supabaseTypes';

/**
 * User profile interface for application use
 * Transformed from database types to provide a clean API for components
 */
export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // Computed field from first_name + last_name
  avatar_url?: string;
  birthdate?: string;
  city?: string;
  country?: string;
  updated_at?: string;
  settings?: UserSettings;
  has_completed_onboarding?: boolean;
}

/**
 * Factory function to create a UserProfile from a database row
 * This ensures consistent transformation from database to application types
 */
export function createUserProfileFromRow(profile: ProfilesRow): UserProfile {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
    city: profile.city || undefined,
    country: profile.country || undefined,
    birthdate: profile.birthdate || undefined,
    updated_at: profile.created_at, // Using created_at as updated_at if needed
    has_completed_onboarding: profile.has_completed_onboarding
  };
}

/**
 * User settings interface for application use
 * Contains user preferences and configuration
 */
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareProfile: boolean;
    showTravelHistory: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

/**
 * Default user settings to ensure consistent initialization
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    shareProfile: false,
    showTravelHistory: false
  },
  theme: 'system',
  language: 'en'
};
