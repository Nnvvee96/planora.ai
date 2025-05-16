/**
 * Public API for the auth feature
 * This file exports only what should be accessible to other parts of the application
 * It serves as the boundary for this feature
 */

// Export types that should be available to other features
import { User, AuthState, LoginCredentials, RegisterData } from './types/authTypes';
export type { User, AuthState, LoginCredentials, RegisterData };

// Export hooks that provide feature functionality to the rest of the app
export { useAuth } from './hooks/useAuth';

// Export services through a unified interface to maintain proper boundaries
import { authService } from './services/authService';
export { authService };

// In the future, we could export auth-specific components here
// export { LoginForm } from './components/LoginForm';
