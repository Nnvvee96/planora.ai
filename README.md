# Planora.ai - Intelligent Travel Planning Platform

![Planora.ai Logo](https://placehold.co/600x200/1c2331/ffffff?text=Planora.ai)

Planora is an intelligent travel planning platform that helps users discover, plan, and organize their ideal trips based on personal preferences, budget constraints, and travel goals.

## 🏆 **Production-Ready Architecture**

Planora.ai features a **gold standard** enterprise-grade codebase achieved through comprehensive cleanup phases:
- **✅ Zero linting errors and warnings**
- **✅ Perfect TypeScript strict mode compliance**
- **✅ Simplified authentication system with standard Supabase patterns**
- **✅ Standardized component imports and organization**
- **✅ Clean backend with no orphaned resources**
- **✅ Comprehensive security configuration**
- **✅ Enterprise service layer with retry logic and monitoring**
- **✅ Subscription-based tier management (Explorer, Wanderer Pro, Global Elite)**

## Key Features

- **Personalized Travel Recommendations**: AI-driven travel recommendations based on user preferences
- **Budget Optimization**: Intelligent travel planning within user budget constraints
- **User Profile Management**: Comprehensive user profile and preference management
- **Location Intelligence**: Advanced country-city selection with customizable options
- **Preference Synchronization**: Seamless synchronization between profile location and travel preferences
- **Simplified Authentication**: Standard email confirmation flow with onboarding persistence
- **Subscription Tiers**: Flexible subscription model (Free, Explorer, Wanderer Pro, Global Elite)
- **Supabase Integration**: Secure authentication and data storage with Supabase
- **User Reviews and Feedback**: View community reviews and submit your own experiences through an intuitive modal interface
- **Enterprise Service Layer**: Robust service patterns with automatic retry logic and performance monitoring

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: ShadCN UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth with email confirmation
- **Database**: Supabase PostgreSQL
- **Subscriptions**: Stripe integration with automatic tier assignment
- **Deployment**: Cloudflare Pages
- **Architecture**: Feature-first organization with atomic design
- **Service Layer**: Enterprise patterns with retry logic and monitoring

## Authentication & User Flow

Planora.ai implements a simplified, secure authentication system:

### **User Registration Flow**
1. **Email Registration**: User fills form → Email confirmation link → Login enabled
2. **Google OAuth**: Direct login with Google account → Email auto-verified
3. **Onboarding Required**: Dashboard access blocked until onboarding completion
4. **Subscription Management**: Automatic tier assignment based on Stripe purchases

### **Subscription Tiers**
- **Free**: Basic travel planning features
- **Explorer**: Enhanced features with advanced filters
- **Wanderer Pro**: Premium features with priority support
- **Global Elite**: Unlimited access with all premium features

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account for backend services
- Stripe account for subscription management (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Nnvvee96/planora.ai.git
cd planora.ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe credentials

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
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

# Build for production
npm run build
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
│   ├── developer/         # Development guidelines
│   └── database/          # Database documentation
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
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

### 4. Simplified Authentication
- Standard Supabase email confirmation flow
- Onboarding persistence until completion
- Subscription-based access control

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
- **Authentication System**: Simplified email confirmation flow
- **Subscription Management**: Automatic tier assignment with Stripe integration
- **Database Schema**: Clean subscription-based access control

### 🎯 **Active Development**
- **Enhanced UI/UX**: Modern chat interface and travel planning features
- **Advanced Features**: Tier-based feature access and premium functionality
- **Performance Optimization**: Caching and optimization strategies
- **Testing Coverage**: Comprehensive test suite implementation

## Edge Functions

Planora.ai uses Supabase Edge Functions for server-side operations:

- **account-management**: Handles account deletion and OAuth unlinking
- **scheduled-account-deleter**: Automated cleanup of expired deletion requests
- **create-checkout-session**: Stripe checkout session creation
- **stripe-webhook-handler**: Automatic subscription tier assignment

## License

Proprietary - All rights reserved
