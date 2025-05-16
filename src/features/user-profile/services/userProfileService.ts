/**
 * User Profile Service
 * Encapsulates all database operations related to user profiles
 */

import { supabase } from '@/lib/supabase/supabaseClient';
import { UserProfile } from '../types/userProfileTypes';

/**
 * Fetches a user's profile data
 * @param userId The ID of the user whose profile to fetch
 * @returns The user profile data or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
};

/**
 * Updates a user's profile data
 * @param userId The ID of the user whose profile to update
 * @param profileData The profile data to update
 * @returns The updated profile data or null on failure
 */
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return null;
  }
};

// Export the service methods
export const userProfileService = {
  getUserProfile,
  updateUserProfile
};
