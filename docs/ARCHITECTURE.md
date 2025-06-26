# Planora.ai Architecture Guide

This document outlines the architectural principles, patterns, and tools used in the Planora.ai codebase. All contributors should follow these guidelines to maintain consistency and code quality.

## 🏆 **Current Status: Production-Ready Architecture**

The Planora.ai codebase has achieved **gold standard** architectural compliance with:
- **✅ Zero linting errors and warnings**
- **✅ Perfect TypeScript strict mode compliance**
- **✅ Enterprise-grade service layer with retry logic and monitoring**
- **✅ Comprehensive error handling patterns**
- **✅ Optimal development experience (Fast Refresh compatible)**
- **✅ Zero technical debt**

## Table of Contents

1. [Core Architectural Principles](#core-architectural-principles)
2. [Service Layer Architecture](#service-layer-architecture)
3. [Code Organization](#code-organization)
4. [Type Safety](#type-safety)
5. [Export and Import Patterns](#export-and-import-patterns)
6. [UI Component Architecture](#ui-component-architecture)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Architecture Maintenance Tools](#architecture-maintenance-tools)
9. [Configuration Files](#configuration-files)
10. [Refactoring Guidelines](#refactoring-guidelines)

## Core Architectural Principles

### 1. Feature-First Organization

Code is organized by feature domain, not by technical role. Each feature has its own directory with the following structure:

```
features/
└── feature-name/
    ├── featureNameApi.ts  # Public API boundary for the feature (standardized naming)
    ├── components/        # Feature-specific UI components
    ├── hooks/             # Feature-specific hooks
    ├── services/          # Feature-specific business logic
    ├── adapters/          # Integration with external services
    ├── types/             # Feature-specific type definitions
    └── utils/             # Feature-specific utility functions
```

> **Important**: Feature API files must follow the standardized naming pattern: `featureNameApi.ts` (kebab-case feature directory + PascalCase "Api" suffix). This is enforced by our architecture validation tools.

### 2. Separation of Concerns

- Each module, folder, and file must have a clear, single responsibility
- Business logic must be separated from UI components
- Data transformation must be separated from data presentation
- Database types must be separated from application types
- Utilities must be separated from components for Fast Refresh compatibility

### 3. Modular Design

- Components, services, hooks, and features must be isolated and reusable
- Minimize dependencies between modules
- Design for composition rather than inheritance
- Features must not directly depend on other features

### 4. No Redundancy

- Eliminate duplicated logic, folders, and components
- Shared functionality should be extracted to appropriate locations
- Avoid multiple implementations of the same concept

### 5. Clean Code and Naming

- Code must be easy to read, test, extend, and maintain
- No generic index.ts files; every file must have a unique, descriptive name
- Follow consistent naming conventions throughout the codebase

## Service Layer Architecture

### Enterprise-Grade Service Patterns

The Planora.ai service layer implements production-ready patterns for reliability and monitoring:

#### Service Utilities (`src/lib/serviceUtils.ts`)

All services use the `withRetryAndMonitoring` wrapper that provides:

```typescript
// Comprehensive service operation wrapper
export async function withRetryAndMonitoring<T>(
  operation: () => Promise<T>,
  config: ServiceConfig
): Promise<T>
```

**Features:**
- **Exponential Backoff with Jitter**: Prevents thundering herd problems
- **Smart Retry Logic**: Retries network/timeout errors, not business logic errors
- **Performance Monitoring**: Tracks operation timing and success/failure rates
- **Configurable Retry Conditions**: Different strategies for different error types
- **Error Boundaries**: Proper error boundaries with graceful degradation

#### Example Service Implementation

```typescript
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return withRetryAndMonitoring(
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data ? createUserProfileFromDatabase(data) : null;
    },
    {
      operationName: 'getUserProfile',
      maxRetries: 3,
      shouldRetry: (error) => isNetworkError(error) || isTimeoutError(error),
      onStart: () => console.log('Starting getUserProfile operation'),
      onSuccess: (result, metrics) => console.log('getUserProfile succeeded', metrics),
      onError: (error, metrics) => console.error('getUserProfile failed', error, metrics),
      onRetry: (attempt, error) => console.warn(`Retrying getUserProfile (attempt ${attempt})`, error)
    }
  );
}
```

#### Service Layer Benefits

- **Reliability**: Automatic retry for transient failures
- **Observability**: Comprehensive monitoring and logging
- **Performance**: Connection resilience and optimization
- **Maintainability**: Consistent patterns across all services
- **Scalability**: Built for production workloads

## Code Organization

### Directory Structure

```
planora.ai/
├── src/
│   ├── App.css             # Main application styles
│   ├── App.tsx             # Main application component
│   ├── components/         # Third-party/library components
│   │   └── ui/             # Shadcn/UI components (with separated utilities)
│   ├── constants/          # Global constants
│   ├── features/           # Feature modules (auth, reviews, travel-planning, etc.)
│   ├── hooks/              # Custom React hooks (global or integration)
│   │   └── integration/    # Cross-feature integration hooks
│   ├── lib/                # Shared utilities and configurations
│   │   ├── serviceUtils.ts # Enterprise service layer utilities
│   │   └── supabase/       # Supabase client setup and configuration
│   ├── pages/              # Page components (e.g., LandingPage, ReviewsPage)
│   ├── store/              # State management (Redux)
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # Custom UI components (atomic design)
│   │   ├── atoms/          # Fundamental building blocks
│   │   ├── hooks/          # UI-specific hooks
│   │   ├── molecules/      # Combinations of atoms
│   │   └── organisms/      # Complex UI sections
│   ├── utils/              # General utility functions
│   ├── index.css           # Global CSS entry point
│   ├── main.tsx            # Main application entry point
│   └── vite-env.d.ts       # Vite environment type definitions
├── config/                 # Configuration files (symlinked to root where needed)
├── docs/                   # Project documentation
└── public/                 # Static assets
```

### Feature Module Structure

Each feature module follows this standardized structure:

```
feature-name/
├── featureNameApi.ts    # Public API boundary (standardized naming)
├── components/          # Feature-specific components
├── context/             # Feature-specific contexts (separated for Fast Refresh)
├── hooks/               # Feature-specific hooks
├── services/            # Business logic with enterprise patterns
├── types/               # Type definitions
└── utils/               # Utility functions
```

## Type Safety

- **TypeScript Strict Mode**: Enabled throughout the codebase
- **No `any` Types**: All types are properly defined
- **Database Type Safety**: Clear mappings between database and application types
- **Type Guards**: Used for runtime type validation
- **Discriminated Unions**: For better type safety in complex scenarios

## Export and Import Patterns

### Export Rules (Strictly Enforced)

- **NEVER** use default exports
- **ALWAYS** use named exports
- Export types alongside their related components or functions
- Maintain proper casing in imports
- Separate utilities from components for Fast Refresh compatibility

### Examples

```typescript
// ✅ Correct - Component file
export { Button };
export type { ButtonProps };

// ✅ Correct - Utility file
export { buttonVariants };

// ❌ Incorrect - Mixed exports (breaks Fast Refresh)
export { Button, buttonVariants };

// ❌ Incorrect - Default export
export default Button;
```

### File Naming Conventions

- **NEVER** use generic `index.ts` files
- Component files: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- Service/util files: camelCase (e.g., `authService.ts`, `formatDate.ts`)
- Type files: camelCase (e.g., `userTypes.ts`)
- Utility files: camelCase (e.g., `buttonVariants.ts`, `useFormField.ts`)

### Cross-Feature Communication

- Features communicate only through their public API boundaries (`api.ts`)
- Never import directly from another feature's internal files
- Use integration hooks for complex cross-feature interactions
- Use the Redux store for global state that needs to be shared

```typescript
// ✅ Correct
import { useAuth } from '@/features/auth/authApi';

// ❌ Incorrect
import { useAuth } from '@/features/auth/hooks/useAuth';
```

## UI Component Architecture

### Fast Refresh Optimized Structure

We maintain **perfect Fast Refresh compatibility** by separating concerns:

#### Component/Utility Separation

```
components/ui/
├── button.tsx           # Component only
├── buttonVariants.ts    # Utility functions only
├── form.tsx            # Components only  
├── useFormField.ts     # Hooks only
└── ...
```

#### Component Structure Guidelines

1. **shadcn/ui Components** (`src/components/ui/`):
   - Standard UI components with utilities separated
   - Components in kebab-case files (e.g., `button.tsx`)
   - Utilities in camelCase files (e.g., `buttonVariants.ts`)
   - Hooks in camelCase files (e.g., `useFormField.ts`)

2. **Custom Atomic Components** (`src/ui/`):
   - Custom components following atomic design
   - Use PascalCase file names (e.g., `Button.tsx`)
   - Build on top of shadcn/ui components
   - Only export components from component files

### Import Patterns

```typescript
// Import shadcn/ui components and utilities
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { useFormField } from '@/components/ui/useFormField';

// Import custom components
import { GradientButton } from '@/ui/atoms/GradientButton';
import { Input } from '@/ui/atoms/Input';
```

## Error Handling Patterns

### Service Layer Error Handling

All services implement consistent error handling patterns:

```typescript
// Standardized error handling with retry logic
export async function serviceOperation(): Promise<Result> {
  return withRetryAndMonitoring(
    async () => {
      // Operation implementation
    },
    {
      operationName: 'serviceOperation',
      maxRetries: 3,
      shouldRetry: (error) => isRetriableError(error),
      onError: (error, metrics) => handleServiceError(error, metrics)
    }
  );
}
```

### Error Categories

- **Network Errors**: Automatically retried with exponential backoff
- **Timeout Errors**: Retried with jitter to prevent thundering herd
- **Business Logic Errors**: Not retried, handled gracefully
- **Authentication Errors**: Handled with user feedback and redirect

### Graceful Degradation

- Services provide fallback strategies for failures
- UI components handle loading and error states
- Critical operations have multiple retry attempts
- Non-critical operations fail silently with logging

## Architecture Maintenance Tools

### ESLint Custom Rules

Custom ESLint rules enforce architectural principles:

- **Feature API Boundaries**: Prevents direct cross-feature imports
- **Named Exports Only**: Eliminates default exports
- **Fast Refresh Compatibility**: Ensures component/utility separation
- **Database Abstraction**: Prevents direct database access in UI

### Dependency Cruiser

Enforces architectural boundaries and prevents violations:

- Integration hooks pattern for cross-feature communication
- Prevention of circular dependencies
- Consistent state management approaches
- Feature isolation enforcement

### Code Generation with Plop.js

Generates code following architectural principles:

- Features with proper structure (`npm run scaffold:feature`)
- UI components following atomic design (`npm run scaffold:component`)
- Services with enterprise patterns (`npm run scaffold:service`)
- Integration hooks (`npm run scaffold:integration`)

## Configuration Files

### Configuration Directory Structure

```
config/
├── dependencies/       # Dependency management configuration
├── deployment/         # Deployment configuration
├── linting/           # Code quality tools
│   └── eslint/        # Custom ESLint rules for architecture
└── plop/              # Code generation templates
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `eslint.config.js` | Enforces architectural principles |
| `enforce-architecture.js` | Custom ESLint rules |
| `.dependency-cruiser.cjs` | Architecture boundary enforcement |
| `serviceUtils.ts` | Enterprise service layer utilities |

## Refactoring Guidelines

### UI Integrity Rule

- Never change UI design, layout, or behavior without explicit confirmation
- Preserve visual components, routes, states, and rendering behavior during refactoring
- Focus on internal architecture improvements without changing user-facing behavior

### Service Layer Refactoring

- All services must use the `withRetryAndMonitoring` wrapper
- Implement proper error handling and retry logic
- Add performance monitoring to critical operations
- Ensure graceful degradation for failures

### Component Refactoring

- Maintain Fast Refresh compatibility by separating utilities
- Keep components focused on rendering logic only
- Extract hooks and utilities to separate files
- Follow naming conventions strictly

### Cross-Feature Communication

- Use integration hooks when features need to communicate
- Always communicate through API boundaries
- Never directly import from feature internals
- Follow the factory function pattern to resolve circular dependencies

---

## 🎯 **Architecture Achievement Summary**

The Planora.ai architecture represents a **production-ready, enterprise-grade** codebase with:

### ✅ **Quality Metrics**
- **Zero** linting errors and warnings
- **100%** TypeScript strict mode compliance
- **Perfect** Fast Refresh compatibility
- **Comprehensive** error handling coverage

### ✅ **Enterprise Patterns**
- **Robust service layer** with retry logic and monitoring
- **Graceful degradation** for all failure scenarios
- **Performance optimization** for critical operations
- **Scalable architecture** for future growth

### ✅ **Developer Experience**
- **Optimal development workflow** with Fast Refresh
- **Consistent code patterns** across all features
- **Automated quality enforcement** via ESLint and tools
- **Clear architectural boundaries** and communication patterns

This architecture provides a solid foundation for continued feature development and scaling of the Planora.ai application.
