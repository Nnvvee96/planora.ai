# Planora.ai Documentation

This directory contains comprehensive documentation for the Planora.ai project, organized by topic to make information easily accessible.

## Documentation Structure

### Architecture
- [Architecture Principles](../ARCHITECTURE.md) - Core architecture principles and patterns
- [Architecture Decisions](architecture/decisions.md) - Records of architectural decisions (ADRs)
- [Architecture Tools](architecture/tools.md) - Tools used to enforce architectural boundaries
- [Refactoring Plan](architecture/refactoring-plan.md) - Plan for architectural improvements
- [Architecture Diagram](architecture/diagram.md) - Visual representation of the architecture

### Setup Guides
- [Supabase Setup](setup/supabase-setup.md) - Setting up Supabase for Planora
- [Email Verification](setup/email-verification.md) - Configuring Supabase email verification
- [Deployment Guide](setup/deployment-guide.md) - Guide for deploying Planora to Vercel

### Developer Resources
- [Developer Guide](developer/guide.md) - Comprehensive guide for Planora developers
- [Style Guide](developer/styleguide.md) - Code style and formatting guidelines

## Architectural Principles

Planora.ai follows strict architectural principles:

1. **Feature-First Organization**: Code is organized by feature domain, not by technical role
2. **Separation of Concerns**: Business logic is separated from UI components
3. **Modular Design**: Components are isolated and reusable
4. **Clear Boundaries**: Features only communicate through well-defined API boundaries
5. **Type Safety**: Strong TypeScript typing throughout the application

For detailed information on our architecture, refer to the [Architecture Documentation](../ARCHITECTURE.md).
