# Planora.ai Architecture Diagram

This document provides a visual representation of the Planora.ai clean architecture.

## High-Level Architecture

```
┌────────────────────────────────────────┐
│                                        │
│               Pages                    │
│                                        │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│                                        │
│          Integration Hooks             │
│                                        │
└────┬─────────────────┬─────────────┬───┘
     │                 │             │
     ▼                 ▼             ▼
┌─────────┐     ┌─────────┐    ┌─────────┐
│         │     │         │    │         │
│ Feature │     │ Feature │    │ Feature │
│    A    │     │    B    │    │    C    │
│         │     │         │    │         │
└────┬────┘     └────┬────┘    └────┬────┘
     │               │              │
     └───────────────┼──────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│                                        │
│              UI Layer                  │
│     (Atoms, Molecules, Organisms)      │
│                                        │
└────────────────────────────────────────┘
```

## Feature Module Structure

Each feature follows this internal structure:

```
feature/
 ├── api.ts                # Public exports
 ├── types.ts              # Feature-specific types
 ├── components/           # Feature-specific UI components
 │   ├── FeatureDetail.tsx
 │   └── FeatureList.tsx
 ├── services/             # Business logic
 │   └── featureService.ts
 ├── hooks/                # React hooks
 │   └── useFeature.ts
 └── utils/                # Feature-specific utilities
     └── featureUtils.ts
```

## Cross-Feature Communication

Features communicate through these mechanisms:

1. **Integration Hooks**: Located in `src/hooks/integration/useFeatureIntegration.ts`
2. **Redux Store**: For global state that multiple features need access to
3. **Public API**: Each feature exposes a public API via its `api.ts` file

## UI Component Organization (Atomic Design)

```
ui/
 ├── atoms/                # Basic building blocks
 │   ├── Button.tsx
 │   └── Input.tsx
 ├── molecules/            # Combinations of atoms
 │   ├── FormField.tsx
 │   └── Card.tsx
 ├── organisms/            # Complex UI sections
 │   ├── Navigation.tsx
 │   └── Footer.tsx
 └── templates/            # Page layouts
     └── DashboardLayout.tsx
```

## Data Flow

```
User Action → Component → Hook → Service → API → Store → Component
```

This unidirectional data flow ensures predictable state management and simplifies debugging.

## Architectural Boundaries

Our architecture enforces strict boundaries to maintain code quality and separation of concerns:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        Application                            │
│                                                               │
├────────────┬────────────────────────┬───────────────────────┤
│            │                        │                       │
│   Pages    │    Integration Layer   │    UI Components      │
│            │                        │    (Atomic Design)    │
└──────┬─────┴─────────┬──────────────┴────────────┬──────────┘
       │               │                           │
       │      ┌────────▼────────┐                 │        
       │      │                 │                 │
       │      │  Feature API    │◄────── X ───────┘  <-- Forbidden Direct Import
       │      │    Boundary     │                      
       │      │                 │             
       │      └────────┬────────┘                 
       │               │                           
┌──────▼───────┬──────▼────────┬───────────────┐
│              │               │               │
│  Feature A   │   Feature B   │   Feature C   │     <-- Features cannot import
│              │               │               │         from each other directly
└──────────────┴───────────────┴───────────────┘
```

## Architecture Validation

We enforce these architectural boundaries through automated tools:

1. **Static Analysis**:
   - Dependency Cruiser validates import relationships
   - ESLint rules prevent invalid import patterns
   - TypeScript ensures type safety across boundaries

2. **Automated Testing**:
   - Integration tests verify proper cross-feature communication
   - Architecture tests ensure no boundaries are violated
   - Mock implementations allow testing in isolation

3. **CI/CD Pipeline**:
   - Architecture validation runs on every PR
   - Visual dependency graphs highlight violations
   - Detailed reports show architectural compliance

```
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│                   │    │                   │    │                   │
│  Pre-Commit Hook  │───►│   CI/CD Pipeline  │───►│  Dependency Graph │
│                   │    │                   │    │                   │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

This comprehensive approach ensures that architectural boundaries remain intact as the application grows and evolves.
