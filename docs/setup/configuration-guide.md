# Planora.ai Configuration Guide

This document outlines Planora's configuration system and the organization of configuration files to maintain architectural compliance and project consistency.

## Configuration Directory Structure

Planora.ai now organizes all configuration files in a dedicated `config/` directory, with symlinks to the root directory for backward compatibility. This approach improves project organization while maintaining compatibility with tools that expect configuration files in standard locations.

```
config/
├── dependencies/       # Dependency management configuration
│   ├── .dependency-cruiser.cjs  # Architecture validation rules
│   └── .npmrc          # NPM configuration
│
├── deployment/         # Deployment configuration
│   ├── vercel.json     # Vercel configuration
│   ├── vercel.build.json  # Vercel build settings
│   └── vercel-deploy.sh   # Deployment script
│
└── linting/            # Code quality tools
    └── .lintstagedrc.json  # Pre-commit lint configuration
```

## Development Tools

### Code Generation (Plop.js)

Planora uses Plop.js for code generation following our architectural principles. All templates and configuration for code generation are now organized in the `tools/plop/` directory.

```
tools/
└── plop/              # Code generation
    ├── plopfile.js    # Code generator configuration
    └── templates/     # Code templates
        ├── ai-feature.hbs
        ├── api-client.hbs
        ├── component.hbs
        ├── feature-api.hbs
        ├── feature-types.hbs
        ├── hook.hbs
        ├── integration-hook.hbs
        └── service.hbs
```

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

## Configuration Files Reference

| File | Location | Purpose |
|------|----------|---------|
| `.dependency-cruiser.cjs` | `config/dependencies/` | Defines architectural boundaries and dependency rules |
| `.lintstagedrc.json` | `config/linting/` | Configures pre-commit linting with lint-staged |
| `.npmrc` | `config/dependencies/` | NPM configuration for package management |
| `vercel.json` | `config/deployment/` | Vercel deployment configuration including routing and headers |
| `vercel.build.json` | `config/deployment/` | Build-specific settings for Vercel deployment |
| `vercel-deploy.sh` | `config/deployment/` | Deployment script for Vercel |

## Best Practices

When working with configuration files:

1. **Never edit the symlinked files** in the root directory. Always edit the source files in the `config/` directory.

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
