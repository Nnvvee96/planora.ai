# Planora.ai Architecture Guide

This document outlines the architectural principles, patterns, and tools used in the Planora.ai codebase. All contributors should follow these guidelines to maintain consistency and code quality.

## Table of Contents

1. [Core Architectural Principles](#core-architectural-principles)
2. [Architecture Decision Records](#architecture-decision-records)
3. [Code Organization](#code-organization)
4. [Type Safety](#type-safety)
5. [Export and Import Patterns](#export-and-import-patterns)
6. [Architecture Maintenance Tools](#architecture-maintenance-tools)
7. [Configuration Files](#configuration-files)
8. [Refactoring Guidelines](#refactoring-guidelines)

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

## Architecture Decision Records

### ADR-001: Feature-First with Atomic Design

**Status**: Accepted

**Context**: We needed a clear architecture that would support scaling the application while keeping features isolated and UI components well-organized.

**Decision**: We've adopted a hybrid architecture that combines:
1. Feature-First organization for business logic and domain concerns
2. Atomic Design for UI components

**Consequences**:
- Features are encapsulated and have clear boundaries
- UI components are organized by complexity and reusability
- Cross-feature communication is formalized through integration hooks
- Maintenance and scalability are improved

### ADR-002: Feature Isolation and Integration Pattern

**Status**: Accepted

**Context**: Features need to communicate with each other without creating tight coupling.

**Decision**: We've implemented:
1. Each feature exposes a public API through an `api.ts` file
2. Integration hooks in `src/hooks/integration` facilitate cross-feature communication
3. The Redux store provides a centralized state for application-wide data

## Code Organization

### Directory Structure

```
planora.ai/
├── src/
│   ├── App.css             # Main application styles
│   ├── App.tsx             # Main application component
│   ├── __tests__/          # Test files (typically co-located or here)
│   ├── components/         # Third-party/library components
│   │   └── ui/             # Shadcn/UI components
│   ├── constants/          # Global constants
│   ├── database/           # Database structure, client, and functions
│   │   ├── client/         # Supabase client configuration
│   │   ├── functions/      # Supabase edge functions or DB functions
│   │   ├── schema/         # SQL schema and policies
│   │   └── databaseApi.ts  # API for database interactions
│   ├── features/           # Feature modules (auth, reviews, travel-planning, etc.)
│   ├── hooks/              # Custom React hooks (global or integration)
│   ├── lib/                # Shared utilities (e.g., cn utility)
│   ├── pages/              # Page components (e.g., LandingPage, ReviewsPage)
│   ├── store/              # State management (Redux)
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # Custom UI components (atomic design)
│   │   ├── atoms/          # Fundamental building blocks
│   │   ├── hooks/          # UI-specific hooks (not tied to a specific feature)
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

Each feature module should follow this structure:

```
feature-name/
├── featureNameApi.ts    # Public API boundary for the feature (standardized naming)
├── components/         # Feature-specific components
├── hooks/              # Feature-specific hooks
├── services/           # Business logic and data access
├── types/              # Type definitions
└── utils/              # Utility functions
```

> **Critical**: API boundary files MUST follow the standardized naming pattern `featureNameApi.ts` to ensure consistent imports and architectural validation.

## Type Safety

- Use TypeScript throughout the codebase
- Define proper interfaces for all data structures
- Avoid using `any` type whenever possible
- Create clear type mappings between database schema and application types
- Use type guards and discriminated unions for better type safety

## Export and Import Patterns

### Export Rules

- **NEVER** use default exports
- **ALWAYS** use named exports
- Export types alongside their related components or functions
- Maintain proper casing in imports

### Import Examples

```typescript
// Correct
export { Button };
export type { ButtonProps };

// Incorrect
export default Button;
```

### 6. File Naming Conventions

- **NEVER** use generic `index.ts` files
- Component files: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- Service/util files: camelCase (e.g., `authService.ts`, `formatDate.ts`)
- Type files: camelCase (e.g., `userTypes.ts`)

### 7. Cross-Feature Communication

- Features should only communicate through their public API boundaries (`api.ts`)
- Never import directly from another feature's internal files
- Use the Redux store for global state that needs to be shared between features

```typescript
// Correct
import { useAuth } from '@/features/auth/authApi';

// Incorrect
import { useAuth } from '@/features/auth/hooks/useAuth';
```

## Database & Type System

The Planora.ai application uses Supabase as its database. We maintain a strict typing system:

1. Database schema types are defined in `src/lib/supabase/supabaseTypes.ts`
2. Feature-specific types transform database types into application-specific types
3. Factory functions create application types from database rows

This ensures type safety and consistency throughout the application while maintaining a clean separation between database and application concerns.

## UI Component Architecture

### Component Structure

We use a hybrid approach for UI components:

1. **shadcn/ui Components** (`src/components/ui/`):
   - Standard UI components from shadcn/ui
   - Follow shadcn's conventions (kebab-case file names)
   - Used as the base UI layer
   - Example: `button.tsx`, `card.tsx`, `input.tsx`

2. **Custom Atomic Components** (`src/ui/`):
   - Custom components following atomic design
   - Use PascalCase file names
   - Build on top of shadcn/ui components when possible
   - Structure:
     ```
     ui/
       ├── atoms/          # Fundamental building blocks
       ├── molecules/      # Combinations of atoms
       ├── organisms/      # Complex UI sections
       └── hooks/          # UI-specific hooks (e.g., for complex non-feature related UI logic)
     ```

### When to Use Which


### Naming Conventions

- **shadcn/ui components**: kebab-case (e.g., `button.tsx`)
- **Custom components**: PascalCase (e.g., `Button.tsx`)
- **Component files**: Match the component name exactly

### When to Use Each

**Use shadcn components directly when:**
- You need a base component that will be wrapped in a custom component
- You're working within a custom component implementation

**Use custom components when:**
- Building application UI
- You need consistent styling and behavior
- You want to ensure design system compliance

### Importing Components

```typescript
// Import shadcn/ui base components (for custom component implementation)
import { Button as ShadcnButton } from '@/components/ui/button';

// Import custom components (for application use)
import { Button } from '@/ui/atoms/Button';
import { GradientButton } from '@/ui/atoms/GradientButton';
import { Input } from '@/ui/atoms/Input';
```

### Creating New Custom Components

When creating a new custom component that wraps a shadcn component:

1. Create the component in the appropriate `src/ui/` directory
2. Use PascalCase for the filename
3. Re-export any necessary types/variants from the base component
4. Add consistent styling and behavior
5. Document any additional props or behavior

Example (`src/ui/atoms/Button.tsx`):
```typescript
import { Button as ShadcnButton, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Button = ({
  className,
  ...props
}: ButtonProps) => (
  <ShadcnButton
    className={cn("gap-2", className)}
    {...props}
  />
)

export { buttonVariants } from "@/components/ui/button"
```

## Environment Configuration

- Environment variables must be defined in a `.env.example` file
- Never commit actual `.env` files to the repository
- Document required environment variables in the README

## Security Best Practices

- Never store API keys or JWT tokens in the codebase
- Always use environment variables for secrets
- Regularly rotate API keys and credentials
- Perform security audits using the provided `check-secrets.sh` script

## Architecture Maintenance Tools

### Dependency Cruiser

Planora uses [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser) to enforce architectural boundaries and prevent violations of our architecture principles. The configuration is located in `config/dependencies/.dependency-cruiser.cjs` (symlinked to root directory) and enforces:

- AI service isolation (future-proofing for AI features)
- Integration hooks pattern for cross-feature communication
- Prevention of circular dependencies
- Consistent state management approaches

The Dependency Cruiser is integrated with our CI/CD pipeline to automatically detect and reject architectural violations.

### ESLint Custom Rules

Custom ESLint rules are implemented to enforce architectural principles:

- Preventing direct database client usage in UI components
- Enforcing feature API boundaries
- Preventing circular dependencies
- Requiring named exports (no default exports)

### Code Generation with Plop.js

Planora uses Plop.js for code generation that follows our architectural principles. All templates and configuration are located in the `config/plop/` directory:

- Generate new features with proper structure (`npm run scaffold:feature`)
- Create UI components following atomic design (`npm run scaffold:component`)
- Create services with factory function pattern (`npm run scaffold:service`)
- Generate hooks for React logic (`npm run scaffold:hook`)
- Create integration hooks for cross-feature communication (`npm run scaffold:integration`)
- Ensure consistent file naming and export patterns
- Maintain type safety and architectural compliance

## Configuration Files

Planora's architecture is supported by various configuration files that maintain code quality and architectural integrity. These files are now organized in the `config/` directory with symbolic links to the root directory for compatibility:

### Configuration Directory Structure

```
config/
├── dependencies/       # Dependency management configuration
│   ├── .dependency-cruiser.cjs  # Architecture validation rules
│   ├── .npmrc          # NPM configuration
│   └── reports/        # Architecture validation reports
│       └── dependency-violations.html  # Generated dependency violation reports
│
├── deployment/         # Deployment configuration (e.g., for Cloudflare Pages)
│
├── linting/            # Code quality tools
│   └── .lintstagedrc.json  # Pre-commit lint configuration
│
└── plop/              # Code generation templates and configuration
    ├── plopfile.js    # Code generator configuration
    ├── ai-feature.hbs # AI feature template
    ├── api-client.hbs # API client template
    ├── component.hbs  # UI component template
    ├── feature-api.hbs # Feature API boundary template
    ├── feature-types.hbs # Feature types template
    ├── hook.hbs      # React hook template
    ├── integration-hook.hbs # Cross-feature integration hook template
    └── service.hbs   # Service template
```

### Configuration Files Reference

| File | Location | Purpose |
|------|----------|--------|
| `.dependency-cruiser.cjs` | `config/dependencies/` | Enforces architectural boundaries |
| `dependency-violations.html` | `config/dependencies/reports/` | Generated dependency violation reports |
| `.lintstagedrc.json` | `config/linting/` | Configures pre-commit linting for TypeScript and JavaScript files |
| `.npmrc` | `config/dependencies/` | Sets npm configuration (legacy-peer-deps=true) |
| `plopfile.js` | `config/plop/` | Code generator configuration (symlinked to root) |
| `*.hbs templates` | `config/plop/` | Code generation templates for features, components, etc. |
| `check-secrets.sh` | `config/deployment/` | Security script to prevent credential leakage |
| `tsconfig.*.json` | `config/typescript/` | TypeScript configuration files for different parts of the application |

These files work together to maintain Planora's architectural principles across the development lifecycle. See [Configuration Guide](./setup/configuration-guide.md) for detailed usage information.

## Refactoring Guidelines

When refactoring code in the Planora.ai codebase, follow these guidelines:

### UI Integrity Rule

- Never change UI design, layout, or behavior without explicit confirmation
- Preserve visual components, routes, states, and rendering behavior during refactoring
- Focus on internal architecture improvements without changing user-facing behavior

### Cross-Feature Communication

- Use integration hooks when features need to communicate
- Follow the factory function pattern to resolve circular dependencies
- Always communicate through API boundaries, never directly import from feature internals

### Database Abstraction

- Never use database clients directly in UI components
- Always abstract database operations behind service interfaces
- Ensure proper error handling and type safety in database operations
