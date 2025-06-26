import React, { ReactNode } from "react";
import { useUserProfile } from "@/features/user-profile/userProfileApi";

interface BetaFeatureProps {
  children: ReactNode;
}

/**
 * A wrapper component that only renders its children if the currently
 * authenticated user is a beta tester.
 */
export const BetaFeature: React.FC<BetaFeatureProps> = ({ children }) => {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return null; // Don't render anything while profile is loading
  }

  const isBetaTester = profile?.isBetaTester;

  if (!isBetaTester) {
    return null;
  }

  return <>{children}</>;
};
