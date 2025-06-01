/**
 * Planora.ai Code Generator
 * 
 * This file configures plop.js to generate code that follows Planora's
 * architectural principles, ensuring consistency and enforcing best practices.
 * 
 * ARCHITECTURAL PRINCIPLES ENFORCED:
 * - Feature-first organization
 * - Separation of concerns
 * - Modular design
 * - No redundancy
 * - Consistent naming conventions
 * - Clean API boundaries
 * - Future-proof patterns for AI integration
 */

export default function (plop) {
  // Create UI component generator
  plop.setGenerator('ui-component', {
    description: 'Generate a UI component following atomic design',
    prompts: [
      {
        type: 'list',
        name: 'atomicLevel',
        message: 'What type of component?',
        choices: ['atoms', 'molecules', 'organisms', 'templates']
      },
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase):'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/ui/{{atomicLevel}}/{{name}}.tsx',
        templateFile: './component.hbs'
      }
    ]
  });

  // Create feature generator
  plop.setGenerator('feature', {
    description: 'Generate a new feature module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (kebab-case):'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/features/{{name}}/components/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: '../../src/features/{{name}}/services/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: '../../src/features/{{name}}/hooks/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: '../../src/features/{{name}}/utils/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: '../../src/features/{{name}}/types.ts',
        templateFile: './feature-types.hbs'
      },
      {
        type: 'add',
        path: '../../src/features/{{name}}/{{name}}Api.ts',
        templateFile: './feature-api.hbs'
      }
    ]
  });

  // Create service generator
  plop.setGenerator('service', {
    description: 'Generate a service',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature name (kebab-case, leave empty if global):'
      },
      {
        type: 'input',
        name: 'name',
        message: 'Service name (camelCase):'
      }
    ],
    actions: function(data) {
      const actions = [];
      
      if (data.feature) {
        actions.push({
          type: 'add',
          path: '../../src/features/{{feature}}/services/{{name}}Service.ts',
          templateFile: './service.hbs'
        });
      } else {
        actions.push({
          type: 'add',
          path: '../../src/services/{{name}}Service.ts',
          templateFile: './service.hbs'
        });
      }
      
      return actions;
    }
  });

  // Create hook generator
  plop.setGenerator('hook', {
    description: 'Generate a custom hook',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature name (kebab-case, leave empty if global):'
      },
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (camelCase, without "use" prefix):'
      }
    ],
    actions: function(data) {
      const actions = [];
      
      if (data.feature) {
        actions.push({
          type: 'add',
          path: '../../src/features/{{feature}}/hooks/use{{pascalCase name}}.ts',
          templateFile: './hook.hbs'
        });
      } else {
        actions.push({
          type: 'add',
          path: '../../src/hooks/use{{pascalCase name}}.ts',
          templateFile: './hook.hbs'
        });
      }
      
      return actions;
    }
  });

  // Create integration hook generator
  plop.setGenerator('integration-hook', {
    description: 'Generate an integration hook for cross-feature communication',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature to integrate (kebab-case):'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/hooks/integration/use{{pascalCase feature}}Integration.ts',
        templateFile: './integration-hook.hbs'
      }
    ]
  });

  // AI Feature Generator - specialized for AI components
  plop.setGenerator('ai-feature', {
    description: 'Generate a new AI feature with architecture safeguards',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'AI Feature name (kebab-case, should start with "ai-"):',
        validate: (input) => {
          if (!input.startsWith('ai-')) {
            return 'AI feature names should start with "ai-" for consistent identification';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description of this AI feature:'
      },
      {
        type: 'confirm',
        name: 'useExternalApi',
        message: 'Will this feature connect to external AI APIs?',
        default: true
      }
    ],
    actions: function(data) {
      const actions = [
        // Create the API boundary file
        {
          type: 'add',
          path: '../../src/features/{{name}}/{{name}}Api.ts',
          templateFile: './feature-api.hbs'
        },
        // Create the types file
        {
          type: 'add',
          path: '../../src/features/{{name}}/types.ts',
          templateFile: './feature-types.hbs'
        },
        // Create folder structure
        {
          type: 'add',
          path: '../../src/features/{{name}}/components/.gitkeep',
          template: ''
        },
        {
          type: 'add',
          path: '../../src/features/{{name}}/hooks/.gitkeep',
          template: ''
        },
        {
          type: 'add',
          path: '../../src/features/{{name}}/utils/.gitkeep',
          template: ''
        },
        {
          type: 'add',
          path: '../../src/features/{{name}}/models/.gitkeep',
          template: ''
        },
        // Create main hook
        {
          type: 'add',
          path: '../../src/features/{{name}}/hooks/use{{pascalCase name}}.ts',
          template: `/**
 * use{{pascalCase name}} Hook
 *
 * Primary hook for the {{name}} AI feature.
 * Provides a clean interface to the AI functionality.
 */

import { useState } from 'react';
import { {{pascalCase name}}Response, {{pascalCase name}}Request } from '../types';

export function use{{pascalCase name}}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processRequest = async (request: {{pascalCase name}}Request): Promise<{{pascalCase name}}Response | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Implementation will go here
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    processRequest,
    loading,
    error
  };
}
`
        },
        // Create AI service
        {
          type: 'add',
          path: '../../src/features/{{name}}/services/{{name}}Service.ts',
          template: `/**
 * {{pascalCase name}} Service
 *
 * Service for handling {{description}}.
 * Follows AI safety and ethical guidelines.
 */

import { {{pascalCase name}}Request, {{pascalCase name}}Response } from '../types';

class {{pascalCase name}}Service {
  // Track model version for reproducibility
  private modelVersion = '1.0.0';
  
  // Process a request and return a response
  async processRequest(request: {{pascalCase name}}Request): Promise<{{pascalCase name}}Response> {
    try {
      // Validate input
      this.validateRequest(request);
      
      // Process with AI model (implementation will go here)
      const result = await this.callAIModel(request);
      
      // Validate output
      return this.validateResponse(result);
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  }
  
  private validateRequest(request: {{pascalCase name}}Request): void {
    // Implement validation logic
    if (!request) {
      throw new Error('Invalid request');
    }
  }
  
  private async callAIModel(request: {{pascalCase name}}Request) {
    // This would be implemented with actual AI model integration
    return {
      id: 'mock-id',
      result: 'Mock result',
      timestamp: new Date().toISOString()
    };
  }
  
  private validateResponse(response: any): {{pascalCase name}}Response {
    // Implement validation logic
    if (!response || !response.result) {
      throw new Error('Invalid AI response');
    }
    
    return response as {{pascalCase name}}Response;
  }
  
  // Get model version information
  getModelInfo() {
    return {
      version: this.modelVersion,
      capabilities: ['basic-text-processing'],
      limitations: ['requires-manual-review']
    };
  }
}

// Singleton instance
let instance: {{pascalCase name}}Service | null = null;

// Factory function
export function get{{pascalCase name}}Service(): {{pascalCase name}}Service {
  if (!instance) {
    instance = new {{pascalCase name}}Service();
  }
  return instance;
}
`
        },
        // Create README with architectural guidelines
        {
          type: 'add',
          path: '../../src/features/{{name}}/README.md',
          templateFile: './ai-feature.hbs'
        }
      ];
      
      // Add API connection if needed
      if (data.useExternalApi) {
        actions.push({
          type: 'add',
          path: '../../src/features/{{name}}/services/apiClient.ts',
          templateFile: './api-client.hbs'
        });
      }
      
      return actions;
    }
  });
};
