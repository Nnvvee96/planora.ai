/**
 * User Profile Service
 * 
 * Service for managing user profile data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/database/databaseExports';
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
    birthdate: dbProfile.birthdate,
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
  if (profile.birthdate !== undefined) dbProfile.birthdate = profile.birthdate;
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
  console.log('Extracting name from Google metadata:', JSON.stringify(user_metadata, null, 2));
  
  // Extract first and last name from various possible Google metadata formats
  let firstName = '';
  let lastName = '';
  
  // Try different paths where Google might provide name info
  if (typeof user_metadata?.name === 'string') {
    // Name provided as a single string, try to split it
    const nameParts = (user_metadata.name as string).split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  } else if (typeof user_metadata?.full_name === 'string') {
    // Name provided as a single string under full_name, try to split it
    const nameParts = (user_metadata.full_name as string).split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  } else {
    // Try to extract from specific name fields
    firstName = (user_metadata?.given_name as string) || 
                (user_metadata?.first_name as string) || 
                (user_metadata?.display_name as string) || '';
                
    lastName = (user_metadata?.family_name as string) || 
               (user_metadata?.last_name as string) || '';
  }
  
  // Fall back to email if name is still empty
  if (!firstName && !lastName && user.email) {
    // Extract username part from email and format it
    const emailParts = user.email.split('@');
    const username = emailParts[0];
    // Format username: replace symbols with spaces and capitalize each part
    const formattedParts = username.split(/[._-]/).map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );
    
    if (formattedParts.length > 1) {
      firstName = formattedParts[0];
      lastName = formattedParts.slice(1).join(' ');
    } else {
      firstName = formattedParts[0] || '';
    }
  }
  
  return { firstName, lastName };
};

/**
 * User profile service for managing profile data
 */
export const userProfileService = {
  /**
   * Update a user's profile with Google authentication data
   * @param user Supabase user with metadata
   * @returns True if update was successful
   */
  updateProfileWithGoogleData: async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<boolean> => {
    try {
      if (!user || !user.id) {
        console.error('Cannot update profile with Google data: Invalid user');
        return false;
      }
      
      const { user_metadata } = user;
      
      // Extract name information
      const { firstName, lastName } = extractNameFromGoogleData(user);
      
      // Current timestamp for created/updated
      const timestamp = new Date().toISOString();
      
      // Check if user already has a profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for existing profile:', error);
      }
      
      if (!data) {
        // No profile exists, create one
        console.log('Creating new profile for user:', user.id);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            avatar_url: (user_metadata?.avatar_url as string) || (user_metadata?.picture as string) || '',
            has_completed_onboarding: false,
            created_at: timestamp,
            updated_at: timestamp
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
        
        return true;
      } else {
        // Profile exists, update if name fields are empty
        if (!data.first_name || !data.last_name) {
          console.log('Updating existing profile with Google data for user:', user.id);
          
          const updates: Record<string, unknown> = {
            updated_at: timestamp
          };
          
          if (!data.first_name && firstName) {
            updates.first_name = firstName;
          }
          
          if (!data.last_name && lastName) {
            updates.last_name = lastName;
          }
          
          if (!data.avatar_url) {
            updates.avatar_url = (user_metadata?.avatar_url as string) || 
                                 (user_metadata?.picture as string) || '';
          }
          
          if (Object.keys(updates).length > 1) {
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
        
        return true;
      }
    } catch (error) {
      console.error('Error updating profile with Google data:', error);
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
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
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
   * @returns True if the profile exists or was created successfully
   */
  ensureProfileExists: async (userId: string): Promise<boolean> => {
    try {
      if (!userId) return false;
      
      // Check if profile exists
      const exists = await userProfileService.checkProfileExists(userId);
      
      if (exists) {
        return true;
      }
      
      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        console.error('Error getting user for profile creation:', userError);
        return false;
      }
      
      // Create profile using Google data if available
      return await userProfileService.updateProfileWithGoogleData(user);
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      return false;
    }
  },
  
  /**
   * Get user profile by ID
   * @param userId User ID to get profile for
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Getting user profile for user ID:', userId);
      
      // First attempt - try to get the profile using maybeSingle to avoid 406 errors
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (data) {
        // We have profile data, return it
        return mapDbProfileToUserProfile(data as DbUserProfile);
      }
      
      if (error) {
        console.error('Error fetching user profile from profiles table:', error);
        // Continue to fallback methods
      }
      
      // First fallback - try to get user from auth metadata
      console.log('Profile not found in database, trying auth metadata fallback');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id === userId) {
        // Create a synthetic profile from auth data
        console.log('Creating synthetic profile from auth metadata');
        const { user_metadata } = user;
        
        // Extract name information with proper fallbacks
        const nameInfo = extractNameFromGoogleData(user);
        
        // Create a profile object
        const syntheticProfile: UserProfile = {
          id: user.id,
          firstName: nameInfo.firstName || '',
          lastName: nameInfo.lastName || '',
          email: user.email || '',
          avatarUrl: (user_metadata?.avatar_url as string) || 
                    (user_metadata?.picture as string) || '',
          hasCompletedOnboarding: (user_metadata?.has_completed_onboarding as boolean) || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Try to save this profile to the database for future use
        try {
          await userProfileService.createUserProfile(syntheticProfile);
        } catch (saveError) {
          console.warn('Non-fatal error saving synthetic profile:', saveError);
        }
        
        return syntheticProfile;
      }
      
      console.warn('No profile found for user ID after all fallbacks:', userId);
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },
  
  /**
   * Create a new user profile in Supabase
   * @param profileData Complete profile data to create
   */
  createUserProfile: async (profileData: UserProfile): Promise<boolean> => {
    try {
      console.log('Creating new user profile for ID:', profileData.id);
      
      if (!profileData.id) {
        console.error('Cannot create user profile: Missing user ID');
        return false;
      }
      
      // First check if profile already exists
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileData.id)
        .maybeSingle();
        
      if (data) {
        console.log('Profile already exists, using update instead');
        return userProfileService.updateUserProfile(profileData.id, profileData);
      }
      
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          ...mapUserProfileToDbProfile(profileData),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating user profile:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  },
  
  /**
   * Update user profile in Supabase
   * @param userId User ID to update profile for
   * @param profileData Profile data to update
   */
  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!userId) {
        console.error('User ID is required to update profile');
        return false;
      }
      
      // Create a copy of profileData to avoid mutating the original
      const profileUpdate = { ...profileData };
      
      // Format birthdate if it exists
      if (profileUpdate.birthdate) {
        try {
          // Ensure birthdate is in YYYY-MM-DD format
          const date = new Date(profileUpdate.birthdate);
          if (!isNaN(date.getTime())) {
            profileUpdate.birthdate = date.toISOString().split('T')[0];
          } else {
            console.warn('Invalid birthdate format, removing from update:', profileUpdate.birthdate);
            delete profileUpdate.birthdate;
          }
        } catch (e) {
          console.error('Error formatting birthdate:', e);
          delete profileUpdate.birthdate;
        }
      }
      
      // Convert profile data to database format
      const dbProfile = mapUserProfileToDbProfile(profileUpdate);
      
      console.log('Updating profile in database:', { userId, dbProfile });
      
      // Update the profile in the database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...dbProfile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error('Error updating profile in database:', error);
        // If the profile doesn't exist, try creating it
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.log('Profile does not exist, attempting to create it');
          return userProfileService.createUserProfile({
            id: userId,
            firstName: profileUpdate.firstName || '',
            lastName: profileUpdate.lastName || '',
            email: profileUpdate.email || '',
            birthdate: profileUpdate.birthdate as string | undefined,
            hasCompletedOnboarding: false,
          });
        }
        return false;
      }
      
      console.log('Successfully updated profile:', data);
      return true;
      
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return false;
    }
  },
  
  /**
   * Get the current user and their profile
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found');
        return null;
      }
      
      return userProfileService.getUserProfile(user.id);
    } catch (error) {
      console.error('Error getting current user profile:', error);
      return null;
    }
  }
};
