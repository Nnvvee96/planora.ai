# Planora.ai - Intelligent Travel Planning Platform

![Planora.ai Logo](https://placehold.co/600x200/1c2331/ffffff?text=Planora.ai)

Planora is an intelligent travel planning platform that helps users discover, plan, and organize their ideal trips based on personal preferences, budget constraints, and travel goals.

## Project Overview

Planora combines powerful AI with a clean, user-friendly interface to create personalized travel experiences. The application follows a strict clean architecture approach focused on maintainability, extensibility, and code quality.

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

## Architecture

Planora.ai follows a strict clean architecture approach with the following principles:

- **Feature-First Organization**: Code organized by feature domain
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
- **Modular Design**: Reusable components built using atomic design principles
- **Type Safety**: Comprehensive TypeScript types throughout the codebase

Read our [Architecture Documentation](ARCHITECTURE.md) for detailed information.

## Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [Architecture Guides](./docs/architecture)
- [Setup Instructions](./docs/setup)
- [Developer Guidelines](./docs/developer)

## Contributing

We welcome contributions to Planora.ai! Please review our [Style Guide](./docs/developer/styleguide.md) before submitting changes.

## License

This project is proprietary and is not open for redistribution or use without explicit permission.

## Contact

For questions or support, please contact the repository maintainers.
