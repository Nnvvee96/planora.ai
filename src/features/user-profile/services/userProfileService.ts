/**
 * User Profile Service
 * Encapsulates all database operations related to user profiles
 */

import { supabase } from '@/lib/supabase/supabaseClient';
import { UserProfile, createUserProfileFromRow } from '../types/userProfileTypes';
import { Database } from '@/lib/supabase/supabaseTypes';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Define Profile type based on the table schema
type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Type guard function to check if an object matches the ProfileRecord shape
 */
const isProfileRecord = (data: unknown): data is ProfileRecord => {
  if (!data || typeof data !== 'object') return false;
  const profile = data as Record<string, unknown>;
  return 'id' in profile && typeof profile.id === 'string';
};

/**
 * Safely cast to a valid insert payload for Supabase
 */
const asSafeInsert = (data: Record<string, unknown>): unknown => {
  // This works around TypeScript issues with Supabase's insert method
  return [data];
};

/**
 * Safe ID filter for Supabase queries
 * Uses any type because Supabase's types are too complex to handle precisely
 * This helper preserves the query builder chain for proper type inference
 */
 
const withSafeId = <T>(query: T, userId: string): T => {
  // This works around Supabase typing issues with UUID fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (query as any).eq('id', userId);
};

/**
 * Convert UserProfile to a database-compatible insert record
 * Mapping only the fields that exist in the database schema
 */
const mapUserProfileToInsert = (profile: Partial<UserProfile>): ProfileInsert => ({
  id: profile.id,
  username: profile.username || '',
  email: profile.email || '',
  first_name: profile.first_name || '',
  last_name: profile.last_name || '',
  city: profile.city,
  country: profile.country,
  birthdate: profile.birthdate,
  has_completed_onboarding: profile.has_completed_onboarding,
  created_at: new Date().toISOString(),
});

/**
 * Convert UserProfile to a database-compatible update record
 * Mapping only the fields that exist in the database schema
 */
const mapUserProfileToUpdate = (profile: Partial<UserProfile>): ProfileUpdate => {
  const updateData: ProfileUpdate = {};
  
  if (profile.username !== undefined) updateData.username = profile.username;
  if (profile.email !== undefined) updateData.email = profile.email;
  if (profile.first_name !== undefined) updateData.first_name = profile.first_name;
  if (profile.last_name !== undefined) updateData.last_name = profile.last_name;
  if (profile.city !== undefined) updateData.city = profile.city;
  if (profile.country !== undefined) updateData.country = profile.country;
  if (profile.birthdate !== undefined) updateData.birthdate = profile.birthdate;
  if (profile.has_completed_onboarding !== undefined) updateData.has_completed_onboarding = profile.has_completed_onboarding;
  
  return updateData;
};

/**
 * Fetches a user's profile data
 * @param userId The ID of the user whose profile to fetch
 * @returns The user profile data or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Using our safer approach to handle ID filtering
    const { data, error } = await withSafeId(
      supabase.from('profiles').select('*'),
      userId
    ).single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // If we find a profile, return it
    if (data && isProfileRecord(data)) {
      // Convert the database record to our application type
      return createUserProfileFromRow(data);
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
    // Using our safer approach to handle ID filtering
    const { data: existingProfile, error: checkError } = await withSafeId(
      supabase.from('profiles').select('id'),
      userId
    ).single();
    
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
      
      // Create a properly formatted profile object for insertion using our mapping function
      const profileInsertData = mapUserProfileToInsert({
        id: userId,
        ...profileData
      });
      
      console.log('Inserting profile with data:', JSON.stringify(profileInsertData));
      
      // Try to insert the new profile - Supabase requires array for inserts
       
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(asSafeInsert(profileInsertData) as any)
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating new user profile:', insertError.message, insertError.code, insertError.details);
        
        // Make one more attempt with a minimal profile
        console.log('Attempting fallback with minimal profile data');
        // Creating a minimal profile with proper typing
        const minimalData: ProfileInsert = {
          id: userId,
          email: profileData.email || '',
          // Set required fields with defaults
          username: '',
          first_name: '',
          last_name: '',
          created_at: new Date().toISOString(),
          has_completed_onboarding: false
        };
        
         
        const { data: minimalProfile, error: minimalError } = await supabase
          .from('profiles')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(asSafeInsert(minimalData) as any)
          .select()
          .single();
          
        if (minimalError) {
          console.error('Final attempt to create profile failed:', minimalError.message, minimalError.code);
          return null;
        }
        
        console.log('Successfully created minimal profile as fallback');
        // Using proper typing conversion
        if (minimalProfile && isProfileRecord(minimalProfile)) {
          return createUserProfileFromRow(minimalProfile);
        }
        return null;
      }
      
      console.log('Successfully created new profile');
      // Safe assertion as we know the structure will be correct
      // Using proper typing conversion
      if (newProfile && isProfileRecord(newProfile)) {
        return createUserProfileFromRow(newProfile);
      }
      return null;
    }
    
    // If profile exists, update it
    console.log('Updating existing profile for user:', userId);
    
    // Filter out any undefined properties to avoid overwriting with nulls
     
    const cleanedProfileData: Record<string, unknown> = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key as keyof typeof profileData] !== undefined) {
        cleanedProfileData[key] = profileData[key as keyof typeof profileData];
      }
    });
    
    console.log('Updating with cleaned data:', JSON.stringify(cleanedProfileData));
    
    // Use our mapping function to create a properly typed update object
    const safeUpdateData = mapUserProfileToUpdate(cleanedProfileData);
    
    // Always add an updated_at field for tracking changes
    const updateRecord = {
      ...safeUpdateData,
      updated_at: new Date().toISOString()
    };
    
    // Use type cast for the update record and safe ID filtering
     
    const { data, error } = await withSafeId(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from('profiles').update(updateRecord as any),
      userId
    ).select().single();
      
    if (error) {
      console.error('Error updating user profile:', error.message, error.code, error.details);
      return null;
    }
    
    console.log('Successfully updated existing profile');
    if (data) {
      if (isProfileRecord(data)) {
        return createUserProfileFromRow(data);
      }
      return null;
    }
    return null;
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
    
    // First try to check if profile exists through the count API instead of single
    // This avoids the "JSON object requested, multiple (or no) rows returned" error
    const { count, error: countError } = await withSafeId(
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      userId
    );
    
    if (countError) {
      console.log('Profile count error:', countError.message);
      // Continue to try creating anyway
    }
    
    // Profile exists
    if (count && count > 0) {
      console.log('Profile exists check: profile found for user');
      return true;
    }
    
    // Profile doesn't exist, try creating a minimal one
    console.log('No profile found. Creating minimal profile for user:', userId);
    
    // Create a minimal valid profile with proper typing
    const minimalProfile: ProfileInsert = {
      id: userId,
      created_at: new Date().toISOString(),
      email: '', // Required field
      username: '',
      first_name: '',
      last_name: '',
      has_completed_onboarding: false
    };
    
    // Use proper array form for inserting with type safety
     
    const { error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(asSafeInsert(minimalProfile) as any);
      
    if (error) {
      console.error('Failed to create minimal profile:', error.message);
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
