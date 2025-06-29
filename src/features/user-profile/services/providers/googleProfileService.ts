/**
 * Google Profile Provider
 * 
 * Handles Google authentication data extraction and profile creation/updates
 */

import { supabase } from "@/lib/supabase/client";

/**
 * Function to extract name data from Google user metadata
 * @param user Supabase user with metadata
 * @returns Object with firstName and lastName extracted
 */
export const extractNameFromGoogleData = (user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): { firstName: string; lastName: string } => {
  const { user_metadata } = user;

  // Log the user metadata to see its structure
  console.log(
    "Extracting name from Google metadata:",
    JSON.stringify(user_metadata, null, 2),
  );

  // Extract first and last name from various possible Google metadata formats
  let firstName = "";
  let lastName = "";

  try {
    // Try to get from user_metadata.full_name (Google OAuth)
    if (
      user_metadata?.full_name &&
      typeof user_metadata.full_name === "string"
    ) {
      const nameParts = user_metadata.full_name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }
    // Try to get from user_metadata.name (Google OAuth)
    else if (user_metadata?.name && typeof user_metadata.name === "string") {
      const nameParts = user_metadata.name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }
    // Try to get from individual first_name and last_name fields
    else if (
      user_metadata?.first_name &&
      typeof user_metadata.first_name === "string"
    ) {
      firstName = user_metadata.first_name;
      lastName = (user_metadata.last_name as string) || "";
    }
    // Try to get from identities array (Google OAuth)
    else if (
      user_metadata?.identities &&
      Array.isArray(user_metadata.identities)
    ) {
      const googleIdentity = (
        user_metadata.identities as Array<{
          provider: string;
          identity_data?: {
            given_name?: string;
            first_name?: string;
            family_name?: string;
            last_name?: string;
          };
        }>
      ).find((identity) => identity.provider === "google");

      if (googleIdentity?.identity_data) {
        firstName =
          googleIdentity.identity_data.given_name ||
          googleIdentity.identity_data.first_name ||
          "";
        lastName =
          googleIdentity.identity_data.family_name ||
          googleIdentity.identity_data.last_name ||
          "";
      }
    }

    if (import.meta.env.DEV) {
      console.log(`Extracted name: ${firstName} ${lastName}`);
    }
  } catch (e) {
    console.error("Error extracting name from metadata:", e);
  }

  return { firstName, lastName };
};

/**
 * Updates a user profile with data from Google authentication
 * @param user User data from Supabase auth
 * @returns True if profile was successfully updated
 */
export const updateProfileWithGoogleData = async (user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<boolean> => {
  try {
    if (!user || !user.id) {
      console.error("Invalid user data for profile update");
      return false;
    }

    const { firstName, lastName } = extractNameFromGoogleData(user);

    // Check if a profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*, is_beta_tester")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing profile:", checkError);

      // Try to create a new profile if error suggests it doesn't exist
      if (
        checkError.code === "PGRST104" ||
        checkError.message?.includes("not found")
      ) {
        if (import.meta.env.DEV) {
          console.log(
            "Profile not found, creating new profile for Google user",
          );
        }

        const timestamp = new Date().toISOString();
        const emailVerified = true; // Google accounts are pre-verified

        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            email_verified: emailVerified,
            is_beta_tester: false,
            created_at: timestamp,
            updated_at: timestamp,
            // Standardize on birthdate field only
            birthdate: null,
          });

        if (insertError) {
          console.error(
            "Error creating profile for Google user:",
            insertError,
          );
          return false;
        }

        if (import.meta.env.DEV) {
          console.log("Successfully created profile for Google user");
        }
        return true;
      }

      return false;
    }

    if (existingProfile) {
      if (import.meta.env.DEV) {
        console.log("Updating existing profile with Google data");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName || existingProfile.first_name,
          last_name: lastName || existingProfile.last_name,
          email: user.email,
          email_verified: true, // Google accounts are pre-verified
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(
          "Error updating profile with Google data:",
          updateError,
        );
        return false;
      }

      if (import.meta.env.DEV) {
        console.log("Successfully updated profile with Google data");
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating profile with Google data:", error);
    return false;
  }
};
