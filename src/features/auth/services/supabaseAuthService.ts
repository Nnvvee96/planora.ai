/**
 * Supabase Auth Service
 * 
 * Service for interacting with Supabase authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  AuthResponse, 
  UserRegistrationStatus, 
  GoogleAuthCredentials 
} from '../types/authTypes';

/**
 * Supabase authentication service
 * Provides methods for authentication operations
 */
export const supabaseAuthService = {
  /**
   * Update user metadata
   * @param metadata The metadata to update
   */
  updateUserMetadata: async (metadata: Record<string, unknown>): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to update user metadata:', err);
      throw err;
    }
  },
  
  /**
   * Sign in with Google
   * Initiates Google OAuth flow
   */
  signInWithGoogle: async (): Promise<void> => {
    // Use environment-specific redirect URL
    let redirectUrl;
    
    if (import.meta.env.DEV) {
      // Local development
      redirectUrl = 'http://localhost:3000/auth/callback';
    } else {
      // Production environment - hardcode the main domain
      redirectUrl = 'https://planora-ai-plum.vercel.app/auth/callback';
    }
    
    console.log('Using redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },
  
  /**
   * Sign out user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  /**
   * Get current user from session
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  /**
   * Check if user has completed onboarding
   */
  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
    
    return data?.has_completed_onboarding || false;
  },
  
  /**
   * Handle authentication callback from Google
   * Determines if user is new or returning
   */
  handleAuthCallback: async (): Promise<AuthResponse> => {
    try {
      console.log('Auth callback initiated');
      
      // Get session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Auth session check result:', { 
        hasSession: !!session, 
        hasError: !!error,
        errorMessage: error?.message
      });
      
      if (error || !session) {
        console.error('Auth callback error - no valid session:', error);
        return { 
          success: false, 
          user: null, 
          error: error?.message || 'No session found',
          registrationStatus: UserRegistrationStatus.ERROR
        };
      }
      
      const user = session.user;
      console.log('User authenticated successfully:', user.id);
      
      // Instead of importing from user-profile, we'll directly handle the profile update here
      // This breaks the circular dependency
      try {
        // Extract profile data from Google authentication
        const { user_metadata } = user;
        
        // Check if we have user metadata
        if (user_metadata) {
          const timestamp = new Date().toISOString();
          
          // Extract name from metadata (similar logic to what was in extractNameFromGoogleData)
          let firstName = '';
          let lastName = '';
          
          if (typeof user_metadata.name === 'string') {
            const nameParts = (user_metadata.name as string).split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else {
            firstName = (user_metadata.given_name as string) || (user_metadata.first_name as string) || '';
            lastName = (user_metadata.family_name as string) || (user_metadata.last_name as string) || '';
          }
          
          // If still empty and we have email, extract username part as fallback
          if (!firstName && user.email) {
            const emailParts = user.email.split('@');
            const nameParts = emailParts[0].split(/[.|_|-]/);
            if (nameParts.length > 1) {
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
            } else {
              firstName = emailParts[0] || '';
            }
          }
          
          console.log('Extracted name info:', { firstName, lastName });
          
          // Check if profile exists
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('id', user.id)
            .single();
          
          if (!data || error) {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: user.email,
                avatar_url: user_metadata.avatar_url as string || user_metadata.picture as string || '',
                has_completed_onboarding: false,
                created_at: timestamp,
                updated_at: timestamp
              });
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          } else if (!data.first_name || !data.last_name) {
            // Profile exists but name fields are empty, update them
            const updates: Record<string, unknown> = {
              updated_at: timestamp
            };
            
            if (!data.first_name && firstName) {
              updates.first_name = firstName;
            }
            
            if (!data.last_name && lastName) {
              updates.last_name = lastName;
            }
            
            if (Object.keys(updates).length > 1) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);
                
              if (updateError) {
                console.error('Error updating profile with Google data:', updateError);
              }
            }
          }
        }
      } catch (profileErr) {
        // Log but continue - we don't want profile errors to block auth
        console.warn('Non-fatal error updating profile with Google data:', profileErr);
      }
      
      // Check if this is a new or existing user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile || profileError) {
        console.warn('Profile not found after auth callback, treating as new user');
        
        // New user should go to onboarding
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.NEW_USER
        };
      } 
      
      // Existing user, check if onboarding is completed
      if (!profile.has_completed_onboarding) {
        console.log('User has not completed onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.INCOMPLETE_ONBOARDING
        };
      }
      
      // Existing user with completed onboarding
      console.log('Returning user with completed onboarding');
      return {
        success: true,
        user,
        registrationStatus: UserRegistrationStatus.RETURNING_USER
      };
    } catch (err) {
      console.error('Error in auth callback:', err);
      return { 
        success: false, 
        user: null, 
        error: err instanceof Error ? err.message : 'Unknown error',
        registrationStatus: UserRegistrationStatus.ERROR
      };
    }
  },
  
  /**
   * Update onboarding status for user
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      console.log(`Updating onboarding status for user ${userId} to ${hasCompleted}`);
      
      // First, update the Supabase Auth metadata
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { 
            has_completed_onboarding: hasCompleted,
            onboarding_completed_at: hasCompleted ? new Date().toISOString() : null
          }
        });
        
        if (metadataError) {
          console.warn('Could not update auth metadata, but will still try to update profile:', metadataError);
        } else {
          console.log('Successfully updated auth metadata with onboarding status');
        }
      } catch (metaErr) {
        console.warn('Failed to update auth metadata, continuing with profile update:', metaErr);
      }
      
      // Then update the profile record
      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_completed_onboarding: hasCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating onboarding status in profile:', error);
        return false;
      }
      
      console.log('Successfully updated onboarding status in profile table');
      return true;
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      return false;
    }
  }
};
