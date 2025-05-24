# Planora.ai Developer Guide

This guide provides comprehensive information for developers working on the Planora.ai codebase. It explains our clean architecture principles, patterns, and tools to ensure consistent, maintainable code.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Coding Style Guide](#coding-style-guide)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Quick Start

1. **Set up your development environment**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Run architecture validation**
   ```bash
   npm run validate-arch
   ```

4. **Generate new components with our templates**
   ```bash
   # Create a new UI component (atom, molecule, organism, template)
   npm run scaffold:component
   
   # Create a new feature
   npm run scaffold:feature
   
   # Create a new service
   npm run scaffold:service
   
   # Create a new hook
   npm run scaffold:hook
   
   # Create a new integration hook
   npm run scaffold:integration
   ```

## Architecture Overview

Planora.ai follows a clean architecture pattern that combines:

1. **Feature-First Organization**: Business logic is organized by feature domain
2. **Atomic Design**: UI components follow a hierarchical organization
3. **Integration Hooks**: Features communicate through dedicated integration hooks
4. **Redux State Management**: Global state is managed through Redux

Our architecture creates clear boundaries between different parts of the system to ensure maintainability, scalability, and testability.

### Directory Structure

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
├── features/               # Feature-specific code organized by domain
│   ├── auth/                # Authentication feature
│   │   ├── api.ts           # Public API exports for the feature (boundary)
│   │   ├── types/           # Feature-specific type definitions
│   │   ├── components/      # Feature-specific components
│   │   ├── services/        # Feature-related services
│   │   ├── hooks/           # Custom React hooks for feature
│   │   └── utils/           # Utility functions for feature
│   │
│   ├── travel-planning/     # Travel planning feature
│   ├── travel-preferences/  # Travel preferences feature
│   └── user-profile/        # User profile feature
│
├── pages/                  # Page components that use features and UI components
├── store/                   # Global state management
│   ├── store.ts             # Redux store configuration
│   ├── slices/              # Redux slices organized by feature
│   └── hooks.ts             # Typed hooks for Redux
├── lib/                     # Shared utilities and services
├── hooks/                   # Shared React hooks
└── types/                   # Global type definitions
```

## Coding Style Guide

### Naming Conventions

#### Files and Directories
- **Feature directories**: kebab-case (`travel-preferences`)
- **Component files**: PascalCase (`UserProfile.tsx`)
- **Utility/hook files**: camelCase (`useAuth.ts`)
- **Test files**: `.test.ts` or `.spec.ts` suffix
- **Type files**: `.types.ts` or `.d.ts` suffix

#### Variables and Functions
- **Variables**: camelCase (`const userProfile`)
- **Constants**: UPPER_SNAKE_CASE (`const MAX_ITEMS = 10`)
- **Boolean variables**: prefix with `is`, `has`, `should` (`isLoading`, `hasError`)
- **Functions**: camelCase, verb-based names (`fetchUserData`, `handleSubmit`)
- **Event handlers**: prefix with `handle` (`handleClick`, `handleSubmit`)

### TypeScript Best Practices

- **Interfaces vs Types**: Use `interface` for public API definitions, `type` for unions, tuples, or complex types
- **Avoid `any`**: Use `unknown` when type is truly unknown, then narrow
- **Strict Mode**: Write code compatible with TypeScript's strict mode
- **Type Exports**: Export types and interfaces for reuse

### Component Design

#### Functional Components
- Use function declarations for components
- Destructure props at the top of the component
- Keep components small and focused on a single responsibility

```tsx
interface UserProfileProps {
  userId: string;
  onUpdate: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // Component implementation
}
```

#### Props and State
- Use TypeScript interfaces for props and state
- Keep state as local as possible
- Lift state up when needed by multiple components
- Use `useReducer` for complex state logic

### Styling
- Use Tailwind CSS for styling
- Keep styles scoped to components
- Use CSS variables for theming
- Follow BEM naming for custom CSS classes

### State Management
- **Local State**: `useState`, `useReducer`
- **Shared State**: Redux Toolkit
- **Server State**: RTK Query or React Query
- **Form State**: React Hook Form

### Error Handling
- Use Error Boundaries for UI errors
- Handle API errors gracefully
- Log errors appropriately
- Provide helpful error messages to users

## Development Workflow

### Branch Naming
- `feature/`: New features
- `fix/`: Bug fixes
- `refactor/`: Code refactoring
- `docs/`: Documentation updates
- `chore/`: Maintenance tasks

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Example:
```
feat(auth): add Google OAuth integration

- Add Google OAuth button component
- Implement auth flow with Supabase
- Add error handling and loading states

Closes #123
```

### Code Review Process
1. Create a pull request
2. Request review from at least one team member
3. Address all review comments
4. Ensure all tests pass
5. Get approval before merging

## Testing

### Unit Tests
- Test individual functions and components in isolation
- Use React Testing Library for component tests
- Mock external dependencies

### Integration Tests
- Test feature interactions
- Mock API calls
- Test user flows

### End-to-End Tests
- Test critical user journeys
- Use Cypress or Playwright
- Run in CI/CD pipeline

## Troubleshooting

### Common Issues
1. **Dependency Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install`

2. **Type Errors**
   - Check type definitions
   - Ensure all props are properly typed
   - Use type guards for complex types

3. **Build Failures**
   - Check for TypeScript errors
   - Ensure all required environment variables are set
   - Review recent changes for breaking changes

```
src/
├── ui/                      # UI components following atomic design
│   ├── atoms/               # Basic building blocks
│   ├── molecules/           # Combinations of atoms
│   ├── organisms/           # Complex UI sections
│   └── templates/           # Page layouts
│
├── features/                # Feature-specific code organized by domain
│   ├── auth/                # Authentication feature
│   │   ├── api.ts           # Public API exports
│   │   ├── types.ts         # Feature-specific types
│   │   ├── components/      # Feature-specific components
│   │   ├── services/        # Feature-related services
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   │
│   ├── travel-planning/     # Travel planning feature
│   └── user-profile/        # User profile feature
│
├── pages/                   # Page components
├── store/                   # Global state management
├── hooks/                   # Shared React hooks
│   └── integration/         # Feature integration hooks
│
├── styles/                  # Global styles
├── types/                   # Global TypeScript types
├── utils/                   # Shared utility functions
└── constants/               # Application constants
```

## Key Architectural Rules

1. **Feature Isolation**: Features must not import directly from other features
2. **Clean Communication**: Features communicate through integration hooks or Redux
3. **UI Independence**: UI components must not import from features
4. **Public APIs**: Each feature must export its functionality through an `api.ts` file
5. **No Index Files**: Always use descriptive file names, never `index.ts`
6. **Atomic UI**: UI components follow the atomic design methodology
7. **Services/UI Separation**: Services must not import UI components

## Adding New Features

When adding a new feature to Planora.ai:

1. **Generate the feature scaffold**
   ```bash
   npm run scaffold:feature
   ```

2. **Define your types**
   - Create clear TypeScript interfaces in `types.ts`

3. **Implement services and hooks**
   - Business logic goes in the `services/` directory
   - React hooks go in the `hooks/` directory

4. **Create feature-specific components**
   - Components used only by this feature go in the `components/` directory

5. **Create integration hooks**
   ```bash
   npm run scaffold:integration
   ```

6. **Export through the public API**
   - Only export what other features need in `api.ts`

7. **Validate your implementation**
   ```bash
   npm run validate-arch
   ```

## Working with UI Components

UI components follow atomic design principles:

1. **Atoms**: Basic building blocks (Button, Input, etc.)
2. **Molecules**: Combinations of atoms (Card, FormField, etc.)
3. **Organisms**: Complex UI components (Navigation, Footer, etc.)
4. **Templates**: Page layouts and structure

Use the scaffolding tool to create new components:
```bash
npm run scaffold:component
```

## Validation Tools

> **Note:** The dependency visualization files (`dependency-graph.svg` and `dependency-violations.html`) are intentionally excluded from version control. Run the commands below to generate them locally.

We enforce our architecture through several automated tools:

1. **Dependency Cruiser**: Validates architectural boundaries
   ```bash
   npm run check-arch
   ```

2. **ESLint Rules**: Enforces import patterns
   ```bash
   npm run lint
   ```

3. **Integration Tests**: Verifies cross-feature communication
   ```bash
   npm test -- --testPathPattern=src/__tests__/integration
   ```

4. **Git Hooks**: Prevents architectural violations from being committed

## Common Tasks

### Creating a Cross-Feature Integration

To allow features to communicate:

1. Create an integration hook:
   ```bash
   npm run scaffold:integration
   ```

2. Import only from the feature's public API:
   ```typescript
   import { someFunction } from '@/features/feature-name/featureNameApi';
   ```

3. Use the integration hook in other features:
   ```typescript
   import { useFeatureIntegration } from '@/hooks/integration/useFeatureIntegration';
   ```

### Adding Global State

For state that needs to be shared across features:

1. Create a Redux slice in the appropriate feature
2. Export the slice from the feature's `api.ts`
3. Add the slice to the root reducer in `src/store/store.ts`
4. Access the state through integration hooks

## Testing Architecture Compliance

### Automated Architecture Validation

Run the full architecture validation suite:
```bash
npm run validate-arch
```

Visualize the dependency graph:
```bash
npm run visualize-deps
```

Generate a complete architecture report:
```bash
npm run arch:report
```

### Integration Testing

Integration tests verify that features communicate correctly through their designated boundaries:

```bash
# Run all integration tests
npm test -- --testPathPattern=src/__tests__/integration

# Run specific integration tests
npm test -- --testMatch="**/authIntegrationTest.ts"
```

Integration tests validate that:

1. Features only expose their public APIs through `api.ts`
2. Features communicate through integration hooks only
3. No direct cross-feature imports exist
4. UI components don't directly import from features

### Write Your Own Integration Tests

To create a new integration test:

1. Add a new test file to `src/__tests__/integration/`
2. Import the necessary test utilities from `testSetup.tsx`
3. Test that features properly interact through integration hooks

Example integration test:

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { createTestWrapper, RootState } from './testSetup';
import { useMyFeatureIntegration } from '@/hooks/integration/useMyFeatureIntegration';

describe('My Feature Integration', () => {
  it('should maintain proper architectural boundaries', () => {
    // Test setup with mock state
    const preloadedState: Partial<RootState> = {
      /* Your test state */
    };
    
    // When using the integration hook
    const { result } = renderHook(
      () => useMyFeatureIntegration(),
      { wrapper: createTestWrapper(preloadedState) }
    );
    
    // Then it should expose only the public interface
    const expectedKeys = ['featureData', 'actions'];
    const actualKeys = Object.keys(result.current);
    
    expectedKeys.forEach(key => {
      expect(actualKeys).toContain(key);
    });
    
    // Should not expose internal implementation
    expect(actualKeys.length).toBe(expectedKeys.length);
  });
});
```

## Troubleshooting

### Architecture Validation Errors

If you see architecture validation errors:

1. Check for forbidden cross-feature imports
2. Ensure UI components don't import from features
3. Verify that features only export through their public API
4. Make sure there are no index.ts files

### ESLint Errors

If you see ESLint errors about architecture:

1. Check import paths for architectural violations
2. Use integration hooks for cross-feature communication
3. Import only from public APIs

## Additional Resources

- [Architecture Decision Records](./ADR.md)
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
