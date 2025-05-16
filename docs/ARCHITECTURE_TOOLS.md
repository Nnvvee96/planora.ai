# Planora Architecture Maintenance Tools

This document outlines the tools we've implemented to maintain our clean architecture principles and ensure code quality. These tools work together to enforce our architectural boundaries, prevent violations, and guide developers in creating code that follows our established patterns.

## Installed Architecture Tools

The following tools have been integrated into the project to enforce our architecture principles:

1. **Dependency Cruiser**: Validates architectural boundaries and prevents cross-feature dependencies
2. **ESLint**: Enforces coding standards and prevents improper imports
3. **Husky + Lint-Staged**: Prevents committing code that violates architectural rules
4. **Plop.js**: Generates code scaffolding that follows our architectural patterns
5. **Path Aliases**: Provides clear import paths that reinforce the architecture

These tools are configured to work together to maintain the integrity of our clean architecture.

## Core Architecture Principles

1. **Separation of Concerns**: Each module/folder has a clear, single responsibility
2. **Modular Design**: Components, services, hooks, and features are isolated and reusable
3. **Feature-First Organization**: Code is structured by feature for scalability and clarity
4. **Feature Isolation**: Features must not directly depend on other features
5. **No Redundancy**: No duplicated logic, folders, or components
6. **No Inconsistencies**: Uniform naming, folder structures, and file responsibilities
7. **Clean Naming**: No generic index.ts files; every file must have a unique, descriptive name
8. **Clean Code**: Code is easy to read, test, extend, and maintain
9. **Future-Proof Design**: Code follows best practices to support long-term scalability

## Implemented Tools

### 1. Dependency Analysis (dependency-cruiser)

Scans all files and folders to build a complete dependency graph and detect architectural violations.

```bash
# Check architectural dependencies
npm run check-arch

# Visualize dependencies
npm run visualize-deps
```

Configuration: `.dependency-cruiser.cjs`

### 2. Code Quality Enforcement (ESLint)

Enforces clean code, naming conventions, and style rules.

```bash
# Run linting
npm run lint

# Fix automatically fixable issues
npm run lint:fix
```

Configuration: `.eslintrc.json`

### 3. Pre-commit Validation (Husky + Lint-Staged)

Prevents commits that violate our architecture rules or introduce dirty code.

Configuration:
- `.husky/pre-commit`
- `.lintstagedrc`

### 4. Code Generation (Plop.js)

Scaffolds new code with the correct structure, naming, and folder placement.

```bash
# General scaffolding command
npm run scaffold

# Specific scaffolding commands
npm run scaffold:component  # Create UI component
npm run scaffold:feature    # Create feature module
npm run scaffold:service    # Create service
npm run scaffold:hook       # Create custom hook
```

Configuration: `plopfile.js` and templates in `plop-templates/`

### 5. Integration Layer (Feature Communication)

Custom hooks in `src/hooks/integration` provide a controlled way for features to interact without creating direct dependencies.

Example:
```typescript
// WRONG: direct import from another feature
import { useProfile } from '@/features/profile/hooks/useProfile';

// RIGHT: import from integration layer
import { useProfileIntegration } from '@/hooks/integration/useProfileIntegration';
```

### 6. Index File Renaming Tool

Helps identify and rename generic index.ts files to follow our naming conventions.

```bash
# Run the interactive renaming tool
npm run rename-index-files
```

### 7. Path Aliases (Import Clarity)

Configured in `tsconfig.json` to provide clean, explicit imports that reinforce our architecture.

Examples:
```typescript
// Explicitly import from a specific module
import { Button } from '@ui/atoms/Button';
import { useProfileIntegration } from '@hooks/integration/useProfileIntegration';
```

## Architecture Maintenance Commands

For regular maintenance, use these commands:

```bash
# Check architectural violations
npm run arch:check

# Fix common architectural issues
npm run arch:fix

# Visualize the dependency graph
npm run visualize-deps
```

## Development Workflow

When creating new code:

1. **Use code generators** to scaffold new components, features, etc.
   ```bash
   npm run scaffold
   ```

2. **Follow the integration layer pattern** for cross-feature communication
   - Create integration hooks for new features in `src/hooks/integration/`
   - Never import directly from other features

3. **Use descriptive file names** (never index.ts)
   - Name files after their primary export
   - Be explicit about file purpose

4. **Run architecture checks regularly**
   ```bash
   npm run check-arch
   ```

5. **Ensure pre-commit hooks are working**
   - They should block commits that violate our architecture
   - Don't bypass hooks with `--no-verify`

## Reference Documents

- `ARCHITECTURE.md`: Defines our architectural principles and structure
- `styleguide.md`: Defines our coding style conventions
- `ARCHITECTURE_REFACTORING_PLAN.md`: Plan for addressing existing violations
