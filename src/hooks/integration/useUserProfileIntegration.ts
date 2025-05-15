/**
 * useUserProfileIntegration hook
 * 
 * This is an integration hook that provides a clean interface to the user-profile feature.
 * It isolates the implementation details of the user-profile feature and provides only what other
 * features need to know about user profiles.
 */

// Import only from the feature's public API
import { UserProfile } from '@/features/user-profile/api';
import { useAuthIntegration } from './useAuthIntegration';

/**
 * useUserProfileIntegration
 * 
 * @returns Interface to interact with the user-profile feature
 */
export function useUserProfileIntegration() {
  // Use the auth integration to get necessary user info
  const { user, isAuthenticated, userName } = useAuthIntegration();
  
  // In a real app, we would have a useUserProfile hook in the user-profile feature
  // that would fetch the user's profile data based on their authentication
  
  // For now, simulate a user profile based on authentication data
  const userProfile: UserProfile | null = isAuthenticated ? {
    id: user?.id || '',
    userName: userName || '',
    email: user?.email || '',
    settings: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        shareProfile: false,
        showTravelHistory: true
      },
      theme: 'dark',
      language: 'en'
    }
  } : null;
  
  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    userProfile,
    hasProfile: !!userProfile,
    
    // In a real app, we would expose methods to update the profile
    // updateProfile: (updates) => { ... },
    
    // Derived data that might be useful for other features
    displayName: userProfile?.userName || 'Guest',
    profileInitial: userProfile?.userName ? userProfile.userName.charAt(0).toUpperCase() : 'G',
  };
}
