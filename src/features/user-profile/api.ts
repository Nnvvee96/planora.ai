/**
 * Public API for the user-profile feature
 * This file exports only what should be accessible to other parts of the application
 * It serves as the boundary for this feature
 */

// Export component interfaces
import { UserProfileMenuProps } from './components/UserProfileMenu';

// Export types
import { UserProfile, UserSettings } from './types';
export type { UserProfile, UserSettings, UserProfileMenuProps };

// Export components that should be accessible outside this feature
export { default as UserProfileMenu } from './components/UserProfileMenu';

// When we add hooks, they would be exported here
// export { useUserProfile } from './hooks/useUserProfile';
