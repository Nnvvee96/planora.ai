/**
 * Auth Callback Service
 *
 * Handles authentication callbacks and registration status determination
 * Part of the auth service refactoring to improve maintainability
 */

import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import {
  AuthResponse,
  UserRegistrationStatus,
} from "../types/authTypes";

/**
 * Authentication callback service
 * Handles auth callbacks, registration status determination, and profile synchronization
 */
export const authCallbackService = {
  /**
   * Handle authentication callback from Google
   * Determines if user is new or returning
   */
  handleAuthCallback: async (): Promise<AuthResponse> => {
    try {
      if (import.meta.env.DEV) {
        console.log("Auth callback initiated");
      }

      // Get session and check if this is a new user
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (import.meta.env.DEV) {
        console.log("Auth session check result:", {
          hasSession: !!session,
          hasError: !!error,
          errorMessage: error?.message,
        });
      }

      if (error || !session) {
        console.error("Auth callback error - no valid session:", error);
        return {
          success: false,
          user: null,
          error: error?.message || "No session found",
          registrationStatus: UserRegistrationStatus.ERROR,
        };
      }

      const user = session.user;
      if (import.meta.env.DEV) {
        console.log("User authenticated successfully:", user.id);
      }

      // Determine registration status using comprehensive logic
      const registrationDetails = {
        status: UserRegistrationStatus.NEW_USER, // Default to new user
        isNewUser: true,
      };

      // Check if user has a profile or travel preferences
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding")
          .eq("id", user.id)
          .single();

        const { data: prefs } = await supabase
          .from("travel_preferences")
          .select("id")
          .eq("user_id", user.id)
          .single();

        const hasProfile = !!profile;
        const hasCompletedOnboarding = profile?.has_completed_onboarding === true;
        const hasTravelPreferences = !!prefs;

        if (import.meta.env.DEV) {
          console.log("Registration status check:", {
            hasProfile,
            hasCompletedOnboarding,
            hasTravelPreferences
          });
        }

        // Determine status based on comprehensive logic
        if (hasCompletedOnboarding || hasTravelPreferences) {
          // User has completed onboarding or has travel preferences -> returning user
          registrationDetails.status = UserRegistrationStatus.RETURNING_USER;
          registrationDetails.isNewUser = false;
        } else if (hasProfile && !hasCompletedOnboarding) {
          // Profile exists but onboarding not completed -> incomplete onboarding
          registrationDetails.status = UserRegistrationStatus.INCOMPLETE_ONBOARDING;
          registrationDetails.isNewUser = false;
        } else {
          // No profile exists -> new user
          registrationDetails.status = UserRegistrationStatus.NEW_USER;
          registrationDetails.isNewUser = true;
        }

        if (import.meta.env.DEV) {
          console.log("Final registration status:", registrationDetails.status);
        }
      } catch (err) {
        console.warn("Error checking user registration status:", err);
        // Continue with default status (NEW_USER)
      }

      // Instead of importing from user-profile, we'll directly handle the profile update here
      // This breaks the circular dependency
      try {
        // Extract profile data from Google authentication
        const { user_metadata } = user;

        if (import.meta.env.DEV) {
          console.log(
            "Google auth - user metadata:",
            JSON.stringify(user_metadata, null, 2),
          );
        }

        // Check if we have user metadata
        if (user_metadata) {
          const timestamp = new Date().toISOString();

          // Use comprehensive name extraction (same logic as extractFirstName/extractLastName)
          let firstName = "";
          let lastName = "";

          // Try identities array first (most reliable for Google)
          if (
            user_metadata.identities &&
            Array.isArray(user_metadata.identities)
          ) {
            const googleIdentity = user_metadata.identities.find(
              (identity: Record<string, unknown>) =>
                identity.provider === "google",
            );

            if (googleIdentity?.identity_data) {
              const data = googleIdentity.identity_data;
              firstName = data.given_name || data.first_name || "";
              lastName = data.family_name || data.last_name || "";

              // If no specific name fields, try to extract from full name
              if ((!firstName || !lastName) && data.name) {
                const nameParts = data.name.split(" ");
                if (!firstName) firstName = nameParts[0] || "";
                if (!lastName) lastName = nameParts.slice(1).join(" ");
              }
            }
          }

          // Fallback to direct metadata fields
          if (!firstName || !lastName) {
            if (user_metadata.given_name)
              firstName = firstName || user_metadata.given_name;
            if (user_metadata.first_name)
              firstName = firstName || user_metadata.first_name;
            if (user_metadata.family_name)
              lastName = lastName || user_metadata.family_name;
            if (user_metadata.last_name)
              lastName = lastName || user_metadata.last_name;

            // Try name field as final fallback
            if ((!firstName || !lastName) && user_metadata.name) {
              const nameParts = (user_metadata.name as string).split(" ");
              if (!firstName) firstName = nameParts[0] || "";
              if (!lastName) lastName = nameParts.slice(1).join(" ");
            }

            // Try full_name as backup
            if ((!firstName || !lastName) && user_metadata.full_name) {
              const nameParts = (user_metadata.full_name as string).split(" ");
              if (!firstName) firstName = nameParts[0] || "";
              if (!lastName) lastName = nameParts.slice(1).join(" ");
            }
          }

          if (import.meta.env.DEV) {
            console.log("Extracted names:", { firstName, lastName });
          }

          // Update user profile with extracted data using direct Supabase call
          if (firstName || lastName) {
            try {
              // Check if profile exists first
              const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id, first_name, last_name")
                .eq("id", user.id)
                .single();

              if (existingProfile) {
                // Update existing profile
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    first_name: firstName || existingProfile.first_name,
                    last_name: lastName || existingProfile.last_name,
                    email: user.email,
                    email_verified: true, // Google accounts are pre-verified
                    updated_at: timestamp,
                  })
                  .eq("id", user.id);

                if (updateError) {
                  console.error(
                    "Error updating profile with Google data:",
                    updateError,
                  );
                } else {
                  if (import.meta.env.DEV) {
                    console.log("Successfully updated profile with Google data");
                  }
                }
              } else {
                // Create new profile
                const { error: insertError } = await supabase
                  .from("profiles")
                  .insert({
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    email: user.email,
                    email_verified: true,
                    is_beta_tester: false,
                    has_completed_onboarding: false,
                    created_at: timestamp,
                    updated_at: timestamp,
                  });

                if (insertError) {
                  console.error(
                    "Error creating profile with Google data:",
                    insertError,
                  );
                } else {
                  if (import.meta.env.DEV) {
                    console.log("Successfully created profile with Google data");
                  }
                }
              }
            } catch (profileError) {
              console.error("Error with profile operations:", profileError);
            }
          }
        }
      } catch (err) {
        console.error("Error updating user profile:", err);
      }

      return {
        success: true,
        user,
        error: null,
        registrationStatus: registrationDetails.status,
      };
    } catch (err) {
      console.error("Error handling auth callback:", err);
      return {
        success: false,
        user: null,
        error: err.message,
        registrationStatus: UserRegistrationStatus.ERROR,
      };
    }
  },

  /**
   * Subscribe to authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Subscription that can be unsubscribed
   */
  subscribeToAuthChanges: (
    callback: (event: string, session: Session | null) => void,
  ) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log("Auth state changed event:", event);
      }
      callback(event, session);
    });
  },

  /**
   * Update user onboarding status
   * @param userId User ID
   * @param hasCompleted Whether onboarding is completed
   * @returns Success status
   */
  updateOnboardingStatus: async (
    userId: string,
    hasCompleted: boolean = true,
  ): Promise<boolean> => {
    try {
      // STEP 1: Make sure we have a valid session before starting
      // This helps prevent session loss during the process
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        console.error(
          "No active session found when updating onboarding status",
        );
        // Attempt to refresh the session
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshData?.session) {
          console.error("Failed to refresh session:", refreshError);
          // Still try to update the database, but warn about potential issues
        }
      }

      // STEP 2: Update local storage FIRST as it's the most reliable
      // This ensures we have at least one source of truth that won't be affected by potential API errors
      localStorage.setItem(
        "has_completed_onboarding",
        hasCompleted ? "true" : "false",
      );
      localStorage.setItem(
        "hasCompletedInitialFlow",
        hasCompleted ? "true" : "false",
      );

      // STEP 3: Update profiles table before metadata to avoid race conditions
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: hasCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.error(
          "Error updating profile onboarding status:",
          profileError,
        );
        // Continue with metadata update anyway
      }

      // STEP 4: Finally, update the user metadata
      // This can trigger a USER_UPDATED event and potentially affect the session
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          has_completed_onboarding: hasCompleted,
          onboarding_complete_date: new Date().toISOString(),
          onboarding_version: "2.0", // Adding a version to track which onboarding flow was completed
        },
      });

      if (userError) {
        console.error(
          "Error updating user metadata for onboarding status:",
          userError,
        );
        // We've already updated local storage and possibly the profile, so return partial success
        return true;
      }

      // STEP 5: Force refresh the session one more time to ensure the session has the latest metadata
      try {
        await supabase.auth.refreshSession();
      } catch (refreshError) {
        console.warn(
          "Error refreshing session after metadata update:",
          refreshError,
        );
        // Not critical, we can still consider this a success
      }

      return true;
    } catch (err) {
      console.error("Failed to update onboarding status:", err);
      // Even if we fail here, local storage should still be updated
      return localStorage.getItem("has_completed_onboarding") === "true";
    }
  },

  /**
   * Refresh session to ensure we have the latest authentication state
   */
  refreshSession: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn("Error refreshing session:", error);
      }
    } catch (err) {
      console.warn("Failed to refresh session:", err);
    }
  },

  /**
   * Check user registration status
   * @param userId User ID
   * @returns Registration status details
   */
  checkUserRegistrationStatus: async (userId: string) => {
    try {
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("id", userId)
        .single();

      // Check if user has travel preferences
      const { data: prefs, error: prefsError } = await supabase
        .from("travel_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      const hasProfile = !profileError && !!profile;
      const hasCompletedOnboarding = hasProfile && profile.has_completed_onboarding;
      const hasTravelPreferences = !prefsError && !!prefs;

      let registrationStatus = UserRegistrationStatus.NEW_USER;

      if (hasCompletedOnboarding || hasTravelPreferences) {
        registrationStatus = UserRegistrationStatus.RETURNING_USER;
      } else if (hasProfile && !hasCompletedOnboarding) {
        // Profile exists but onboarding not completed -> incomplete onboarding
        registrationStatus = UserRegistrationStatus.INCOMPLETE_ONBOARDING;
      }
      // else: No profile exists -> keep NEW_USER status

      return {
        isNewUser: !hasProfile,
        hasProfile,
        hasCompletedOnboarding,
        hasTravelPreferences,
        registrationStatus,
      };
    } catch (err) {
      console.error("Failed to check user registration status:", err);
      return {
        isNewUser: false,
        hasProfile: false,
        hasCompletedOnboarding: false,
        hasTravelPreferences: false,
        registrationStatus: UserRegistrationStatus.ERROR,
      };
    }
  },
}; 