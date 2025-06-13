import React, { ReactNode } from 'react';
import { useAuthContext } from '@/features/auth/authApi';

interface BetaFeatureProps {
  children: ReactNode;
}

/**
 * A wrapper component that only renders its children if the currently
 * authenticated user is a beta tester.
 */
export const BetaFeature: React.FC<BetaFeatureProps> = ({ children }) => {
  const { user } = useAuthContext();

  // The 'user' object from our context now contains the merged profile,
  // but we need to handle the case where it might be a partial object
  // before the profile has fully loaded.
  const isBetaTester = user && 'isBetaTester' in user && user.isBetaTester;

  if (!isBetaTester) {
    return null;
  }

  return <>{children}</>;
}; 