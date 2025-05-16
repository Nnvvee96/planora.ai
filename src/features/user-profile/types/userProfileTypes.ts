/**
 * Type definitions for the user-profile feature
 */

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  birthdate?: string;
  city?: string;
  country?: string;
  updated_at?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  email: boolean;
  push: boolean;
  sms: boolean;
  privacy: {
    shareProfile: boolean;
    showTravelHistory: boolean;
  };
  shareProfile: boolean;
  showTravelHistory: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}
