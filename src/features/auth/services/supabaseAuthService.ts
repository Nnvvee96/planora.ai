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
    
    // First, check for production Vercel URL
    if (import.meta.env.VITE_PRODUCTION_URL) {
      baseUrl = import.meta.env.VITE_PRODUCTION_URL;
    }
    // Fall back to current origin if available
    else if (typeof window !== 'undefined' && window.location.origin) {
      baseUrl = window.location.origin;
    } 
    // If all else fails, use the Vercel production URL
    else {
      baseUrl = 'https://planora-ai-plum.vercel.app';
    }
    
    // Log the redirect URL for debugging
    console.log(`Setting email verification redirect URL: ${baseUrl}/auth/${route}`);
    
    return `${baseUrl}/auth/${route}`;
  },

  /**
   * Determine the authentication provider used by a user
   * @returns The detected authentication provider type based on the current user session
   */
  getAuthProvider: async (): Promise<AuthProviderType> => {
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
};
