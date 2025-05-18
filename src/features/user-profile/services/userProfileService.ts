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
    // Need to use UUID as the parameter type
    // Using proper type casting instead of any
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // If we find a profile, return it
    if (data) {
      // Using proper typing conversion
      return data ? {
        id: data.id,
        email: data.email || '',
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      } as UserProfile : null;
    }
    
    return null;
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
    // Check if profile exists first
    // Using type assertion to fix TypeScript error with string parameter
    // Using proper UUID typing for Supabase
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // For logging to help with debugging
    console.log('Checking if profile exists for user:', userId);
    if (checkError) {
      // This could be a 'not found' error (expected) or something else
      console.log('Profile check error:', checkError.message, checkError.code);
    }
    console.log('Profile exists check result:', existingProfile ? 'Yes' : 'No');
    console.log('Profile data being saved:', JSON.stringify(profileData));
    
    // If profile doesn't exist, we need to insert instead of update
    if (!existingProfile) {
      console.log('Creating new profile for user:', userId);
      
      // Create a properly formatted profile object for insertion
      const profileInsertData = {
        id: userId,
        username: profileData.username || '',
        email: profileData.email || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        full_name: profileData.full_name || '',
        avatar_url: profileData.avatar_url || '',
        updated_at: new Date().toISOString()
      };
      
      console.log('Inserting profile with data:', JSON.stringify(profileInsertData));
      
      // Try to insert the new profile with type assertion
      // Creating a strongly-typed record for insert
      const insertData = {
        id: userId,
        username: profileInsertData.username || '',
        email: profileInsertData.email || '',
        first_name: profileInsertData.first_name || '',
        last_name: profileInsertData.last_name || '',
        full_name: profileInsertData.full_name || '',
        avatar_url: profileInsertData.avatar_url || '',
        updated_at: new Date().toISOString(),
      };
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(insertData)
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating new user profile:', insertError.message, insertError.code, insertError.details);
        
        // Make one more attempt with a minimal profile
        console.log('Attempting fallback with minimal profile data');
        // Creating a minimal profile with proper typing
        const minimalData = {
          id: userId,
          email: profileData.email || '',
          updated_at: new Date().toISOString(),
          // Set required fields with defaults
          username: '',
          first_name: '',
          last_name: '',
          full_name: '',
          avatar_url: ''
        };
        
        const { data: minimalProfile, error: minimalError } = await supabase
          .from('profiles')
          .insert(minimalData)
          .select()
          .single();
          
        if (minimalError) {
          console.error('Final attempt to create profile failed:', minimalError.message, minimalError.code);
          return null;
        }
        
        console.log('Successfully created minimal profile as fallback');
        // Using proper typing conversion
        return minimalProfile ? {
          id: minimalProfile.id,
          email: minimalProfile.email || '',
          username: minimalProfile.username || '',
          first_name: minimalProfile.first_name || '',
          last_name: minimalProfile.last_name || '',
          full_name: minimalProfile.full_name || '',
          avatar_url: minimalProfile.avatar_url || '',
          created_at: minimalProfile.created_at || new Date().toISOString(),
          updated_at: minimalProfile.updated_at || new Date().toISOString(),
        } as UserProfile : null;
      }
      
      console.log('Successfully created new profile');
      // Safe assertion as we know the structure will be correct
      // Using proper typing conversion
      return newProfile ? {
        id: newProfile.id,
        email: newProfile.email || '',
        username: newProfile.username || '',
        first_name: newProfile.first_name || '',
        last_name: newProfile.last_name || '',
        full_name: newProfile.full_name || '',
        avatar_url: newProfile.avatar_url || '',
        created_at: newProfile.created_at || new Date().toISOString(),
        updated_at: newProfile.updated_at || new Date().toISOString(),
        // Additional fields can be included with defaults or null values
      } as UserProfile : null;
    }
    
    // If profile exists, update it
    console.log('Updating existing profile for user:', userId);
    
    // Filter out any undefined properties to avoid overwriting with nulls
    const cleanedProfileData: Record<string, any> = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key as keyof typeof profileData] !== undefined) {
        cleanedProfileData[key] = profileData[key as keyof typeof profileData];
      }
    });
    
    // Always add an updated_at field
    cleanedProfileData.updated_at = new Date().toISOString();
    
    console.log('Updating with cleaned data:', JSON.stringify(cleanedProfileData));
    
    // Create a properly typed update object
    // Filter all unknown keys that might cause type errors
    const safeUpdateData = {
      ...('username' in cleanedProfileData ? { username: cleanedProfileData.username } : {}),
      ...('email' in cleanedProfileData ? { email: cleanedProfileData.email } : {}),
      ...('first_name' in cleanedProfileData ? { first_name: cleanedProfileData.first_name } : {}),
      ...('last_name' in cleanedProfileData ? { last_name: cleanedProfileData.last_name } : {}),
      ...('full_name' in cleanedProfileData ? { full_name: cleanedProfileData.full_name } : {}),
      ...('avatar_url' in cleanedProfileData ? { avatar_url: cleanedProfileData.avatar_url } : {}),
      ...('birthdate' in cleanedProfileData ? { birthdate: cleanedProfileData.birthdate } : {}),
      ...('city' in cleanedProfileData ? { city: cleanedProfileData.city } : {}),
      ...('country' in cleanedProfileData ? { country: cleanedProfileData.country } : {}),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdateData)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error.message, error.code, error.details);
      return null;
    }
    
    console.log('Successfully updated existing profile');
    return data as unknown as UserProfile;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception in user profile operation:', errorMessage);
    return null;
  }
};

/**
 * Ensures a user profile exists. If no profile exists, creates one with minimal data.
 * @param userId The ID of the user
 * @returns True if profile exists or was successfully created
 */
export const ensureProfileExists = async (userId: string): Promise<boolean> => {
  try {
    console.log('Ensuring profile exists for user:', userId);
    
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId as any)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists for user');
      return true;
    }
    
    // Profile doesn't exist, create a minimal one
    console.log('No profile found. Creating minimal profile for user:', userId);
    // Create a minimal valid profile with proper typing
    const minimalProfile = {
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Required fields with defaults
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      full_name: '',
      avatar_url: ''
    };
    
    const { error } = await supabase
      .from('profiles')
      .insert(minimalProfile);
      
    if (error) {
      console.error('Failed to create minimal profile:', error.message, error.code);
      return false;
    }
    
    console.log('Successfully created minimal profile');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error ensuring profile exists:', errorMessage);
    return false;
  }
};

// Export the service methods
export const userProfileService = {
  getUserProfile,
  updateUserProfile,
  ensureProfileExists
};
