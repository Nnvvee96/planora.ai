/**
 * User Profile Service
 * 
 * Service for managing user profile data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/lib/supabase';
import { UserProfile, DbUserProfile } from '../types/profileTypes';

/**
 * Converts snake_case database profile to camelCase application profile
 */
const mapDbProfileToUserProfile = (dbProfile: DbUserProfile): UserProfile => {
  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    email: dbProfile.email,
    avatarUrl: dbProfile.avatar_url,
    hasCompletedOnboarding: dbProfile.has_completed_onboarding,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  };
};

/**
 * Converts camelCase application profile to snake_case database profile
 */
const mapUserProfileToDbProfile = (profile: Partial<UserProfile>): Partial<DbUserProfile> => {
  const dbProfile: Partial<DbUserProfile> = {};
  
  if (profile.id !== undefined) dbProfile.id = profile.id;
  if (profile.firstName !== undefined) dbProfile.first_name = profile.firstName;
  if (profile.lastName !== undefined) dbProfile.last_name = profile.lastName;
  if (profile.email !== undefined) dbProfile.email = profile.email;
  if (profile.avatarUrl !== undefined) dbProfile.avatar_url = profile.avatarUrl;
  if (profile.hasCompletedOnboarding !== undefined) dbProfile.has_completed_onboarding = profile.hasCompletedOnboarding;
  
  return dbProfile;
};

/**
 * User profile service for managing profile data
 */
export const userProfileService = {
  /**
   * Check if a profile exists for a user
   * @param userId The user ID to check
   * @returns True if a profile exists
   */
  checkProfileExists: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking profile existence:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  },
  
  /**
   * Ensure a profile exists for a user
   * Creates a profile if one doesn't exist
   * @param userId The user ID to check/create profile for
   * @returns True if profile exists or was created
   */
  ensureProfileExists: async (userId: string): Promise<boolean> => {
    // First check if profile exists
    const exists = await userProfileService.checkProfileExists(userId);
    if (exists) return true;
    
    // Get user data from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error fetching user data:', userError);
      return false;
    }
    
    // Create new profile with user data
    const { user_metadata } = user;
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: user_metadata?.given_name || '',
        last_name: user_metadata?.family_name || '',
        email: user.email,
        avatar_url: user_metadata?.avatar_url || user_metadata?.picture || '',
        has_completed_onboarding: false
      });
    
    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
    
    return true;
  },
  
  /**
   * Get a user's profile
   * @param userId The user ID to get profile for
   * @returns The user profile or null if not found
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return mapDbProfileToUserProfile(data as DbUserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  /**
   * Update a user's profile
   * @param userId The user ID to update profile for
   * @param profileData The profile data to update
   * @returns True if update was successful
   */
  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
    try {
      // Convert profile data to database format
      const dbProfileData = mapUserProfileToDbProfile(profileData);
      
      // Add updated timestamp
      dbProfileData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update(dbProfileData)
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
};
