# Planora.ai - Intelligent Travel Planning Platform

![Planora.ai Logo](https://placehold.co/600x200/1c2331/ffffff?text=Planora.ai)

Planora is an intelligent travel planning platform that helps users discover, plan, and organize their ideal trips based on personal preferences, budget constraints, and travel goals.

## 🏆 **Production-Ready Architecture**

Planora.ai features a **gold standard** enterprise-grade codebase with:
- **✅ Zero linting errors and warnings**
- **✅ Perfect TypeScript strict mode compliance**
- **✅ Enterprise service layer with retry logic and monitoring**
- **✅ Comprehensive error handling patterns**
- **✅ Optimal development experience (Fast Refresh compatible)**
- **✅ Zero technical debt**

## Key Features

- **Personalized Travel Recommendations**: AI-driven travel recommendations based on user preferences
- **Budget Optimization**: Intelligent travel planning within user budget constraints
- **User Profile Management**: Comprehensive user profile and preference management
- **Location Intelligence**: Advanced country-city selection with customizable options
- **Preference Synchronization**: Seamless synchronization between profile location and travel preferences
- **Supabase Integration**: Secure authentication and data storage with Supabase
- **User Reviews and Feedback**: View community reviews and submit your own experiences through an intuitive modal interface
- **Enterprise Service Layer**: Robust service patterns with automatic retry logic and performance monitoring

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: ShadCN UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Cloudflare Pages
- **Architecture**: Feature-first organization with atomic design
- **Service Layer**: Enterprise patterns with retry logic and monitoring

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account for backend services

### Installation

```bash
# Clone the repository
git clone https://github.com/Nnvvee96/planora.ai.git
cd planora.ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
```

## Development Tools

Planora.ai includes comprehensive development tools for maintaining code quality and architectural compliance:

### Code Quality & Architecture
- **ESLint with Custom Rules** - Enforces architectural principles and code quality
- **TypeScript Strict Mode** - Perfect type safety throughout the codebase
- **Fast Refresh Optimization** - Optimal development experience
- **Dependency Cruiser** - Validates architecture compliance and visualizes dependencies
- **Architecture Validation** - Automated enforcement of architectural principles

### Code Generation
Use the scaffolding tools to generate compliant code:

```bash
# Generate a new feature with proper structure
npm run scaffold:feature

# Generate a new UI component following atomic design
npm run scaffold:component

# Generate a service with enterprise patterns
npm run scaffold:service

# Generate a React hook
npm run scaffold:hook

# Generate an integration hook for cross-feature communication
npm run scaffold:integration
```

### Architecture Monitoring
```bash
# Check architecture compliance
npm run arch:monitor

# Run comprehensive linting
npm run lint

# Validate all architectural principles
npm run arch:validate
```

## Project Structure

```
planora.ai/
├── src/                    # Source code
│   ├── App.css             # Main application styles
│   ├── App.tsx             # Main application component
│   ├── components/         # Third-party/library components
│   │   └── ui/             # Shadcn/UI components (with separated utilities)
│   ├── constants/          # Global constants
│   ├── features/           # Feature modules (feature-first organization)
│   │   └── feature-name/   # Individual features with proper boundaries
│   │       ├── featureNameApi.ts  # Public API boundary
│   │       ├── components/ # Feature-specific components
│   │       ├── context/    # Feature contexts (Fast Refresh optimized)
│   │       ├── hooks/      # Feature-specific hooks
│   │       ├── services/   # Business logic with enterprise patterns
│   │       ├── types/      # Type definitions
│   │       └── utils/      # Utility functions
│   ├── hooks/              # Custom React hooks
│   │   └── integration/    # Cross-feature integration hooks
│   ├── lib/                # Shared utilities and configurations
│   │   ├── serviceUtils.ts # Enterprise service layer utilities
│   │   └── supabase/       # Supabase client configuration
│   ├── pages/              # Page components
│   ├── store/              # State management (Redux)
│   ├── types/              # Global TypeScript type definitions
│   ├── ui/                 # Custom UI components (atomic design)
│   │   ├── atoms/          # Fundamental building blocks
│   │   ├── hooks/          # UI-specific hooks
│   │   ├── molecules/      # Combinations of atoms
│   │   └── organisms/      # Complex UI sections
│   ├── utils/              # General utility functions
│   ├── index.css           # Global CSS entry point
│   ├── main.tsx            # Main application entry point
│   └── vite-env.d.ts       # Vite environment type definitions
├── config/                 # Configuration files
│   ├── dependencies/       # Dependency management configs
│   ├── deployment/         # Deployment configurations
│   ├── linting/           # ESLint configurations with custom rules
│   │   └── eslint/        # Custom architectural enforcement rules
│   └── plop/              # Code generation templates
├── docs/                   # Project documentation
│   ├── ARCHITECTURE.md     # Comprehensive architecture guide
│   ├── setup/             # Setup and configuration guides
│   └── developer/         # Development guidelines
└── public/                # Static assets
```

## Architectural Principles

Planora.ai follows strict architectural principles for maintainability and scalability:

### 1. Feature-First Organization
- Code organized by business domain, not technical role
- Each feature has clear boundaries and public APIs
- Cross-feature communication through integration hooks

### 2. Enterprise Service Layer
- All services use retry logic with exponential backoff
- Comprehensive error handling and monitoring
- Performance tracking and graceful degradation

### 3. Type Safety Excellence
- TypeScript strict mode enabled throughout
- No `any` types - all code properly typed
- Clear separation between database and application types

### 4. Fast Refresh Optimization
- Perfect development experience with instant updates
- Components and utilities properly separated
- Zero Fast Refresh warnings

### 5. Zero Technical Debt
- Comprehensive linting with custom architectural rules
- Automated quality enforcement
- Clean, maintainable, and scalable codebase

## Development Guidelines

- Follow the comprehensive guidelines in [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Use TypeScript strict mode for all code
- Follow established architectural patterns
- Use the provided scaffolding tools for new code
- Maintain Fast Refresh compatibility
- Implement proper error handling and retry logic

## Documentation

For detailed documentation, please refer to:

- [Project Overview & Setup](README.md) - This file: general info, setup, and project structure
- [Architecture Guide](docs/ARCHITECTURE.md) - Comprehensive architectural principles, service patterns, and code organization
- [Database Guide](docs/database/DATABASE.md) - Database schema, Supabase integration, and data management
- [Developer Guide](docs/developer/guide.md) - Development workflow, coding standards, and best practices
- **Setup Guides**:
  - [Configuration Guide](docs/setup/configuration-guide.md) - Environment and application configuration
  - [Deployment Guide](docs/setup/deployment-guide.md) - Application deployment instructions
  - [Email Verification Setup](docs/setup/email-verification.md) - Email verification with Supabase
  - [Supabase Setup](docs/setup/supabase-setup.md) - Comprehensive Supabase setup guide

## Current Development Status

The technical foundation is **complete and production-ready**. Current focus areas:

### ✅ **Completed**
- **Architecture & Code Quality**: Gold standard compliance achieved
- **Service Layer**: Enterprise patterns with retry logic and monitoring
- **Type Safety**: Perfect TypeScript strict mode compliance
- **Development Experience**: Optimal Fast Refresh compatibility

### 🎯 **Active Development**
- **Email Registration Flow**: Enhanced UI and security features
- **Account Management**: Secure deletion and email change workflows
- **Onboarding Logic**: Conditional location handling based on registration method
- **Subscription Model**: Stripe integration and tier-based features

## License

Proprietary - All rights reserved
