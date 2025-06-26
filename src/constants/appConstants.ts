/**
 * Application-wide constants
 */

// Application settings
export const APP_NAME = "Planora";
export const APP_VERSION = "1.0.0";

// API settings
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || window.location.origin; // Uses env or current origin
export const API_TIMEOUT = 30000; // 30 seconds

// Auth constants

export const AUTH_TOKEN_KEY = "planora_auth_token";
export const REFRESH_TOKEN_KEY = "planora_refresh_token";
export const SESSION_EXPIRY_KEY = "planora_session_expiry";

// UI settings
export const TOAST_AUTO_CLOSE_DURATION = 5000; // 5 seconds
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Feature flags
export const FEATURES = {
  AI_CHAT: true,
  TRAVEL_RECOMMENDATIONS: true,
  MULTI_DESTINATION_PLANNING: true,
  ITINERARY_SHARING: true,
  BUDGET_TRACKING: true,
};
