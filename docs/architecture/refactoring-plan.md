# Architecture Refactoring Plan

This document outlines our plan to fix architectural violations and ensure the codebase adheres to our clean architecture principles. Many of these improvements have already been implemented during our architectural audit.

## Completed Refactoring Tasks

1. ✅ **Standardized Export Patterns** - Converted all components from default exports to named exports for consistency
2. ✅ **Fixed Import Casing Issues** - Ensured all imports use consistent casing (e.g., `Button.tsx` not `button.tsx`)
3. ✅ **Removed Redundant Type Files** - Consolidated duplicate type definitions into organized type folders
4. ✅ **Enhanced Feature API Boundaries** - Updated feature API files to properly export only what should be accessible

## Main Architectural Issues

We've detected 66 architectural violations, primarily:

1. Feature-to-feature imports (most common)
2. Services importing from UI components
3. Non-descriptive index.ts files

## Refactoring Approach

We'll tackle these issues systematically:

### 1. Cross-Feature Dependencies

**Problem**: Features directly importing from other features, creating tight coupling.

**Solution** (✅ Partially Implemented):
- Created clear feature API boundaries through api.ts files in each feature
- Established proper export patterns from feature APIs
- Set up a foundation for using integration hooks and Redux as communication channels

**Example**:
```typescript
// BEFORE (INCORRECT): Direct import from another feature's internal implementation
import { useProfile } from '@/features/profile/hooks/useProfile';

// AFTER (CORRECT): Import only from the feature's public API boundary
import { useProfile } from '@/features/profile/api';

// ALTERNATE (CORRECT): For complex cross-feature integration
import { useProfileIntegration } from '@/hooks/integration/useProfileIntegration';
```

### 2. Services Importing UI Components

**Problem**: Business logic depends on presentation, violating separation of concerns.

**Solution** (✅ Implemented):
- Enforced unidirectional data flow (UI depends on services, not vice versa)
- Established clear directory structure separating UI components from business logic
- Organized custom UI components in ui/ directory and library components in components/

**Example**:
```typescript
// BEFORE (INCORRECT): Service importing UI
import { ProfileCard } from '@/ui/organisms/ProfileCard';

// AFTER (CORRECT): Service only deals with data
const profileData = getProfileData();

// UI component imports the service
import { profileService } from '@/features/profile/api';
```

### 3. Non-Descriptive index.ts Files

**Problem**: Generic index.ts files hide component/module purpose and create confusing imports.

**Solution** (✅ Implemented):
- Renamed all index.ts files to be descriptive (e.g., Button.tsx)
- Updated all imports to use specific file names
- Added explicit architecture rule against using generic index.ts files

**Example**:
```typescript
// BEFORE (INCORRECT):
import Button from './components/index';

// AFTER (CORRECT):
import { Button } from '@/ui/atoms/Button';
```

**Additional Improvement** (✅ Implemented):
- Standardized on named exports (no default exports)
- Consistent import paths with proper casing

## Implementation Strategy

We've already made significant progress on our implementation strategy:

1. **Feature API Boundaries** (✅ Implemented):
   - Updated all feature API files to properly export types, components, and services
   - Standardized on named exports for consistent import patterns
   - Removed redundant type files and consolidated into organized type folders

2. **Store as Communication Medium** (🔄 In Progress):
   - Features communicate through Redux store when appropriate
   - Each feature should only dispatch actions and select state, not directly import other features

3. **Integration Hooks** (🔄 In Progress):
   - Create integration hooks in `src/hooks/integration` to handle complex cross-feature logic
   - Use these hooks for functionality that spans multiple features

4. **Clean File Naming** (✅ Implemented):
   - Renamed files to use descriptive names (no index.ts)
   - Standardized casing in file names and import paths
   - Updated import statements throughout the codebase

## Remaining Tasks

1. 🔄 Complete the integration hooks for complex cross-feature communication
2. 🔄 Audit and verify all cross-feature dependencies use proper boundaries
3. 🔄 Ensure Redux store is properly structured for feature communication
4. 🔄 Add comprehensive test coverage for the refactored architecture

## Additional Guidelines

When continuing development:
- ✅ Use named exports only (no default exports)
- ✅ Never create circular dependencies
- ✅ Never use generic index.ts files
- ✅ Maintain consistent casing in file names and imports
- ✅ Add appropriate documentation to interfaces
- ✅ Use proper type exports alongside components and functions
- ✅ Use the path aliases defined in tsconfig.json
