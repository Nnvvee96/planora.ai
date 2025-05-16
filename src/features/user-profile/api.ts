/**
 * Public API for the user-profile feature
 * This file exports only what should be accessible to other parts of the application
 * It serves as the boundary for this feature
 */

// Export types from a centralized type file
import { UserProfile, UserSettings } from './types/userProfileTypes';
export type { UserProfile, UserSettings };

// Export component types without importing the actual components
// This breaks the circular dependency
export type { UserProfileMenuProps } from './components/UserProfileMenu';
export type { ProfileModalProps, ProfileFormValues } from './components/modals/ProfileModal';
export type { SettingsModalProps, PasswordFormValues } from './components/modals/SettingsModal';

// Import and export services
import { userProfileService } from './services/userProfileService';
export { userProfileService };

// Export components from their own files (not re-exporting)
// This avoids circular dependencies while maintaining the API boundary
export { UserProfileMenu } from './components/UserProfileMenu';
export { ProfileModal } from './components/modals/ProfileModal';
export { SettingsModal } from './components/modals/SettingsModal';

// When we add hooks, they would be exported here
// export { useUserProfile } from './hooks/useUserProfile';
