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
        has_completed_onboarding: false,
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
      
      console.log('Registration successful:', authData.user);
      
      // Create profile in profiles table with extended information
      // Following our architecture principles of clean code and type safety
      // Create a properly typed profile object according to our architecture principles
      const profileData: ProfilesInsert = {
        id: authData.user.id,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        // Properly handle metadata with appropriate type conversions for database schema
        city: typeof data.metadata?.city === 'string' ? data.metadata.city : null,
        country: typeof data.metadata?.country === 'string' ? data.metadata.country : null,
        birthdate: typeof data.metadata?.birthdate === 'string' ? data.metadata.birthdate : null,
        created_at: new Date().toISOString(),
        has_completed_onboarding: false
      };

      // Using proper type definitions following our architectural principles
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
  },

  /**
   * Get the current user if authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data?.session?.user) return null;
    
    return mapSupabaseUser(data.session.user);
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
        queryParams: {
          // Request specific OAuth scopes to get profile information
          access_type: 'offline',
          prompt: 'consent',
          // Request profile information from Google
          scope: 'email profile'
        }
      }
    });
    
    if (error) throw new Error(error.message);
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
