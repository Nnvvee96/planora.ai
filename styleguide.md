# Planora Coding Style Guide

This style guide outlines the conventions and best practices for the Planora codebase. Following these guidelines ensures consistency, maintainability, and adherence to our architectural principles.

## Table of Contents

1. [File Structure](#file-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript & Type Safety](#typescript--type-safety)
4. [Component Design](#component-design)
5. [State Management](#state-management)
6. [CSS & Styling](#css--styling)
7. [Testing](#testing)
8. [Common Patterns](#common-patterns)

## File Structure

### Directory Organization

We use a clean architecture approach that combines Atomic Design for UI components with Feature-First organization for business logic:

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
│   │   ├── services/        # Feature-related services
│   │   ├── hooks/           # Custom React hooks for feature
│   │   └── utils/           # Utility functions for feature
│   │
│   ├── travel-planning/     # Travel planning feature
│   ├── travel-preferences/  # Travel preferences feature
│   └── user-profile/        # User profile feature
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

### File Naming

- **Component Files**: Use PascalCase and name after the component (`Button.tsx`, not `index.tsx`)
- **Service Files**: Use camelCase (`authService.ts`, `cacheService.ts`)
- **Utility Files**: Use camelCase (`formatDate.ts`, `validation.ts`)
- **Type Files**: Use camelCase (`user.ts`, `travel.ts`)
- **Test Files**: Append `.test` or `.spec` (`Button.test.tsx`)

## Naming and Export Conventions

### Components and Exports

- **Component Names**: PascalCase (`Button`, `UserProfile`)
- **Component Props**: PascalCase + Props (`ButtonProps`)
- **Hooks**: camelCase prefixed with `use` (`useAuth`, `useFormField`)
- **Context**: PascalCase + Context (`UserContext`)
- **IMPORTANT**: Use named exports for all components, NOT default exports
  ```typescript
  // CORRECT
  export { Button };
  
  // INCORRECT
  export default Button;
  ```

### Variables and Functions

- **Variables**: camelCase (`userName`, `isVisible`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`MAX_ITEMS`)
- **Boolean Variables**: Prefix with is/has/should (`isLoading`, `hasError`)
- **Functions**: camelCase, verb-based naming (`calculateTotal`, `fetchUserData`)
- **Event Handlers**: Prefix with `handle` or `on` (`handleSubmit`, `onUserUpdate`)

### File Naming (Critical)

- **Never use generic index.ts files**
- Every file must have a descriptive name that reflects its purpose
- Maintain proper casing in imports (e.g., `Button.tsx` not `button.tsx`)

## TypeScript & Type Safety

- **Use TypeScript**: Always define types for props, state, and function parameters/returns
- **Type vs Interface**: Use interfaces for objects and classes, types for unions and aliases
- **Avoid `any`**: Use `unknown` when type is truly unknown, then narrow
- **Strict Mode**: Write code compatible with TypeScript's strict mode
- **Type Exports**: Export types and interfaces for reuse

### Example

```typescript
// Good
interface UserProps {
  name: string;
  age: number;
  role?: 'admin' | 'user';
}

function UserCard({ name, age, role = 'user' }: UserProps) {
  // ...
}

// Avoid
const UserCard = (props: any) => {
  const { name, age, role } = props;
  // ...
}
```

## Component Design

### Named Exports and Composition

Use named exports and composition to share code between components.

```tsx
// Good
const Button = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

export { Button };

// In another file:
import { Button } from '@/ui/atoms/Button';

const IconButton = ({ icon, children, ...props }) => {
  return (
    <Button {...props}>
      {icon}
      {children}
    </Button>
  );
};

export { IconButton };

// Avoid default exports and extending classes for components
```

### Props

- Pass only necessary props
- Use destructuring to extract props
- Provide default values when appropriate
- Use optional chaining (`?.`) for potentially undefined values

### State Management

- Use local state for UI-specific state
- Use Redux for global application state
- Prefer controlled components over uncontrolled when possible
- Extract complex state logic to custom hooks

## CSS & Styling

We use Tailwind CSS for styling:

- Follow the utility-first approach
- Use composition via `cn()` utility for conditional classes
- Create reusable component styles via `cva()`
- Extract complex sets of utilities to components

### Example

```tsx
const buttonVariants = cva(
  "px-4 py-2 rounded-md font-medium",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-secondary hover:bg-secondary/90",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

function Button({ variant, size, className, ...props }) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)} 
      {...props} 
    />
  );
}
```

## State Management

### Redux Structure

- Use Redux Toolkit slices for feature-based state management
- Keep selectors close to the state definitions
- Use thunks for async operations
- Use immer for immutable state updates (built into Redux Toolkit)

### Event-Driven Communication

- UI components dispatch actions
- Services handle business logic
- State changes trigger UI updates

## Testing

### Component Testing

- Test component rendering
- Test prop variations
- Test user interactions
- Test state changes
- Use React Testing Library
- Remember to use named imports in tests to match component exports:

```typescript
// Correct
import { Button } from '@/ui/atoms/Button';

test('Button should render correctly', () => {
  render(<Button>Click me</Button>);
  // assertions...
});
```

### Unit Testing

- Test utility functions
- Test service methods
- Test complex logic
- Aim for pure functions where possible

## Common Patterns

### Form Handling

- Use React Hook Form for complex forms
- Extract form logic to custom hooks
- Implement consistent validation

### API Calls

- Abstract API calls into service methods
- Handle loading states consistently
- Implement error handling with the ErrorService
- Use the CacheService to optimize performance

### Authentication

- Use the AuthService for all auth operations
- Protect routes requiring authentication
- Keep auth state in Redux

### Error Handling

- Use the centralized ErrorService
- Implement consistent error UI patterns
- Log errors appropriately

---

By following this style guide, we ensure a consistent, maintainable, and high-quality codebase that adheres to our architectural principles.
