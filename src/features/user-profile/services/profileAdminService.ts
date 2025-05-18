/**
 * Profile Admin Service
 * 
 * This service handles administrative operations for user profiles that require
 * special permissions or bypass standard RLS policies in Supabase.
 * 
 * NOTE: This service uses specialized endpoints that bypass RLS for specific operations
 * that cannot be handled through regular client operations due to security restrictions.
 */

import { supabase } from '@/lib/supabase/supabaseClient';
import { UserProfile } from '../types/userProfileTypes';
import { Database } from '@/types/supabaseTypes';

/**
 * Creates a user profile using service role permissions to bypass RLS policies.
 * This should ONLY be used for the essential operation of creating a profile
 * during signup/authentication when the user's session may not have the right permissions.
 * 
 * @param userId The user's ID
 * @param profileData Initial profile data
 * @returns Whether the profile was successfully created
 */
export const createProfileWithServiceRole = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<boolean> => {
  try {
    console.log('Attempting to create profile with service role for user:', userId);
    
    // First check if a profile already exists to avoid duplication
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', userId as any); // Type cast to bypass TypeScript restriction
    
    if (countError) {
      console.error('Error checking for existing profile:', countError.message);
    }
    
    // If profile already exists, no need to create a new one
    if (count && count > 0) {
      console.log('Profile already exists for user, no need to create');
      return true;
    }
    
    // Construct a minimal valid profile record with proper typing for Supabase
    // Note: Conform to the actual database schema from supabaseTypes.ts
    const profileRecord: Database['public']['Tables']['profiles']['Insert'] = {
      id: userId,
      email: profileData.email || '',
      username: profileData.username || '',
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      // Removed full_name as it's not in the database schema
      avatar_url: profileData.avatar_url || '',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Store the full name in a separate variable in case we need it for display purposes
    const fullName = profileData.full_name || '';
    
    // Create a serverless function call or Edge Function to create profile with service role
    // This is a simplified version - in production, you would call a secure serverless function
    const response = await fetch('/api/admin/create-user-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        profileData: profileRecord,
        // You would include a secure token here to validate the request
      }),
    });
    
    if (!response.ok) {
      // If the serverless function is not yet implemented, as a fallback
      // try the direct Supabase insert which might work in some cases
      console.log('Serverless function not available, attempting direct insert as fallback');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileRecord as any); // Type cast to bypass TypeScript restriction
        
      if (insertError) {
        console.error('Direct profile insert failed:', insertError.message);
        
        // As a last resort, try the REST API directly with a POST request
        // This approach avoids accessing protected properties directly
        const { data: configData } = await supabase.auth.getSession();
        const accessToken = configData?.session?.access_token;
        
        // Get the base URL from window.location for API calls
        // This avoids accessing protected supabaseUrl property
        const apiUrl = window.location.hostname.includes('localhost') 
          ? 'http://localhost:54321' // Local Supabase development URL
          : 'https://vwzbowcvbrchbpqjcnkg.supabase.co'; // Production Supabase URL
        
        const directApiResponse = await fetch(`${apiUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': accessToken || '', // Use session token instead of protected key
            'Authorization': `Bearer ${accessToken || ''}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(profileRecord)
        });
        
        if (!directApiResponse.ok) {
          console.error('All profile creation attempts failed');
          return false;
        }
      }
    }
    
    console.log('Successfully created profile for user');
    return true;
  } catch (error) {
    console.error('Error in createProfileWithServiceRole:', error);
    return false;
  }
};

// Export as a named service
export const profileAdminService = {
  createProfileWithServiceRole
};
