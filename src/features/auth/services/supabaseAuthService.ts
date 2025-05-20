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
  GoogleAuthCredentials,
  RegisterData
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
      
      // Get session and check if this is a new user
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Auth session check result:', { 
        hasSession: !!session, 
        hasError: !!error,
        errorMessage: error?.message,
        isNewUser: session?.user?.identities?.[0]?.created_at === session?.user?.created_at
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
      
      // Check if this is a new user (just signed up)
      const isNewUser = session.user.identities?.[0]?.created_at === session.user.created_at;
      console.log('Is new user from identity provider?', isNewUser);
      
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
          
          // If still empty and we have email, use full email or properly format email parts
          if ((!firstName || !lastName) && user.email) {
            // First try to capitalize parts of the email username to make it look like a name
            const emailParts = user.email.split('@');
            const nameParts = emailParts[0].split(/[.|_|-]/);
            
            if (nameParts.length > 1) {
              // Format each part with capitalization
              const formattedNameParts = nameParts.map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)
              );
              
              if (!firstName) {
                firstName = formattedNameParts[0] || '';
              }
              
              if (!lastName) {
                lastName = formattedNameParts.slice(1).join(' ') || '';
              }
            } else if (!firstName) {
              // Just capitalize the email name part
              const emailName = emailParts[0];
              firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1) || '';
            }
            
            // Store the full email in user metadata for reference
            if (user.email) {
              await supabase.auth.updateUser({
                data: { 
                  full_email: user.email,
                  display_name: `${firstName} ${lastName}`.trim()
                }
              });
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
      
      console.log('⚠️ CRITICAL DEBUGGING: Authentication callback authentication status check');
      console.log('User data:', { 
        id: user.id, 
        email: user.email,
        metadata: user.user_metadata 
      });
      
      // SECTION 1: Check localStorage first (most reliable client-side indicator)
      const localStorageOnboardingComplete = localStorage.getItem('hasCompletedInitialFlow') === 'true';
      console.log('🔍 Source 1 - localStorage hasCompletedInitialFlow:', localStorageOnboardingComplete);
      
      // SECTION 2: Check auth.users metadata (server-side, tied to auth system)
      const metadataOnboardingComplete = 
        user?.user_metadata?.has_completed_onboarding === true;
      console.log('🔍 Source 2 - Auth metadata has_completed_onboarding:', metadataOnboardingComplete);

      // SECTION 3: Check profiles table (database record)
      // Force using primary RLS permissions with explicit auth refresh
      await supabase.auth.refreshSession();
      
      // First try to get the profile
      let profile;
      let profileError;
      
      try {
        const profileResult = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if no profile found
          
        profile = profileResult.data;
        profileError = profileResult.error;
        
        // If no profile found, try to create one
        if (!profile && !profileError) {
          console.log('🔨 No profile found - attempting to create one automatically');
          
          // Create a new profile with user data
          const createResult = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                has_completed_onboarding: user.user_metadata?.has_completed_onboarding || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();
            
          if (createResult.data) {
            console.log('✅ Successfully created profile for user', user.id);
            profile = createResult.data;
          } else if (createResult.error) {
            console.error('Failed to create profile:', createResult.error);
          }
        }
      } catch (err) {
        console.error('Error in profile retrieval/creation:', err);
      }
      
      // Detailed profile data logging
      if (profile) {
        console.log('🔍 Source 3 - Profile data retrieved or created:', { 
          id: profile.id,
          email: profile.email,
          hasCompletedOnboarding: profile.has_completed_onboarding,
          firstName: profile.first_name,
          lastName: profile.last_name
        });
      } else {
        console.warn('❌ No profile found in database and creation failed');
        if (profileError) {
          console.error('Profile retrieval error:', profileError);
        }
      }

      // SECTION 4: Check for travel preferences data (indicates completed onboarding)
      const { data: travelPrefs } = await supabase
        .from('travel_preferences')
        .select('id')
        .eq('user_id', user.id);
        
      const hasTravelPreferences = travelPrefs && travelPrefs.length > 0;
      console.log('🔍 Source 4 - Has travel preferences:', hasTravelPreferences);
      
      // PRIORITY DECISION: If ANY reliable source indicates completion, trust it
      // This breaks the redirect loop for users who completed onboarding
      const onboardingCompleteFromAnySource = 
        localStorageOnboardingComplete || 
        metadataOnboardingComplete || 
        (profile && profile.has_completed_onboarding === true) ||
        hasTravelPreferences;
        
      console.log('🚨 FINAL DECISION - Onboarding complete from ANY source:', onboardingCompleteFromAnySource);
        
      // FORCE bypass onboarding if any source indicates completion
      if (onboardingCompleteFromAnySource) {
        console.log('✅ User has completed onboarding according to at least one source - bypassing onboarding');
        
        // Also update all sources to be consistent
        try {
          // Set local storage flag
          localStorage.setItem('hasCompletedInitialFlow', 'true');
          
          // Update user metadata if needed
          if (!metadataOnboardingComplete) {
            await supabase.auth.updateUser({
              data: { has_completed_onboarding: true }
            });
          }
          
          // Update profile if it exists and flag not set
          if (profile && profile.has_completed_onboarding !== true) {
            await supabase
              .from('profiles')
              .update({ has_completed_onboarding: true })
              .eq('id', user.id);
          }
        } catch (syncError) {
          console.error('Non-fatal error synchronizing onboarding status:', syncError);
          // Continue anyway as we're bypassing onboarding
        }
        
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.RETURNING_USER
        };
      }
      
      // If this is a new user (just signed up via Google), always send to onboarding
      if (isNewUser) {
        console.log('New user detected from identity provider, requiring onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.NEW_USER
        };
      }
      
      // Handle case where profile doesn't exist
      if (!profile || profileError) {
        console.warn('No profile found, treating as new user requiring onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.NEW_USER
        };
      }
      
      // If we reach here, no source indicated onboarding completion
      // But since this isn't a new user, we'll treat them as returning
      console.log('Returning user, checking if onboarding is needed');
      
      // If any source indicates onboarding is complete, trust it
      if (localStorageOnboardingComplete || metadataOnboardingComplete || profile.has_completed_onboarding) {
        console.log('Returning user with completed onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.RETURNING_USER
        };
      }
      
      // Otherwise, require onboarding
      console.log('Returning user who needs to complete onboarding');
      return {
        success: true,
        user,
        registrationStatus: UserRegistrationStatus.INCOMPLETE_ONBOARDING
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
      
      // First, update user metadata in auth.users
      await supabaseAuthService.updateUserMetadata({ hasCompletedOnboarding: hasCompleted });
      
      // Then, update the profile record
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
  },

  /**
   * Register a new user with email and password
   * @param data Registration data including email, password, and profile information
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = data;
      
      // Create the user with email and password
      const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            hasCompletedOnboarding: false
          }
        }
      });
      
      if (error) {
        console.error('Error registering user:', error);
        throw error;
      }
      
      if (!authData.user) {
        throw new Error('User registration failed');
      }
      
      // Additional profile creation will happen via Supabase triggers
      console.log('User registered successfully');
    } catch (err) {
      console.error('Failed to register user:', err);
      throw err;
    }
  },

  /**
   * Update user password
   * @param currentPassword The current password for verification
   * @param newPassword The new password to set
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // First verify the current password by attempting a sign-in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabaseAuthService.getCurrentUser())?.email || '',
        password: currentPassword
      });
      
      if (signInError || !user) {
        console.error('Error verifying current password:', signInError);
        throw new Error('Current password is incorrect');
      }
      
      // If current password is verified, update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }
      
      console.log('Password updated successfully');
    } catch (err) {
      console.error('Failed to update password:', err);
      throw err;
    }
  }
};
