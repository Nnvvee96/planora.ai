/**
 * Global Types
 * 
 * Contains shared types that are used across multiple features
 */

// Common type for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// Common pagination type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Generic status types for async operations
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

// Common error type
export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Supported languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja';

// Currency type
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';
