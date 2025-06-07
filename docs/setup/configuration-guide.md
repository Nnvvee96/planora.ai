# Planora.ai Configuration Guide

This document outlines Planora.ai's configuration approach, detailing where key configuration files are located to maintain project consistency and support development tools.

Planora.ai utilizes a hybrid approach for configuration files:
- A dedicated `config/` directory houses specific, more complex tool configurations (like Plop.js and detailed ESLint setups), generated reports, and utility scripts.
- Many standard and primary configuration files reside directly in the project root directory for ease of access and compatibility with common development tools and practices.

## `config/` Directory Structure

The `config/` directory is organized as follows:

```
config/
├── dependencies/       # Dependency management related items
│   └── reports/        # Architecture validation reports (e.g., from Dependency Cruiser)
│       └── dependency-violations.html  # Example generated dependency violation report
│
├── deployment/         # Deployment-related scripts and utilities
│   └── check-secrets.sh # Script to check for secrets before deployment
│
├── linting/            # Detailed linting configurations
│   └── eslint/         # ESLint specific configurations
│       ├── eslint.config.js # Main ESLint configuration
│       ├── index.js         # Helper/entry for ESLint setup
│       └── rules/           # Custom ESLint rules
│
└── plop/               # Code generation (Plop.js) templates and configuration
    ├── plopfile.js     # Plop.js generator configuration
    ├── ai-feature.hbs  # AI feature template
    ├── api-client.hbs  # API client template
    ├── component.hbs   # UI component template
    ├── feature-api.hbs # Feature API boundary template
    ├── feature-types.hbs # Feature types template
    ├── hook.hbs        # React hook template
    ├── integration-hook.hbs # Cross-feature integration hook template
    └── service.hbs     # Service template
```

## Development Tools

### Code Generation (Plop.js)

Planora uses Plop.js for code generation, adhering to our architectural principles. All Plop.js templates and its main configuration file (`plopfile.js`) are located in the `config/plop/` directory. The `npm run scaffold:*` scripts in `package.json` are configured to use this path.

### Using Code Generation

To generate new code that follows Planora's architectural principles:

```bash
# Generate a new feature module
npm run scaffold:feature

# Generate a new UI component
npm run scaffold:component

# Generate a service
npm run scaffold:service

# Generate a custom hook
npm run scaffold:hook

# Generate an integration hook for cross-feature communication
npm run scaffold:integration
```

## Architecture Validation

Planora enforces strict architectural compliance using Dependency Cruiser. The configuration file `.dependency-cruiser.cjs` defines rules that ensure:

1. Feature isolation
2. Proper API boundaries
3. No circular dependencies
4. Clean import/export patterns

To check architecture compliance:

```bash
# Check architecture compliance
npm run check-arch

# Visualize dependency graph
npm run visualize-deps
```

## Environment Variables

Application runtime configuration, such as API keys and service URLs, is managed through environment variables.

- **`.env`**: Used for local development. Contains actual secrets and configuration values. This file is gitignored.
- **`.env.example`**: A template file committed to the repository, showing the required environment variables without their actual values. Developers should copy this to `.env` and fill in the values.

Key environment variables include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Supabase integration.

## Configuration Files Reference

Below is a reference for key configuration files in the Planora.ai project:

| File                      | Location                  | Purpose                                                                 |
|---------------------------|---------------------------|-------------------------------------------------------------------------|
| `package.json`            | Root (`./`)               | Project metadata, dependencies, and scripts (e.g., `dev`, `build`, `lint`) |
| `package-lock.json`       | Root (`./`)               | Records exact versions of dependencies.                                 |
| `.env`                    | Root (`./`)               | Local environment variables (gitignored).                               |
| `.env.example`            | Root (`./`)               | Example environment variables.                                          |
| `vite.config.ts`          | Root (`./`)               | Vite build tool configuration (dev server, build process, plugins).       |
| `tsconfig.json`           | Root (`./`)               | TypeScript compiler options for the project.                            |
| `tsconfig.app.json`       | Root (`./`)               | TypeScript configuration specific to the application code (src).        |
| `tsconfig.node.json`      | Root (`./`)               | TypeScript configuration for Node.js context (e.g., Vite config, scripts).|
| `tailwind.config.ts`      | Root (`./`)               | Tailwind CSS framework configuration (theme, plugins).                  |
| `postcss.config.js`       | Root (`./`)               | PostCSS processor configuration (e.g., for Tailwind, autoprefixer).     |
| `eslint.config.js`        | `config/linting/eslint/`  | Main ESLint configuration for code linting rules and plugins.           |
| `.lintstagedrc.json`      | Root (`./`)               | Lint-staged configuration for running linters on pre-commit.            |
| `.dependency-cruiser.cjs` | Root (`./`)               | Dependency Cruiser rules for architecture validation.                   |
| `.npmrc`                  | Root (`./`)               | NPM configuration (e.g., registry settings).                            |
| `.gitignore`              | Root (`./`)               | Specifies intentionally untracked files that Git should ignore.         |
| `vercel.json`             | Root (`./`)               | Vercel deployment configuration (routing, headers, builds).             |
| `vercel.build.json`       | Root (`./`)               | Vercel build-specific settings (deprecated if using `vercel.json` builds).|
| `vercel-deploy.sh`        | Root (`./`)               | Custom deployment script for Vercel (if needed).                        |
| `jest.config.js`          | Root (`./`)               | Jest testing framework configuration.                                   |
| `plopfile.js`             | `config/plop/`            | Plop.js code generation configuration and templates.                    |

## Best Practices

When working with configuration files:

1. **Understand file locations**: Be aware that some configurations are in the root, while others are nested within `config/`. Edit files in their actual locations.

2. **Add new configuration files** to the appropriate subdirectory in `config/` based on their purpose.

3. **Update documentation** when adding or modifying configuration files.

4. **Maintain backward compatibility** by creating symlinks for tools that expect configuration files in standard locations.

5. **Use code generation tools** to ensure new code follows Planora's architectural principles.

## CI/CD Integration

Planora's CI/CD pipeline integrates architectural validation to automatically enforce boundaries:

```bash
# Run architectural validation in CI pipeline
npm run ci:arch
```

This ensures that all code committed to the repository follows Planora's architectural principles.
