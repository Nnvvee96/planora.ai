/**
 * User Profile Types
 * 
 * Shared types and interfaces for the user profile feature
 * Following Planora's architectural principles with feature-first organization
 */

// Common profile data interface shared between components
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
