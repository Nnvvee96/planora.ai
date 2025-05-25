/**
 * Auth Feature API Boundary
 * 
 * This file serves as the public API boundary for the auth feature.
 * Other features should only import from this file, not from internal auth files.
 * Following Planora's architectural principles with feature-first organization.
 */

import { authApi, getAuthService, type AuthService } from './authApi';
import { AuthProviderType } from './types/authTypes';

// Re-export what should be publicly available
export { 
  authApi,
  getAuthService,
  AuthProviderType
};

// Re-export types
export type { AuthService };

// Default export is not allowed by Planora's architectural principles
