/**
 * Auth Provider
 * 
 * React context provider for authentication state.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { createContext, useContext, ReactNode } from 'react';
// Import types directly from types directory instead of through API
import { User } from '@supabase/supabase-js';
import { AppUser, AuthState, AuthResponse } from '../types/authTypes';
// Import UserRegistrationStatus as a value, not just a type
import { UserRegistrationStatus } from '../types/authTypes';

// Import services directly to avoid circular dependencies
import { supabaseAuthService } from '../services/supabaseAuthService';

// Define the auth context type for better type safety
export interface AuthContextType {
  isAuthenticated: boolean;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthCallback: () => Promise<AuthResponse>;
  updateOnboardingStatus: (userId: string, hasCompleted?: boolean) => Promise<boolean>;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  handleAuthCallback: async () => ({ success: false, user: null, registrationStatus: 'new_user' as UserRegistrationStatus, error: null }),
  updateOnboardingStatus: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component
 * Provides authentication state and methods to the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Implement auth logic directly here to avoid circular dependencies
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });
  
  // Map Supabase user to AppUser format with comprehensive null checking
  const mapSupabaseUser = (user: User | null): AppUser => {
    if (!user) {
      console.warn('mapSupabaseUser called with null user, returning empty user object');
      return {
        id: '',
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        avatarUrl: '',
        hasCompletedOnboarding: false
      };
    }
    
    // Start with empty metadata to ensure we always have a valid object
    const metadata: Record<string, any> = {};
    
    // Safely extract user metadata with null checking
    if (user.user_metadata && typeof user.user_metadata === 'object') {
      Object.assign(metadata, user.user_metadata);
    }
    
    // Extract name from identities array if available (most reliable for Google)
    let extractedFirstName = '';
    let extractedLastName = '';
    
    try {
      if (metadata.identities && Array.isArray(metadata.identities)) {
        const googleIdentity = metadata.identities.find((identity: any) => 
          identity && identity.provider === 'google' && identity.identity_data
        );
        
        if (googleIdentity && googleIdentity.identity_data) {
          extractedFirstName = googleIdentity.identity_data.given_name || 
                            googleIdentity.identity_data.first_name || '';
                            
          extractedLastName = googleIdentity.identity_data.family_name || 
                           googleIdentity.identity_data.last_name || '';
                           
          // If no specific name fields, try to extract from full name
          if ((!extractedFirstName || !extractedLastName) && googleIdentity.identity_data.name) {
            const nameParts = googleIdentity.identity_data.name.split(' ');
            if (nameParts.length > 0 && !extractedFirstName) {
              extractedFirstName = nameParts[0] || '';
            }
            if (nameParts.length > 1 && !extractedLastName) {
              extractedLastName = nameParts.slice(1).join(' ');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting user identity data:', error);
    }
    
    // Safely get values from metadata or use extracted values with null coalescing
    return {
      id: user.id || '',
      email: user.email || '',
      username: (metadata.preferred_username as string) || 
               (metadata.name as string) || 
               (user.email?.split('@')[0]) || 
               'user',
      firstName: extractedFirstName || 
               (metadata.first_name as string) || 
               (metadata.given_name as string) || 
               '',
      lastName: extractedLastName || 
              (metadata.last_name as string) || 
              (metadata.family_name as string) || 
              '',
      avatarUrl: (metadata.avatar_url as string) || 
               (metadata.picture as string) || 
               '',
      hasCompletedOnboarding: Boolean(metadata.has_completed_onboarding) || false
    };
  };
  
  // Track if auth service is initialized
  const [isAuthServiceInitialized, setIsAuthServiceInitialized] = React.useState(false);
  
  // Check authentication status on component mount with improved initialization
  React.useEffect(() => {
    // Flag to prevent multiple initializations
    let isInitializing = true;
    
    const checkAuth = async () => {
      try {
        console.log('Initializing auth service...');
        
        // Force session check to ensure we have the latest session state
        await supabaseAuthService.refreshSession();
        
        // Get the current user after session refresh
        let supabaseUser = null;
        try {
          supabaseUser = await supabaseAuthService.getCurrentUser();
          console.log('User data loaded successfully:', !!supabaseUser);
        } catch (loadError) {
          console.error('Error loading user data:', loadError);
        }
        
        // Mark auth service as initialized before updating state
        if (isInitializing) {
          setIsAuthServiceInitialized(true);
          console.log('Auth service successfully initialized');
          isInitializing = false;
        }
        
        // Use safe mapping function even if user is null
        const mappedUser = supabaseUser ? mapSupabaseUser(supabaseUser) : null;
        
        setAuthState({
          isAuthenticated: !!supabaseUser,
          user: mappedUser,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error initializing auth service:', error);
        
        // Even on error, mark as initialized to prevent hanging
        if (isInitializing) {
          setIsAuthServiceInitialized(true);
          console.log('Auth service marked as initialized despite error');
          isInitializing = false;
        }
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Error checking authentication status'
        });
      }
    };
    
    // Initialize immediately
    checkAuth();
    
    // Set up Supabase auth listener to handle auth changes
    const { data: { subscription } } = supabaseAuthService.subscribeToAuthChanges((event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      // On any auth change, update our local state
      try {
        if (session?.user) {
          // Safely map user with comprehensive null checking
          const mappedUser = mapSupabaseUser(session.user);
          console.log('Auth state update with user:', !!mappedUser);
          
          setAuthState({
            isAuthenticated: true,
            user: mappedUser,
            loading: false,
            error: null
          });
        } else {
          console.log('Auth state update: No user in session');
          
          setAuthState({
            isAuthenticated: false,
            user: null, 
            loading: false,
            error: null
          });
        }
      } catch (stateUpdateError) {
        console.error('Error updating auth state:', stateUpdateError);
        
        // Still update state even on error, just with no user
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Error processing authentication data'
        });
      }
    });
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Auth methods
  const signInWithGoogle = async () => {
    try {
      await supabaseAuthService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };
  
  const logout = async () => {
    try {
      await supabaseAuthService.signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleAuthCallback = async (): Promise<AuthResponse> => {
    try {
      return await supabaseAuthService.handleAuthCallback();
    } catch (error) {
      console.error('Auth callback error:', error);
      return {
        success: false,
        user: null,
        error: 'Error handling authentication callback',
        registrationStatus: UserRegistrationStatus.ERROR
      };
    }
  };
  
  const updateOnboardingStatus = async (userId: string, hasCompleted: boolean = true): Promise<boolean> => {
    try {
      return await supabaseAuthService.updateOnboardingStatus(userId, hasCompleted);
    } catch (error) {
      console.error('Update onboarding status error:', error);
      return false;
    }
  };
  
  const authContextValue: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    logout,
    handleAuthCallback,
    updateOnboardingStatus
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for accessing auth context
 * Provides a convenient way to access auth state and methods
 */
export const useAuthContext = () => useContext(AuthContext);
