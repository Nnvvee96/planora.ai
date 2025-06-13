import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from '@/features/auth/authApi';
import { userProfileService } from '../services/userProfileService';
import { UserProfile } from '../types/profileTypes';

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  error: null,
});

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [profileState, setProfileState] = useState<UserProfileContextType>({
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (authUser) {
        try {
          setProfileState({ profile: null, loading: true, error: null });
          const userProfile = await userProfileService.getUserProfile(authUser.id);
          setProfileState({ profile: userProfile, loading: false, error: null });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
          setProfileState({ profile: null, loading: false, error: errorMessage });
          console.error(err);
        }
      } else if (!authLoading) {
        // If there's no auth user and auth is not loading, then there's no profile to fetch.
        setProfileState({ profile: null, loading: false, error: null });
      }
    };

    fetchProfile();
  }, [authUser, authLoading]);

  return (
    <UserProfileContext.Provider value={profileState}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext); 