/**
 * Error Service
 *
 * Central service for standardized error handling.
 * Following Planora's architectural principles with feature-first organization.
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Error sources in the application
 */
export enum ErrorSource {
  AUTH = "auth",
  PROFILE = "profile",
  TRAVEL_PREFERENCES = "travel_preferences",
  DATABASE = "database",
  API = "api",
  UI = "ui",
  UNKNOWN = "unknown",
}

/**
 * Standardized error format
 */
export interface AppError {
  source: ErrorSource;
  severity: ErrorSeverity;
  code?: string;
  message: string;
  userMessage?: string;
  originalError?: unknown;
  timestamp: number;
}

/**
 * Error handling service
 * Provides standardized error creation, logging, and handling
 */
export const errorService = {
  /**
   * Create a standardized error object
   */
  createError: (params: {
    source: ErrorSource;
    severity: ErrorSeverity;
    code?: string;
    message: string;
    userMessage?: string;
    originalError?: unknown;
  }): AppError => {
    return {
      source: params.source,
      severity: params.severity,
      code: params.code,
      message: params.message,
      userMessage: params.userMessage || "An error occurred. Please try again.",
      originalError: params.originalError,
      timestamp: Date.now(),
    };
  },

  /**
   * Log an error with standardized format
   */
  logError: (error: AppError): void => {
    const logPrefix = `[${error.source.toUpperCase()}][${error.severity.toUpperCase()}]`;
    const timestamp = new Date(error.timestamp).toISOString();

    switch (error.severity) {
      case ErrorSeverity.INFO:
        console.info(`${timestamp} ${logPrefix} ${error.message}`);
        break;
      case ErrorSeverity.WARNING:
        if (import.meta.env.DEV) console.warn(`${timestamp} ${logPrefix} ${error.message}`);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        if (import.meta.env.DEV) console.error(`${timestamp} ${logPrefix} ${error.message}`);

        // Log original error details if available
        if (error.originalError) {
          if (import.meta.env.DEV) console.error("Original error:", error.originalError);
        }
        break;
    }
  },

  /**
   * Handle an error with standard logging and return user-friendly message
   */
  handleError: (params: {
    source: ErrorSource;
    severity: ErrorSeverity;
    code?: string;
    message: string;
    userMessage?: string;
    originalError?: unknown;
  }): string => {
    const error = errorService.createError(params);
    errorService.logError(error);
    return error.userMessage || "An error occurred. Please try again.";
  },

  /**
   * Convert any error to standardized format
   */
  normalizeError: (
    err: unknown,
    source: ErrorSource = ErrorSource.UNKNOWN,
  ): AppError => {
    if ((err as AppError).source && (err as AppError).severity) {
      return err as AppError;
    }

    let message = "Unknown error occurred";
    let userMessage = "Something went wrong. Please try again.";

    if (err instanceof Error) {
      message = err.message;

      // Extract more useful information for specific error types
      if (message.includes("permission denied")) {
        userMessage = "You don't have permission to perform this action.";
      } else if (message.includes("network")) {
        userMessage =
          "Network error. Please check your connection and try again.";
      } else if (message.includes("not found")) {
        userMessage = "The requested resource was not found.";
      } else if (message.includes("auth/")) {
        source = ErrorSource.AUTH;
        userMessage = "Authentication error. Please sign in again.";
      } else if (message.includes("timed out")) {
        userMessage = "The operation timed out. Please try again.";
      }
    } else if (typeof err === "string") {
      message = err;
    }

    return {
      source,
      severity: ErrorSeverity.ERROR,
      message,
      userMessage,
      originalError: err,
      timestamp: Date.now(),
    };
  },

  /**
   * Extract a user-friendly message from any error
   */
  getUserMessage: (err: unknown): string => {
    const normalizedError = errorService.normalizeError(err);
    return (
      normalizedError.userMessage || "Something went wrong. Please try again."
    );
  },
};
