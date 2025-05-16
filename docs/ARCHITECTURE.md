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
- **Consistent Exports**: All components use named exports (not default exports)
- **Casing Consistency**: PascalCase for components, camelCase for directories and files

## High-Level Architecture

```
┌────────────────────────────────────────┐
│                                        │
│               Pages                    │
│                                        │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│                                        │
│          Integration Hooks             │
│                                        │
└────┬─────────────────┬─────────────┬───┘
     │                 │             │
     ▼                 ▼             ▼
┌─────────┐     ┌─────────┐    ┌─────────┐
│         │     │         │    │         │
│ Feature │     │ Feature │    │ Feature │
│    A    │     │    B    │    │    C    │
│         │     │         │    │         │
└────┬────┘     └────┬────┘    └────┬────┘
     │               │              │
     └───────────────┼──────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│                                        │
│              UI Layer                  │
│     (Atoms, Molecules, Organisms)      │
│                                        │
└────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── ui/                      # Custom UI components following atomic design
│   ├── atoms/               # Basic building blocks (Button, Logo, etc.)
│   ├── molecules/           # Combinations of atoms (FeatureCard, TravelCards, etc.)
│   ├── organisms/           # Complex UI sections (Navigation, Footer, etc.)
│   └── templates/           # Page layouts (DashboardLayout, AuthLayout, etc.)
│
├── components/              # Third-party/library components
│   └── ui/                  # Low-level shadcn/ui components
│
├── features/                # Feature-specific code organized by domain
│   ├── auth/                # Authentication feature
│   │   ├── api.ts           # Public API exports for the feature (boundary)
│   │   ├── types/           # Feature-specific type definitions
│   │   │   ├── appTypes.ts  # Frontend application types
│   │   │   └── databaseTypes.ts # Database schema types
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
│   ├── travel-preferences/  # Travel preferences feature
│   │   ├── api.ts           # Public API exports for the feature
│   │   ├── types/           # Feature-specific type definitions
│   │   ├── components/      # Travel preferences components 
│   │   ├── services/        # Travel preferences services
│   │   ├── hooks/           # Custom hooks for travel preferences
│   │   └── utils/           # Utility functions for travel preferences
│   │
│   └── user-profile/        # User profile feature
│       ├── api.ts           # Public API exports for the feature
│       ├── types.ts         # Feature-specific type definitions
│       ├── components/      # User profile components
│       ├── services/        # User profile services
│       ├── hooks/           # Custom hooks for user profile
│       └── utils/           # Utility functions for user profile
│
├── pages/                   # Application pages
│   ├── LandingPage.tsx      # Landing page for unregistered users
│   ├── Dashboard.tsx        # Main dashboard for registered users
│   ├── Login.tsx            # Login page
│   └── ...                  # Other pages
│
├── hooks/                   # Global hooks
│   ├── integration/         # Feature integration hooks
│   │   ├── useAuthIntegration.ts
│   │   ├── useTravelPlanningIntegration.ts
│   │   ├── useTravelPreferencesIntegration.ts
│   │   └── useUserProfileIntegration.ts
│   ├── useMobile.tsx        # Responsive design hook
│   └── useToast.ts          # Toast notification hook
│
├── store/                   # Redux store
│   ├── slices/              # Redux slices for each feature
│   └── store.ts             # Store configuration
│
└── ...
```

## Architectural Principles in Practice

1. **Feature-First Organization**: Code is primarily organized by feature domain (auth, travel-planning, user-profile)

2. **UI Component Isolation**: UI components are organized using atomic design principles and remain separate from business logic

3. **Unidirectional Data Flow**: Data flows from services through state management to components

4. **Clean Dependencies**: Lower levels of the architecture don't depend on higher levels:
   - Services don't import from UI components
   - Features don't import from other features directly
   - UI components don't import from feature-specific components

## Import Rules and Dependencies

1. **UI Components** can import from:
   - Other UI components at the same or lower level (atoms, molecules, etc.)
   - `/utils/*`, `/constants/*`, `/hooks/*`
   - NEVER from `/features/*` or `/services/*`

2. **Feature Components** can import from:
   - UI components: `import { Button } from '@/ui/atoms/Button';`
   - shadcn components: `import { Dialog } from '@/components/ui/dialog';`
   - The same feature module (services, hooks, utils within the same feature)
   - `/store/*`, `/hooks/*`, `/utils/*`, `/types/*`, `/constants/*`
   - NEVER from other features directly

3. **Services** can import from:
   - Other services within the same feature
   - `/utils/*`, `/types/*`, `/constants/*`, `/lib/*`
   - NEVER from UI components or store directly

4. **Pages** can import from:
   - UI components: `import { Button } from '@/ui/atoms/Button';`
   - Features (ONLY through their public API exports): `import { UserProfileMenu } from '@/features/user-profile/api';`
   - `/store/*`, `/hooks/*`, `/utils/*`, `/types/*`

5. **Feature API Modules** must:
   - Export only what should be accessible to other parts of the application
   - Act as the boundary for the feature
   - Example: `export { TravelCards } from './components/TravelCards';`

6. **Path Aliases** should be used consistently:
   - `@/ui/*` for custom UI components
   - `@/components/*` for third-party/library components
   - `@/features/*` for feature modules
   - `@/hooks/*`, `@/utils/*`, `@/types/*`, etc., for shared code

## Cross-Feature Communication

Planora.ai uses a robust integration strategy to maintain loose coupling between features while enabling necessary communication. There are three primary mechanisms for cross-feature communication:

### 1. Feature API Boundaries (Primary Method)

Each feature exposes a public API through its `api.ts` file, which serves as the boundary for the feature:

```typescript
// Example: features/auth/api.ts
// Named exports only - no default exports
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
export type { User, AuthState } from './types/appTypes';
// Only export what should be accessible
```

Pages and other parts of the application should only import from these feature APIs, never from the internal implementation details of a feature.

```typescript
// CORRECT: Import from feature API
import { useAuth, authService } from '@/features/auth/api';

// INCORRECT: Direct import bypassing the API boundary
import { useAuth } from '@/features/auth/hooks/useAuth';
```

### 2. Integration Hooks (For Complex Cross-Feature Logic)

Integration hooks serve as adapters between features, isolating implementation details:

```typescript
// Example: useAuthIntegration.ts in src/hooks/integration/
import { useAuth } from '@/features/auth/api';
import { useUserProfile } from '@/features/user-profile/api';

export function useAuthIntegration() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { profile } = useUserProfile();
  
  // Return a clean interface that combines data from multiple features
  return {
    isAuthenticated,
    loading,
    user,
    logout,
    // Computed properties combining multiple features
    isProfileComplete: isAuthenticated && !!profile?.preferences,
    userName: user?.username || '',
    userInitial: user?.username ? user.username.charAt(0).toUpperCase() : ''
  };
}
```

### 3. Redux Store as Communication Channel

The Redux store serves as a centralized state management system and a communication channel between features:

- Each feature has its own slice in the Redux store
- Features dispatch actions and select state without direct dependencies
- The store holds shared application state that multiple features may need to access

Example of feature communication through the store:

```typescript
// Auth feature dispatches login action
dispatch(loginSuccess(userData));

// User profile feature consumes auth state
const { isAuthenticated } = useAppSelector(state => state.auth);
```

## Architectural Boundaries

Our architecture enforces strict boundaries to maintain code quality and separation of concerns:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        Application                            │
│                                                               │
├────────────┬────────────────────────┬───────────────────────┤
│            │                        │                       │
│   Pages    │    Integration Layer   │    UI Components      │
│            │                        │    (Atomic Design)    │
└──────┬─────┴─────────┬──────────────┴────────────┬──────────┘
       │               │                           │
       │      ┌────────▼────────┐                 │        
       │      │                 │                 │
       │      │  Feature API    │◄────── X ───────┘  <-- Forbidden Direct Import
       │      │    Boundary     │                      
       │      │                 │             
       │      └────────┬────────┘                 
       │               │                           
┌──────▼───────┬──────▼────────┬───────────────┐
│              │               │               │
│  Feature A   │   Feature B   │   Feature C   │     <-- Features cannot import
│              │               │               │         from each other directly
└──────────────┴───────────────┴───────────────┘
```

## Architecture Validation

We enforce these architectural boundaries through automated tools:

1. **Static Analysis**:
   - Dependency Cruiser validates import relationships
   - ESLint rules prevent invalid import patterns
   - TypeScript ensures type safety across boundaries

2. **Automated Testing**:
   - Integration tests verify proper cross-feature communication
   - Architecture tests ensure no boundaries are violated
   - Mock implementations allow testing in isolation

3. **CI/CD Pipeline**:
   - Architecture validation runs on every PR
   - Visual dependency graphs highlight violations
   - Detailed reports show architectural compliance

```
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│                   │    │                   │    │                   │
│  Pre-Commit Hook  │───►│   CI/CD Pipeline  │───►│  Dependency Graph │
│                   │    │                   │    │                   │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

## Future Extensibility

This architecture is designed to support future phases of Planora:

1. **API Integration**: In future phases, mock services can be replaced with actual API calls
2. **AI Integration**: Planora agent services are organized to allow easy integration with AI backend
3. **Feature Expansion**: New features can be added as separate modules following the same pattern

## File Naming Conventions

To maintain consistency throughout the codebase, we follow these naming conventions:

1. **No Generic Names**: Never use generic names like `index.ts`. Every file must have a descriptive name.
2. **Component Files**: Use PascalCase for component files (e.g., `Button.tsx`, `UserProfile.tsx`)
3. **Service/Utility Files**: Use camelCase for services and utilities (e.g., `authService.ts`, `dateUtils.ts`)
4. **Hook Files**: Use camelCase with "use" prefix (e.g., `useAuth.ts`, `useTravelPreferences.ts`)
5. **Type Files**: Use camelCase for type files (e.g., `userTypes.ts`, `travelPreferencesTypes.ts`)
6. **Directory Names**: Use kebab-case for directory names (with exceptions for established patterns)

These conventions ensure clear identification of file purposes and maintain a clean, consistent codebase structure.
