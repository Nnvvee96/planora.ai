import { AuthContext, AuthContextType } from '../context/authContext';
import { useContext } from 'react';

/**
 * Custom hook to use the AuthContext
 * @returns The authentication context
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 