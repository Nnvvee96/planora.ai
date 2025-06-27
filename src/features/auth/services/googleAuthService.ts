/**
 * Google Auth Service
 *
 * Handles Google OAuth authentication flows and profile management
 * Part of the auth service refactoring to improve maintainability
 */

import { supabase } from "@/lib/supabase/client";

/**
 * Google authentication service
 * Handles Google OAuth flows, profile creation, and metadata extraction
 */
export const googleAuthService = {
  /**
   * Sign in with Google
   * Initiates Google OAuth flow
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      // Use environment-specific redirect URL
      let redirectUrl;

      if (import.meta.env.DEV) {
        // Use environment variable for redirect URL in all environments
        redirectUrl =
          import.meta.env.VITE_AUTH_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`;
        if (import.meta.env.DEV) {
          console.log("Using redirect URL from env:", redirectUrl);
        }
      }

      if (import.meta.env.DEV) {
        console.log(
          "Google Auth: Initiating sign-in with redirect URL:",
          redirectUrl,
        );
      }

      // Ensure we're using the correct Supabase OAuth flow with proper scopes
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          // These specific query parameters help ensure proper Google OAuth flow
          queryParams: {
            access_type: "offline", // Get refresh token
            prompt: "consent", // Always show consent screen
            scope: "profile email", // Request minimal required scopes
            include_granted_scopes: "true",
          },
          // Skip the URL fragment cleanup - this may be causing issues
          skipBrowserRedirect: false,
        },
      });

      // Track if the sign-in process started successfully
      if (data?.url) {
        if (import.meta.env.DEV) {
          console.log(
            "Google Auth: Successfully generated OAuth URL, redirecting user...",
          );
        }
        // You could store a flag in localStorage to help track auth flow state
        localStorage.setItem("auth_flow_started", "true");
        localStorage.setItem("auth_flow_timestamp", Date.now().toString());
      }

      if (error) {
        console.error("Google Auth: Error initiating sign-in:", error);
        throw error;
      }
    } catch (err) {
      console.error(
        "Google Auth: Unexpected error during sign-in process:",
        err,
      );
      throw err;
    }
  },

  /**
   * Handle Google authentication callback and profile creation
   */
  handleGoogleAuthCallback: async (
    url: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if the URL contains an error related to database user creation
      if (
        url.includes("error=server_error") &&
        url.includes("error_description=Database+error+saving+new+user")
      ) {
        if (import.meta.env.DEV) {
          console.log(
            "Detected database error saving new user, attempting direct profile creation...",
          );
        }

        // First, try to get the current session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          if (import.meta.env.DEV) {
            console.log(
              "Existing session found, attempting to create profile...",
            );
          }
          const { user } = sessionData.session;

          if (!user) {
            return {
              success: false,
              error: "Session exists but no user found",
            };
          }

          // Create profile manually
          const profileCreated = await googleAuthService.createGoogleUserProfile(
            user.id,
            user.email || "",
            user.user_metadata || {},
          );

          return { success: profileCreated };
        }

        return { success: false, error: "No active session found" };
      }

      return { success: true };
    } catch (error) {
      console.error("Google auth callback handling failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Create a profile for a Google-authenticated user
   */
  createGoogleUserProfile: async (
    userId: string,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<boolean> => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email_verified")
        .eq("id", userId)
        .single();

      if (existingProfile) {
        if (import.meta.env.DEV) {
          console.log("Profile already exists for user:", userId);
        }

        // Update email_verified for Google accounts
        if (existingProfile.email_verified === false) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ email_verified: true })
            .eq("id", userId);

          if (updateError) {
            console.error("Error updating email_verified status:", updateError);
          }
        }

        return true;
      }

      // Extract name from metadata
      const firstName = googleAuthService.extractFirstName(metadata);
      const lastName = googleAuthService.extractLastName(metadata);
      const timestamp = new Date().toISOString();

      // Create profile
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: (metadata.picture || metadata.avatar_url || "") as string,
        email_verified: true, // Always true for Google sign-ins
        is_beta_tester: false,
        created_at: timestamp,
        updated_at: timestamp,
        has_completed_onboarding: false,
        account_status: "active",
        birthdate: null,
      });

      if (error) {
        console.error("Error creating profile:", error);
        return false;
      }

      if (import.meta.env.DEV) {
        console.log("Successfully created profile for user:", userId);
      }
      return true;
    } catch (error) {
      console.error("Error in createGoogleUserProfile:", error);
      return false;
    }
  },

  /**
   * Extract first name from Google metadata
   */
  extractFirstName: (metadata: Record<string, unknown>): string => {
    if (import.meta.env.DEV) {
      console.log("Extracting first name from metadata:", metadata);
    }

    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find(
        (identity: Record<string, unknown>) => identity.provider === "google",
      );

      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data;
        if (import.meta.env.DEV) {
          console.log("Google identity data:", data);
        }
        if (data.given_name) {
          if (import.meta.env.DEV) {
            console.log("Found given_name:", data.given_name);
          }
          return data.given_name as string;
        }
        if (data.first_name) {
          if (import.meta.env.DEV) {
            console.log("Found first_name:", data.first_name);
          }
          return data.first_name as string;
        }

        // Try to extract from full name
        if (data.name) {
          const firstName = (data.name as string).split(" ")[0] || "";
          if (import.meta.env.DEV) {
            console.log("Extracted from name:", firstName);
          }
          return firstName;
        }
      }
    }

    // Fallback to direct metadata fields
    if (metadata.given_name) {
      if (import.meta.env.DEV) {
        console.log("Found direct given_name:", metadata.given_name);
      }
      return metadata.given_name as string;
    }
    if (metadata.first_name) {
      if (import.meta.env.DEV) {
        console.log("Found direct first_name:", metadata.first_name);
      }
      return metadata.first_name as string;
    }

    // Try name field as final fallback
    if (metadata.name) {
      const firstName = (metadata.name as string).split(" ")[0] || "";
      if (import.meta.env.DEV) {
        console.log("Extracted from direct name:", firstName);
      }
      return firstName;
    }

    // Try full_name as backup
    if (metadata.full_name) {
      const firstName = (metadata.full_name as string).split(" ")[0] || "";
      if (import.meta.env.DEV) {
        console.log("Extracted from full_name:", firstName);
      }
      return firstName;
    }

    if (import.meta.env.DEV) {
      console.log("No first name found in metadata");
    }
    return "";
  },

  /**
   * Extract last name from Google metadata
   */
  extractLastName: (metadata: Record<string, unknown>): string => {
    if (import.meta.env.DEV) {
      console.log("Extracting last name from metadata:", metadata);
    }

    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find(
        (identity: Record<string, unknown>) => identity.provider === "google",
      );

      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data;
        if (import.meta.env.DEV) {
          console.log("Google identity data for last name:", data);
        }

        if (data.family_name) {
          if (import.meta.env.DEV) {
            console.log("Found family_name:", data.family_name);
          }
          return data.family_name as string;
        }
        if (data.last_name) {
          if (import.meta.env.DEV) {
            console.log("Found last_name:", data.last_name);
          }
          return data.last_name as string;
        }
        if (data.name) {
          const parts = (data.name as string).split(" ");
          if (parts.length > 1) {
            const lastName = parts.slice(1).join(" ");
            if (import.meta.env.DEV) {
              console.log("Extracted last name from name:", lastName);
            }
            return lastName;
          }
        }
      }
    }

    // Try direct metadata fields as fallback
    if (metadata.family_name) {
      if (import.meta.env.DEV) {
        console.log("Found direct family_name:", metadata.family_name);
      }
      return metadata.family_name as string;
    }
    if (metadata.last_name) {
      if (import.meta.env.DEV) {
        console.log("Found direct last_name:", metadata.last_name);
      }
      return metadata.last_name as string;
    }
    if (metadata.name) {
      const parts = (metadata.name as string).split(" ");
      if (parts.length > 1) {
        const lastName = parts.slice(1).join(" ");
        if (import.meta.env.DEV) {
          console.log("Extracted last name from direct name:", lastName);
        }
        return lastName;
      }
    }
    if (metadata.full_name) {
      const parts = (metadata.full_name as string).split(" ");
      if (parts.length > 1) {
        const lastName = parts.slice(1).join(" ");
        if (import.meta.env.DEV) {
          console.log("Extracted last name from full_name:", lastName);
        }
        return lastName;
      }
    }

    if (import.meta.env.DEV) {
      console.log("No last name found in metadata");
    }
    return "";
  },
}; 