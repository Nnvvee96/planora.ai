/**
 * Authentication Provider Service
 * 
 * Handles detection and management of authentication providers (Google, Email, etc.)
 * Extracted from oversized supabaseAuthService.ts for better maintainability
 */

import { supabase } from "@/lib/supabase/client";
import { AuthProviderType } from "../types/authTypes";

export const authProviderService = {
  /**
   * Determine the authentication provider used by a user
   * @param userId Optional user ID to check (uses current user if not provided)
   * @returns The detected authentication provider type based on the user session
   */
  getAuthProvider: async (_userId?: string): Promise<AuthProviderType> => {
    try {
      // Get the current user from the session
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error getting current user:", error);
        return AuthProviderType.ANONYMOUS;
      }

      // Check user metadata for provider information
      // The provider info could be in different locations depending on auth method
      const provider =
        user.app_metadata?.provider ||
        user.identities?.[0]?.provider ||
        user.user_metadata?.provider;

      if (import.meta.env.DEV) {
        console.log("Detected authentication provider:", provider);
      }

      if (provider === "google") {
        return AuthProviderType.GOOGLE;
      } else if (user.email && user.email_confirmed_at) {
        // User has confirmed email but no social provider
        return AuthProviderType.EMAIL;
      }

      // Check if the user has any identities that might indicate the auth method
      if (user.identities && user.identities.length > 0) {
        // Look through identities for social login providers
        for (const identity of user.identities) {
          if (identity.provider === "google") {
            return AuthProviderType.GOOGLE;
          }
        }

        // If there are identities but none are social, assume email
        if (user.email) {
          return AuthProviderType.EMAIL;
        }
      }

      // If the user has a confirmed email, they likely use email auth
      if (user.email_confirmed_at) {
        return AuthProviderType.EMAIL;
      }

      // As a fallback, check user_metadata for any sign of provider
      if (user.user_metadata) {
        if (
          user.user_metadata.full_name ||
          user.user_metadata.name ||
          user.user_metadata.email_verified
        ) {
          // These fields are typically set for Google auth
          return AuthProviderType.GOOGLE;
        }
      }

      // If we get here and have an email, assume email auth
      if (user.email) {
        return AuthProviderType.EMAIL;
      }

      return AuthProviderType.ANONYMOUS;
    } catch (err) {
      console.error("Failed to determine auth provider:", err);
      return AuthProviderType.ANONYMOUS;
    }
  },

  /**
   * Get a redirect URL for email verification flows
   * Ensures consistent redirect URLs across different email verification processes
   * @param route The specific route for the email verification
   * @returns The full URL for email verification redirect
   */
  getEmailVerificationRedirectUrl: (route: string): string => {
    let baseUrl = "";
    const standardizedRoute = route === "verification" ? "verification" : route;

    // Use environment variable for base URL in all environments
    baseUrl =
      import.meta.env.VITE_SITE_URL ||
      (typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://getplanora.app");

    // Log the redirect URL for debugging
    if (import.meta.env.DEV) {
      console.log(
        `Setting email verification redirect URL: ${baseUrl}/auth/${standardizedRoute}`,
      );
    }

    return `${baseUrl}/auth/${standardizedRoute}`;
  },
}; 