/**
 * Type definitions for the user-profile feature
 * 
 * TEMPORARY MOCK VERSION - Non-functional placeholder
 * 
 * Following Planora's architectural principles:
 * - Feature-First Organization: Types specific to the user-profile feature
 * - Clean Code: Clear type definitions with proper documentation
 * - Separation of Concerns: Separating database schema from application types
 * 
 * This file contains application-level types used throughout the UI
 * and feature components.
 */

/**
 * User profile interface for application use
 */
export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: UserSettings;
}

/**
 * MOCK: Creating a user profile for our non-functional mockup
 */
export function createMockUserProfile(): UserProfile {
  return {
    id: 'mock-user-id',
    username: 'mockuser',
    firstName: 'Mock',
    lastName: 'User',
    email: 'mockuser@example.com',
    phoneNumber: '+1234567890',
    bio: 'This is a mock user profile for testing',
    avatarUrl: 'https://via.placeholder.com/150',
    location: 'San Francisco, CA',
    hasCompletedOnboarding: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: DEFAULT_USER_SETTINGS
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
