/**
 * Service Utilities
 *
 * Shared utilities for service layer patterns including retry logic and monitoring hooks.
 * Following Planora's architectural principles for consistent service behavior.
 */

// Types for service utilities
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface MonitoringHooks {
  onStart?: (operation: string, params?: Record<string, unknown>) => void;
  onSuccess?: (operation: string, result?: unknown, duration?: number) => void;
  onError?: (operation: string, error: Error, duration?: number) => void;
  onRetry?: (operation: string, attempt: number, error: Error) => void;
}

// Default retry options
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503") ||
      error.message.includes("504")
    );
  },
};

// Default monitoring hooks (console-based for development)
const DEFAULT_MONITORING_HOOKS: MonitoringHooks = {
  onStart: (operation: string, params?: Record<string, unknown>) => {
    console.debug(`[Service] Starting ${operation}`, params ? { params } : "");
  },
  onSuccess: (operation: string, result?: unknown, duration?: number) => {
    console.debug(`[Service] ✅ ${operation} completed in ${duration}ms`);
  },
  onError: (operation: string, error: Error, duration?: number) => {
    console.error(
      `[Service] ❌ ${operation} failed after ${duration}ms:`,
      error.message,
    );
  },
  onRetry: (operation: string, attempt: number, error: Error) => {
    console.warn(
      `[Service] 🔄 ${operation} retry attempt ${attempt}:`,
      error.message,
    );
  },
};

/**
 * Calculates delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>,
): number {
  const exponentialDelay =
    options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
  return Math.min(jitteredDelay, options.maxDelay);
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for service operations
 * Implements exponential backoff with jitter and configurable retry conditions
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {},
  hooks: MonitoringHooks = {},
): Promise<T> {
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const monitoringHooks = { ...DEFAULT_MONITORING_HOOKS, ...hooks };

  const startTime = Date.now();
  let lastError: Error;

  // Start monitoring
  monitoringHooks.onStart?.(operationName);

  for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      // Success monitoring
      monitoringHooks.onSuccess?.(operationName, result, duration);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry =
        attempt < retryOptions.maxAttempts &&
        retryOptions.retryCondition(lastError);

      if (shouldRetry) {
        // Retry monitoring
        monitoringHooks.onRetry?.(operationName, attempt, lastError);

        // Calculate delay and wait
        const delay = calculateDelay(attempt, retryOptions);
        await sleep(delay);
      } else {
        // Final error monitoring
        const duration = Date.now() - startTime;
        monitoringHooks.onError?.(operationName, lastError, duration);

        // Throw the last error
        throw lastError;
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Combined retry and monitoring wrapper
 * The most comprehensive service operation wrapper
 */
export async function withRetryAndMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string,
  retryOptions: RetryOptions = {},
  monitoringHooks: MonitoringHooks = {},
): Promise<T> {
  return withRetry(operation, operationName, retryOptions, monitoringHooks);
}
