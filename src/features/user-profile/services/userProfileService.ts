/**
 * User Profile Service
 * 
 * Service for managing user profile data in Supabase.
 * Following Planora's architectural principles with feature-first organization.
 */

import { supabase } from '@/features/auth/services/supabaseClient';
import { UserProfile, DbUserProfile } from '../types/profileTypes';
// Import directly from service to avoid circular dependency through API
import { travelPreferencesService } from '@/features/travel-preferences/services/travelPreferencesService';

/**
 * Converts snake_case database profile to camelCase application profile
 */
const mapDbProfileToUserProfile = (dbProfile: DbUserProfile): UserProfile => {
  // Get the birthdate value (now the standardized field)
  const dateValue = dbProfile.birthdate || null;
  
  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name || '',
    lastName: dbProfile.last_name || '',
    email: dbProfile.email,
    avatarUrl: dbProfile.avatar_url,
    // Standard field for birth date information
    birthdate: dateValue,
    // Location data
    country: dbProfile.country || undefined,
    city: dbProfile.city || undefined,
    customCity: dbProfile.custom_city || undefined,
    hasCompletedOnboarding: dbProfile.has_completed_onboarding,
    emailVerified: dbProfile.email_verified,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  };
};

/**
 * Converts camelCase application profile to snake_case database profile
 * Standardizes on using birthdate as the single date field in the database
 */
const mapUserProfileToDbProfile = (profile: Partial<UserProfile>): Partial<DbUserProfile> => {
  const dbProfile: Partial<DbUserProfile> = {};
  
  if (profile.id !== undefined) dbProfile.id = profile.id;
  if (profile.firstName !== undefined) dbProfile.first_name = profile.firstName;
  if (profile.lastName !== undefined) dbProfile.last_name = profile.lastName;
  if (profile.email !== undefined) dbProfile.email = profile.email;
  if (profile.avatarUrl !== undefined) dbProfile.avatar_url = profile.avatarUrl;
  
  // Standardize on birthdate field, use only birthdate as the standard field
  const dateValue = profile.birthdate;
  
  // Add date to DB model if provided
  if (dateValue) {
    dbProfile.birthdate = dateValue;
  }
  
  // Location data
  if (profile.country !== undefined) dbProfile.country = profile.country;
  if (profile.city !== undefined) dbProfile.city = profile.city;
  if (profile.customCity !== undefined) dbProfile.custom_city = profile.customCity;
  
  if (profile.hasCompletedOnboarding !== undefined) dbProfile.has_completed_onboarding = profile.hasCompletedOnboarding;
  if (profile.emailVerified !== undefined) dbProfile.email_verified = profile.emailVerified;
  
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

  try {
    // Try to get from user_metadata.full_name (Google OAuth)
    if (user_metadata?.full_name && typeof user_metadata.full_name === 'string') {
      const nameParts = user_metadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } 
    // Try to get from user_metadata.name (Google OAuth)
    else if (user_metadata?.name && typeof user_metadata.name === 'string') {
      const nameParts = user_metadata.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    // Try to get from individual first_name and last_name fields
    else if (user_metadata?.first_name && typeof user_metadata.first_name === 'string') {
      firstName = user_metadata.first_name;
      lastName = (user_metadata.last_name as string) || '';
    }
    // Try to get from identities array (Google OAuth)
    else if (user_metadata?.identities && Array.isArray(user_metadata.identities)) {
      const googleIdentity = (user_metadata.identities as any[]).find((identity: any) => 
        identity.provider === 'google'
      );
      
      if (googleIdentity?.identity_data) {
        firstName = googleIdentity.identity_data.given_name || googleIdentity.identity_data.first_name || '';
        lastName = googleIdentity.identity_data.family_name || googleIdentity.identity_data.last_name || '';
      }
    }
    
    console.log(`Extracted name: ${firstName} ${lastName}`);
  } catch (e) {
    console.error('Error extracting name from metadata:', e);
  }
  
  return { firstName, lastName };
};

/**
 * User profile service for managing profile data
 */
export const userProfileService = {
  /**
   * Updates a user profile with data from Google authentication
   * @param user User data from Supabase auth
   * @returns True if profile was successfully updated
   */
  updateProfileWithGoogleData: async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<boolean> => {
    try {
      if (!user || !user.id) {
        console.error('Invalid user data for profile update');
        return false;
      }
      
      const { firstName, lastName } = extractNameFromGoogleData(user);
      
      // Check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing profile:', checkError);
        
        // Try to create a new profile if error suggests it doesn't exist
        if (checkError.code === 'PGRST104' || checkError.message?.includes('not found')) {
          console.log('Profile not found, creating new profile for Google user');
          
          const timestamp = new Date().toISOString();
          const emailVerified = true; // Google accounts are pre-verified
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              email_verified: emailVerified,
              created_at: timestamp,
              updated_at: timestamp,
              // Standardize on birthdate field only
              birthdate: null
            });
            
          if (insertError) {
            console.error('Error creating profile for Google user:', insertError);
            return false;
          }
          
          console.log('Successfully created profile for Google user');
          return true;
        }
        
        return false;
      }
      
      if (existingProfile) {
        console.log('Updating existing profile with Google data');
        
        // Only use birthdate as the standard field
        // Profile is now using standardized birthdate field
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName || existingProfile.first_name,
            last_name: lastName || existingProfile.last_name,
            email: user.email,
            email_verified: true, // Google accounts are pre-verified
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile with Google data:', updateError);
          return false;
        }
        
        console.log('Successfully updated profile with Google data');
        return true;
      }
      
      return false;
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
      if (!userId) {
        console.error('User ID is required to check profile');
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No match found
        }
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
   * @returns True if a profile exists or was created
   */
  ensureProfileExists: async (userId: string): Promise<boolean> => {
    try {
      if (!userId) {
        console.error('User ID is required to ensure profile');
        return false;
      }
      
      // First check if profile exists
      const profileExists = await userProfileService.checkProfileExists(userId);
      
      if (profileExists) {
        return true;
      }
      
      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user data for profile creation:', userError);
        return false;
      }
      
      // Create a minimal profile
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          first_name: '',
          last_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError) {
        console.error('Error creating profile:', createError);
        return false;
      }
      
      return true;
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
      if (!userId) {
        console.error('User ID is required to get profile');
        return null;
      }
      
      // Attempt to get profile from database
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        // Not found error is expected when profile doesn't exist
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user ID:', userId);
        } else {
          console.error('Error getting profile from database:', error);
        }
        
        // Try to get user data from auth as fallback
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user data as fallback:', userError);
          return null;
        }
        
        // Create a synthetic profile from auth data
        if (user.id === userId) {
          console.log('Creating synthetic profile from auth data');
          
          const { firstName, lastName } = extractNameFromGoogleData(user);
          
          const syntheticProfile: UserProfile = {
            id: userId,
            firstName: firstName || '',
            lastName: lastName || '',
            email: user.email || '',
            avatarUrl: null,
            birthdate: null,
            hasCompletedOnboarding: false,
            emailVerified: !!user.email_confirmed_at,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          };
          
          return syntheticProfile;
        }
      }
      
      if (dbProfile) {
        return mapDbProfileToUserProfile(dbProfile);
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
      if (!profileData || !profileData.id) {
        console.error('Profile data with ID is required to create profile');
        return false;
      }
      
      // Convert to database format
      const dbProfile = mapUserProfileToDbProfile(profileData);
      
      // Add timestamps
      const now = new Date().toISOString();
      dbProfile.created_at = now;
      dbProfile.updated_at = now;
      
      // Insert into database
      const { error } = await supabase
        .from('profiles')
        .insert(dbProfile);
        
      if (error) {
        console.error('Error creating profile in database:', error);
        
        // Check if it's a unique constraint violation (profile already exists)
        if (error.code === '23505') {
          console.log('Profile already exists, attempting update instead');
          
          // Try updating instead
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              ...dbProfile,
              created_at: undefined, // Don't overwrite creation date
            })
            .eq('id', profileData.id);
            
          if (updateError) {
            console.error('Error updating existing profile:', updateError);
            return false;
          }
          
          return true;
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  },
  
  /**
   * Update a user's profile
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
      
      // Format the standardized birthdate field
      const formatDate = (dateStr: string | null | undefined): string | null => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
          console.warn('Invalid date format:', dateStr);
          return null;
        } catch (e) {
          console.error('Error formatting date:', e);
          return null;
        }
      };
      
      // Format birthdate if provided
      if (profileUpdate.birthdate !== undefined) {
        profileUpdate.birthdate = formatDate(profileUpdate.birthdate);
      }
      
      // Store location data for sync with travel preferences
      const locationUpdated = profileUpdate.country !== undefined || profileUpdate.city !== undefined;
      const locationData = {
        country: profileUpdate.country,
        city: profileUpdate.city === 'Other' ? profileUpdate.customCity : profileUpdate.city
      };
      
      // Convert profile data to database format
      const dbProfile = mapUserProfileToDbProfile(profileUpdate);
      
      // Add updated timestamp
      dbProfile.updated_at = new Date().toISOString();
      
      // First try: Update with all fields
      let updateResult = await supabase
        .from('profiles')
        .update({
          ...dbProfile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (updateResult.error) {
        console.error('Error updating profile in database:', updateResult.error);
        
        // Try more specific error handling approaches
        if (updateResult.error.code === 'PGRST204' || 
            (updateResult.error.message?.includes('column') && 
             updateResult.error.message?.includes('does not exist'))) {
             
          console.log('Column error detected - trying fallback update strategy');
          
          // Strategy 1: Try without the specific field that's causing problems
          if (updateResult.error.message?.includes('birthdate')) {
            console.log('Birthdate column issue detected - removing problematic field');
            const { error: retryError1 } = await supabase
              .from('profiles')
              .update({
                first_name: dbProfile.first_name,
                last_name: dbProfile.last_name,
                email: dbProfile.email,
                updated_at: new Date().toISOString(),
                // Explicitly exclude birthdate
              })
              .eq('id', userId);
              
            if (!retryError1) {
              console.log('Successfully updated profile with limited fields');
              return true;
            }
          }
          
          // Strategy 2: Try minimal fields only (names)
          console.log('Trying minimal update with first_name and last_name only');
          const { error: retryError2 } = await supabase
            .from('profiles')
            .update({
              first_name: dbProfile.first_name,
              last_name: dbProfile.last_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (!retryError2) {
            console.log('Successfully updated profile with names only');
            return true;
          }
          
          // Strategy 3: Last resort - try to create profile if it doesn't exist
          if (updateResult.error.message?.includes('not found') || 
              updateResult.error.code === 'PGRST104' || 
              updateResult.error.code === 'PGRST116') {
            console.log('Profile might not exist - trying to create instead');
            
            // Construct a minimal profile from the update data
            const minimalProfile: UserProfile = {
              id: userId,
              firstName: profileUpdate.firstName || '',
              lastName: profileUpdate.lastName || '',
              email: profileUpdate.email || '',
              birthdate: profileUpdate.birthdate as string | null | undefined,
              // Standardized on birthdate field only
              hasCompletedOnboarding: false,
              emailVerified: true, // Set to true for new profiles since we have verified emails
            };
            
            const success = await userProfileService.createUserProfile(minimalProfile);
            if (success) {
              console.log('Successfully created profile as fallback for update');
              return true;
            }
          }
        }
        
        return false;
      }
      
      // Sync profile location with travel preferences if location was updated
      if (locationUpdated && locationData.country) {
        try {
          // First check if travel preferences exist
          const prefsExist = await travelPreferencesService.checkTravelPreferencesExist(userId);
          
          if (prefsExist) {
            // Get current travel preferences
            const currentPrefs = await travelPreferencesService.getUserTravelPreferences(userId);
            
            if (currentPrefs) {
              // Update travel preferences with new location data
              await travelPreferencesService.saveTravelPreferences(userId, {
                departureCountry: locationData.country,
                departureCity: locationData.city || currentPrefs.departureCity
              });
              console.log('Successfully synced profile location with travel preferences');
            }
          }
        } catch (syncError) {
          // Non-critical error, continue even if sync fails
          console.warn('Failed to sync profile location with travel preferences:', syncError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
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
  },
  
  /**
   * Request account deletion with a 30-day recovery period
   * Updates the profile status and creates a deletion request
   * @param userId User ID to mark for deletion
   * @param email User's email for recovery communication
   * @returns Object with success status, optional error message, and recovery token
   */
  requestAccountDeletion: async (userId: string, email: string): Promise<{ success: boolean, error?: string, recoveryToken?: string }> => {
    try {
      if (!userId || !email) {
        console.error('User ID and email are required to request account deletion');
        return { success: false, error: 'Missing required information' };
      }
      
      // Start a transaction
      const now = new Date().toISOString();
      // Calculate purge date (30 days from now)
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const scheduledPurgeAt = thirtyDaysLater.toISOString();
      
      // Generate a recovery token
      const recoveryToken = crypto.randomUUID ? crypto.randomUUID() : `recovery_${userId}_${Date.now()}`;
      
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_status: 'pending_deletion',
          deletion_requested_at: now,
          updated_at: now
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating profile status for deletion:', profileError);
        return { success: false, error: 'Failed to update account status' };
      }
      
      // Create deletion request
      const { error: requestError } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: userId,
          email: email,
          requested_at: now,
          scheduled_purge_at: scheduledPurgeAt,
          status: 'pending',
          recovery_token: recoveryToken
        });
        
      if (requestError) {
        console.error('Error creating account deletion request:', requestError);
        
        // Revert profile status if request creation failed
        await supabase
          .from('profiles')
          .update({
            account_status: 'active',
            deletion_requested_at: null,
            updated_at: now
          })
          .eq('id', userId);
          
        return { success: false, error: 'Failed to create deletion request' };
      }
      
      return { 
        success: true,
        recoveryToken // Include the token for recovery communication
      };
    } catch (error) {
      console.error('Unexpected error requesting account deletion:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  /**
   * Recover an account marked for deletion
   * @param recoveryToken The recovery token from the deletion request
   * @returns Object with success status and optional error message
   */
  recoverAccount: async (recoveryToken: string): Promise<{ success: boolean, error?: string }> => {
    try {
      if (!recoveryToken) {
        return { success: false, error: 'Recovery token is required' };
      }
      
      // Find the deletion request
      const { data: request, error: findError } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('recovery_token', recoveryToken)
        .eq('status', 'pending')
        .single();
        
      if (findError || !request) {
        console.error('Error finding deletion request:', findError);
        return { success: false, error: 'Invalid or expired recovery token' };
      }
      
      // Update the request status
      const { error: updateRequestError } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'cancelled',
        })
        .eq('id', request.id);
        
      if (updateRequestError) {
        console.error('Error updating deletion request status:', updateRequestError);
        return { success: false, error: 'Failed to update request status' };
      }
      
      // Update the profile status
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          deletion_requested_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.user_id);
        
      if (updateProfileError) {
        console.error('Error updating profile status:', updateProfileError);
        return { success: false, error: 'Failed to restore account' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error recovering account:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  /**
   * Check the status of an account deletion request
   * @param userId User ID to check deletion status for
   * @returns Object with deletion status information
   */
  checkAccountDeletionStatus: async (userId: string): Promise<{ 
    isPendingDeletion: boolean, 
    requestDate?: string,
    scheduledPurgeDate?: string,
    daysRemaining?: number,
    recoveryToken?: string
  }> => {
    try {
      if (!userId) {
        console.error('User ID is required to check deletion status');
        return { isPendingDeletion: false };
      }
      
      // Get profile status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_status, deletion_requested_at')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error getting profile status:', profileError);
        return { isPendingDeletion: false };
      }
      
      const isPendingDeletion = profile.account_status === 'pending_deletion';
      
      if (!isPendingDeletion) {
        return { isPendingDeletion: false };
      }
      
      // Get detailed deletion request
      const { data: request, error: requestError } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();
        
      if (requestError || !request) {
        console.error('Error getting deletion request:', requestError);
        return { 
          isPendingDeletion: true,
          requestDate: profile.deletion_requested_at
        };
      }
      
      // Calculate days remaining
      const now = new Date();
      const purgeDate = new Date(request.scheduled_purge_at);
      const diffTime = Math.abs(purgeDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        isPendingDeletion: true,
        requestDate: request.requested_at,
        scheduledPurgeDate: request.scheduled_purge_at,
        daysRemaining: diffDays,
        recoveryToken: request.recovery_token
      };
    } catch (error) {
      console.error('Unexpected error checking deletion status:', error);
      return { isPendingDeletion: false };
    }
  },
  
  /**
   * Permanently delete a user profile and all associated data
   * @param userId User ID to delete
   * @param deleteAuth Whether to also delete the auth user
   * @returns True if deletion was successful
   */
  deleteUserProfile: async (userId: string, deleteAuth: boolean = false): Promise<boolean> => {
    try {
      if (!userId) {
        console.error('User ID is required to delete profile');
        return false;
      }
      
      // Delete travel preferences
      const { error: travelError } = await supabase
        .from('travel_preferences')
        .delete()
        .eq('user_id', userId);
        
      if (travelError) {
        console.warn('Error deleting travel preferences:', travelError);
        // Continue with deletion even if this fails
      }
      
      // Mark deletion requests as completed
      const { error: requestError } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'completed',
          purged_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'pending');
        
      if (requestError) {
        console.warn('Error updating deletion requests:', requestError);
        // Continue with deletion even if this fails
      }
      
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        return false;
      }
      
      // Delete auth user if requested
      if (deleteAuth) {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error('Error deleting auth user:', authError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error deleting user profile:', error);
      return false;
    }
  },
  
  /**
   * Check if database connection is working
   * @returns True if database connection is successful
   */
  checkDatabaseConnection: async (): Promise<boolean> => {
    try {
      // Simple ping to Supabase using profiles table to test connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Database connection test failed:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error during database connection test:', error);
      return false;
    }
  },
  
  /**
   * Complete the email change process for a user
   * @param userId The user ID to complete the email change for
   * @returns True if the email change was successfully completed
   */
  completeEmailChange: async (userId: string, newEmail: string): Promise<boolean> => {
    try {
      // Clear email change fields in the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: newEmail, // Update the email field
          pending_email_change: null,
          email_change_requested_at: null,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating profile during email change completion:', profileError);
        return false;
      }
      
      // Update the email_change_tracking table if it exists
      try {
        const { error: trackingError } = await supabase
          .from('email_change_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('status', 'pending');
          
        if (trackingError) {
          // This is a non-critical error, just log it
          console.warn('Error updating email change tracking:', trackingError);
        }
      } catch (trackingErr) {
        // Non-critical error, just log it
        console.warn('Error with email change tracking table:', trackingErr);
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error completing email change:', error);
      return false;
    }
  }
};
