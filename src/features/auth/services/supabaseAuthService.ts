/**
 * Supabase Auth Service
 * 
 * Service for interacting with Supabase authentication.
 * Following Planora's architectural principles with feature-first organization.
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { 
  AuthResponse, 
  UserRegistrationStatus, 
  RegisterData,
  AuthProviderType,
  VerificationCodeResponse,
  VerificationCodeStatus,
  // Added for new signup flow
  InitiateSignupResponse,
  CompleteSignupPayload,
  CompleteSignupResponse
} from '../types/authTypes';

/**
 * Supabase authentication service
 * Provides methods for authentication operations
 * Following Planora's architectural principles with feature-first organization
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
        // Use environment variable for redirect URL in all environments
        redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`;
        console.log('Using redirect URL from env:', redirectUrl);
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
      
      // Determine registration status
      const registrationDetails = {
        status: UserRegistrationStatus.NEW_USER, // Default to new user
        isNewUser: true
      };
      
      // Check if user has a profile or travel preferences
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();
        
        const { data: prefs } = await supabase
          .from('travel_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        // If user has profile with completed onboarding or travel preferences,
        // they are considered a returning user
        if ((profile && profile.has_completed_onboarding) || prefs) {
          registrationDetails.status = UserRegistrationStatus.RETURNING_USER;
          registrationDetails.isNewUser = false;
        }
      } catch (err) {
        console.warn('Error checking user registration status:', err);
        // Continue with default status (NEW_USER)
      }
      
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
          }
          
          // Update user profile with extracted data
          await supabaseAuthService.updateUserProfile(user.id, {
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            updated_at: timestamp,
          });
        }
      } catch (err) {
        console.error('Error updating user profile:', err);
      }
      
      return {
        success: true,
        user,
        error: null,
        registrationStatus: registrationDetails.status,
      };
    } catch (err) {
      console.error('Error handling auth callback:', err);
      return {
        success: false,
        user: null,
        error: err.message,
        registrationStatus: UserRegistrationStatus.ERROR,
      };
    }
  },
  
  /**
   * Get a redirect URL for email verification flows
   * Ensures consistent redirect URLs across different email verification processes
   * @param route The specific route for the email verification
   * @returns The full URL for email verification redirect
   */
  getEmailVerificationRedirectUrl: (route: string): string => {
    let baseUrl = '';
    const standardizedRoute = route === 'verification' ? 'verification' : route;
    
    // Use environment variable for base URL in all environments
    baseUrl = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://getplanora.app');
    
    // Log the redirect URL for debugging
    console.log(`Setting email verification redirect URL: ${baseUrl}/auth/${standardizedRoute}`);
    
    return `${baseUrl}/auth/${standardizedRoute}`;
  },

  /**
   * Determine the authentication provider used by a user
   * @param userId Optional user ID to check (uses current user if not provided)
   * @returns The detected authentication provider type based on the user session
   */
  getAuthProvider: async (_userId?: string): Promise<AuthProviderType> => {
    try {
      // Get the current user from the session
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
   * Update email address
   * @param newEmail New email address
   * @param password Current password (required for Google->Email conversion)
   * @returns Promise<void>
   */
  updateEmail: async (newEmail: string, password?: string): Promise<void> => {
    try {
      // Check if we have a current user first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Check if we need to convert from Google to email auth
      const provider = await supabaseAuthService.getAuthProvider();
      const isGoogleUser = provider === AuthProviderType.GOOGLE;
      
      // Get current profile for tracking - critical for proper email comparison
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, pending_email_change')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile for email update:', profileError);
      }
      
      // Get the actual current email to compare against
      const currentAuthEmail = user.email || '';
      const currentProfileEmail = profileData?.email || '';
      const pendingEmailChange = profileData?.pending_email_change || null;
      
      console.log('Email change request comparison:', {
        authEmail: currentAuthEmail,
        profileEmail: currentProfileEmail,
        pendingChange: pendingEmailChange,
        newRequestedEmail: newEmail
      });
      
      // Critical logic for email comparison
      // When auth email and profile email are different, we want to allow changing
      // to either one to allow re-synchronizing state
      if (
        (currentAuthEmail.toLowerCase() === newEmail.toLowerCase()) &&
        (currentProfileEmail.toLowerCase() === newEmail.toLowerCase())
      ) {
        throw new Error('New email address must be different from current one');
      }
      
      // If there's a pending change to this exact email already, prevent duplicate requests
      if (pendingEmailChange && pendingEmailChange.toLowerCase() === newEmail.toLowerCase()) {
        throw new Error('You already have a pending change to this email address. Please check your inbox for the verification link.');
      }
      
      // Track email change in the specialized tracking table (gracefully handling missing table)
      try {
        // First check if the table exists before trying to use it
        const { error: tableCheckError } = await supabase
          .from('email_change_tracking')
          .select('id', { count: 'exact', head: true });
        
        // If the table exists, track the change
        if (!tableCheckError || tableCheckError.code !== 'PGRST204') {
          const { error: trackingError } = await supabase
            .from('email_change_tracking')
            .upsert({
              user_id: user.id,
              old_email: currentProfileEmail || currentAuthEmail, // Use profile email primarily, fallback to auth email
              new_email: newEmail,
              requested_at: new Date().toISOString(),
              status: 'pending',
              auth_provider: isGoogleUser ? 'google' : 'email'
            }, { 
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
          
          if (trackingError) {
            console.warn('Email change tracking insert failed (continuing anyway):', trackingError);
          }
        } else {
          console.warn('Email change tracking table not found, continuing without tracking');
        }
      } catch (trackingErr) {
        // Non-critical error, continue with the process
        console.warn('Error with email tracking operations:', trackingErr);
      }
      
      // Special handling for Google-authenticated users
      if (isGoogleUser) {
        if (!password || password.length < 8) {
          throw new Error('A secure password (min 8 characters) is required when changing from Google authentication');
        }
        
        console.log('Converting Google user to email/password authentication...');
        
        // Get the redirect URL for email verification
        const redirectTo = supabaseAuthService.getEmailVerificationRedirectUrl('email-change-verification');
        
        // Add a provider_change flag to help with verification
        const fullRedirectUrl = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}provider_change=google_to_email`;
        
        // Try admin method first (requires service role)
        try {
          // Use admin API to update user
          const { error: adminError } = await supabase.auth.admin.updateUserById(
            user.id, 
            { 
              email: newEmail,
              password: password,
              email_confirm: false // User must confirm via email
            }
          );
          
          if (adminError) {
            throw adminError;
          }
          
          console.log('Successfully initiated Google user conversion to email/password via admin API');
          return; // Success, we're done
        } catch (adminErr) {
          // If admin method fails, fall back to standard method
          console.warn('Admin updateUser failed, falling back to standard updateUser:', adminErr);
          
          // Try standard update method
          const { error: updateError } = await supabase.auth.updateUser(
            { 
              email: newEmail,
              password: password 
            },
            { emailRedirectTo: fullRedirectUrl }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          console.log('Successfully initiated Google user conversion to email/password via standard API');
          return; // Success, we're done
        }
      } else {
        // For regular email users, just request the email change
        const redirectTo = supabaseAuthService.getEmailVerificationRedirectUrl('email-change-verification');
        
        const { error: emailError } = await supabase.auth.updateUser(
          { email: newEmail }, 
          { emailRedirectTo: redirectTo }
        );
        
        if (emailError) {
          throw emailError;
        }
        
        console.log('Successfully initiated email change verification process');
      }
      
      // Create profile for new user
      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Get the provider and determine if email should be verified
        // For Google auth, email is pre-verified by Google
        const isGoogleUser = Boolean(user?.app_metadata?.provider === 'google');
        
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              auth_provider: provider,
              email_verified: isGoogleUser, // Set to true for Google users
              // Ensure other critical fields have defaults
              first_name: user?.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
            });
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Try updating instead if insert fails
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email: user.email,
                updated_at: new Date().toISOString(),
                auth_provider: provider,
                email_verified: isGoogleUser
              })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('Error updating profile as fallback:', updateError);
            }
          }
        } else {
          // Update existing profile's email verification status for Google users
          if (isGoogleUser && !existingProfile.email_verified) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('Error updating email verification status:', updateError);
            }
          }
        }
      } catch (profileErr) {
        console.error('Error creating/updating profile:', profileErr);
      }
      
      // Update profile to mark pending email change (gracefully handling missing columns)
      try {
        // First check if the pending_email_change column exists
        const { error: columnCheckError } = await supabase
          .from('profiles')
          .select('pending_email_change')
          .limit(1);
        
        // If the column exists, update it
        if (!columnCheckError) {
          await supabase
            .from('profiles')
            .update({
              pending_email_change: newEmail,
              email_change_requested_at: new Date().toISOString(),
              email_verified: false, // Mark as unverified until confirmation
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        } else {
          // If the column doesn't exist, at least update email_verified status
          await supabase
            .from('profiles')
            .update({
              email_verified: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
      } catch (profileErr) {
        // Non-critical error, continue with the process
        console.warn('Error updating profile during email change:', profileErr);
      }
    } catch (err) {
      console.error('Error updating email:', err);
      throw err;
    }
  },
  
  /**
   * Verify email address using a token from the verification link
   * Handles both initial email verification and email change verification
   * @param token The verification token from email link
   * @returns True if verification successful, false otherwise
   */
  verifyEmail: async (token: string): Promise<boolean> => {
    try {
      console.log('Starting email verification process with token');
      
      // Check if token looks valid
      if (!token || token.length < 10) {
        console.error('Invalid verification token format');
        return false;
      }
      
      // First verify the token with Supabase auth
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        console.error('Error verifying email token:', error);
        if (error.message.includes('expired')) {
          throw new Error('Verification link has expired. Please request a new verification email.');
        }
        return false;
      }

      // Get the current user after verification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found after email verification');
        // This is still a success from an auth perspective - user just needs to log in again
        return true;
      }
      
      console.log('Email verification token validated for user:', user.id);
      
      // Check if this was a pending email change by looking at profile data
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('pending_email_change, email')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.warn('Could not fetch profile during email verification:', profileError);
          // Continue with verification - this is non-critical
        }
        
        if (profileData) {
          const pendingEmailChange = profileData.pending_email_change;
          const currentProfileEmail = profileData.email;
          
          // If we have a pending change and the emails are different, this was an email change
          if (pendingEmailChange && user.email !== currentProfileEmail) {
            console.log(`Email change verified: ${currentProfileEmail} \u2192 ${user.email}`);
            
            // Update the profile with the new verified email
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                email: user.email,
                email_verified: true,
                pending_email_change: null,
                email_change_requested_at: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.error('Error updating profile after email verification:', updateError);
              // Continue, this is still a success from auth perspective
            }
            
            // Also check if this was a Google-to-Email conversion and mark it in metadata
            try {
              // First check if the table exists before trying to query it
              const { error: tableCheckError } = await supabase
                .from('email_change_tracking')
                .select('count(*)', { count: 'exact', head: true });
              
              if (tableCheckError && tableCheckError.message.includes('does not exist')) {
                console.warn('email_change_tracking table does not exist in database');
                // Continue without tracking - it's not critical
              } else {
                // Table exists, proceed with tracking query
                const { data: trackingData } = await supabase
                  .from('email_change_tracking')
                  .select('auth_provider')
                  .eq('user_id', user.id)
                  .eq('status', 'pending')
                  .single();
                  
                if (trackingData && trackingData.auth_provider === 'google') {
                  // Mark in user metadata that this was converted from Google
                  await supabase.auth.updateUser({
                    data: {
                      converted_from_google: true,
                      original_provider: 'google',
                      provider_changed_at: new Date().toISOString()
                    }
                  });
                  
                  console.log('User metadata updated to reflect Google-to-Email conversion');
                }
                
                // Update tracking record
                await supabase
                  .from('email_change_tracking')
                  .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                  })
                  .eq('user_id', user.id)
                  .eq('status', 'pending');
              }
            } catch (trackingErr) {
              console.warn('Non-critical error with tracking record:', trackingErr);
              // Continue despite error - this is helpful but not critical
            }
          } else {
            // This was just a regular email verification (not a change)
            console.log('Regular email verification completed for:', user.email);
            
            const { error: verificationError } = await supabase
              .from('profiles')
              .update({ 
                email: user.email, // Ensure profile email matches auth email
                email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (verificationError) {
              console.error('Error updating profile verification status:', verificationError);
            }
          }
        }
      } catch (err) {
        console.warn('Non-critical error during verification process:', err);
        // Continue with verification - the auth part succeeded
      }
      
      // Force a session refresh to ensure all state is current
      try {
        await supabase.auth.refreshSession();
        console.log('Auth session refreshed after email verification');
      } catch (refreshErr) {
        console.warn('Non-critical error refreshing session:', refreshErr);
        // Continue despite error - session refresh is helpful but not critical
      }
      
      return true;
    } catch (err) {
      console.error('Failed to verify email:', err);
      return false;
    }
  },
  
  /**
   * Update user profile
   * @param userId User ID
   * @param data Profile data to update
   * @returns Promise<void>
   */
  updateUserProfile: async (userId: string, data: Record<string, unknown>): Promise<void> => {
    try {
      await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  },

  /**
   * Refreshes the current session.
   */
  refreshSession: async (): Promise<void> => {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      // Only log if it's not a session missing error (which is expected for new users)
      if (error.message !== 'Auth session missing!' && !error.message.includes('session missing')) {
        console.error('Error refreshing session:', error);
      }
      throw error;
    }
  },
  
  /**
   * Resend verification email or code
   * @param email The email address to resend verification to
   * @param userId Optional user ID (required for code-based verification)
   */
  resendVerificationEmail: async (email: string, userId?: string): Promise<boolean> => {
    try {
      // If userId is provided, use our custom verification code system
      if (userId) {
        const result = await supabaseAuthService.sendVerificationCode(userId, email);
        return result.success;
      }
      
      // Otherwise, use Supabase's built-in verification email system
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: supabaseAuthService.getEmailVerificationRedirectUrl('verification')
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
   * Check if a user's email is verified
   * @param userId The user ID to check verification status for
   */
  checkEmailVerificationStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking email verification status:', error);
        return false;
      }
      
      return data?.email_verified || false;
    } catch (err) {
      console.error('Failed to check email verification status:', err);
      return false;
    }
  },
  
  /**
   * Send password reset email
   * @param email The email address to send password reset to
   */
  sendPasswordResetEmail: async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
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
   */
  resetPassword: async (newPassword: string): Promise<boolean> => {
    try {
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
   * Check user registration status
   * Comprehensive function that checks multiple sources to determine user status
   * @param userId User ID to check
   */
  checkUserRegistrationStatus: async (userId: string) => {
    try {
      // Since we're running this code, the user is already authenticated
      // We don't need to check auth.users with Admin API (which doesn't work client-side)
      
      // Check if user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // Not found error
        console.error('Error checking profile:', profileError);
        return {
          isNewUser: false,
          hasProfile: false,
          hasCompletedOnboarding: false,
          hasTravelPreferences: false,
          registrationStatus: UserRegistrationStatus.ERROR
        };
      }
      
      // Check if user has travel preferences
      const { data: travelData, error: _travelError } = await supabase
        .from('travel_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      const hasProfile = !!profileData;
      const hasCompletedOnboarding = hasProfile && profileData.has_completed_onboarding;
      const hasTravelPreferences = !!travelData;
      
      // Determine registration status
      let registrationStatus: UserRegistrationStatus = UserRegistrationStatus.RETURNING_USER;
      
      if (!hasProfile) {
        registrationStatus = UserRegistrationStatus.NEW_USER;
      } else if (!hasCompletedOnboarding) {
        registrationStatus = UserRegistrationStatus.INCOMPLETE_ONBOARDING;
      } else {
        registrationStatus = UserRegistrationStatus.RETURNING_USER;
      }
      
      return {
        isNewUser: !hasProfile,
        hasProfile,
        hasCompletedOnboarding,
        hasTravelPreferences,
        registrationStatus
      };
    } catch (err) {
      console.error('Failed to check user registration status:', err);
      return {
        isNewUser: false,
        hasProfile: false,
        hasCompletedOnboarding: false,
        hasTravelPreferences: false,
        registrationStatus: UserRegistrationStatus.ERROR
      };
    }
  },
  
  /**
   * Initiates the first step of the two-phase signup process.
   * Sends user's email and password to the backend to generate and dispatch a verification code.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's chosen raw password.
   * @returns {Promise<InitiateSignupResponse>} The response from the backend.
   */
  async initiateSignup(email: string, password_raw: string): Promise<InitiateSignupResponse> {
    try {
      if (!email || !password_raw) {
        throw new Error("Email and password are required to initiate signup.");
      }

      const { data, error } = await supabase.functions.invoke('verification-code-handler', {
        body: {
          action: 'initiate-signup',
          payload: {
            email,
            password: password_raw, // Send the raw password to the backend
          },
        },
      });

      if (error) {
        // Log the detailed error from the function invocation
        console.error('Error invoking initiate-signup function:', error);
        // Attempt to parse a more specific error message from the function's response
        const functionError = error.context?.function_error || 'An unknown error occurred.';
        return {
          success: false,
          message: null,
          error: "Failed to initiate signup.",
          details: functionError,
        };
      }
      
      // The backend function returns a success message
      return { 
        success: true, 
        message: data.message || "Verification code sent.",
        error: null,
        details: null,
      };

    } catch (err: unknown) {
      console.error('Unexpected error in initiateSignup service:', err);
      return {
        success: false,
        message: null,
        error: "An unexpected error occurred during signup initiation.",
        details: err instanceof Error ? err.message : String(err),
      };
    }
  },

  /**
   * Completes the second step of the two-phase signup process.
   * Sends the verification code and full user details to create the account.
   * @param {CompleteSignupPayload} payload - The user details including email, code, names, etc.
   * @returns {Promise<CompleteSignupResponse>} The final response from the backend.
   */
  async completeSignup(payload: CompleteSignupPayload): Promise<CompleteSignupResponse> {
    try {
      if (!payload.email || !payload.code) {
        throw new Error("Email and verification code are required to complete signup.");
      }

      const { data, error } = await supabase.functions.invoke('verification-code-handler', {
        body: {
          action: 'complete-signup',
          payload: payload, // Forward the entire payload
        },
      });

      if (error) {
        console.error('Error invoking complete-signup function:', error);
        const functionError = error.context?.function_error || 'An unknown error occurred.';
        return {
          success: false,
          userId: null,
          error: "Failed to complete signup.",
          details: functionError,
        };
      }

      // Backend returns userId on success
      return { 
        success: true, 
        userId: data.userId,
        error: null,
        details: null,
      };

    } catch (err: unknown) {
      console.error('Unexpected error in completeSignup service:', err);
      return {
        success: false,
        userId: null,
        error: "An unexpected error occurred during signup completion.",
        details: err instanceof Error ? err.message : String(err),
      };
    }
  },
  
  /**
   * Update user password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
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
   * Subscribe to authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Subscription that can be unsubscribed
   */
  subscribeToAuthChanges: (callback: (event: string, session: unknown) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed event:', event);
      callback(event, session);
    });
  },
  
  /**
   * Update user onboarding status
   * @param userId User ID
   * @param hasCompleted Whether onboarding is completed
   * @returns Success status
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      // STEP 1: Make sure we have a valid session before starting
      // This helps prevent session loss during the process
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found when updating onboarding status');
        // Attempt to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session) {
          console.error('Failed to refresh session:', refreshError);
          // Still try to update the database, but warn about potential issues
        }
      }
      
      // STEP 2: Update local storage FIRST as it's the most reliable
      // This ensures we have at least one source of truth that won't be affected by potential API errors
      localStorage.setItem('has_completed_onboarding', hasCompleted ? 'true' : 'false');
      localStorage.setItem('hasCompletedInitialFlow', hasCompleted ? 'true' : 'false');
      
      // STEP 3: Update profiles table before metadata to avoid race conditions
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          has_completed_onboarding: hasCompleted,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile onboarding status:', profileError);
        // Continue with metadata update anyway
      }
      
      // STEP 4: Finally, update the user metadata 
      // This can trigger a USER_UPDATED event and potentially affect the session
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          has_completed_onboarding: hasCompleted, 
          onboarding_complete_date: new Date().toISOString(),
          onboarding_version: '2.0' // Adding a version to track which onboarding flow was completed
        }
      });

      if (userError) {
        console.error('Error updating user metadata for onboarding status:', userError);
        // We've already updated local storage and possibly the profile, so return partial success
        return true;
      }
      
      // STEP 5: Force refresh the session one more time to ensure the session has the latest metadata
      try {
        await supabase.auth.refreshSession();
      } catch (refreshError) {
        console.warn('Error refreshing session after metadata update:', refreshError);
        // Not critical, we can still consider this a success
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update onboarding status:', err);
      // Even if we fail here, local storage should still be updated
      return localStorage.getItem('has_completed_onboarding') === 'true';
    }
  },
  
  /**
   * Register a new user
   * @param data Registration data
   * @returns Registration result with user data and email confirmation status
   */
  register: async (data: RegisterData): Promise<{ user: User | null, emailConfirmationRequired: boolean }> => {
    try {
      console.log('Registering new user:', data.email);
      
      // Extract metadata from registration data
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username || data.email.split('@')[0],
        ...data.metadata
      };
      
      // Register user with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
          emailRedirectTo: supabaseAuthService.getEmailVerificationRedirectUrl('verification')
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      // Determine if email confirmation is required
      const emailConfirmationRequired = !!authData?.user && !authData?.user?.email_confirmed_at;
      
      return {
        user: authData?.user || null,
        emailConfirmationRequired
      };
    } catch (err) {
      console.error('Error during registration:', err);
      throw err;
    }
  },
  
  /**
   * Send verification code to user's email
   * @param userId User ID
   * @param email Email address to send code to
   * @returns Response indicating success or failure
   */
  sendVerificationCode: async (userId: string, email: string): Promise<VerificationCodeResponse> => {
    try {
      console.log('Sending verification code to:', email);
      
      // Refresh session to ensure we have the latest authentication state
      await supabaseAuthService.refreshSession();
      
      // Check if we're in a test/development environment to show the code
      const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'test';
      
      // Generate a verification code directly in the database
      try {
        // Try to use the generate_verification_code function if available
        const { data: rpcData, error: rpcError } = await supabase.rpc('generate_verification_code', {
          p_user_id: userId,
          p_user_email: email,
          p_is_test_mode: isTestMode
        });
        
        let verificationCode: string;
        
        if (!rpcError && rpcData) {
          // RPC succeeded, store the code
          verificationCode = rpcData;
          console.log(`Verification code generated successfully${isTestMode ? ' (test mode)' : ''} for user ${userId}`);
        } else {
          // If RPC failed (possibly older DB schema), fall back to direct method
          console.log('Falling back to direct verification code generation');
          
          // Generate random 6-digit code
          verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour
          
          // The Supabase webhook will now trigger the Edge Function to send the email.
          // This frontend service is now only responsible for generating and storing the code,
          // and returning it in test mode for display.
          console.log('[Info] Verification code generated. Email sending will be handled by webhook-triggered Edge Function.');
          
          // Expire any previous codes for this user
          await supabase
            .from('verification_codes')
            .update({ used: true })
            .eq('user_id', userId)
            .eq('used', false);
          
          // Insert new code
          const { error: insertError } = await supabase
            .from('verification_codes')
            .insert({
              user_id: userId,
              email: email,
              code: verificationCode,
              expires_at: expiresAt.toISOString(),
              used: false,
              is_test_mode: isTestMode
            });
          
          if (insertError) {
            console.error('Error creating verification code:', insertError);
            return {
              success: false,
              error: 'Failed to create verification code. Please try again.'
            };
          }
          
          console.log(`Verification code generated successfully${isTestMode ? ' (test mode)' : ''} for user ${userId}`);
        }
        // Return the code if in test mode, otherwise just success
        if (isTestMode) {
          return { success: true, code: verificationCode };
        } else {
          return { success: true };
        }
      } catch (generationError: unknown) { // Catch for the inner try block (code generation logic)
        console.error('Error during verification code generation logic:', generationError);
        return { 
          success: false, 
          error: 'Failed to generate verification code due to an internal issue. Please try again.' 
        };
      }
    } catch (err) {
      console.error('Error in sendVerificationCode:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to send verification code' 
      };
    }
  },
  
  /**
   * Verify a code entered by the user
   * @param userId User ID
   * @param code Verification code
   * @returns Response indicating success or failure
   */
  verifyCode: async (userId: string, code: string): Promise<VerificationCodeResponse> => {
    try {
      console.log('Verifying code for user:', userId);
      
      // Refresh session to ensure we have the latest authentication state
      await supabaseAuthService.refreshSession();
      
      // Directly verify the code against the database
      const { data: codeData, error: dbError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (dbError || !codeData) {
        // Check if the code is expired
        const { data: expiredData } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('user_id', userId)
          .eq('code', code)
          .eq('used', false)
          .lte('expires_at', new Date().toISOString())
          .single();
        
        if (expiredData) {
          return { success: false, error: 'Verification code has expired. Please request a new one.' };
        }
        
        // Check if the code was already used
        const { data: usedData } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('user_id', userId)
          .eq('code', code)
          .eq('used', true)
          .single();
        
        if (usedData) {
          return { success: false, error: 'This verification code has already been used.' };
        }
        
        return { success: false, error: 'Invalid verification code. Please check and try again.' };
      }
      
      // Mark code as used
      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', codeData.id);
      
      // Update verification status in multiple places for redundancy
      const timestamp = new Date().toISOString();
      
      // 1. Update profile table
      try {
        await supabase
          .from('profiles')
          .update({
            email_verified: true,
            updated_at: timestamp
          })
          .eq('id', userId);
      } catch (updateErr) {
        console.warn('Error updating profile verification status:', updateErr);
        // Continue despite error - we have multiple update points for redundancy
      }
      
      // 2. Update user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            email_verified: true,
            email_verified_at: timestamp
          }
        });
        
        // Update user metadata in auth.users using admin API
        const { error: adminError } = await supabase.auth.admin.updateUserById(userId, {
          // Note: We can't directly set email_confirmed_at as it's not in the AdminUserAttributes type
          // But we can update the user metadata to reflect verified status
          user_metadata: {
            email_verified: true,
            email_verified_at: timestamp
          }
        });
        
        if (adminError) {
          console.warn('Error updating auth user record:', adminError);
        }
      } catch (updateErr) {
        console.warn('Error updating user metadata verification status:', updateErr);
        // Continue despite error
      }
      
      return { success: true, message: 'Email verified successfully' };
    } catch (err) {
      console.error('Error in verifyCode:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An unexpected error occurred'
      };
    }
  },
  
  /**
   * Check verification code status
   * @param userId User ID
   * @param code Verification code
   * @returns Status of the verification code
   */
  /**
   * Sign in with email and password
   * @param credentials Email and password credentials
   * @returns Authentication result with data and error
   */
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    try {
      // Call Supabase auth signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      // Log for debugging (not sensitive info)
      if (error) {
        console.error('Login error:', error.message);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error during login:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown error during login') 
      };
    }
  },
  
  /**
   * Check verification code status
   * @param userId User ID
   * @param code Verification code
   * @returns Status of the verification code
   */
  checkCodeStatus: async (userId: string, code: string): Promise<VerificationCodeStatus> => {
    try {
      // Query the verification_codes table to check status
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', code)
        .eq('used', false)
        .single();
      
      if (error) {
        return {
          isValid: false,
          isExpired: true,
          message: 'Invalid verification code'
        };
      }
      
      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const isExpired = now > expiresAt;
      
      return {
        isValid: true,
        isExpired,
        message: isExpired ? 'Verification code has expired' : 'Verification code is valid'
      };
    } catch (err) {
      console.error('Error checking code status:', err);
      return {
        isValid: false,
        isExpired: false,
        message: 'Error checking verification code status'
      };
    }
  },
  
  /**
   * Handle Google authentication callback and profile creation
   */
  async handleGoogleAuthCallback(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the URL contains an error related to database user creation
      if (url.includes('error=server_error') && 
          url.includes('error_description=Database+error+saving+new+user')) {
        
        console.log('Detected database error saving new user, attempting direct profile creation...');
        
        // First, try to get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Existing session found, attempting to create profile...');
          const { user } = sessionData.session;
          
          if (!user) {
            return { success: false, error: 'Session exists but no user found' };
          }
          
          // Create profile manually
          const profileCreated = await this.createGoogleUserProfile(
            user.id, 
            user.email || '', 
            user.user_metadata || {}
          );
          
          return { success: profileCreated };
        }
        
        return { success: false, error: 'No active session found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Google auth callback handling failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Create a profile for a Google-authenticated user
   */
  async createGoogleUserProfile(
    userId: string, 
    email: string, 
    metadata: Record<string, unknown>
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
        
        // Update email_verified for Google accounts
        if (existingProfile.email_verified === false) {
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
      
      // Extract name from metadata
      const firstName = this.extractFirstName(metadata);
      const lastName = this.extractLastName(metadata);
      const timestamp = new Date().toISOString();
      
      // Create profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: (metadata.picture || metadata.avatar_url || '') as string,
          email_verified: true,  // Always true for Google sign-ins
          is_beta_tester: false,
          created_at: timestamp,
          updated_at: timestamp,
          has_completed_onboarding: false,
          account_status: 'active',
          birthdate: null
        });
        
      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }
      
      console.log('Successfully created profile for user:', userId);
      return true;
    } catch (error) {
      console.error('Error in createGoogleUserProfile:', error);
      return false;
    }
  },

  /**
   * Extract first name from Google metadata
   */
  extractFirstName(metadata: Record<string, unknown>): string {
    console.log('Extracting first name from metadata:', metadata);
    
    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find((identity: Record<string, unknown>) => 
        identity.provider === 'google'
      );
      
      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data as Record<string, unknown>;
        console.log('Google identity data:', data);
        
        if (typeof data.given_name === 'string' && data.given_name.trim()) {
          console.log('Found given_name:', data.given_name);
          return data.given_name.trim();
        }
        if (typeof data.first_name === 'string' && data.first_name.trim()) {
          console.log('Found first_name:', data.first_name);
          return data.first_name.trim();
        }
        if (typeof data.name === 'string' && data.name.trim()) {
          const firstName = data.name.trim().split(' ')[0];
          console.log('Extracted from name:', firstName);
          return firstName;
        }
      }
    }
    
    // Try direct metadata fields as fallback
    if (typeof metadata.given_name === 'string' && metadata.given_name.trim()) {
      console.log('Found direct given_name:', metadata.given_name);
      return metadata.given_name.trim();
    }
    if (typeof metadata.first_name === 'string' && metadata.first_name.trim()) {
      console.log('Found direct first_name:', metadata.first_name);
      return metadata.first_name.trim();
    }
    if (typeof metadata.name === 'string' && metadata.name.trim()) {
      const firstName = metadata.name.trim().split(' ')[0];
      console.log('Extracted from direct name:', firstName);
      return firstName;
    }
    if (typeof metadata.full_name === 'string' && metadata.full_name.trim()) {
      const firstName = metadata.full_name.trim().split(' ')[0];
      console.log('Extracted from full_name:', firstName);
      return firstName;
    }
    
    console.log('No first name found in metadata');
    return '';
  },

  /**
   * Extract last name from Google metadata
   */
  extractLastName(metadata: Record<string, unknown>): string {
    console.log('Extracting last name from metadata:', metadata);
    
    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find((identity: Record<string, unknown>) => 
        identity.provider === 'google'
      );
      
      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data as Record<string, unknown>;
        console.log('Google identity data for last name:', data);
        
        if (typeof data.family_name === 'string' && data.family_name.trim()) {
          console.log('Found family_name:', data.family_name);
          return data.family_name.trim();
        }
        if (typeof data.last_name === 'string' && data.last_name.trim()) {
          console.log('Found last_name:', data.last_name);
          return data.last_name.trim();
        }
        if (typeof data.name === 'string' && data.name.trim()) {
          const parts = data.name.trim().split(' ');
          if (parts.length > 1) {
            const lastName = parts.slice(1).join(' ');
            console.log('Extracted last name from name:', lastName);
            return lastName;
          }
        }
      }
    }
    
    // Try direct metadata fields as fallback
    if (typeof metadata.family_name === 'string' && metadata.family_name.trim()) {
      console.log('Found direct family_name:', metadata.family_name);
      return metadata.family_name.trim();
    }
    if (typeof metadata.last_name === 'string' && metadata.last_name.trim()) {
      console.log('Found direct last_name:', metadata.last_name);
      return metadata.last_name.trim();
    }
    if (typeof metadata.name === 'string' && metadata.name.trim()) {
      const parts = metadata.name.trim().split(' ');
      if (parts.length > 1) {
        const lastName = parts.slice(1).join(' ');
        console.log('Extracted last name from direct name:', lastName);
        return lastName;
      }
    }
    if (typeof metadata.full_name === 'string' && metadata.full_name.trim()) {
      const parts = metadata.full_name.trim().split(' ');
      if (parts.length > 1) {
        const lastName = parts.slice(1).join(' ');
        console.log('Extracted last name from full_name:', lastName);
        return lastName;
      }
    }
    
    console.log('No last name found in metadata');
    return '';
  }
};
