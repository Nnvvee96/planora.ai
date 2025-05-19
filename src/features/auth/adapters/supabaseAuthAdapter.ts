/**
 * Supabase Auth Adapter
 * 
 * This adapter isolates Supabase-specific authentication implementation details
 * from the rest of the application, following the Adapter pattern for better
 * separation of concerns and future-proofing the auth feature.
 */

import { AuthError, OAuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';
import { LoginCredentials, RegisterData, User } from '../types/authTypes';
import { SupabaseUser, SupabaseIdentity } from '../types/supabaseTypes';
import { ProfilesInsert } from '@/lib/supabase/supabaseTypes';

/**
 * Get the site URL for authentication redirects
 * Following our architectural principles of separation of concerns and clean code
 */
const getSiteUrl = (): string => {
  // Always use explicit URLs for consistency across environments
  if (import.meta.env.PROD) {
    return 'https://planora-ai-beta.vercel.app';
  }
  
  // In development, use localhost
  return window.location.origin || 'http://localhost:5173';
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
 * Follows Planora's architectural principles with feature-first organization
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
      const { data: emailCheckData, error: emailCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();
        
      if (emailCheckData) {
        throw new Error('An account with this email already exists');
      }
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username || `${data.firstName.toLowerCase()}${data.lastName.toLowerCase()}`,
            has_completed_onboarding: false,
            has_profile_created: false
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData?.user) throw new Error('User registration failed');
      
      return mapSupabaseUser(authData.user);
    } catch (error) {
      // Handle specific error messages
      if (error instanceof AuthError) {
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw new Error(error.message);
      }
      
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Get the current user if authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Get session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        return null;
      }
      
      // If no session, user is not authenticated
      if (!sessionData.session) {
        return null;
      }
      
      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError.message);
        return null;
      }
      
      if (!userData.user) {
        return null;
      }
      
      return mapSupabaseUser(userData.user);
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Error getting user for reset:', userError?.message || 'No user found');
        return null;
      }
      
      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          has_completed_onboarding: false
        }
      });
      
      if (error || !data.user) {
        console.error('Error resetting onboarding status:', error?.message || 'User data not returned');
        return null;
      }
      
      // Update profiles table if needed
      await supabase
        .from('profiles')
        .update({ has_completed_onboarding: false })
        .eq('id', userData.user.id);
      
      return mapSupabaseUser(data.user);
    } catch (error) {
      console.error('Error in resetOnboardingStatus:', error);
      return null;
    }
  },

  /**
   * Sign in with Google OAuth
   * FIX FOR AUTH ISSUE: Proper implementation of OAuth for Google Sign-In
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      // CRITICAL: Redirect URL must match exactly what is configured in Google Cloud Console
      const redirectTo = `${getSiteUrl()}/auth/callback`;
      console.log('Google auth redirect URL:', redirectTo);
      
      // Do NOT clear localStorage items - Supabase needs them for PKCE
      // Don't modify standard auth flow process
      
      // Simple, clean implementation following Supabase docs exactly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            // Standard Google OAuth parameters
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      
      // Just log any errors, don't throw - browser will be redirected by Supabase
      if (error) {
        console.error('Error starting Google auth flow:', error.message);
      }
    } catch (error) {
      // Just log the error, don't throw - browser will be redirected
      console.error('Unexpected error in Google sign-in:', error);
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<User> => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Email verification failed');
    
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
    if (!data.user) throw new Error('User metadata update failed');
    
    return mapSupabaseUser(data.user);
  },

  /**
   * Reset password with email
   */
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    });
    
    if (error) throw new Error(error.message);
  },

  /**
   * Update user's password
   * Requires the user to be logged in and provide their current password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<User> => {
    try {
      // First verify the current password by attempting to sign in with it
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('You must be logged in to change your password');
      }
      
      const userEmail = sessionData.session.user.email;
      if (!userEmail) {
        throw new Error('Cannot retrieve user email from session');
      }
      
      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // If sign-in succeeded, update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Password update failed');
      
      return mapSupabaseUser(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update password');
    }
  }
};
