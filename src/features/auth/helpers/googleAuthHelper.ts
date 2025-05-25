/**
 * Google Auth Helper
 * 
 * Helper functions for Google authentication flow
 * Following Planora's architectural principles with feature-first organization
 */

import { supabase } from '@/database/databaseExports';
import { AuthError } from '@supabase/supabase-js';

/**
 * Helper to fix common issues with Google authentication
 * Provides recovery mechanisms for various failure scenarios
 */
export const googleAuthHelper = {
  /**
   * Verify and recover Google authentication
   * This handles cases where the auth flow succeeded but profile creation failed
   * @param url The full URL from the OAuth callback
   */
  verifyAndRecoverGoogleAuth: async (url: string): Promise<boolean> => {
    // Check if the URL contains an error related to database user creation
    if (url.includes('error=server_error') && 
        url.includes('error_description=Database+error+saving+new+user')) {
      
      console.log('Detected database error saving new user, attempting direct profile creation...');
      
      try {
        // For 'Database error saving new user', the OAuth authentication actually succeeded
        // but the database trigger to create the profile failed
        
        // First, try to get the current session - there might be a valid session already
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Existing session found, attempting to create profile...');
          const { user } = sessionData.session;
          
          if (!user) {
            console.error('Recovery failed: Session exists but no user found');
            return false;
          }
          
          // Create profile manually since that's what likely failed
          return await createProfileForUser(user.id, user.email || '', user.user_metadata || {});
        }
        
        // No active session found, we need to try a different approach
        // Manual sign-in with Google might be needed at this point
        console.log('No active session found. User will need to try signing in again.');
        return false;
      } catch (error) {
        console.error('Google auth recovery failed:', error);
        return false;
      }
    }
    
    // No recovery needed or recovery not applicable
    return false;
  }
};

/**
 * Create a profile for a user who was authenticated but has no profile
 * @param userId The user ID
 * @param email The user's email
 * @param metadata The user's metadata from authentication
 */
async function createProfileForUser(
  userId: string, 
  email: string, 
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return true;
    }
    
    console.log('Creating missing profile for user:', userId);
    
    // Get timestamp for consistency
    const timestamp = new Date().toISOString();
    
    // Create profile with available data
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: metadata.given_name || metadata.name?.split(' ')[0] || '',
        last_name: metadata.family_name || metadata.name?.split(' ').slice(1).join(' ') || '',
        avatar_url: metadata.picture || '',
        email_verified: true,
        created_at: timestamp,
        updated_at: timestamp,
        has_completed_onboarding: false,
        account_status: 'active',  // Add required account_status field
        birthday: null,
        birthdate: null
      });
      
    if (error) {
      console.error('Error creating profile:', error);
      // Log the specific error details for better debugging
      if (error.details) {
        console.error('Error details:', error.details);
      }
      if (error.hint) {
        console.error('Error hint:', error.hint);
      }
      return false;
    }
    
    console.log('Successfully created profile for user:', userId);
    return true;
  } catch (error) {
    console.error('Error in createProfileForUser:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}
