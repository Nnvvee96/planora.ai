# Planora.ai - Intelligent Travel Planning Platform

![Planora.ai Logo](https://placehold.co/600x200/1c2331/ffffff?text=Planora.ai)

Planora is an intelligent travel planning platform that helps users discover, plan, and organize their ideal trips based on personal preferences, budget constraints, and travel goals.

## Key Features

- **Personalized Travel Recommendations**: AI-driven travel recommendations based on user preferences
- **Budget Optimization**: Intelligent travel planning within user budget constraints
- **User Profile Management**: Comprehensive user profile and preference management
- **Location Intelligence**: Advanced country-city selection with customizable options
- **Preference Synchronization**: Seamless synchronization between profile location and travel preferences
- **Supabase Integration**: Secure authentication and data storage with Supabase
- **User Reviews and Feedback**: View community reviews and submit your own experiences through an intuitive modal interface.

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: ShadCN UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Cloudflare Pages

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

Planora.ai includes several development tools to ensure code quality and architecture compliance:

- **ESLint** - Code quality and style checking
- **Dependency Cruiser** - Validates architecture compliance and visualizes dependencies
- **Architecture Validation** - Ensures code follows our architectural principles
- **Plop.js** - Scaffolding templates for creating new features and components that follow our architectural standards

Run `npm run arch:monitor` to visualize the current dependency graph and check architecture compliance.

Use the scaffolding tools to generate compliant code:

```bash
# Generate a new feature
npm run scaffold:feature

# Generate a new UI component
npm run scaffold:component

# Generate a service
npm run scaffold:service

# Generate a hook
npm run scaffold:hook

# Generate an integration hook for cross-feature communication
npm run scaffold:integration
```

## Project Structure

```
planora.ai/
├── src/                    # Source code
│   ├── App.css             # Main application styles
│   ├── App.tsx             # Main application component
│   ├── __tests__/          # Test files
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
│   │   ├── hooks/          # UI-specific hooks
│   │   ├── molecules/      # Combinations of atoms
│   │   └── organisms/      # Complex UI sections
│   ├── utils/              # General utility functions
│   ├── index.css           # Global CSS entry point
│   ├── main.tsx            # Main application entry point
│   └── vite-env.d.ts       # Vite environment type definitions
├── config/                 # Configuration files
│   ├── dependencies/       # Dependency management configs (.npmrc, .dependency-cruiser.cjs)
│   │   └── reports/        # Architecture validation reports
│   ├── deployment/         # Deployment configs (e.g., for Cloudflare Pages)
│   ├── linting/            # Linting configs (.lintstagedrc.json, eslint configs)
│   └── plop/               # Code generation templates and configuration
├── docs/                   # Project documentation
│   ├── ARCHITECTURE.md     # Architecture decisions and patterns
│   ├── setup/              # Setup and configuration guides
│   └── developer/          # Development guidelines
└── public/                 # Static assets
```

## Development Guidelines

- Follow the guidelines in [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Use TypeScript for type safety
- Follow the established component patterns
- Write tests for new features

## Documentation

For detailed documentation, please refer to the following:

- [Project Overview & Setup](README.md) - This file: general info, setup, and project structure.
- [Architecture Guide](docs/ARCHITECTURE.md) - Core architectural principles, patterns, and code organization.
- [Database Guide](docs/database/DATABASE.md) - Database schema, Supabase integration details, and data management.
- [Developer Guide](docs/developer/guide.md) - Development workflow, coding standards, testing, and troubleshooting.
- **Setup Guides**:
  - [Configuration Guide](docs/setup/configuration-guide.md) - Detailed environment and application configuration.
  - [Deployment Guide](docs/setup/deployment-guide.md) - Instructions for deploying the application.
  - [Email Verification Setup](docs/setup/email-verification.md) - Setting up email verification with Supabase.
  - [Supabase Setup](docs/setup/supabase-setup.md) - Comprehensive guide to setting up and managing Supabase services.

## License

Proprietary - All rights reserved
