/**
 * Error Handling API
 *
 * Public API for error handling functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

export {
  errorService,
  ErrorSeverity,
  ErrorSource,
} from "./services/errorService";

export type { AppError } from "./services/errorService";
