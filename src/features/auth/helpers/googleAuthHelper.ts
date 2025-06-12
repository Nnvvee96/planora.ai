/**
 * Google Auth Helper
 * 
 * Helper functions for Google authentication flow
 * Following Planora's architectural principles with feature-first organization
 */

import { supabase } from '../services/supabaseClient';
import { AuthError } from '@supabase/supabase-js';

/**
 * Extract first name from various Google metadata formats
 * @param metadata User metadata from authentication
 * @returns First name or empty string
 */
function extractFirstName(metadata: Record<string, any>): string {
  // Try to get from identities array first (most reliable for Google)
  if (metadata.identities && Array.isArray(metadata.identities)) {
    const googleIdentity = metadata.identities.find((identity: any) => 
      identity.provider === 'google'
    );
    
    if (googleIdentity?.identity_data) {
      if (googleIdentity.identity_data.given_name) {
        return googleIdentity.identity_data.given_name;
      }
      if (googleIdentity.identity_data.first_name) {
        return googleIdentity.identity_data.first_name;
      }
      if (googleIdentity.identity_data.name) {
        return googleIdentity.identity_data.name.split(' ')[0] || '';
      }
    }
  }
  
  // Try direct metadata fields
  if (metadata.given_name) {
    return metadata.given_name;
  }
  if (metadata.first_name) {
    return metadata.first_name;
  }
  if (metadata.name) {
    return metadata.name.split(' ')[0] || '';
  }
  if (metadata.full_name) {
    return metadata.full_name.split(' ')[0] || '';
  }
  
  // No name found
  return '';
}

/**
 * Extract last name from various Google metadata formats
 * @param metadata User metadata from authentication
 * @returns Last name or empty string
 */
function extractLastName(metadata: Record<string, any>): string {
  // Try to get from identities array first (most reliable for Google)
  if (metadata.identities && Array.isArray(metadata.identities)) {
    const googleIdentity = metadata.identities.find((identity: any) => 
      identity.provider === 'google'
    );
    
    if (googleIdentity?.identity_data) {
      if (googleIdentity.identity_data.family_name) {
        return googleIdentity.identity_data.family_name;
      }
      if (googleIdentity.identity_data.last_name) {
        return googleIdentity.identity_data.last_name;
      }
      if (googleIdentity.identity_data.name) {
        const parts = googleIdentity.identity_data.name.split(' ');
        return parts.length > 1 ? parts.slice(1).join(' ') : '';
      }
    }
  }
  
  // Try direct metadata fields
  if (metadata.family_name) {
    return metadata.family_name;
  }
  if (metadata.last_name) {
    return metadata.last_name;
  }
  if (metadata.name) {
    const parts = metadata.name.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
  if (metadata.full_name) {
    const parts = metadata.full_name.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
  
  // No name found
  return '';
}

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
      .select('id, email_verified')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      
      // If profile exists but email_verified is false, update it for Google sign-ins
      if (existingProfile.email_verified === false) {
        console.log('Updating email_verified status for Google account');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating email_verified status:', updateError);
        }
      }
      
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
        first_name: extractFirstName(metadata),
        last_name: extractLastName(metadata),
        avatar_url: metadata.picture || metadata.avatar_url || '',
        email_verified: true,  // Always true for Google sign-ins
        created_at: timestamp,
        updated_at: timestamp,
        has_completed_onboarding: false,
        account_status: 'active',  // Add required account_status field
        birthdate: null  // Standardized field for birth date
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
      
      // If we get a column error, try a more minimal profile creation
      if (error.code === 'PGRST204' || 
          (error.message && error.message.includes('column') && 
           error.message.includes('does not exist'))) {
        
        console.log('Attempting fallback profile creation without problematic columns');
        
        // Try with only the essential fields
        const { error: fallbackError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            first_name: extractFirstName(metadata),
            last_name: extractLastName(metadata),
            email_verified: true,
            created_at: timestamp,
            updated_at: timestamp,
            has_completed_onboarding: false,
            account_status: 'active'
          });
          
        if (!fallbackError) {
          console.log('Successfully created profile with fallback method');
          return true;
        }
        
        console.error('Fallback profile creation also failed:', fallbackError);
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
