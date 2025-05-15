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

## Directory Structure

```
src/
├── ui/                  # UI components following atomic design
│   ├── atoms/           # Basic building blocks (Button, Input, etc.)
│   ├── molecules/       # Combinations of atoms (FormField, Card, etc.)
│   ├── organisms/       # Complex UI sections (Navigation, TravelCardList, etc.)
│   └── templates/       # Page layouts (DashboardLayout, AuthLayout, etc.)
│
├── features/            # Feature-specific code organized by domain
│   ├── auth/            # Authentication feature
│   │   ├── components/  # Feature-specific components
│   │   ├── services/    # Auth-related services
│   │   ├── hooks/       # Custom React hooks for auth
│   │   └── utils/       # Utility functions for auth
│   │
│   ├── travel-planning/ # Travel planning feature
│   └── user-profile/    # User profile feature
│
├── pages/               # Page components that use features and UI components
├── store/               # Global state management
│   ├── slices/          # Redux slices organized by feature
│   └── hooks/           # Custom hooks for state access
│
├── hooks/               # Shared React hooks
├── styles/              # Global styles and theme
├── types/               # TypeScript type definitions
├── utils/               # Shared utility functions
├── lib/                 # Third-party library wrappers
├── constants/           # Application constants
└── mocks/               # Mock data for development
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

Follow these rules for imports to maintain architectural boundaries:

1. UI components can import from:
   - Other UI components at the same or lower level
   - `/styles/*`, `/utils/*`, `/types/*`
   - NEVER from `/features/*` or `/services/*`

2. Feature components can import from:
   - UI components
   - The same feature module (services, hooks, utils within the same feature)
   - `/store/*`, `/hooks/*`, `/utils/*`, `/types/*`
   - NEVER from other features directly

3. Services can import from:
   - Other services within the same feature
   - `/utils/*`, `/types/*`, `/constants/*`
   - NEVER from UI components or store

4. Pages can import from:
   - UI components
   - Features (through their public exports)
   - `/store/*`, `/hooks/*`, `/utils/*`

5. Integration between features:
   - Features must NEVER import directly from other features
   - Use the integration hooks in `/hooks/integration/*` to access functionality from other features
   - Use the store (Redux) as a communication channel between features
   - Define clear boundaries and minimal interfaces for cross-feature interactions

## Integration Strategy

Features communicate with each other through the store (Redux) or through explicit integration points. This maintains loose coupling between features.

For example:
- Auth feature provides authentication status to other features through the store
- Travel planning feature interacts with the user profile through dedicated hooks

## Future Extensibility

This architecture is designed to support future phases of Planora:

1. **API Integration**: In future phases, mock services can be replaced with actual API calls
2. **AI Integration**: Planora agent services are organized to allow easy integration with AI backend
3. **Feature Expansion**: New features can be added as separate modules following the same pattern
