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
      
      // Check if this is a new or existing user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // If no profile exists, create one with Google user data
      if (!profile || profileError) {
        // New user, create profile from Google data
        const { user_metadata } = user;
        
        // Insert profile record
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: user_metadata?.given_name || '',
            last_name: user_metadata?.family_name || '',
            email: user.email,
            avatar_url: user_metadata?.avatar_url || user_metadata?.picture || '',
            has_completed_onboarding: false
          });
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return { 
            success: false, 
            user, 
            error: 'Failed to create user profile' 
          };
        }
        
        // New user should go to onboarding
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.NEW_USER
        };
      } 
      
      // Existing user, check if onboarding is completed
      if (!profile.has_completed_onboarding) {
        return {
          success: true,
          user,
          registrationStatus: UserRegistrationStatus.INCOMPLETE_ONBOARDING
        };
      }
      
      // Existing user with completed onboarding, go to dashboard
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
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Update onboarding status for user
   */
  updateOnboardingStatus: async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: hasCompleted })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating onboarding status:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      return false;
    }
  }
};
