/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // Added AI-service isolation for future AI features
    {
      name: 'ai-service-isolation',
      severity: 'error',
      comment: 'AI services should be isolated and only accessible through their API',
      from: {
        path: '^src/(?!features/ai-)'  // Match any path not in AI features
      },
      to: {
        path: '^src/features/ai-.*?/(?!.*Api\.ts$)'  // Match internal AI feature files
      }
    },
    // Enforce integration hooks pattern
    {
      name: 'enforce-integration-hooks',
      severity: 'warn',
      comment: 'Features should communicate through integration hooks',
      from: {
        path: '^src/features/([^/]+)'  // Capture feature name
      },
      to: {
        path: '^src/features/(?!$1)',  // Different feature
        pathNot: ['^src/hooks/integration']
      }
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'consistent-state-management',
      severity: 'info',
      comment: 'Consider using Redux store for global state management',
      from: {
        path: '^src/features/'
      },
      to: {
        path: '^src/features/',
        pathNot: ['^src/store/']
      },
      as: {
        wildcard: ['.*State', '.*store', '.*Store']
      }
    },
    {
      name: 'no-cross-feature-dependencies',
      severity: 'error',
      comment: 'Features must not directly depend on other features',
      from: {
        path: '^src/features/([^/]+)'
      },
      to: {
        path: '^src/features/(?!(\\1))',
        pathNot: '^src/features/[^/]+/api\\.ts$'
      }
    },
    {
      name: 'ui-not-importing-features',
      severity: 'error',
      comment: 'UI components must not import from features',
      from: {
        path: '^src/ui/'
      },
      to: {
        path: '^src/features/'
      }
    },
    {
      name: 'services-not-importing-ui',
      severity: 'error',
      comment: 'Services must not import from UI components',
      from: {
        path: '^src/features/.*/services/'
      },
      to: {
        path: '^src/ui/'
      }
    },
    {
      name: 'pages-only-import-features-through-api',
      severity: 'error',
      comment: 'Pages should only import features through their public API',
      from: {
        path: '^src/pages/'
      },
      to: {
        path: '^src/features/[^/]+/(?!.*Api\\.ts$)'
      }
    },
    {
      name: 'features-must-use-integration-hooks',
      severity: 'error',
      comment: 'Features must use integration hooks to access other features',
      from: {
        path: '^src/features/([^/]+)'
      },
      to: {
        path: '^src/features/(?!(\\1))/(?!api\\.ts$)'
      }
    },
    {
      name: 'no-index-files',
      severity: 'error',
      comment: 'Index files are not allowed, use descriptive file names instead',
      from: {},
      to: {
        path: '.*/index\\.(js|ts|jsx|tsx)$'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: [
        '(fixtures)',
        '(mocks)',
        '\\.stories\\.tsx$',
        '\\.spec\\.[jt]sx?$',
        '\\.test\\.[jt]sx?$'
      ]
    },
    includeOnly: {
      path: '^src'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
