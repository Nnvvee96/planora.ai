/**
 * Auth Context
 *
 * Defines the React context for authentication state and a custom hook for accessing it.
 * This separation from the provider component improves modularity and aligns with React's Fast Refresh best practices.
 */

import { createContext, useContext } from "react";
import { AuthContextType } from "../types/authTypes";
import { UserRegistrationStatus } from "../types/authTypes";

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  handleAuthCallback: async () => ({
    success: false,
    user: null,
    registrationStatus: "new_user" as UserRegistrationStatus,
    error: null,
  }),
  updateOnboardingStatus: async () => false,
});

// Create and export a custom hook to consume the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
