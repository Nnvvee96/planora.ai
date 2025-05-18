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
 * Ensures that a profile exists for the specified user ID
 * Will create a profile if one doesn't exist using multiple fallback methods
 * This is a critical function for fixing the Google Sign-In loop
 * 
 * @param userId The ID of the user
 * @returns True if the profile exists or was created successfully
 */
export const ensureProfileExists = async (userId: string): Promise<boolean> => {
  console.log('⚠️ CRITICAL FUNCTION - Ensuring profile exists for user:', userId);
  
  // Try up to 3 times to ensure profile creation
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Attempt ${attempt} to ensure profile exists`);
      
      // STEP 1: Check if profile already exists using most reliable method
      // Use count() to avoid potential RLS issues with single()
      console.log('Step 1: Checking if profile exists using count method');
      const { count, error: countError } = await withSafeId(
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        userId
      );
      
      if (countError) {
        console.error(`Count error (attempt ${attempt}):`, countError.message);
      } else {
        console.log(`Profile count result: ${count}`);
      }
      
      // If profile exists, update it and return success
      if (count && count > 0) {
        console.log('✅ Profile found! Updating it with completed onboarding flag');
        
        try {
          // Use the established mapUserProfileToUpdate helper to ensure type safety
          const profileUpdate = mapUserProfileToUpdate({
            has_completed_onboarding: true
          });
          
          // We can't directly add updated_at to ProfileUpdate as it's not part of our type definition
          // So we need to use a type assertion to include it, following architectural principles
          // This ensures we're only modifying the specific fields we intend to
          const update = {
            ...profileUpdate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any; // Type assertion needed for database compatibility
          
          // Add the updated_at field after the type assertion
          update.updated_at = new Date().toISOString();
          
          // Note: We use 'update' not 'profileUpdate' here to include the updated_at field
          const { error: updateError } = await withSafeId(
            supabase.from('profiles').update(update),
            userId
          );
            
          if (updateError) {
            console.error('Error updating existing profile:', updateError.message);
          } else {
            console.log('✅ Successfully updated profile onboarding flag');
          }
        } catch (updateError) {
          console.error('Exception updating profile:', updateError);
        }
        
        // Even if update fails, profile exists so return true
        return true;
      }
      
      // STEP 2: Get user details from auth for profile creation
      console.log('Step 2: Getting user details from auth');
      let userEmail = '';
      let firstName = '';
      let lastName = '';
      let fullName = '';
      let isGoogleAuth = false;
      
      try {
        // First try with admin API
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError) {
          console.error('Error getting user data with admin API:', userError.message);
        } else if (userData?.user) {
          userEmail = userData.user.email || '';
          firstName = userData.user.user_metadata?.first_name || '';
          lastName = userData.user.user_metadata?.last_name || '';
          fullName = userData.user.user_metadata?.full_name || '';
          
          // Check if this is a Google auth user
          isGoogleAuth = userData.user.app_metadata?.provider === 'google' || 
                        (userData.user.identities?.some(i => i.provider === 'google') || false);
                        
          console.log('User details retrieved from admin API:', { 
            userEmail, 
            firstName, 
            lastName,
            isGoogleAuth 
          });
        }
      } catch (adminError) {
        console.error('Exception getting user with admin API:', adminError);
        
        // Fall back to regular auth API
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            userEmail = user.email || '';
            firstName = user.user_metadata?.first_name || '';
            lastName = user.user_metadata?.last_name || '';
            fullName = user.user_metadata?.full_name || '';
            isGoogleAuth = user.app_metadata?.provider === 'google' || false;
            
            console.log('User details retrieved from session:', { 
              userEmail, 
              firstName, 
              lastName,
              isGoogleAuth 
            });
          }
        } catch (sessionError) {
          console.error('Exception getting user session:', sessionError);
        }
      }
      
      // STEP 3: Create profile with available data
      console.log('Step 3: Creating new profile with gathered data');
      
      // Prepare minimum viable profile data
      const username = userEmail ? userEmail.split('@')[0] : `user_${Math.random().toString(36).substring(2, 10)}`;
      
      // Method 1: Try standard insert first
      try {
        console.log('Creating profile - Method 1: Standard insert');
        
        // Create a proper profile using the mapUserProfileToInsert helper that conforms to ProfileInsert type
        const profileInsert = mapUserProfileToInsert({
          id: userId,
          username: username,
          email: userEmail,
          first_name: firstName || '',
          last_name: lastName || '',
          has_completed_onboarding: true // Critical fix: Always set this to true
        });
        
        // Use asSafeInsert helper to ensure proper array format for Supabase insert
        const { error: insertError } = await supabase
          .from('profiles')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(asSafeInsert(profileInsert) as any);
          
        if (insertError) {
          console.error('Standard insert failed:', insertError.message);
        } else {
          console.log('✅ Profile created successfully with standard insert!');
          return true;
        }
      } catch (insertError) {
        console.error('Exception in standard insert:', insertError);
      }
      
      // Method 2: Try upsert if insert failed
      try {
        console.log('Creating profile - Method 2: Upsert operation');
        
        // Create a proper profile using the mapUserProfileToInsert helper that conforms to ProfileInsert type
        const profileInsert = mapUserProfileToInsert({
          id: userId,
          username: username,
          email: userEmail,
          first_name: firstName || '',
          last_name: lastName || '',
          has_completed_onboarding: true // Critical fix: Always set this to true
        });
        
        // Use asSafeInsert helper to ensure proper array format for Supabase upsert
        const { error: upsertError } = await supabase
          .from('profiles')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(asSafeInsert(profileInsert) as any, { onConflict: 'id' });
          
        if (upsertError) {
          console.error('Upsert operation failed:', upsertError.message);
        } else {
          console.log('✅ Profile created successfully with upsert!');
          return true;
        }
      } catch (upsertError) {
        console.error('Exception in upsert operation:', upsertError);
      }
      
      // Method 3: Try RPC call to bypass RLS policies
      try {
        console.log('Creating profile - Method 3: RPC call');
        const { error: rpcError } = await supabase.rpc('create_profile_with_admin', {
          user_id: userId,
          user_email: userEmail,
          user_username: username,
          user_first_name: firstName || '',
          user_last_name: lastName || '',
          user_full_name: fullName || `${firstName} ${lastName}`.trim(),
          has_completed_onboarding: true
        });
        
        if (rpcError) {
          console.error('RPC call failed:', rpcError.message);
        } else {
          console.log('✅ Profile created successfully with RPC call!');
          return true;
        }
      } catch (rpcError) {
        console.error('Exception in RPC call:', rpcError);
      }
      
      console.log(`❌ All methods failed in attempt ${attempt}. ${attempt < 3 ? 'Retrying...' : 'Giving up.'}`);
      
      // Short delay before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (attemptError) {
      console.error(`Critical error in attempt ${attempt}:`, attemptError);
    }
  }
  
  // Last resort: update auth metadata even if profile creation failed
  try {
    console.log('🚨 All profile creation attempts failed. Updating auth metadata as last resort');
    await supabase.auth.updateUser({
      data: { 
        has_completed_onboarding: true,
        profile_creation_failed: true,
        profile_creation_attempted_at: new Date().toISOString()
      }
    });
    
    // Set localStorage as a fallback
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hasCompletedInitialFlow', 'true');
      localStorage.setItem('profileCreationFailed', 'true');
    }
  } catch (metadataError) {
    console.error('Failed to update auth metadata as last resort:', metadataError);
  }
  
  console.log('⚠️ Failed to ensure profile exists after multiple attempts');
  return false;
};

// Export the service methods
export const userProfileService = {
  getUserProfile,
  updateUserProfile,
  ensureProfileExists
};
