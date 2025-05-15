module.exports = function (plop) {
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
        path: 'src/ui/{{atomicLevel}}/{{name}}.tsx',
        templateFile: 'plop-templates/component.hbs'
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
        path: 'src/features/{{name}}/components/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/services/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/utils/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/types.ts',
        templateFile: 'plop-templates/feature-types.hbs'
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/api.ts',
        templateFile: 'plop-templates/feature-api.hbs'
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
          path: 'src/features/{{feature}}/services/{{name}}Service.ts',
          templateFile: 'plop-templates/service.hbs'
        });
      } else {
        actions.push({
          type: 'add',
          path: 'src/services/{{name}}Service.ts',
          templateFile: 'plop-templates/service.hbs'
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
          path: 'src/features/{{feature}}/hooks/use{{pascalCase name}}.ts',
          templateFile: 'plop-templates/hook.hbs'
        });
      } else {
        actions.push({
          type: 'add',
          path: 'src/hooks/use{{pascalCase name}}.ts',
          templateFile: 'plop-templates/hook.hbs'
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
        path: 'src/hooks/integration/use{{pascalCase feature}}Integration.ts',
        templateFile: 'plop-templates/integration-hook.hbs'
      }
    ]
  });
};
