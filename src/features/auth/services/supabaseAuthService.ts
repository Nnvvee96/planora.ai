/**
 * Supabase Auth Service
 * 
 * Service for interacting with Supabase authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '@/database/databaseExports';
import { 
  AuthResponse, 
  UserRegistrationStatus, 
  GoogleAuthCredentials,
  RegisterData,
  AuthProviderType
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
    try {
      // Use environment-specific redirect URL
      let redirectUrl;
      
      if (import.meta.env.DEV) {
        // Local development - use current window location to determine port
        const currentUrl = window.location.origin;
        redirectUrl = `${currentUrl}/auth/callback`;
        console.log('Using dynamic redirect URL:', redirectUrl);
      } else {
        // Production environment - hardcode the main domain
        redirectUrl = 'https://planora-ai-plum.vercel.app/auth/callback';
      }
      
      console.log('Google Auth: Initiating sign-in with redirect URL:', redirectUrl);
      
      // Ensure we're using the correct Supabase OAuth flow with proper scopes
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // These specific query parameters help ensure proper Google OAuth flow
          queryParams: {
            access_type: 'offline',  // Get refresh token
            prompt: 'consent',      // Always show consent screen
            scope: 'profile email', // Request minimal required scopes
            include_granted_scopes: 'true',
          },
          // Skip the URL fragment cleanup - this may be causing issues
          skipBrowserRedirect: false,
        },
      });
      
      // Track if the sign-in process started successfully
      if (data?.url) {
        console.log('Google Auth: Successfully generated OAuth URL, redirecting user...');
        // You could store a flag in localStorage to help track auth flow state
        localStorage.setItem('auth_flow_started', 'true');
        localStorage.setItem('auth_flow_timestamp', Date.now().toString());
      }
      
      if (error) {
        console.error('Google Auth: Error initiating sign-in:', error);
        throw error;
      }
    } catch (err) {
      console.error('Google Auth: Unexpected error during sign-in process:', err);
      throw err;
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
      
      // Use the comprehensive registration status check
      const registrationDetails = await supabaseAuthService.checkUserRegistrationStatus(user.id);
      
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
          const { data: profileData, error: profileFetchError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, has_completed_onboarding')
            .eq('id', user.id)
            .single();
          
          // Prepare profile data with proper names
          const profileUpdates = {
            id: user.id,
            email: user.email,
            first_name: firstName || user_metadata.given_name || user_metadata.name?.split(' ')[0] || '',
            last_name: lastName || user_metadata.family_name || user_metadata.name?.split(' ').slice(1).join(' ') || '',
            avatar_url: user_metadata.avatar_url || user_metadata.picture || '',
            updated_at: timestamp
          };

          if (!profileData || profileFetchError) {
            // Profile doesn't exist, create it with all available data
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                ...profileUpdates,
                has_completed_onboarding: false,
                created_at: timestamp
              });
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('Successfully created profile with Google data');
            }
          } else {
            // Profile exists, update it with latest data
            const updates: Record<string, unknown> = { ...profileUpdates };
            
            // Only update name fields if they're empty or if we have better data
            if ((!profileData.first_name || (firstName && firstName !== profileData.first_name)) && profileUpdates.first_name) {
              updates.first_name = profileUpdates.first_name;
            } else {
              delete updates.first_name;
            }
            
            if ((!profileData.last_name || (lastName && lastName !== profileData.last_name)) && profileUpdates.last_name) {
              updates.last_name = profileUpdates.last_name;
            } else {
              delete updates.last_name;
            }
            
            // Only update if we have changes
            if (Object.keys(updates).length > 1) { // More than just id and updated_at
              const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);
                
              if (updateError) {
                console.error('Error updating profile with Google data:', updateError);
              } else {
                console.log('Successfully updated profile with Google data');
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
      
      // SECTION 1: Initialize profile data and onboarding status
      let profileData = null;
      let profileError = null;
      
      try {
        // Try to fetch profile data
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        profileData = result.data;
        profileError = result.error;
        
        if (profileError && profileError.code !== 'PGRST116') { // Ignore 'not found' errors
          console.error('Error fetching profile:', profileError);
        }
      } catch (err) {
        console.error('Error in profile retrieval:', err);
        profileError = err;
      }
      
      // Check localStorage for onboarding status (client-side indicator)
      const localStorageOnboardingComplete = localStorage.getItem('hasCompletedInitialFlow') === 'true';
      console.log('🔍 Source 1 - localStorage hasCompletedInitialFlow:', localStorageOnboardingComplete);
      
      // Check auth.users metadata (server-side, tied to auth system)
      const metadataOnboardingComplete = 
        user?.user_metadata?.has_completed_onboarding === true;
      console.log('🔍 Source 2 - Auth metadata has_completed_onboarding:', metadataOnboardingComplete);

      // Log profile data if available
      if (profileData) {
        console.log('🔍 Source 3 - Profile data retrieved:', { 
          id: profileData.id,
          email: profileData.email,
          hasCompletedOnboarding: profileData.has_completed_onboarding,
          firstName: profileData.first_name,
          lastName: profileData.last_name
        });
      } else {
        console.warn('❌ No profile found in database');
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
      
      // Check if onboarding is complete from any source
      const onboardingCompleteFromAnySource = 
        localStorageOnboardingComplete || 
        metadataOnboardingComplete || 
        (profileData?.has_completed_onboarding === true) ||
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
          if (profileData?.has_completed_onboarding !== true) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                has_completed_onboarding: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('Error updating profile onboarding status:', updateError);
            } else {
              console.log('Successfully updated profile onboarding status');
            }
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
      
      // Return the appropriate response based on registration details
      if (registrationDetails.registrationStatus === UserRegistrationStatus.NEW_USER) {
        console.log('New user or missing profile/preferences, requiring onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.NEW_USER
        };
      } else if (registrationDetails.registrationStatus === UserRegistrationStatus.RETURNING_USER) {
        console.log('Returning user with completed onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.RETURNING_USER
        };
      } else {
        console.log('Returning user who needs to complete onboarding');
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.INCOMPLETE_ONBOARDING
        };
      }
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
  /**
   * Check user registration status
   * Comprehensive function that checks multiple sources to determine user status
   * @param userId User ID to check
   * @returns Object with registration status details
   */
  checkUserRegistrationStatus: async (userId: string): Promise<{
    isNewUser: boolean;
    hasProfile: boolean;
    hasCompletedOnboarding: boolean;
    hasTravelPreferences: boolean;
    registrationStatus: UserRegistrationStatus;
  }> => {
    try {
      console.log('Checking registration status for user:', userId);
      
      // Check profile existence
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_completed_onboarding, first_name, last_name')
        .eq('id', userId)
        .single();
      
      const hasProfile = !!profile && !profileError;
      
      // Check travel preferences existence
      const { data: preferences, error: preferencesError } = await supabase
        .from('travel_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      const hasTravelPreferences = !!preferences && !preferencesError;
      
      // Get user metadata for additional checks
      const { data: { user } } = await supabase.auth.getUser();
      const userMetadata = user?.user_metadata || {};
      
      // Check onboarding status from multiple sources
      const profileOnboardingComplete = profile?.has_completed_onboarding === true;
      const metadataOnboardingComplete = userMetadata.hasCompletedOnboarding === true || userMetadata.has_completed_onboarding === true;
      const localStorageOnboardingComplete = typeof localStorage !== 'undefined' && localStorage.getItem('hasCompletedInitialFlow') === 'true';
      
      // Consolidated onboarding status check
      const hasCompletedOnboarding = profileOnboardingComplete || metadataOnboardingComplete || localStorageOnboardingComplete || hasTravelPreferences;
      
      // Determine if this is a new user (no profile or preferences)
      const isNewUser = !hasProfile || (!hasCompletedOnboarding && !hasTravelPreferences);
      
      // Determine registration status
      let registrationStatus: UserRegistrationStatus;
      if (isNewUser) {
        registrationStatus = UserRegistrationStatus.NEW_USER;
      } else if (hasCompletedOnboarding) {
        registrationStatus = UserRegistrationStatus.RETURNING_USER;
      } else {
        registrationStatus = UserRegistrationStatus.INCOMPLETE_ONBOARDING;
      }
      
      console.log('Registration status results:', {
        isNewUser,
        hasProfile,
        hasCompletedOnboarding,
        hasTravelPreferences,
        registrationStatus
      });
      
      return {
        isNewUser,
        hasProfile,
        hasCompletedOnboarding,
        hasTravelPreferences,
        registrationStatus
      };
    } catch (error) {
      console.error('Error checking user registration status:', error);
      return {
        isNewUser: true, // Default to new user on error
        hasProfile: false,
        hasCompletedOnboarding: false,
        hasTravelPreferences: false,
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
   * @returns Information about the registration result including if email confirmation is required
   */
  register: async (data: RegisterData): Promise<{ user: User | null, emailConfirmationRequired: boolean }> => {
    try {
      const { email, password, firstName, lastName, metadata = {} } = data;
      
      // Combine provided metadata with user information
      const userMetadata = {
        firstName,
        lastName,
        hasCompletedOnboarding: false,
        ...metadata
      };
      
      // Create the user with email and password
      // We'll use redirectTo to ensure users are redirected after confirming their email
      const redirectTo = window.location.origin + '/auth/email-confirmation';
      
      const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: redirectTo
        }
      });
      
      if (error) {
        console.error('Error registering user:', error);
        throw error;
      }
      
      if (!authData.user) {
        throw new Error('User registration failed');
      }
      
      // Determine if email confirmation is required
      // Supabase returns session=null when email confirmation is required
      const emailConfirmationRequired = authData.session === null;
      
      console.log('User registered successfully', {
        emailConfirmationRequired,
        user: authData.user
      });
      
      // Return registration result with confirmation status
      return {
        user: authData.user,
        emailConfirmationRequired
      };
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
      // First, we need to reauthenticate the user
      const { data: reauthData, error: reauthError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword,
      });

      if (reauthError) {
        console.error('Reauthentication error:', reauthError);
        throw new Error('Current password is incorrect');
      }

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to update password:', err);
      throw err;
    }
  },
  
  /**
   * Update the user's email address and handle verification flow
   * @param newEmail The new email address
   * @param password Optional password to set when converting from Google auth to email/password
   */
  updateEmail: async (newEmail: string, password?: string): Promise<void> => {
    try {
      // Check if this is a Google-authenticated user
      const authProvider = await supabaseAuthService.getAuthProvider();
      const isGoogleUser = authProvider === AuthProviderType.GOOGLE;
      
      // Get the current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      // Store current email for tracking changes
      const currentEmail = user.email;
      const userId = user.id;
      
      // Create a tracking record in the database for the email change
      // This helps with state tracking and allows us to properly sync after verification
      try {
        const { error: trackingError } = await supabase
          .from('email_change_tracking')
          .upsert({
            user_id: userId,
            old_email: currentEmail,
            new_email: newEmail,
            requested_at: new Date().toISOString(),
            is_provider_change: isGoogleUser,
            status: 'pending'
          }, { onConflict: 'user_id' });
          
        if (trackingError) {
          console.warn('Failed to track email change:', trackingError);
          // Continue anyway as this is a non-critical enhancement
        }
      } catch (err) {
        // If the table doesn't exist yet, log but continue
        console.warn('Email change tracking table may not exist yet:', err);
      }
      
      // Special handling for Google users who are changing email
      if (isGoogleUser && password) {
        console.log('Converting Google user to email/password authentication...');
        
        // When converting from Google auth, we need to:
        // 1. Update the email (with special redirect options)
        // 2. Set a password for future email/password logins
        // 3. Update metadata to reflect the change
        
        // Configure the verification redirect to our custom handler
        // with a flag indicating this was a provider change
        const redirectTo = window.location.origin + '/auth/email-change-verification?provider_change=google_to_email';
        
        // Update user's email address with custom redirect
        // Use the separate options parameter for email redirect
        const { error: emailError } = await supabase.auth.updateUser(
          { email: newEmail },
          { emailRedirectTo: redirectTo }
        );
        if (emailError) throw emailError;
        
        // Update user metadata to reflect they now use email/password auth
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            provider: 'email',
            // Mark that this account was converted from Google
            previous_provider: 'google',
            provider_changed_at: new Date().toISOString()
          }
        });
        
        if (metadataError) {
          console.error('Error updating user metadata:', metadataError);
          // Non-critical error, continue with the email update
        }
        
        // Important: DON'T update the profile email yet - wait for verification
        // Instead, only update the verification status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            email_verified: false,
            // Track that there's a pending email change 
            pending_email_change: newEmail
          })
          .eq('id', userId);
        
        if (profileError) {
          console.error('Error updating profile verification status:', profileError);
          // Non-critical error, continue with the email update
        }
        
        console.log('Successfully initiated Google user conversion to email/password');
      } else {
        // Standard email update for regular users
        // Configure the verification redirect to our custom handler
        const redirectTo = window.location.origin + '/auth/email-change-verification';
        
        // Update user's email address with custom redirect
        // Use the separate options parameter for email redirect
        const { error } = await supabase.auth.updateUser(
          { email: newEmail },
          { emailRedirectTo: redirectTo }
        );
        if (error) throw error;
        
        // Important: DON'T update the profile email yet - wait for verification
        // Instead, only update the verification status and track the pending change
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            email_verified: false,
            // Track that there's a pending email change
            pending_email_change: newEmail
          })
          .eq('id', userId);
            
        if (profileError) {
          console.error('Error updating profile verification status:', profileError);
          // Non-critical error, continue with the email update
        }
      }
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  },

  /**
   * Verify email address using token
   * @param token The verification token from email link
   * @returns True if verification successful, false otherwise
   */
  verifyEmail: async (token: string): Promise<boolean> => {
    try {
      // Note: This is actually handled by Supabase automatically via URL
      // This method serves as a confirmation and handles database synchronization
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        console.error('Error verifying email:', error);
        return false;
      }

      // Get current auth user to verify their email and verify changes
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found after email verification');
        // This is still a success from an auth perspective - user just needs to log in again
        return true;
      }
      
      // First, check if this was a pending email change
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('pending_email_change, email')
        .eq('id', user.id)
        .single();
      
      if (profileFetchError) {
        console.error('Error fetching profile during email verification:', profileFetchError);
      }
      
      const pendingEmailChange = profileData?.pending_email_change;
      const currentProfileEmail = profileData?.email;
      
      // Compare the emails to determine what happened
      if (pendingEmailChange && user.email !== currentProfileEmail) {
        console.log(`Email change verified: ${currentProfileEmail} → ${user.email}`);
        
        // This was an email change - update the profile with the new verified email
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            email: user.email,
            email_verified: true,
            pending_email_change: null,
            email_change_requested_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileUpdateError) {
          console.error('Error updating profile with verified email:', profileUpdateError);
        }
        
        // Update the email change tracking record
        try {
          const { error: trackingError } = await supabase
            .from('email_change_tracking')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('status', 'pending');
          
          if (trackingError) {
            console.warn('Error updating email change tracking:', trackingError);
          }
        } catch (err) {
          // Table might not exist yet, which is fine
          console.warn('Error with email tracking table:', err);
        }
      } else {
        // This was a regular email verification (not a change)
        const { error: verificationUpdateError } = await supabase
          .from('profiles')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (verificationUpdateError) {
          console.error('Error updating profile verification status:', verificationUpdateError);
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to verify email:', err);
      return false;
    }
  },

  /**
   * Resend verification email
   * @param email The email address to resend verification to
   * @returns True if email sent successfully, false otherwise
   */
  resendVerificationEmail: async (email: string): Promise<boolean> => {
    try {
      // Create the redirect URL for verification
      const redirectTo = window.location.origin + '/auth/email-confirmation';
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('Error resending verification email:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      return false;
    }
  },

  /**
   * Send password reset email
   * @param email The email address to send password reset to
   * @returns True if email sent successfully, false otherwise
   */
  sendPasswordResetEmail: async (email: string): Promise<boolean> => {
    try {
      // Create the redirect URL for password reset
      const redirectTo = window.location.origin + '/auth/reset-password';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      return false;
    }
  },

  /**
   * Reset password with reset token
   * @param newPassword The new password to set
   * @returns True if password reset was successful, false otherwise
   */
  resetPassword: async (newPassword: string): Promise<boolean> => {
    try {
      // The token is automatically included in the URL and handled by Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error resetting password:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to reset password:', err);
      return false;
    }
  },
  
  /**
   * Determine the authentication provider used by a user
   * @returns The detected authentication provider type based on the current user session
   */
  getAuthProvider: async (): Promise<AuthProviderType> => {
    try {
      // Get the current user from the session - this is available to regular users
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Error getting current user:', error);
        return AuthProviderType.ANONYMOUS;
      }
      
      // Check user metadata for provider information
      // The provider info could be in different locations depending on auth method
      const provider = user.app_metadata?.provider || 
                      user.identities?.[0]?.provider || 
                      user.user_metadata?.provider;
                      
      console.log('Detected authentication provider:', provider);
      
      if (provider === 'google') {
        return AuthProviderType.GOOGLE;
      } else if (user.email && user.email_confirmed_at) {
        // User has confirmed email but no social provider
        return AuthProviderType.EMAIL;
      }
      
      // Check if the user has any identities that might indicate the auth method
      if (user.identities && user.identities.length > 0) {
        // Look through identities for social login providers
        for (const identity of user.identities) {
          if (identity.provider === 'google') {
            return AuthProviderType.GOOGLE;
          }
        }
        
        // If there are identities but none are social, assume email
        if (user.email) {
          return AuthProviderType.EMAIL;
        }
      }
      
      // If the user has a confirmed email, they likely use email auth
      if (user.email_confirmed_at) {
        return AuthProviderType.EMAIL;
      }
      
      // As a fallback, check user_metadata for any sign of provider
      if (user.user_metadata) {
        if (user.user_metadata.full_name || 
            user.user_metadata.name ||
            user.user_metadata.email_verified) {
          // These fields are typically set for Google auth
          return AuthProviderType.GOOGLE;
        }
      }
      
      // If we get here and have an email, assume email auth
      if (user.email) {
        return AuthProviderType.EMAIL;
      }
      
      return AuthProviderType.ANONYMOUS;
    } catch (err) {
      console.error('Failed to determine auth provider:', err);
      return AuthProviderType.ANONYMOUS;
    }
  },
  
  /**
   * Check if a user's email is verified
   * @param userId The user ID to check verification status for
   * @returns True if email is verified, false otherwise
   */
  checkEmailVerificationStatus: async (userId: string): Promise<boolean> => {
    try {
      // First check if there's a profile with this user ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error checking email verification status (profile):', profileError);
        
        // If profile check fails, try to get verification status from auth directly
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id === userId) {
          // For auth users, email is verified if email_confirmed_at is set
          const isVerified = user.email_confirmed_at !== null;
          
          // Try to update the profile with the verified status
          try {
            await supabase
              .from('profiles')
              .update({ email_verified: isVerified })
              .eq('id', userId);
          } catch (updateError) {
            console.error('Error updating profile email_verified status:', updateError);
            // Non-critical error, continue with the determined status
          }
          
          return isVerified;
        }
        
        return false;
      }
      
      // Return the email_verified status from the profile
      return profileData?.email_verified || false;
    } catch (err) {
      console.error('Failed to check email verification status:', err);
      return false;
    }
  },
};
