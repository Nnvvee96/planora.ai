/**
 * Profile Mappers
 * 
 * Data transformation utilities for converting between database and application profile formats
 */

import type { UserProfile, DbUserProfile } from "../../types/profileTypes";

/**
 * Converts snake_case database profile to camelCase application profile
 */
export const mapDbProfileToUserProfile = (dbProfile: DbUserProfile): UserProfile => {
  // Get the birthdate value (now the standardized field)
  const dateValue = dbProfile.birthdate || null;

  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name || "",
    lastName: dbProfile.last_name || "",
    email: dbProfile.email,
    avatarUrl: dbProfile.avatar_url,
    // Standard field for birth date information
    birthdate: dateValue,
    // Location data - map from database column names
    country: dbProfile.general_country || undefined,
    city: dbProfile.general_city || undefined,
    customCity: dbProfile.custom_city || undefined,
    // Onboarding departure location mapping
    onboardingDepartureCountry:
      dbProfile.onboarding_departure_country || undefined,
    onboardingDepartureCity: dbProfile.onboarding_departure_city || undefined,
    isBetaTester: dbProfile.is_beta_tester || false,
    hasCompletedOnboarding: dbProfile.has_completed_onboarding,
    emailVerified: dbProfile.email_verified,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
};

/**
 * Converts camelCase application profile to snake_case database profile
 * Standardizes on using birthdate as the single date field in the database
 */
export const mapUserProfileToDbProfile = (
  profile: Partial<UserProfile>,
): Partial<DbUserProfile> => {
  const dbProfile: Partial<DbUserProfile> = {};

  if (profile.id !== undefined) dbProfile.id = profile.id;
  if (profile.firstName !== undefined) dbProfile.first_name = profile.firstName;
  if (profile.lastName !== undefined) dbProfile.last_name = profile.lastName;
  if (profile.email !== undefined) dbProfile.email = profile.email;
  if (profile.avatarUrl !== undefined) dbProfile.avatar_url = profile.avatarUrl;

  // Standardize on birthdate field, use only birthdate as the standard field
  const dateValue = profile.birthdate;

  // Add date to DB model if provided
  if (dateValue) {
    dbProfile.birthdate = dateValue;
  }

  // Location data - map to correct database column names
  if (profile.country !== undefined)
    dbProfile.general_country = profile.country;
  if (profile.city !== undefined) dbProfile.general_city = profile.city;
  if (profile.customCity !== undefined)
    dbProfile.custom_city = profile.customCity;

  // Onboarding departure location mapping
  if (profile.onboardingDepartureCountry !== undefined)
    dbProfile.onboarding_departure_country = profile.onboardingDepartureCountry;
  if (profile.onboardingDepartureCity !== undefined)
    dbProfile.onboarding_departure_city = profile.onboardingDepartureCity;

  if (profile.isBetaTester !== undefined)
    dbProfile.is_beta_tester = profile.isBetaTester;
  if (profile.hasCompletedOnboarding !== undefined)
    dbProfile.has_completed_onboarding = profile.hasCompletedOnboarding;
  if (profile.emailVerified !== undefined)
    dbProfile.email_verified = profile.emailVerified;

  return dbProfile;
};
