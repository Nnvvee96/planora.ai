/**
 * Type definitions for the user-profile feature
 */

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  settings?: UserSettings;
}

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
