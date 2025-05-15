/**
 * Public API for the user-profile feature
 * This file exports only what should be accessible to other parts of the application
 * It serves as the boundary for this feature
 */

// Import components and their types
import UserProfileMenu, { UserProfileMenuProps } from './components/UserProfileMenu';
import ProfileModal, { ProfileModalProps, ProfileFormValues } from './components/modals/ProfileModal';
import SettingsModal, { SettingsModalProps, PasswordFormValues } from './components/modals/SettingsModal';

// Export types
import { UserProfile, UserSettings } from './types';
export type { 
  UserProfile, 
  UserSettings, 
  UserProfileMenuProps,
  ProfileModalProps,
  ProfileFormValues,
  SettingsModalProps,
  PasswordFormValues
};

// Export components that should be accessible outside this feature
export { UserProfileMenu, ProfileModal, SettingsModal };

// When we add hooks, they would be exported here
// export { useUserProfile } from './hooks/useUserProfile';
