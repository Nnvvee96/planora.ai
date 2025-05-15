# Architecture Refactoring Plan

This document outlines our plan to fix the architectural violations detected by dependency-cruiser and ensure the codebase adheres to our clean architecture principles.

## Main Architectural Issues

We've detected 66 architectural violations, primarily:

1. Feature-to-feature imports (most common)
2. Services importing from UI components
3. Non-descriptive index.ts files

## Refactoring Approach

We'll tackle these issues systematically:

### 1. Cross-Feature Dependencies

**Problem**: Features directly importing from other features, creating tight coupling.

**Solution**:
- Move shared logic to global services or util functions
- Use the store (Redux) as a communication channel between features
- Create clean integration points via hooks that abstract feature access

**Example**:
```typescript
// BEFORE: Direct import from another feature
import { useProfile } from '../profile/hooks/useProfile';

// AFTER: Import from a shared integration point
import { useProfileIntegration } from '@hooks/integration/useProfileIntegration';
```

### 2. Services Importing UI Components

**Problem**: Business logic depends on presentation, violating separation of concerns.

**Solution**:
- Enforce unidirectional data flow (UI depends on services, not vice versa)
- Extract any needed logic from UI components into services or hooks
- Ensure services only work with data and don't reference UI components

**Example**:
```typescript
// BEFORE: Service importing UI
import { ProfileCard } from '@ui/organisms/ProfileCard';

// AFTER: Service only deals with data
const profileData = getProfileData();
```

### 3. Non-Descriptive index.ts Files

**Problem**: Generic index.ts files hide component/module purpose and create confusing imports.

**Solution**:
- Rename all index.ts files to be descriptive (e.g., ButtonComponent.ts)
- Update all imports to use specific file names
- Configure ESLint to prevent creation of new index.ts files

**Example**:
```typescript
// BEFORE:
import { Button } from './components/Button';

// AFTER:
import { Button } from './components/ButtonComponent';
```

## Implementation Strategy

We'll take the following steps:

1. **Feature Interface Layer**:
   - Create integration hooks in `src/hooks/integration` to mediate feature access
   - Expose only necessary APIs from features through these hooks

2. **Store as Communication Medium**:
   - Refactor Redux store to serve as communication channel between features
   - Each feature should only dispatch actions and select state, not directly import other features

3. **Shared Services**:
   - Move genuinely shared logic to common services in `src/services`
   - Ensure these services don't create hidden dependencies between features

4. **Clean File Naming**:
   - Rename all index.ts files to descriptive names
   - Update import statements throughout the codebase

## Priority Order

1. Fix service-to-UI dependencies (most critical architectural violation)
2. Create feature interface/integration layer
3. Fix cross-feature dependencies 
4. Rename index.ts files

## Additional Guidelines

When refactoring:
- Never create circular dependencies
- Add appropriate documentation to interfaces
- Update tests to reflect the new architecture
- Use the path aliases defined in tsconfig.json
