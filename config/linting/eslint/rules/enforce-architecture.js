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
      pagesOnlyImportFeaturesApi: "Pages should only import features through their public API (api.ts).",
      noIndexFiles: "Index files are not allowed. Use descriptive file names instead.",
      asyncPatternViolation: "Async functions should handle errors properly and avoid floating promises.",
      inconsistentNaming: "File and export names must follow Planora naming conventions.",
      improperHookUsage: "React hooks must be used according to the rules of hooks.",
      missingTypeExports: "Types should be exported alongside their corresponding components or functions.",
      aiDataHandling: "AI data processing requires proper error handling and privacy considerations."
    }
  },

  create: function(context) {
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
          // Feature API files must follow {featureName}Api.ts pattern
          if (filename.includes('/features/') && filenameBase.includes('api') && !filenameBase.match(/[a-zA-Z]+Api\.ts$/)) {
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: '{featureName}Api.ts' }
            });
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
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: 'camelCaseService.ts' }
            });
          }
          
          // Hooks must start with 'use' and use camelCase
          if (filename.includes('/hooks/') && !filenameBase.match(/^use[A-Z][a-zA-Z0-9]*\.ts$/)) {
            context.report({
              node,
              messageId: 'inconsistentNaming',
              data: { expected: 'useFeatureName.ts' }
            });
          }
        }
      },
      
      // Check import declarations for architectural violations
      // Check async function patterns
      FunctionDeclaration(node) {
        if (node.async) {
          // Check if async function has proper error handling
          const hasErrorHandling = node.body && 
            node.body.body && 
            node.body.body.some(statement => 
              statement.type === 'TryStatement' || 
              (statement.type === 'ExpressionStatement' && 
               statement.expression.type === 'CallExpression' && 
               statement.expression.callee.name === 'tryCatch')
            );
          
          if (!hasErrorHandling) {
            context.report({
              node,
              messageId: 'asyncPatternViolation',
              data: {
                functionName: node.id ? node.id.name : 'anonymous'
              }
            });
          }
        }
      },
      
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
      },
      
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filePath = context.getFilename();
        
        // Handle feature cross-imports
        if (importPath.includes('@/features/') || importPath.includes('../')) {
          // Check for cross-feature imports
          const featureMatch = filePath.match(/src\/features\/([^/]+)/);
          if (featureMatch) {
            const currentFeature = featureMatch[1];
            const importFeatureMatch = importPath.match(/features\/([^/]+)/);
            
            if (importFeatureMatch && importFeatureMatch[1] !== currentFeature) {
              context.report({
                node,
                messageId: "noCrossFeatureImport"
              });
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
        if (filePath.includes('src/pages/') && 
            importPath.includes('features/') && 
            !importPath.endsWith('Api') &&
            !importPath.endsWith('/api')) {
          context.report({
            node,
            messageId: "pagesOnlyImportFeaturesApi"
          });
        }
        
        // No index files
        if (importPath.endsWith('/index') || importPath.endsWith('/index.ts') || importPath.endsWith('/index.tsx')) {
          context.report({
            node,
            messageId: "noIndexFiles"
          });
        }
      }
    };
  }
};
