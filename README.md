# Planora.ai - Intelligent Travel Planning Platform

![Planora.ai Logo](https://placehold.co/600x200/1c2331/ffffff?text=Planora.ai)

Planora is an intelligent travel planning platform that helps users discover, plan, and organize their ideal trips based on personal preferences, budget constraints, and travel goals.

## Key Features

- **Personalized Travel Recommendations**: AI-driven travel recommendations based on user preferences
- **Budget Optimization**: Intelligent travel planning within user budget constraints
- **User Profile Management**: Comprehensive user profile and preference management
- **Supabase Integration**: Secure authentication and data storage with Supabase

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: ShadCN UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

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

## Documentation

We maintain comprehensive documentation to help developers understand and contribute to the project:

- [Architecture Guide](./docs/ARCHITECTURE.md) - Core architectural principles and code organization
- [Developer Guide](./docs/developer/guide.md) - Development workflow, testing, and troubleshooting
- [Setup Guides](./docs/setup/) - Environment setup including Supabase configuration

## Development Tools

Planora.ai includes several development tools to ensure code quality and architecture compliance:

- **ESLint** - Code quality and style checking
- **Architecture Validation** - Ensures code follows our architectural principles
- **Scaffolding** - Templates for creating new features and components

Run `npm run arch:monitor` to visualize the current dependency graph and check architecture compliance.

## Project Structure

```
planora.ai/
├── src/                    # Source code
│   ├── components/         # Third-party UI components (shadcn)
│   ├── features/          # Feature modules (auth, travel-planning, etc.)
│   ├── ui/                # Custom UI components (atoms, molecules, organisms)
│   ├── lib/               # Shared utilities and services
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management (Redux)
│   └── types/             # TypeScript type definitions
├── docs/                   # Project documentation
│   ├── ARCHITECTURE.md     # Architecture decisions and patterns
│   ├── setup/             # Setup and configuration guides
│   └── developer/         # Development guidelines
└── public/                # Static assets
```

## Development Guidelines

- Follow the guidelines in [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Adhere to the [style guide](docs/developer/styleguide.md)
- Use TypeScript for type safety
- Follow the established component patterns
- Write tests for new features

## Documentation

For detailed documentation, please refer to the following:

- [Architecture](docs/ARCHITECTURE.md) - Project architecture and design decisions
- [Setup Guide](docs/setup/) - Environment setup and configuration
- [Developer Guide](docs/developer/) - Coding standards and best practices

## License

Proprietary - All rights reserved
