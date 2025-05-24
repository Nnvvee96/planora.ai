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
      },
      
      // Check import declarations for architectural violations
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
        
        // Pages should only import features through API
        if (filePath.includes('src/pages/') && 
            importPath.includes('features/') && 
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
