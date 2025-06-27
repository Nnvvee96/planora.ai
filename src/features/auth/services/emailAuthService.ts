/**
 * Email Auth Service
 *
 * Handles email/password authentication flows and verification
 * Part of the auth service refactoring to improve maintainability
 */

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import {
  RegisterData,
  InitiateSignupResponse,
  CompleteSignupPayload,
  CompleteSignupResponse,
  VerificationCodeResponse,
  VerificationCodeStatus,
  AuthProviderType,
} from "../types/authTypes";
import { emailVerificationService } from "./emailVerificationService";
import { authProviderService } from "./authProviderService";

/**
 * Email authentication service
 * Handles email/password flows, verification codes, and registration
 */
export const emailAuthService = {
  /**
   * Initiates the first step of the two-phase signup process.
   * Sends user's email and password to the backend to generate and dispatch a verification code.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's chosen raw password.
   * @returns {Promise<InitiateSignupResponse>} The response from the backend.
   */
  initiateSignup: async (
    email: string,
    password_raw: string,
  ): Promise<InitiateSignupResponse> => {
    try {
      if (!email || !password_raw) {
        throw new Error("Email and password are required to initiate signup.");
      }

      const { data, error } = await supabase.functions.invoke(
        "verification-code-handler",
        {
          body: {
            action: "initiate-signup",
            payload: {
              email,
              password: password_raw, // Send the raw password to the backend
            },
          },
        },
      );

      if (error) {
        // Log the detailed error from the function invocation
        console.error("Error invoking initiate-signup function:", error);
        // Attempt to parse a more specific error message from the function's response
        const functionError =
          error.context?.function_error || "An unknown error occurred.";
        return {
          success: false,
          message: null,
          error: "Failed to initiate signup.",
          details: functionError,
        };
      }

      // The backend function returns a success message
      return {
        success: true,
        message: data.message || "Verification code sent.",
        error: null,
        details: null,
      };
    } catch (err: unknown) {
      console.error("Unexpected error in initiateSignup service:", err);
      return {
        success: false,
        message: null,
        error: "An unexpected error occurred during signup initiation.",
        details: err instanceof Error ? err.message : String(err),
      };
    }
  },

  /**
   * Completes the second step of the two-phase signup process.
   * Sends the verification code and full user details to create the account.
   * @param {CompleteSignupPayload} payload - The user details including email, code, names, etc.
   * @returns {Promise<CompleteSignupResponse>} The final response from the backend.
   */
  completeSignup: async (
    payload: CompleteSignupPayload,
  ): Promise<CompleteSignupResponse> => {
    try {
      if (!payload.email || !payload.code) {
        throw new Error(
          "Email and verification code are required to complete signup.",
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "verification-code-handler",
        {
          body: {
            action: "complete-signup",
            payload: payload, // Forward the entire payload
          },
        },
      );

      if (error) {
        console.error("Error invoking complete-signup function:", error);
        const functionError =
          error.context?.function_error || "An unknown error occurred.";
        return {
          success: false,
          userId: null,
          error: "Failed to complete signup.",
          details: functionError,
        };
      }

      // Backend returns userId on success
      return {
        success: true,
        userId: data.userId,
        error: null,
        details: null,
      };
    } catch (err: unknown) {
      console.error("Unexpected error in completeSignup service:", err);
      return {
        success: false,
        userId: null,
        error: "An unexpected error occurred during signup completion.",
        details: err instanceof Error ? err.message : String(err),
      };
    }
  },

  /**
   * Sign in with email and password
   * @param credentials Email and password credentials
   * @returns Authentication result with data and error
   */
  signInWithPassword: async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      // Call Supabase auth signInWithPassword
      const { data, error } =
        await supabase.auth.signInWithPassword(credentials);

      // Log for debugging (not sensitive info)
      if (error) {
        console.error("Login error:", error.message);
      }

      return { data, error };
    } catch (err) {
      console.error("Unexpected error during login:", err);
      return {
        data: null,
        error:
          err instanceof Error ? err : new Error("Unknown error during login"),
      };
    }
  },

  /**
   * Update user password
   */
  updatePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error);
        throw error;
      }
    } catch (err) {
      console.error("Failed to update password:", err);
      throw err;
    }
  },

  /**
   * Update email address
   * @param newEmail New email address
   * @param password Current password (required for Google->Email conversion)
   * @returns Promise<void>
   */
  updateEmail: async (newEmail: string, password?: string): Promise<void> => {
    try {
      // Check if we have a current user first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Check if we need to convert from Google to email auth
      const provider = await authProviderService.getAuthProvider();
      const isGoogleUser = provider === AuthProviderType.GOOGLE;

      // Get current profile for tracking - critical for proper email comparison
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email, pending_email_change")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile for email update:", profileError);
      }

      // Get the actual current email to compare against
      const currentAuthEmail = user.email || "";
      const currentProfileEmail = profileData?.email || "";
      const pendingEmailChange = profileData?.pending_email_change || null;

      if (import.meta.env.DEV) {
        console.log("Email change request comparison:", {
          authEmail: currentAuthEmail,
          profileEmail: currentProfileEmail,
          pendingChange: pendingEmailChange,
          newRequestedEmail: newEmail,
        });
      }

      // Critical logic for email comparison
      // When auth email and profile email are different, we want to allow changing
      // to either one to allow re-synchronizing state
      if (
        currentAuthEmail.toLowerCase() === newEmail.toLowerCase() &&
        currentProfileEmail.toLowerCase() === newEmail.toLowerCase()
      ) {
        throw new Error("New email address must be different from current one");
      }

      // If there's a pending change to this exact email already, prevent duplicate requests
      if (
        pendingEmailChange &&
        pendingEmailChange.toLowerCase() === newEmail.toLowerCase()
      ) {
        throw new Error(
          "You already have a pending change to this email address. Please check your inbox for the verification link.",
        );
      }

      // Track email change in the specialized tracking table (gracefully handling missing table)
      try {
        // First check if the table exists before trying to use it
        const { error: tableCheckError } = await supabase
          .from("email_change_tracking")
          .select("id", { count: "exact", head: true });

        // If the table exists, track the change
        if (!tableCheckError || tableCheckError.code !== "PGRST204") {
          const { error: trackingError } = await supabase
            .from("email_change_tracking")
            .upsert(
              {
                user_id: user.id,
                old_email: currentProfileEmail || currentAuthEmail, // Use profile email primarily, fallback to auth email
                new_email: newEmail,
                requested_at: new Date().toISOString(),
                status: "pending",
                auth_provider: isGoogleUser ? "google" : "email",
              },
              {
                onConflict: "user_id",
                ignoreDuplicates: false,
              },
            );

          if (trackingError) {
            console.warn(
              "Email change tracking insert failed (continuing anyway):",
              trackingError,
            );
          } else {
            if (import.meta.env.DEV) {
              console.log("Email change tracking record created successfully");
            }
          }
        }
      } catch (trackingErr) {
        console.warn(
          "Email change tracking failed (continuing anyway):",
          trackingErr,
        );
        // Continue with the email update process
      }

      // Update the profile table to track the pending change
      try {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            pending_email_change: newEmail,
            email_change_requested_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileUpdateError) {
          console.warn(
            "Profile pending email update failed (continuing anyway):",
            profileUpdateError,
          );
        } else {
          if (import.meta.env.DEV) {
            console.log("Profile pending email change recorded successfully");
          }
        }
      } catch (profileErr) {
        console.warn(
          "Profile update failed (continuing anyway):",
          profileErr,
        );
      }

      // For Google users converting to email auth, we need to set a password first
      if (isGoogleUser && password) {
        if (import.meta.env.DEV) {
          console.log(
            "Google user converting to email auth - setting password first",
          );
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        });

        if (passwordError) {
          console.error("Error setting password for Google user:", passwordError);
          throw new Error(
            "Failed to set password. Please try again or contact support.",
          );
        }

        if (import.meta.env.DEV) {
          console.log("Password set successfully for Google user");
        }
      }

      // Update the email with Supabase
      const { error } = await supabase.auth.updateUser(
        {
          email: newEmail,
        },
        {
          emailRedirectTo: emailVerificationService.getEmailChangeRedirectUrl(),
        },
      );

      if (error) {
        console.error("Error updating email:", error);
        throw error;
      }

      if (import.meta.env.DEV) {
        console.log("Email update request sent successfully");
      }
    } catch (err) {
      console.error("Failed to update email:", err);
      throw err;
    }
  },

  /**
   * Register a new user
   * @param data Registration data
   * @returns Registration result with user data and email confirmation status
   */
  register: async (
    data: RegisterData,
  ): Promise<{ user: User | null; emailConfirmationRequired: boolean }> => {
    try {
      if (import.meta.env.DEV) {
        console.log("Registering new user:", data.email);
      }

      // Extract metadata from registration data
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username || data.email.split("@")[0],
        ...data.metadata,
      };

      // Register user with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
          emailRedirectTo:
            emailVerificationService.getEmailVerificationRedirectUrl("verification"),
        },
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      // Determine if email confirmation is required
      const emailConfirmationRequired =
        !!authData?.user && !authData?.user?.email_confirmed_at;

      return {
        user: authData?.user || null,
        emailConfirmationRequired,
      };
    } catch (err) {
      console.error("Error during registration:", err);
      throw err;
    }
  },

  /**
   * Send verification code to user's email
   * @param userId User ID
   * @param email Email address to send code to
   * @returns Response indicating success or failure
   */
  sendVerificationCode: async (
    userId: string,
    email: string,
  ): Promise<VerificationCodeResponse> => {
    try {
      if (import.meta.env.DEV) {
        console.log("Sending verification code to:", email);
      }

      // Check if we're in a test/development environment to show the code
      const isTestMode = import.meta.env.DEV || import.meta.env.MODE === "test";

      // Generate a verification code directly in the database
      try {
        // Try to use the generate_verification_code function if available
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "generate_verification_code",
          {
            p_user_id: userId,
            p_user_email: email,
            p_is_test_mode: isTestMode,
          },
        );

        let verificationCode: string;

        if (!rpcError && rpcData) {
          // RPC succeeded, store the code
          verificationCode = rpcData;
          if (import.meta.env.DEV) {
            console.log(
              `Verification code generated successfully${isTestMode ? " (test mode)" : ""} for user ${userId}`,
            );
          }
        } else {
          // If RPC failed (possibly older DB schema), fall back to direct method
          if (import.meta.env.DEV) {
            console.log("Falling back to direct verification code generation");
          }

          // Generate random 6-digit code
          verificationCode = Math.floor(
            100000 + Math.random() * 900000,
          ).toString();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour

          // The Supabase webhook will now trigger the Edge Function to send the email.
          // This frontend service is now only responsible for generating and storing the code,
          // and returning it in test mode for display.
          if (import.meta.env.DEV) {
            console.log(
              "[Info] Verification code generated. Email sending will be handled by webhook-triggered Edge Function.",
            );
          }

          // Expire any previous codes for this user
          await supabase
            .from("verification_codes")
            .update({ used: true })
            .eq("user_id", userId)
            .eq("used", false);

          // Insert new code
          const { error: insertError } = await supabase
            .from("verification_codes")
            .insert({
              user_id: userId,
              email: email,
              code: verificationCode,
              expires_at: expiresAt.toISOString(),
              used: false,
              is_test_mode: isTestMode,
            });

          if (insertError) {
            console.error("Error creating verification code:", insertError);
            return {
              success: false,
              error: "Failed to create verification code. Please try again.",
            };
          }

          console.log(
            `Verification code generated successfully${isTestMode ? " (test mode)" : ""} for user ${userId}`,
          );
        }
        // Return the code if in test mode, otherwise just success
        if (isTestMode) {
          return { success: true, code: verificationCode };
        } else {
          return { success: true };
        }
      } catch (generationError: unknown) {
        // Catch for the inner try block (code generation logic)
        console.error(
          "Error during verification code generation logic:",
          generationError,
        );
        return {
          success: false,
          error:
            "Failed to generate verification code due to an internal issue. Please try again.",
        };
      }
    } catch (err) {
      console.error("Error in sendVerificationCode:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to send verification code",
      };
    }
  },

  /**
   * Verify a code entered by the user
   * @param userId User ID
   * @param code Verification code
   * @returns Response indicating success or failure
   */
  verifyCode: async (
    userId: string,
    code: string,
  ): Promise<VerificationCodeResponse> => {
    try {
      if (import.meta.env.DEV) {
        console.log("Verifying code for user:", userId);
      }

      // Directly verify the code against the database
      const { data: codeData, error: dbError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("code", code)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (dbError || !codeData) {
        // Check if the code is expired
        const { data: expiredData } = await supabase
          .from("verification_codes")
          .select("*")
          .eq("user_id", userId)
          .eq("code", code)
          .eq("used", false)
          .lte("expires_at", new Date().toISOString())
          .single();

        if (expiredData) {
          return {
            success: false,
            error: "Verification code has expired. Please request a new one.",
          };
        }

        // Check if the code was already used
        const { data: usedData } = await supabase
          .from("verification_codes")
          .select("*")
          .eq("user_id", userId)
          .eq("code", code)
          .eq("used", true)
          .single();

        if (usedData) {
          return {
            success: false,
            error: "This verification code has already been used.",
          };
        }

        return {
          success: false,
          error: "Invalid verification code. Please check and try again.",
        };
      }

      // Mark code as used
      await supabase
        .from("verification_codes")
        .update({ used: true })
        .eq("id", codeData.id);

      // Update verification status in multiple places for redundancy
      const timestamp = new Date().toISOString();

      // 1. Update profile table
      try {
        await supabase
          .from("profiles")
          .update({
            email_verified: true,
            updated_at: timestamp,
          })
          .eq("id", userId);
      } catch (updateErr) {
        console.warn("Error updating profile verification status:", updateErr);
        // Continue despite error - we have multiple update points for redundancy
      }

      // 2. Update user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            email_verified: true,
            email_verified_at: timestamp,
          },
        });

        // Update user metadata in auth.users using admin API
        const { error: adminError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            // Note: We can't directly set email_confirmed_at as it's not in the AdminUserAttributes type
            // But we can update the user metadata to reflect verified status
            user_metadata: {
              email_verified: true,
              email_verified_at: timestamp,
            },
          },
        );

        if (adminError) {
          console.warn("Error updating auth user record:", adminError);
        }
      } catch (updateErr) {
        console.warn(
          "Error updating user metadata verification status:",
          updateErr,
        );
        // Continue despite error
      }

      return { success: true, message: "Email verified successfully" };
    } catch (err) {
      console.error("Error in verifyCode:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
    }
  },

  /**
   * Check verification code status
   * @param userId User ID
   * @param code Verification code
   * @returns Status of the verification code
   */
  checkCodeStatus: async (
    userId: string,
    code: string,
  ): Promise<VerificationCodeStatus> => {
    try {
      // Query the verification_codes table to check status
      const { data, error } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("code", code)
        .eq("used", false)
        .single();

      if (error) {
        return {
          isValid: false,
          isExpired: true,
          message: "Invalid verification code",
        };
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const isExpired = now > expiresAt;

      return {
        isValid: true,
        isExpired,
        message: isExpired
          ? "Verification code has expired"
          : "Verification code is valid",
      };
    } catch (err) {
      console.error("Error checking code status:", err);
      return {
        isValid: false,
        isExpired: false,
        message: "Error checking verification code status",
      };
    }
  },
}; 