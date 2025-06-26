import { useContext } from 'react';
import { UserProfileContext } from '../context/userProfileContext';

export const useUserProfile = () => useContext(UserProfileContext); 