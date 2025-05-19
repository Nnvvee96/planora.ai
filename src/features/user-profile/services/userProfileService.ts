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
 * Function to extract name data from Google user metadata
 * @param user Supabase user with metadata
 * @returns Object with firstName and lastName extracted
 */
const extractNameFromGoogleData = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): { firstName: string, lastName: string } => {
  const { user_metadata } = user;
  
  // Log the user metadata to see its structure
  console.log('Extracting name from Google metadata:', user_metadata);
  
  // Extract first and last name from various possible Google metadata formats
  let firstName = '';
  let lastName = '';
  
  // Try different paths where Google might provide name info
  if (typeof user_metadata?.name === 'string') {
    // Name provided as a single string, try to split it
    const nameParts = (user_metadata.name as string).split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  } else {
    // Try different field variations
    firstName = (user_metadata?.given_name as string) || (user_metadata?.first_name as string) || '';
    lastName = (user_metadata?.family_name as string) || (user_metadata?.last_name as string) || '';
  }
  
  // If still empty and we have email, extract username part as fallback
  if (!firstName && user.email) {
    const emailParts = user.email.split('@');
    // Fix the escape character issue by using a proper regex
    const nameParts = emailParts[0].split(/[.|_|-]/);
    if (nameParts.length > 1) {
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else {
      firstName = emailParts[0] || '';
    }
  }
  
  console.log('Extracted name info:', { firstName, lastName });
  return { firstName, lastName };
};

/**
 * User profile service for managing profile data
 */
export const userProfileService = {
  /**
   * Update profile with Google user data
   * @param user Supabase user object
   * @returns True if update was successful
   */
  updateProfileWithGoogleData: async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<boolean> => {
    try {
      if (!user || !user.id) {
        console.error('Cannot update profile: Invalid user object');
        return false;
      }
      
      console.log('Updating profile with Google data for user:', user.id);
      
      // Extract name from Google data
      const { firstName, lastName } = extractNameFromGoogleData(user);
      
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const timestamp = new Date().toISOString();
      
      if (!data || error) {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new profile with Google data');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            has_completed_onboarding: false,
            created_at: timestamp,
            updated_at: timestamp
          });
          
        if (insertError) {
          console.error('Error creating profile with Google data:', insertError);
          return false;
        }
      } else {
        // Profile exists, update it if first/last name are empty
        console.log('Existing profile found, updating with Google data if needed');
        
        // Only update if current values are empty
        const updates: Record<string, unknown> = {
          updated_at: timestamp
        };
        
        if (!data.first_name && firstName) {
          updates.first_name = firstName;
        }
        
        if (!data.last_name && lastName) {
          updates.last_name = lastName;
        }
        
        if (Object.keys(updates).length > 1) { // If we have more than just updated_at
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating profile with Google data:', updateError);
            return false;
          }
        }
      }
      
      console.log('Successfully updated profile with Google data');
      return true;
    } catch (err) {
      console.error('Error updating profile with Google data:', err);
      return false;
    }
  },
  
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
