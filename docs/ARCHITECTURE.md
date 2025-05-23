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
     ├── atoms/       # Fundamental building blocks
     │   ├── GradientButton.tsx  # Custom button variant
     │   └── Logo.tsx           # Application logo
     ├── molecules/   # Combinations of atoms
     │   ├── FeatureCard.tsx    # Feature showcase card
     │   └── OrbAnimation.tsx   # Animated background
     └── organisms/   # Complex UI sections
         ├── Footer.tsx         # Page footer
         ├── Navigation.tsx     # Main navigation
         └── ErrorBoundary.tsx  # Error boundary component
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
