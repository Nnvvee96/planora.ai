/**
 * useUserProfileIntegration hook
 *
 * This is an integration hook that provides a clean interface to the user-profile feature.
 * It isolates the implementation details of the user-profile feature and provides only what other
 * features need to know about user profiles.
 */

// Import only from the feature's public API
import { UserProfile } from "@/features/user-profile/types/profileTypes";
import { useAuthIntegration } from "./useAuthIntegration";

/**
 * useUserProfileIntegration
 *
 * @returns Interface to interact with the user-profile feature
 */
export function useUserProfileIntegration() {
  // Use the auth integration to get necessary user info
  const { user, isAuthenticated } = useAuthIntegration();

  // In a real app, we would have a useUserProfile hook in the user-profile feature
  // that would fetch the user's profile data based on their authentication

  // For now, simulate a user profile based on authentication data
  const userProfile: UserProfile | null = isAuthenticated
    ? {
        id: user?.id || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        avatarUrl: user?.avatarUrl,
        hasCompletedOnboarding: user?.hasCompletedOnboarding || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    userProfile,
    hasProfile: !!userProfile,

    // In a real app, we would expose methods to update the profile
    // updateProfile: (updates) => { ... },

    // Derived data that might be useful for other features
    displayName:
      `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() ||
      "Guest",
    profileInitial: userProfile?.firstName
      ? userProfile.firstName.charAt(0).toUpperCase()
      : "G",
  };
}
