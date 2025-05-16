# Planora.ai Architecture Guide

This document outlines the architectural principles and patterns used in the Planora.ai codebase. All contributors should follow these guidelines to maintain consistency and code quality.

## Core Architectural Principles

### 1. Feature-First Organization

Code is organized by feature domain, not by technical role. Each feature has its own directory with the following structure:

```
features/
└── feature-name/
    ├── api.ts             # Public API boundary for the feature
    ├── components/        # Feature-specific UI components
    ├── hooks/             # Feature-specific hooks
    ├── services/          # Feature-specific business logic
    ├── adapters/          # Integration with external services
    ├── types/             # Feature-specific type definitions
    └── utils/             # Feature-specific utility functions
```

### 2. Separation of Concerns

- Each module, folder, and file must have a clear, single responsibility
- Business logic must be separated from UI components
- Data transformation must be separated from data presentation
- Database types must be separated from application types

### 3. Modular Design

- Components, services, hooks, and features must be isolated and reusable
- Minimize dependencies between modules
- Design for composition rather than inheritance

### 4. Type Safety

- Use TypeScript throughout the codebase
- Define proper interfaces for all data structures
- Avoid using `any` type whenever possible
- Create clear type mappings between database schema and application types

### 5. Export Patterns

- **NEVER** use default exports
- **ALWAYS** use named exports
- Export types alongside their related components or functions
- Maintain proper casing in imports

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
import { useAuth } from '@/features/auth/api';

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

We follow atomic design principles for UI components:

```
ui/
├── atoms/       # Fundamental building blocks
├── molecules/   # Combinations of atoms
├── organisms/   # Complex UI sections
└── templates/   # Page layouts
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
