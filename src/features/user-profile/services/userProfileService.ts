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
  // Determine the actual date value, preferring birthdate but falling back to birthday if needed
  const dateValue = dbProfile.birthdate || dbProfile.birthday || null;
  
  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name || '',
    lastName: dbProfile.last_name || '',
    email: dbProfile.email,
    avatarUrl: dbProfile.avatar_url,
    // Only use birthdate in the application model going forward
    birthdate: dateValue,
    // Remove birthday field from type eventually, but keep for backward compatibility
    birthday: dateValue, // Deprecated: use birthdate instead
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
  
  // Standardize on birthdate field, use either source for backward compatibility
  const dateValue = profile.birthdate !== undefined ? profile.birthdate : profile.birthday;
  if (dateValue !== undefined) {
    // Always set birthdate as the primary field
    dbProfile.birthdate = dateValue;
    // Still set birthday for backward compatibility with existing code
    // This can be removed once all code is migrated to use birthdate
    dbProfile.birthday = dateValue;
  }
  
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
  
  // First priority: explicit first_name and last_name fields
  if (user_metadata?.first_name && user_metadata?.last_name) {
    firstName = user_metadata.first_name as string;
    lastName = user_metadata.last_name as string;
  }
  // Second priority: given_name and family_name (common in Google OAuth)
  else if (user_metadata?.given_name && user_metadata?.family_name) {
    firstName = user_metadata.given_name as string;
    lastName = user_metadata.family_name as string;
  }
  // Third priority: full_name field
  else if (typeof user_metadata?.full_name === 'string') {
    const nameParts = (user_metadata.full_name as string).split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }
  // Fourth priority: name field
  else if (typeof user_metadata?.name === 'string') {
    const nameParts = (user_metadata.name as string).split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }
  // Fifth priority: try individual fields
  else {
    firstName = (user_metadata?.given_name as string) || 
                (user_metadata?.first_name as string) || 
                (user_metadata?.display_name as string) || '';
                
    lastName = (user_metadata?.family_name as string) || 
               (user_metadata?.last_name as string) || '';
  }
  
  // Fall back to email if name is still empty
  if ((!firstName || !lastName) && user.email) {
    // If we have at least one name part but not both, only fall back for the missing one
    if (!firstName && !lastName) {
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
    } else if (!firstName) {
      // Just extract first name from email
      const emailParts = user.email.split('@');
      const username = emailParts[0].split(/[._-]/)[0];
      firstName = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    } else if (!lastName) {
      // Just extract last name from email if possible
      const emailParts = user.email.split('@');
      const usernameParts = emailParts[0].split(/[._-]/);
      if (usernameParts.length > 1) {
        lastName = usernameParts.slice(1).map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
      }
    }
  }
  
  console.log('Extracted name information:', { firstName, lastName });
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
      
      // Get avatar URL from metadata
      const avatarUrl = (user_metadata?.avatar_url as string) || 
                       (user_metadata?.picture as string) || '';
      
      // For Google Auth, we always set email_verified to true
      const emailVerified = true;
      
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
            avatar_url: avatarUrl,
            has_completed_onboarding: false,
            email_verified: emailVerified,
            created_at: timestamp,
            updated_at: timestamp,
            // Set both birthday and birthdate to ensure compatibility
            birthday: null,
            birthdate: null
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
        
        console.log('Successfully created profile with Google data');
        return true;
      } else {
        // Profile exists, update with latest Google data
        console.log('Updating existing profile with Google data for user:', user.id);
        
        const updates: Record<string, unknown> = {
          updated_at: timestamp,
          email_verified: emailVerified
        };
        
        // Always update first_name and last_name if we have Google data
        // This ensures the profile stays in sync with Google account changes
        if (firstName) {
          updates.first_name = firstName;
        }
        
        if (lastName) {
          updates.last_name = lastName;
        }
        
        // Update avatar if we have one from Google
        if (avatarUrl) {
          updates.avatar_url = avatarUrl;
        }
        
        // If both birthday and birthdate are used, keep them in sync
        if (data.birthday && !data.birthdate) {
          updates.birthdate = data.birthday;
        } else if (!data.birthday && data.birthdate) {
          updates.birthday = data.birthdate;
        }
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile with Google data:', updateError);
          return false;
        }
        
        console.log('Successfully updated profile with Google data');
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
      
      // Format date fields - handle both birthday and birthdate
      const formatDateField = (dateStr: string | null | undefined): string | null => {
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
      
      // Standardize date handling to use birthdate field
      // Determine the source date, prioritizing birthdate but falling back to birthday if needed
      const sourceDate = profileUpdate.birthdate !== undefined ? profileUpdate.birthdate : profileUpdate.birthday;
      const formattedDate = formatDateField(sourceDate);
      
      // Set the standardized birthdate field
      if (formattedDate) {
        // Use the formatted date for both fields for backward compatibility
        profileUpdate.birthdate = formattedDate;
        profileUpdate.birthday = formattedDate; // Legacy support - will be removed in future
      } else if (sourceDate === '') {
        // Handle explicit empty strings - set to null to clear the field
        profileUpdate.birthdate = null;
        profileUpdate.birthday = null;
      }
      
      // Convert profile data to database format
      const dbProfile = mapUserProfileToDbProfile(profileUpdate);
      
      console.log('Updating profile in database:', { userId, dbProfile });
      
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
          
          // Strategy 1: Try without birthdate if that's the problematic column
          if (updateResult.error.message?.includes('birthdate')) {
            console.log('Birthdate column issue detected - trying with only birthday');
            const { error: retryError1 } = await supabase
              .from('profiles')
              .update({
                first_name: dbProfile.first_name,
                last_name: dbProfile.last_name,
                email: dbProfile.email,
                birthday: dbProfile.birthday, // Keep only the older field name
                updated_at: new Date().toISOString(),
                // Explicitly exclude birthdate
              })
              .eq('id', userId);
              
            if (!retryError1) {
              console.log('Successfully updated profile with birthday only');
              return true;
            }
          }
          
          // Strategy 2: Try with core fields only
          console.log('Trying core fields only update');
          const { error: retryError2 } = await supabase
            .from('profiles')
            .update({
              first_name: dbProfile.first_name,
              last_name: dbProfile.last_name,
              email: dbProfile.email,
              updated_at: new Date().toISOString(),
              // Exclude both date fields
            })
            .eq('id', userId);
            
          if (!retryError2) {
            console.log('Successfully updated profile with core fields only');
            return true;
          }
          
          // If we got here, we have a more serious issue
          console.error('All update strategies failed');
        }
        
        // If the profile doesn't exist, try creating it
        if (updateResult.error.code === 'PGRST116' || updateResult.error.message?.includes('not found')) {
          console.log('Profile does not exist, attempting to create it');
          return userProfileService.createUserProfile({
            id: userId,
            firstName: profileUpdate.firstName || '',
            lastName: profileUpdate.lastName || '',
            email: profileUpdate.email || '',
            birthdate: profileUpdate.birthdate as string | null | undefined,
            birthday: profileUpdate.birthday as string | null | undefined,
            hasCompletedOnboarding: false,
            emailVerified: true, // Set to true for new profiles since we have verified emails
          });
        }
        
        return false;
      }
      
      // Also update auth metadata with name and date fields
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          const metadata: Record<string, unknown> = {};
          
          if (profileUpdate.firstName) metadata.first_name = profileUpdate.firstName;
          if (profileUpdate.lastName) metadata.last_name = profileUpdate.lastName;
          if (profileUpdate.birthdate) metadata.birthdate = profileUpdate.birthdate;
          
          await supabase.auth.updateUser({
            data: metadata
          });
        }
      } catch (metadataError) {
        console.error('Error updating user metadata (non-critical):', metadataError);
        // Don't fail the overall operation for metadata update failures
      }
      
      console.log('Successfully updated profile:', updateResult.data);
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
   * @returns Object with success status and optional error message
   */
  requestAccountDeletion: async (userId: string, email: string): Promise<{ success: boolean, error?: string }> => {
    try {
      if (!userId || !email) {
        console.error('User ID and email are required to request account deletion');
        return { success: false, error: 'Missing required information' };
      }
      
      console.log(`Requesting account deletion for user ${userId}`);
      
      // Calculate purge date (30 days from now)
      const now = new Date();
      const purgeDate = new Date();
      purgeDate.setDate(now.getDate() + 30);
      
      // Generate a recovery token (UUID v4)
      const recoveryToken = crypto.randomUUID();
      
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_status: 'pending_deletion',
          deletion_requested_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating profile status:', profileError);
        return { success: false, error: 'Failed to update account status' };
      }
      
      // Create deletion request
      const { error: requestError } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: userId,
          email: email,
          requested_at: now.toISOString(),
          scheduled_purge_at: purgeDate.toISOString(),
          status: 'pending',
          recovery_token: recoveryToken
        });
        
      if (requestError) {
        console.error('Error creating deletion request:', requestError);
        
        // Revert profile status change if request creation fails
        await supabase
          .from('profiles')
          .update({
            account_status: 'active',
            deletion_requested_at: null,
            updated_at: now.toISOString()
          })
          .eq('id', userId);
          
        return { success: false, error: 'Failed to schedule account deletion' };
      }
      
      // TODO: Send deletion confirmation email with recovery link
      // This would typically integrate with your email service
      console.log(`Account deletion scheduled. Recovery token: ${recoveryToken}`);
      
      return { success: true };
    } catch (error) {
      console.error('Account deletion request failed:', error);
      return { success: false, error: 'Unexpected error during account deletion request' };
    }
  },
  
  /**
   * Recover an account that was marked for deletion
   * @param recoveryToken The token from the recovery link
   * @returns Object with success status and optional error message
   */
  recoverAccount: async (recoveryToken: string): Promise<{ success: boolean, error?: string }> => {
    try {
      if (!recoveryToken) {
        return { success: false, error: 'Recovery token is required' };
      }
      
      console.log(`Attempting account recovery with token: ${recoveryToken}`);
      
      // Find the deletion request with this token
      const { data: request, error: requestError } = await supabase
        .from('account_deletion_requests')
        .select('user_id, email, status, scheduled_purge_at')
        .eq('recovery_token', recoveryToken)
        .eq('status', 'pending')
        .single();
        
      if (requestError || !request) {
        console.error('Error finding deletion request:', requestError);
        return { success: false, error: 'Invalid or expired recovery token' };
      }
      
      // Check if the token is still within the 30-day window
      const purgeDate = new Date(request.scheduled_purge_at);
      const now = new Date();
      
      if (now > purgeDate) {
        console.error('Recovery period has expired');
        return { success: false, error: 'Recovery period has expired' };
      }
      
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          deletion_requested_at: null,
          updated_at: now.toISOString()
        })
        .eq('id', request.user_id);
        
      if (profileError) {
        console.error('Error recovering profile:', profileError);
        return { success: false, error: 'Failed to recover account' };
      }
      
      // Update deletion request status
      const { error: updateError } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'cancelled'
        })
        .eq('recovery_token', recoveryToken);
        
      if (updateError) {
        console.error('Error updating deletion request:', updateError);
        return { success: false, error: 'Failed to update deletion request' };
      }
      
      // TODO: Send recovery confirmation email
      // This would typically integrate with your email service
      console.log(`Account recovered successfully: ${request.user_id}`);
      
      return { success: true };
    } catch (error) {
      console.error('Account recovery failed:', error);
      return { success: false, error: 'Unexpected error during account recovery' };
    }
  },
  
  /**
   * Check if a user's account is pending deletion
   * @param userId User ID to check
   * @returns Object with pending status and purge date if applicable
   */
  checkAccountDeletionStatus: async (userId: string): Promise<{ isPending: boolean, purgeDate?: Date }> => {
    try {
      if (!userId) {
        return { isPending: false };
      }
      
      // Check profile status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_status, deletion_requested_at')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        return { isPending: false };
      }
      
      if (profile.account_status === 'pending_deletion') {
        // Get scheduled purge date
        const { data: request, error: requestError } = await supabase
          .from('account_deletion_requests')
          .select('scheduled_purge_at')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .single();
          
        if (!requestError && request) {
          return { 
            isPending: true, 
            purgeDate: new Date(request.scheduled_purge_at) 
          };
        }
        
        return { isPending: true };
      }
      
      return { isPending: false };
    } catch (error) {
      console.error('Error checking account deletion status:', error);
      return { isPending: false };
    }
  },
  
  /**
   * Complete the account deletion immediately (hard delete)
   * This is the original delete method, now used for immediate deletion
   * @param userId User ID to delete
   * @param deleteAuth Whether to delete the auth record too (requires admin privileges)
   */
  deleteUserProfile: async (userId: string, deleteAuth: boolean = false): Promise<boolean> => {
    try {
      if (!userId) {
        console.error('User ID is required to delete profile');
        return false;
      }
      
      console.log(`Deleting user profile for ${userId}, deleteAuth=${deleteAuth}`);
      
      // 1. Start a transaction to delete related data (travel preferences first)
      const { error: travelPrefError } = await supabase
        .from('travel_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (travelPrefError) {
        console.error('Error deleting travel preferences:', travelPrefError);
        // Continue anyway to try deleting the profile
      }
      
      // 2. Delete any pending deletion requests
      const { error: requestError } = await supabase
        .from('account_deletion_requests')
        .delete()
        .eq('user_id', userId);
        
      if (requestError) {
        console.error('Error deleting account deletion requests:', requestError);
        // Continue anyway to try deleting the profile
      }
      
      // 3. Delete the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        return false;
      }
      
      // 4. If requested and we have admin permissions, delete the auth record
      if (deleteAuth) {
        try {
          // This requires admin privileges and may not work in all environments
          const { error: authError } = await supabase.auth.admin.deleteUser(userId);
          
          if (authError) {
            console.error('Error deleting auth user (admin only):', authError);
            // Don't return false here as we've already deleted the profile
          } else {
            console.log('Successfully deleted auth user');
          }
        } catch (adminError) {
          console.error('Admin deletion failed (likely due to permissions):', adminError);
          // Fall back to signing out the current user if this is a self-deletion
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id === userId) {
            await supabase.auth.signOut();
          }
        }
      } else {
        // If not deleting the auth record, sign out if this is the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          await supabase.auth.signOut();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }
};
