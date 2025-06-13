/**
 * User Data Manager Service
 * 
 * Central service for managing user data across multiple sources.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/lib/supabase';
import { UserProfile } from '../types/profileTypes';
import { TravelPreferencesFormValues } from '@/features/travel-preferences/types/travelPreferencesTypes';
import { userProfileService } from './userProfileService';
import { travelPreferencesService } from '@/features/travel-preferences/travelPreferencesApi';
import { getAuthService, sessionManager } from '@/features/auth/authApi';

/**
 * User Data Manager Service
 * Provides centralized functions for managing user data across multiple sources
 */
export const userDataManager = {
  /**
   * Update user data across multiple sources
   * @param userId User ID to update data for
   * @param options Update options containing profile, metadata, and preferences
   * @returns Object with success status for each data source
   */
  updateUserData: async (userId: string, options: {
    profileData?: Partial<UserProfile>;
    userMetadata?: Record<string, unknown>;
    travelPreferences?: Partial<TravelPreferencesFormValues>;
  }): Promise<{
    success: boolean;
    profileUpdated: boolean;
    metadataUpdated: boolean;
    preferencesUpdated: boolean;
    errors?: Record<string, string>;
  }> => {
    try {
      // Ensure authenticated operation
      await sessionManager.ensureAuthenticatedOperation();
      
      // Initialize results
      const results = {
        success: false,
        profileUpdated: false,
        metadataUpdated: false,
        preferencesUpdated: false,
        errors: {} as Record<string, string>
      };
      
      // Try using the unified stored procedure first
      if (options.profileData || options.userMetadata || options.travelPreferences) {
        try {
          const { data, error } = await supabase.rpc('update_user_data_unified', {
            p_user_id: userId,
            p_profile_data: options.profileData ? JSON.stringify(options.profileData) : null,
            p_user_metadata: options.userMetadata ? JSON.stringify(options.userMetadata) : null,
            p_travel_preferences: options.travelPreferences ? JSON.stringify(options.travelPreferences) : null
          });
          
          if (!error && data) {
            results.profileUpdated = data.profile_updated;
            results.metadataUpdated = data.metadata_updated;
            results.preferencesUpdated = data.preferences_updated;
            results.success = true;
            return results;
          } else if (error) {
            console.warn('Unified update failed, error:', error);
            results.errors.unified = error.message;
          }
        } catch (err) {
          console.warn('Unified update failed, falling back to individual updates:', err);
          if (err instanceof Error) {
            results.errors.unified = err.message;
          } else {
            results.errors.unified = 'Unknown error in unified update';
          }
        }
      }
      
      // Fallback: Update each source individually
      if (options.profileData) {
        try {
          const updatedProfile = await userProfileService.updateUserProfile(userId, options.profileData);
          results.profileUpdated = !!updatedProfile; // Check for truthy value (a profile object)
          if (!results.profileUpdated) {
            results.errors.profile = 'Profile update failed';
          }
        } catch (err) {
          console.error('Failed to update user profile:', err);
          if (err instanceof Error) {
            results.errors.profile = err.message;
          } else {
            results.errors.profile = 'Unknown error in profile update';
          }
        }
      }
      
      if (options.userMetadata) {
        try {
          const authService = getAuthService();
          await authService.updateUserMetadata(options.userMetadata);
          results.metadataUpdated = true;
        } catch (err) {
          console.error('Failed to update user metadata:', err);
          if (err instanceof Error) {
            results.errors.metadata = err.message;
          } else {
            results.errors.metadata = 'Unknown error in metadata update';
          }
        }
      }
      
      if (options.travelPreferences) {
        try {
          results.preferencesUpdated = await travelPreferencesService.saveTravelPreferences(
            userId, 
            options.travelPreferences
          );
          if (!results.preferencesUpdated) {
            results.errors.preferences = 'Travel preferences update failed';
          }
        } catch (err) {
          console.error('Failed to update travel preferences:', err);
          if (err instanceof Error) {
            results.errors.preferences = err.message;
          } else {
            results.errors.preferences = 'Unknown error in preferences update';
          }
        }
      }
      
      results.success = results.profileUpdated || results.metadataUpdated || results.preferencesUpdated;
      
      // If we have no errors, remove the errors object entirely
      if (Object.keys(results.errors).length === 0) {
        delete results.errors;
      }
      
      return results;
    } catch (error) {
      console.error('Error in unified user data update:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        profileUpdated: false,
        metadataUpdated: false,
        preferencesUpdated: false,
        errors: {
          general: errorMessage
        }
      };
    }
  },
  
  /**
   * Check if the user needs to complete onboarding
   * Uses the multi-source truth approach checking all possible sources
   * @param userId User ID to check
   * @returns True if user has completed onboarding
   */
  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    try {
      // Ensure authenticated operation
      await sessionManager.ensureAuthenticatedOperation();
      
      // Source 1: Check user metadata
      const { data: userData } = await supabase.auth.getUser();
      const metadataStatus = userData?.user?.user_metadata?.has_completed_onboarding === true;
      
      // Source 2: Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .single();
      const profileStatus = profileData?.has_completed_onboarding === true;
      
      // Source 3: Check travel preferences existence
      const preferencesExist = await travelPreferencesService.checkTravelPreferencesExist(userId);
      
      // Source 4: Check localStorage (this would need to be called from components)
      
      // Multi-source truth approach: If any trusted source confirms completion, consider it done
      const hasCompletedOnboarding = metadataStatus || profileStatus || preferencesExist;
      
      console.log('Onboarding status check results:', {
        metadataStatus,
        profileStatus,
        preferencesExist,
        finalDecision: hasCompletedOnboarding
      });
      
      return hasCompletedOnboarding;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to false if we can't determine status
      return false;
    }
  },

  /**
   * This is determined by checking if a user profile exists and if travel preferences have been set.
   * @returns {Promise<boolean>} True if the user has completed onboarding, false otherwise.
   */
  hasCompletedOnboarding: async (): Promise<boolean> => {
    const authService = getAuthService();
    const user = await authService.getCurrentUser();

    if (!user) {
      return false;
    }

    const [profileExists, travelPreferencesExist] = await Promise.all([
      userProfileService.checkProfileExists(user.id),
      travelPreferencesService.checkTravelPreferencesExist(user.id),
    ]);

    return profileExists && travelPreferencesExist;
  }
};
