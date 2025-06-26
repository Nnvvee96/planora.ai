import { UserProfile, DbUserProfile } from "../types/profileTypes";

/**
 * Maps a database user profile (snake_case) to an application user profile (camelCase).
 * @param dbUser The user profile object from the database.
 * @returns The application-ready user profile object.
 */
export const mapDbUserToAppUser = (dbUser: DbUserProfile): UserProfile => ({
  id: dbUser.id,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name,
  email: dbUser.email,
  avatarUrl: dbUser.avatar_url,
  birthdate: dbUser.birthdate,
  country: dbUser.country,
  city: dbUser.city,
  customCity: dbUser.custom_city,
  isBetaTester: dbUser.is_beta_tester,
  hasCompletedOnboarding: dbUser.has_completed_onboarding,
  emailVerified: dbUser.email_verified,
  createdAt: dbUser.created_at,
  updatedAt: dbUser.updated_at,
  onboardingDepartureCountry: dbUser.onboarding_departure_country,
  onboardingDepartureCity: dbUser.onboarding_departure_city,
});
