/**
 * Email Verification Service
 *
 * Handles email verification flows and URL generation
 * Part of the auth service refactoring to improve maintainability
 */

/**
 * Email verification service
 * Handles email verification URLs and related utilities
 */
export const emailVerificationService = {
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

  /**
   * Get redirect URL for email change verification
   * @returns The full URL for email change verification redirect
   */
  getEmailChangeRedirectUrl: (): string => {
    return emailVerificationService.getEmailVerificationRedirectUrl("email-change");
  },

  /**
   * Get redirect URL for password reset
   * @returns The full URL for password reset redirect
   */
  getPasswordResetRedirectUrl: (): string => {
    return emailVerificationService.getEmailVerificationRedirectUrl("reset-password");
  },

  /**
   * Get redirect URL for email confirmation
   * @returns The full URL for email confirmation redirect
   */
  getEmailConfirmationRedirectUrl: (): string => {
    return emailVerificationService.getEmailVerificationRedirectUrl("confirmation");
  },
}; 