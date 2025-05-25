/**
 * Google Auth Helper
 * 
 * Helper functions for Google authentication flow
 * Following Planora's architectural principles with feature-first organization
 */

import { supabase } from '@/database/databaseExports';

/**
 * Helper to fix common issues with Google authentication
 * Provides recovery mechanisms for various failure scenarios
 */
export const googleAuthHelper = {
  /**
   * Verify and recover Google authentication
   * This handles cases where the auth flow succeeded but profile creation failed
   */
  verifyAndRecoverGoogleAuth: async (hash: string): Promise<boolean> => {
    // Check if the URL contains an error related to database user creation
    if (hash.includes('error=server_error') && 
        hash.includes('error_description=Database+error+saving+new+user')) {
      
      console.log('Detected database error saving new user, attempting recovery...');
      
      try {
        // Exchange the OAuth token for a session
        // This effectively "completes" the Google auth flow that failed at the DB level
        const result = await supabase.auth.exchangeCodeForSession(hash.substring(1));
        
        if (result.error) {
          console.error('Recovery attempt failed:', result.error);
          return false;
        }
        
        // Get the user from the newly created session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('Recovery attempt failed: No user found after exchange');
          return false;
        }
        
        console.log('Successfully recovered Google authentication for user:', user.id);
        
        // Create profile manually if needed
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (!profileData) {
          console.log('Creating missing profile for recovered user...');
          
          // Get timestamp for consistency
          const timestamp = new Date().toISOString();
          
          // Extract user metadata
          const metadata = user.user_metadata || {};
          
          // Create profile with available data
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: metadata.given_name || metadata.name?.split(' ')[0] || '',
              last_name: metadata.family_name || metadata.name?.split(' ').slice(1).join(' ') || '',
              avatar_url: metadata.picture || '',
              email_verified: true,
              created_at: timestamp,
              updated_at: timestamp,
              has_completed_onboarding: false
            });
        }
        
        return true;
      } catch (error) {
        console.error('Google auth recovery failed:', error);
        return false;
      }
    }
    
    // No recovery needed or recovery not applicable
    return false;
  }
};
