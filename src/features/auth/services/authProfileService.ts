/**
 * Authentication Profile Service
 * 
 * Handles profile operations specifically related to authentication flows
 * Extracted from oversized supabaseAuthService.ts for better maintainability
 */

import { supabase } from "@/lib/supabase/client";

export const authProfileService = {
  /**
   * Extract first name from user metadata
   * @param metadata User metadata from authentication provider
   * @returns Extracted first name
   */
  extractFirstName: (metadata: Record<string, unknown>): string => {
    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find(
        (identity: Record<string, unknown>) => identity.provider === "google",
      );

      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data;
        if (data.given_name) return data.given_name as string;
        if (data.first_name) return data.first_name as string;
        
        // Try to extract from full name
        if (data.name) {
          const nameParts = (data.name as string).split(" ");
          return nameParts[0] || "";
        }
      }
    }

    // Fallback to direct metadata fields
    if (metadata.given_name) return metadata.given_name as string;
    if (metadata.first_name) return metadata.first_name as string;

    // Try name field as final fallback
    if (metadata.name) {
      const nameParts = (metadata.name as string).split(" ");
      return nameParts[0] || "";
    }

    // Try full_name as backup
    if (metadata.full_name) {
      const nameParts = (metadata.full_name as string).split(" ");
      return nameParts[0] || "";
    }

    return "";
  },

  /**
   * Extract last name from user metadata
   * @param metadata User metadata from authentication provider
   * @returns Extracted last name
   */
  extractLastName: (metadata: Record<string, unknown>): string => {
    // Try identities array first (most reliable for Google)
    if (metadata.identities && Array.isArray(metadata.identities)) {
      const googleIdentity = metadata.identities.find(
        (identity: Record<string, unknown>) => identity.provider === "google",
      );

      if (googleIdentity?.identity_data) {
        const data = googleIdentity.identity_data;
        if (data.family_name) return data.family_name as string;
        if (data.last_name) return data.last_name as string;
        
        // Try to extract from full name
        if (data.name) {
          const nameParts = (data.name as string).split(" ");
          return nameParts.slice(1).join(" ");
        }
      }
    }

    // Fallback to direct metadata fields
    if (metadata.family_name) return metadata.family_name as string;
    if (metadata.last_name) return metadata.last_name as string;

    // Try name field as final fallback
    if (metadata.name) {
      const nameParts = (metadata.name as string).split(" ");
      return nameParts.slice(1).join(" ");
    }

    // Try full_name as backup
    if (metadata.full_name) {
      const nameParts = (metadata.full_name as string).split(" ");
      return nameParts.slice(1).join(" ");
    }

    return "";
  },

  /**
   * Create or update user profile from Google authentication data
   * @param userId User ID
   * @param email User email
   * @param metadata User metadata from Google
   * @returns Success status
   */
  createGoogleUserProfile: async (
    userId: string,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<boolean> => {
    try {
      const timestamp = new Date().toISOString();
      
      // Extract names using the service methods
      const firstName = authProfileService.extractFirstName(metadata);
      const lastName = authProfileService.extractLastName(metadata);

      if (import.meta.env.DEV) {
        console.log("Creating/updating Google user profile:", {
          userId,
          email,
          firstName,
          lastName,
        });
      }

      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName || existingProfile.first_name,
            last_name: lastName || existingProfile.last_name,
            email: email,
            email_verified: true, // Google accounts are pre-verified
            updated_at: timestamp,
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile with Google data:", updateError);
          return false;
        } else {
          if (import.meta.env.DEV) {
            console.log("Successfully updated profile with Google data");
          }
          return true;
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            email_verified: true,
            is_beta_tester: false,
            has_completed_onboarding: false,
            created_at: timestamp,
            updated_at: timestamp,
          });

        if (insertError) {
          console.error("Error creating profile with Google data:", insertError);
          return false;
        } else {
          if (import.meta.env.DEV) {
            console.log("Successfully created profile with Google data");
          }
          return true;
        }
      }
    } catch (err) {
      console.error("Error in createGoogleUserProfile:", err);
      return false;
    }
  },

  /**
   * Update user metadata
   * @param metadata The metadata to update
   */
  updateUserMetadata: async (
    metadata: Record<string, unknown>,
  ): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        console.error("Error updating user metadata:", error);
        throw error;
      }
    } catch (err) {
      console.error("Failed to update user metadata:", err);
      throw err;
    }
  },

  /**
   * Check if user has completed onboarding
   */
  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }

    return data?.has_completed_onboarding || false;
  },
}; 