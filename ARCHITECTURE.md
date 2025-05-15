# Planora Clean Architecture

This document outlines the clean architecture of the Planora travel planning application. The architecture is designed with the following principles in mind:

- **Separation of Concerns (SoC)**: Clear separation between UI, business logic, and data layers
- **Modular Design**: Components organized following the Atomic Design pattern
- **Feature-First Organization**: Code is primarily organized by feature, then by type
- **Feature Isolation**: Features must not directly depend on other features
- **Event-Driven Architecture**: Decoupled communication between UI and logic through events
- **Integration Layer**: Communication between features happens through integration hooks and the store
- **Descriptive Naming**: No generic index.ts files; every file must have a unique, descriptive name
- **Maintainability**: Focused on keeping the codebase maintainable and scalable
- **Future-Proof Design**: Prepared for AI agent integration in later phases

## Architecture Overview

Planora.ai follows a carefully designed architecture that emphasizes modularity, testability, and scalability. Our key architectural patterns include:

1. **Atomic Design for UI Components**: Breaking down the interface into atoms, molecules, organisms, and templates
2. **Feature-First Code Organization**: Grouping related functionality by domain features
3. **Clean Integration Boundaries**: Enforcing proper isolation between features through integration hooks
4. **Centralized State Management**: Using Redux for global state with feature-based slices
5. **Type Safety**: Leveraging TypeScript throughout the application for improved reliability

## Directory Structure

```
src/
├── ui/                      # UI components following atomic design
│   ├── atoms/               # Basic building blocks (Button, Input, etc.)
│   ├── molecules/           # Combinations of atoms (FormField, Card, etc.)
│   ├── organisms/           # Complex UI sections (Navigation, TravelCardList, etc.)
│   └── templates/           # Page layouts (DashboardLayout, AuthLayout, etc.)
│
├── features/                # Feature-specific code organized by domain
│   ├── auth/                # Authentication feature
│   │   ├── api.ts           # Public API exports for the feature (boundary)
│   │   ├── types.ts         # Feature-specific type definitions
│   │   ├── components/      # Feature-specific components
│   │   ├── services/        # Auth-related services
│   │   ├── hooks/           # Custom React hooks for auth
│   │   └── utils/           # Utility functions for auth
│   │
│   ├── travel-planning/     # Travel planning feature
│   │   ├── api.ts           # Public API exports for the feature
│   │   ├── types.ts         # Feature-specific type definitions
│   │   ├── components/      # Travel planning components 
│   │   ├── services/        # Travel planning services
│   │   ├── hooks/           # Custom hooks for travel planning
│   │   └── utils/           # Utility functions for travel planning
│   │
│   └── user-profile/        # User profile feature
│       ├── api.ts           # Public API exports for the feature
│       ├── types.ts         # Feature-specific type definitions
│       ├── components/      # User profile components
│       ├── services/        # User profile services
│       ├── hooks/           # Custom hooks for user profile
│       └── utils/           # Utility functions for user profile
│
├── pages/                   # Page components that use features and UI components
├── store/                   # Global state management
│   ├── store.ts             # Redux store configuration
│   ├── slices/              # Redux slices organized by feature
│   └── hooks/               # Custom hooks for state access
│
├── hooks/                   # Shared React hooks
│   └── integration/         # Feature integration hooks for cross-feature communication
│
├── styles/                  # Global styles and theme
├── types/                   # Global TypeScript type definitions
├── utils/                   # Shared utility functions
├── lib/                     # Third-party library wrappers
├── constants/               # Application constants
└── mocks/                   # Mock data for development
```

## Key Architecture Principles

1. **Feature-First Organization**: Code is primarily organized by feature domain (auth, travel-planning, user-profile)

2. **UI Component Isolation**: UI components are organized using atomic design principles and remain separate from business logic

3. **Unidirectional Data Flow**: Data flows from services through state management to components

4. **Clean Dependencies**: Lower levels of the architecture don't depend on higher levels:
   - Services don't import from UI components
   - Features don't import from other features (except through explicit integration points)
   - UI components don't directly use services (they use store/hooks instead)

5. **Reusability Through Composition**: Reuse is achieved through component composition rather than inheritance

## Import Rules

Follow these strict rules for imports to maintain architectural boundaries and ensure clean code organization:

1. **UI Components** can import from:
   - Other UI components at the same or lower level (e.g., organisms can import molecules and atoms)
   - `/styles/*`, `/utils/*`, `/types/*`, `/lib/*`
   - NEVER from `/features/*` or `/services/*`
   - Example: `import { Button } from '@ui/atoms/Button';`

2. **Feature Components** can import from:
   - UI components
   - The same feature module (services, hooks, utils within the same feature)
   - `/store/*`, `/hooks/*`, `/utils/*`, `/types/*`, `/constants/*`
   - NEVER from other features directly
   - Example: `import { authService } from '../services/authService';`

3. **Services** can import from:
   - Other services within the same feature
   - `/utils/*`, `/types/*`, `/constants/*`, `/lib/*`
   - NEVER from UI components or store directly
   - Example: `import { formatDate } from '@/utils/dateUtils';`

4. **Pages** can import from:
   - UI components
   - Features (ONLY through their public API exports)
   - `/store/*`, `/hooks/*`, `/utils/*`, `/types/*`
   - Example: `import { UserProfileMenu } from '@/features/user-profile/api';`

5. **Feature API Modules** must:
   - Export only what should be accessible to other parts of the application
   - Act as the boundary for the feature
   - Example: `export { default as TravelCards } from './components/TravelCards';`

6. **Path Aliases** should be used for clarity:
   - `@ui/*` for UI components
   - `@features/*` for feature modules
   - `@hooks/*`, `@utils/*`, `@types/*`, etc., for shared code

## Integration Strategy

Planora.ai uses a robust integration strategy to maintain loose coupling between features while enabling necessary communication. There are two primary mechanisms for cross-feature communication:

### 1. Integration Hooks

Integration hooks serve as the primary interface between features, acting as adapters that isolate implementation details:

```typescript
// Example: useAuthIntegration.ts in src/hooks/integration/
import { useAuth } from '@/features/auth/api';

export function useAuthIntegration() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  // Return a clean interface that other features can use
  return {
    isAuthenticated,
    loading,
    user,
    logout,
    // Only expose what's needed by other features
    userName: user?.username || '',
    userInitial: user?.username ? user.username.charAt(0).toUpperCase() : ''
  };
}
```

Features must NEVER import directly from other features. Instead, they should use these integration hooks:

```typescript
// WRONG: Direct import from another feature
import { useAuth } from '@/features/auth/hooks/useAuth';

// RIGHT: Import from integration hook
import { useAuthIntegration } from '@/hooks/integration/useAuthIntegration';
```

### 2. Redux Store as Communication Channel

The Redux store serves as a centralized state management system and a communication channel between features:

- Each feature can have its own slice in the Redux store
- Features dispatch actions and select state without direct dependencies
- The store holds shared application state that multiple features may need to access

Example of feature communication through the store:

```typescript
// Auth feature dispatches login action
dispatch(loginSuccess(userData));

// User profile feature consumes auth state
const { isAuthenticated } = useAppSelector(state => state.auth);
```

### 3. Feature API Boundaries

Each feature exposes a public API through its `api.ts` file, which serves as the boundary for the feature:

```typescript
// Example: features/auth/api.ts
export { useAuth } from './hooks/useAuth';
export type { User, AuthState } from './types';
// Only export what should be accessible
```

Pages and other parts of the application should only import from these feature APIs, never from the internal implementation details of a feature.

## Future Extensibility

This architecture is designed to support future phases of Planora:

1. **API Integration**: In future phases, mock services can be replaced with actual API calls
2. **AI Integration**: Planora agent services are organized to allow easy integration with AI backend
3. **Feature Expansion**: New features can be added as separate modules following the same pattern
