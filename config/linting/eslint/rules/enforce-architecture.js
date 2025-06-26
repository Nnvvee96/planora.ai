/**
 * @fileoverview Rule to enforce Planora architectural boundaries
 * @author Planora Team
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce Planora architecture boundaries",
      category: "Architecture",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noCrossFeatureImport: "Cross-feature imports are not allowed. Use integration hooks or Redux store instead.",
      uiNotImportingFeatures: "UI components should not import from features directly.",
      servicesNotImportingUI: "Services should not import UI components.",
      pagesOnlyImportFeaturesApi: "Pages should only import features through their public API (featureNameApi.ts).",
      noIndexFiles: "Index files are not allowed. Use descriptive file names instead.",
      asyncPatternViolation: "Async functions should handle errors properly and avoid floating promises.",
      inconsistentNaming: "File and export names must follow Planora naming conventions.",
      improperHookUsage: "React hooks must be used according to the rules of hooks.",
      missingTypeExports: "Types should be exported alongside their corresponding components or functions.",
      aiDataHandling: "AI data processing requires proper error handling and privacy considerations.",
      noDefaultExports: "Default exports are not allowed. Use named exports instead.",
      noDirectDatabaseAccess: "Direct database access is not allowed in UI components or pages. Use services instead."
    }
  },

  create: function(context) {
    // Helper function to find parent function
    function findParentFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'FunctionDeclaration' || 
            parent.type === 'FunctionExpression' || 
            parent.type === 'ArrowFunctionExpression') {
          return parent;
        }
        parent = parent.parent;
      }
      return null;
    }

    return {
      // Check for index.ts files
      Program(node) {
        const filename = context.getFilename();
        if (filename.endsWith('index.ts') || filename.endsWith('index.tsx')) {
          context.report({
            node,
            messageId: 'noIndexFiles'
          });
        }
        
        // Check file naming conventions
        const filenameBase = filename.split('/').pop();
        if (filenameBase) {
          // Skip naming checks for shadcn/ui components
          if (filename.includes('/components/ui/')) {
            return;
          }
          
          // Feature API files must follow {featureName}Api.ts pattern
          if (filename.includes('/features/') && filenameBase.includes('Api') && !filenameBase.match(/^[a-zA-Z]+Api\.ts$/)) {
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: '{featureName}Api.ts' }
            });
          }
          
          // Allow Redux hooks API file
          if (filenameBase === 'reduxHooksApi.ts') {
            return;
          }
          
          // UI components must use PascalCase
          if (filename.includes('/ui/') && filenameBase.endsWith('.tsx') && !filenameBase.match(/^[A-Z][a-zA-Z0-9]*\.tsx$/)) {
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: 'PascalCase.tsx' }
            });
          }
          
          // Services must use camelCase and end with Service
          if (filename.includes('/services/') && !filenameBase.match(/^[a-z][a-zA-Z0-9]*Service\.ts$/)) {
            // Allow exceptions for specific service files with cross-cutting concerns
            if (filenameBase === 'authSessionManager.ts') {
              return;
            }
            
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: 'camelCaseService.ts' }
            });
          }
          
          // Hooks must start with 'use' and use camelCase
          if (filename.includes('/hooks/') && !filenameBase.match(/^use[A-Z][a-zA-Z0-9]*\.ts$/)) {
            // Allow standard React hook files with kebab-case (use-toast.ts, use-mobile.tsx)
            if (filenameBase.match(/^use-[a-z-]+\.(ts|tsx)$/)) {
              return;
            }
            
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: 'useFeatureName.ts' }
            });
          }
        }
      },
      
      // Check for default exports (not allowed except in config files)
      ExportDefaultDeclaration(node) {
        const filename = context.getFilename();
        // Allow default exports in config files
        if (filename.includes('.config.') || filename.endsWith('config.ts') || filename.endsWith('config.js')) {
          return;
        }
        
        context.report({
          node,
          messageId: 'noDefaultExports'
        });
      },
      
      // Check for direct database access
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filePath = context.getFilename();
        
        // Check for direct database/supabase client imports in UI components or pages
        if ((filePath.includes('/ui/') || filePath.includes('/pages/') || filePath.includes('/components/')) &&
            !filePath.includes('/services/')) {
          
          // Only flag actual client imports, not type imports
          const hasClientImport = node.specifiers.some(spec => {
            if (spec.type === 'ImportSpecifier') {
              const importName = spec.imported.name;
              // Flag common client/instance imports but not types
              return ['supabase', 'createClient', 'createSupabaseClient', 'SupabaseClient'].includes(importName);
            }
            return false;
          });
          
          if (hasClientImport && (importPath.includes('supabase') || importPath.includes('@/lib/supabase'))) {
            context.report({
              node,
              messageId: 'noDirectDatabaseAccess'
            });
          }
        }
        
        // Handle feature cross-imports
        if (importPath.includes('@/features/') || importPath.includes('../')) {
          // Check for cross-feature imports
          const featureMatch = filePath.match(/src\/features\/([^/]+)/);
          if (featureMatch) {
            const currentFeature = featureMatch[1];
            const importFeatureMatch = importPath.match(/features\/([^/]+)/);
            
            if (importFeatureMatch && importFeatureMatch[1] !== currentFeature) {
              // Convert kebab-case to camelCase for API file check
              const featureName = importFeatureMatch[1].replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              const expectedApiFile = `${featureName}Api`;
              
              if (!importPath.endsWith(`${expectedApiFile}`) && !importPath.endsWith(`/${expectedApiFile}`)) {
                context.report({
                  node,
                  messageId: "noCrossFeatureImport"
                });
              }
            }
          }
        }
        
        // UI components should not import from features
        if (filePath.includes('src/ui/') && importPath.includes('features')) {
          context.report({
            node,
            messageId: "uiNotImportingFeatures"
          });
        }
        
        // Services should not import UI components
        if (filePath.includes('/services/') && importPath.includes('ui/')) {
          context.report({
            node,
            messageId: "servicesNotImportingUI"
          });
        }
        
        // Pages should only import features through standardized API files
        if (filePath.includes('src/pages/') && importPath.includes('features/')) {
          // Extract feature name and convert to camelCase
          const featureMatch = importPath.match(/features\/([^/]+)/);
          if (featureMatch) {
            const featureName = featureMatch[1].replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            const expectedApiFile = `${featureName}Api`;
            
            if (!importPath.endsWith(expectedApiFile) && !importPath.endsWith(`/${expectedApiFile}`)) {
              context.report({
                node,
                messageId: "pagesOnlyImportFeaturesApi"
              });
            }
          }
        }
        
        // No index files
        if (importPath.endsWith('/index') || importPath.endsWith('/index.ts') || importPath.endsWith('/index.tsx')) {
          context.report({
            node,
            messageId: "noIndexFiles"
          });
        }
      },
      
      // Check for proper async error handling - DISABLED for now due to false positives
      /*
      AwaitExpression(node) {
        // Skip service files that typically have comprehensive error handling
        const fileName = context.getFilename();
        if (fileName.includes('Service.ts') || fileName.includes('service.ts') || fileName.includes('/services/')) {
          return; // Skip service files
        }
        
        // Skip if we're already in a try-catch block
        let parent = node.parent;
        while (parent) {
          if (parent.type === 'TryStatement') {
            return; // We're in a try-catch, so this is handled
          }
          if (parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression' || parent.type === 'ArrowFunctionExpression') {
            break; // We've reached the function boundary
          }
          parent = parent.parent;
        }
        
        // Check if this await is in a function that returns a promise but doesn't handle errors
        const functionParent = findParentFunction(node);
        if (functionParent && functionParent.async) {
          // Skip if this is a simple assignment or return statement
          const immediateParent = node.parent;
          if (immediateParent.type === 'ReturnStatement' || 
              immediateParent.type === 'VariableDeclarator' ||
              immediateParent.type === 'AssignmentExpression') {
            return;
          }
          
          // Only flag if this is a standalone await that could throw
          context.report({
            node,
            message: 'Async functions should handle errors properly and avoid floating promises'
          });
        }
      },
      */
      
      // Check AI-related data handling
      CallExpression(node) {
        // Check if call is to an AI service or API
        const isAICall = node.callee && 
          node.callee.name && 
          (node.callee.name.includes('ai') || 
           node.callee.name.includes('AI') || 
           node.callee.name.includes('model') || 
           node.callee.name.includes('Model') ||
           node.callee.name.includes('llm') ||
           node.callee.name.includes('LLM'));
        
        if (isAICall) {
          // Skip false positives - common non-AI function names that contain these words
          const fileName = context.getFilename();
          const functionName = node.callee.name;
          
          // Skip false positives in specific files or for specific function names
          if (
            fileName.includes('scripts/') || // Skip script files
            fileName.includes('types.ts') || // Skip type generation
            functionName.includes('email') || // Email functions often have 'mail' 
            functionName.includes('Email') ||
            functionName.includes('mail') ||
            functionName.includes('Mail') ||
            functionName.includes('social') || // Social login functions
            functionName.includes('Social') ||
            functionName.includes('modal') || // Modal/dialog functions
            functionName.includes('Modal') ||
            functionName.includes('modular') ||
            functionName.includes('Modular') ||
            functionName.includes('setEmail') || // State setters
            functionName.includes('setModal') ||
            functionName.includes('handleEmail') || // Event handlers
            functionName.includes('handleModal') ||
            functionName.includes('verifyEmail') || // Auth verification
            functionName.includes('resendEmail') ||
            functionName.includes('sendEmail') ||
            functionName.includes('updateEmail')
          ) {
            return;
          }
          
          // Check if the AI call is inside a try-catch block
          let currentNode = node;
          let foundTryCatch = false;
          
          while (currentNode.parent) {
            currentNode = currentNode.parent;
            if (currentNode.type === 'TryStatement') {
              foundTryCatch = true;
              break;
            }
          }
          
          if (!foundTryCatch) {
            context.report({
              node,
              messageId: 'aiDataHandling',
              data: {
                callName: node.callee.name
              }
            });
          }
        }
      }
    };
  }
};
