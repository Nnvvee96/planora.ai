/**
 * useUserDataIntegration hook
 * 
 * Integration hook for managing user data across multiple features
 * Following Planora's architectural principles with feature-first organization.
 */

import { useCallback } from 'react';
import { useAuthIntegration } from './useAuthIntegration';
import { useTravelPreferencesIntegration } from './useTravelPreferencesIntegration';
import { useUserProfileIntegration } from '@/features/user-profile/hooks/useUserProfileIntegration';

/**
 * Hook for integrating user data across multiple features
 * Provides methods for coordinated updates across auth, profile, and preferences
 */
export function useUserDataIntegration() {
  const { user, isAuthenticated } = useAuthIntegration();
  const { preferences, savePreferences, hasPreferences } = useTravelPreferencesIntegration();
  const { getUserWithProfile } = useUserProfileIntegration();
  
  /**
   * Check if the user has completed onboarding
   * Uses multiple sources to determine onboarding status
   * @returns True if user has completed onboarding
   */
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    try {
      // Check if user has profile data and travel preferences
      const userWithProfile = await getUserWithProfile(user.id);
      const hasProfile = !!userWithProfile;
      
      // Multi-source truth approach: user needs both profile and preferences
      const hasCompletedOnboarding = hasProfile && hasPreferences;
      
      console.log('Onboarding status check results:', {
        hasProfile,
        hasPreferences,
        finalDecision: hasCompletedOnboarding
      });
      
      return hasCompletedOnboarding;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, [isAuthenticated, user, hasPreferences, getUserWithProfile]);
  
  /**
   * Simplified onboarding check that just looks at current state
   * @returns True if user has completed onboarding
   */
  const hasCompletedOnboarding = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      // Check if user has both profile and travel preferences
      const userWithProfile = await getUserWithProfile(user.id);
      const profileExists = !!userWithProfile;

      return profileExists && hasPreferences;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }, [isAuthenticated, user, hasPreferences, getUserWithProfile]);
  
  return {
    // State
    user,
    isAuthenticated,
    preferences,
    hasPreferences,
    
    // Methods
    checkOnboardingStatus,
    hasCompletedOnboarding,
    savePreferences,
    getUserWithProfile,
    
    // Derived data
    hasCompletedOnboardingSync: isAuthenticated && hasPreferences,
  };
} 