/**
 * Supabase Auth Adapter
 * 
 * This adapter isolates Supabase-specific authentication implementation details
 * from the rest of the application, following the Adapter pattern for better
 * separation of concerns and future-proofing the auth feature.
 */

import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';
import { LoginCredentials, RegisterData, User } from '../types/authTypes';
import { SupabaseUser, SupabaseIdentity } from '../types/supabaseTypes';
import { ProfilesInsert } from '@/lib/supabase/supabaseTypes';

/**
 * Get the site URL for authentication redirects
 * Following our architectural principles of separation of concerns and clean code
 */
const getSiteUrl = (): string => {
  // Get current origin for properly handling both dev and production environments
  const origin = window.location.origin;
  
  // In production (Vercel), use the deployment URL to maintain consistency
  if (import.meta.env.PROD) {
    return 'https://planora.vercel.app';
  }
  
  // In development, use the origin
  return origin;
};

/**
 * Maps Supabase user data to our application's User type
 */
export const mapSupabaseUser = (userData: SupabaseUser): User => {
  const identities = userData.identities || [];
  const googleIdentity = identities.find((identity: SupabaseIdentity) => identity.provider === 'google');
  
  // Get name from Google identity if available
  const firstName = (
    userData.user_metadata?.first_name || 
    googleIdentity?.identity_data?.given_name || 
    ''
  );
  
  const lastName = (
    userData.user_metadata?.last_name || 
    googleIdentity?.identity_data?.family_name || 
    ''
  );
  
  // Get email from verified sources
  const email = (
    userData.email || 
    googleIdentity?.identity_data?.email || 
    ''
  );
  
  // Create a reasonable username if none exists
  const username = (
    userData.user_metadata?.username || 
    `${firstName.toLowerCase()}${lastName.toLowerCase()}` || 
    email.split('@')[0] || 
    ''
  );
  
  return {
    id: userData.id,
    email: email,
    username: username,
    firstName: firstName,
    lastName: lastName,
    hasCompletedOnboarding: userData.user_metadata?.has_completed_onboarding === true
  };
};

/**
 * Supabase implementation of authentication operations
 */
export const supabaseAuthAdapter = {
  /**
   * Sign in with email and password
   */
  signInWithCredentials: async (credentials: LoginCredentials): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) throw new Error(error.message);
    if (!data?.user) throw new Error('No user returned from authentication');
    
    return mapSupabaseUser(data.user);
  },

  /**
   * Register a new user
   */
  registerUser: async (data: RegisterData): Promise<User> => {
    try {
      // First, check if the email already exists to provide better error messages
      // Following architectural principles with proper type safety
      // Using controlled type assertions for Supabase API compatibility
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email as any)
        .maybeSingle();
      /* eslint-enable @typescript-eslint/no-explicit-any */
        
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Prepare user metadata
      const userMetadata = {
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        has_completed_onboarding: false, // Always false for new registrations
        // Add additional metadata if provided
        ...(data.metadata || {})
      };

      console.log('Registering with metadata:', userMetadata);

      // Register the user with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${getSiteUrl()}/auth/callback`
        }
      });
      
      if (error) throw new Error(error.message);
      if (!authData?.user) throw new Error('No user returned from registration');
      
      // Prepare profile data for Supabase profiles table
      const profileData: ProfilesInsert = {
        id: authData.user.id,
        email: data.email,
        username: data.username || '',
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        // Optional fields based on ProfilesInsert type
        created_at: new Date().toISOString(),
        has_completed_onboarding: false
      };
      
      // Supabase API requires controlled type assertions for compatibility
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData] as any);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // We'll continue despite profile creation errors and fix later if needed
      }
      
      return mapSupabaseUser(authData.user);
    } catch (error) {
      console.error('Registration error in adapter:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    
    // Clear localStorage items related to authentication
    localStorage.removeItem('hasCompletedInitialFlow');
  },

  /**
   * Get the current user if authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data?.session?.user) return null;
      
      const rawUser = data.session.user;
      
      // Detect Google auth
      const isGoogleAuth = rawUser.identities?.some(
        identity => identity.provider === 'google'
      );
      
      // First check if user has completed onboarding according to localStorage
      const hasCompletedInitialFlow = localStorage.getItem('hasCompletedInitialFlow') === 'true';
      
      console.log('Auth status check:', { 
        isGoogleAuth, 
        hasCompletedInitialFlow,
        metadata_has_completed_onboarding: rawUser.user_metadata?.has_completed_onboarding
      });
      
      // For Google auth users, check their onboarding status
      if (isGoogleAuth) {
        // If localStorage has completion flag, but metadata doesn't match,
        // update the metadata to match localStorage (localStorage is source of truth)
        if (hasCompletedInitialFlow && 
            rawUser.user_metadata?.has_completed_onboarding !== true) {
          
          console.log('Syncing onboarding status to metadata (user has completed onboarding)');
          try {
            await supabase.auth.updateUser({
              data: { has_completed_onboarding: true }
            });
            
            // Update the user object in memory too
            if (rawUser.user_metadata) {
              rawUser.user_metadata.has_completed_onboarding = true;
            }
          } catch (updateError) {
            console.error('Failed to update user metadata:', updateError);
          }
        }
        
        // For new Google users who haven't completed onboarding
        if (!hasCompletedInitialFlow) {
          console.log('New Google user or incomplete onboarding detected');
          
          // Temporarily override the metadata for this session
          if (rawUser.user_metadata) {
            rawUser.user_metadata.has_completed_onboarding = false;
          }
          
          // Also update in Supabase to persist this change
          try {
            await supabase.auth.updateUser({
              data: { has_completed_onboarding: false }
            });
            console.log('Updated user metadata to ensure onboarding flow');
          } catch (updateError) {
            console.error('Failed to update user metadata:', updateError);
          }
        }
      }
      
      return mapSupabaseUser(rawUser);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  },

  /**
   * Reset onboarding status for a user (used for testing or special cases)
   */
  resetOnboardingStatus: async (): Promise<User | null> => {
    try {
      // Clear localStorage flag
      localStorage.removeItem('hasCompletedInitialFlow');
      
      // Update Supabase metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { has_completed_onboarding: false }
      });
      
      if (error) throw new Error(error.message);
      if (!data?.user) throw new Error('No user returned from metadata update');
      
      console.log('Onboarding status reset successfully');
      return mapSupabaseUser(data.user);
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
      return null;
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      // Clear localStorage flags before Google sign-in to prevent stale state
      localStorage.removeItem('hasCompletedInitialFlow');
      
      // Use explicit callback URL to avoid inconsistent redirects
      // For production environments, use the exact full URL to ensure consistency
      const redirectTo = "https://planora.vercel.app/auth/callback";
      
      // Force console logging to debug the redirect URL
      console.log('FORCED REDIRECT: Using explicit callback URL:', redirectTo);
      
      console.log(`Initiating Google sign-in with redirect to: ${redirectTo}`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            // Request specific OAuth scopes to get profile information
            access_type: 'offline',
            prompt: 'consent select_account',
            // Request profile information from Google
            scope: 'email profile'
          }
        }
      });
      
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<User> => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });
    
    if (error) throw new Error(error.message);
    if (!data?.user) throw new Error('No user returned from verification');
    
    return mapSupabaseUser(data.user);
  },
  
  /**
   * Update user metadata
   */
  updateUserMetadata: async (metadata: Record<string, unknown>): Promise<User> => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) throw new Error(error.message);
    if (!data?.user) throw new Error('No user returned from metadata update');
    
    return mapSupabaseUser(data.user);
  },

  /**
   * Reset password with email
   */
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/reset-password`
    });
    
    if (error) throw new Error(error.message);
  },

  /**
   * Update user's password
   * Requires the user to be logged in and provide their current password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<User> => {
    try {
      // First verify the current password by attempting to sign in
      // Get current user email
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.email) {
        throw new Error('No authenticated user found');
      }
      
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Update to the new password
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw new Error(error.message);
      if (!data?.user) throw new Error('No user returned from password update');
      
      return mapSupabaseUser(data.user);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }
};
