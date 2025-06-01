#!/usr/bin/env node

/**
 * Architecture Diagram Generator
 * 
 * This script analyzes the codebase and generates Mermaid diagrams
 * showing feature boundaries, dependencies, and architectural layers.
 * 
 * Usage:
 *   node generate-architecture-diagram.js [--output=path/to/output.md]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.resolve(__dirname, '../src');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../docs/architecture.md');

// Parse command line arguments
const args = process.argv.slice(2);
const outputArg = args.find(arg => arg.startsWith('--output='));
const outputPath = outputArg 
  ? outputArg.split('=')[1] 
  : DEFAULT_OUTPUT;

// Create directories if they don't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Main function
async function generateArchitectureDiagram() {
  console.log('🔍 Analyzing project architecture...');
  
  // Get all features
  const featuresDir = path.join(SRC_DIR, 'features');
  const features = fs.readdirSync(featuresDir)
    .filter(dir => fs.statSync(path.join(featuresDir, dir)).isDirectory());
  
  console.log(`Found ${features.length} features: ${features.join(', ')}`);
  
  // Get UI components
  const uiDir = path.join(SRC_DIR, 'ui');
  const uiLayers = fs.existsSync(uiDir) 
    ? fs.readdirSync(uiDir).filter(dir => fs.statSync(path.join(uiDir, dir)).isDirectory())
    : [];
  
  console.log(`Found ${uiLayers.length} UI layers: ${uiLayers.join(', ')}`);
  
  // Get pages
  const pagesDir = path.join(SRC_DIR, 'pages');
  const pages = fs.existsSync(pagesDir) 
    ? fs.readdirSync(pagesDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'))
      .map(file => file.replace(/\.[^/.]+$/, ""))
    : [];
  
  console.log(`Found ${pages.length} pages`);
  
  // Generate feature dependency diagram
  const featureDiagram = generateFeatureDependencyDiagram(features);
  
  // Generate layered architecture diagram
  const layeredDiagram = generateLayeredArchitectureDiagram(features, uiLayers, pages);
  
  // Generate markdown with diagrams
  const markdown = `# Planora.ai Architecture Documentation

Generated on ${new Date().toISOString().split('T')[0]}

## Feature Dependencies

This diagram shows the dependencies between features via their API boundaries.

\`\`\`mermaid
${featureDiagram}
\`\`\`

## Layered Architecture

This diagram shows the layered architecture of the application.

\`\`\`mermaid
${layeredDiagram}
\`\`\`

## Architectural Principles

1. **Feature-First Organization**: Code is organized by feature domain, not by technical role.
2. **Modular Design**: Components, services, hooks, and features are isolated and reusable.
3. **Separation of Concerns**: Business logic is separated from UI components.
4. **No Redundancy**: Shared functionality is extracted to appropriate locations.
5. **No Inconsistencies**: Uniform naming conventions and folder structures are enforced.
6. **Clean API Boundaries**: Features only expose what should be accessible to other parts.
7. **AI-Specific Patterns**: AI features follow additional safety and ethical guidelines.

## Forbidden Dependencies

- ❌ No cross-feature internal dependencies (must use API boundaries)
- ❌ No UI components importing directly from features
- ❌ No services importing UI components
- ❌ No pages importing from feature internals (only through API)
- ❌ No circular dependencies
- ❌ No index.ts files

## Integration Patterns

Features communicate with each other through:

1. **Integration Hooks**: \`src/hooks/integration/use{Feature}Integration.ts\`
2. **Redux Store**: For global state management
3. **API Boundaries**: Each feature exposes a public API

For more information, see the [architecture validator](../scripts/architecture-validator.js) and [dependency cruiser config](../.dependency-cruiser.cjs).
`;

  // Write markdown to file
  fs.writeFileSync(outputPath, markdown);
  console.log(`✅ Architecture diagram generated at ${outputPath}`);
}

/**
 * Generate a Mermaid diagram showing feature dependencies
 */
function generateFeatureDependencyDiagram(features) {
  let diagram = 'graph TD\n';
  
  // Add all features as nodes
  features.forEach(feature => {
    const displayName = feature.charAt(0).toUpperCase() + feature.slice(1);
    const isAIFeature = feature.startsWith('ai-');
    
    if (isAIFeature) {
      diagram += `  ${feature}["\`🤖 ${displayName}\`"]\n`;
    } else {
      diagram += `  ${feature}["\`${displayName}\`"]\n`;
    }
  });
  
  // Add integration hooks
  diagram += '  integration["\`🔄 Integration Hooks\`"]\n';
  diagram += '  redux["\`🔄 Redux Store\`"]\n';
  
  // Now analyze dependencies between features by checking imports
  features.forEach(feature => {
    const apiFile = path.join(SRC_DIR, 'features', feature, `${feature}Api.ts`);
    
    if (fs.existsSync(apiFile)) {
      // Find which features import this feature's API
      features.forEach(otherFeature => {
        if (feature === otherFeature) return;
        
        const otherFeatureDir = path.join(SRC_DIR, 'features', otherFeature);
        
        try {
          // Use grep to find imports (would be more efficient than reading all files)
          // This is a simplification - a real implementation would be more thorough
          const grepCmd = `grep -r "from '@/features/${feature}/${feature}Api'" ${otherFeatureDir} 2>/dev/null || true`;
          const result = execSync(grepCmd, { encoding: 'utf-8' });
          
          if (result.trim()) {
            diagram += `  ${otherFeature} --> ${feature}\n`;
          }
        } catch (error) {
          // Ignore grep errors
        }
      });
      
      // Check for integration hooks
      try {
        const integrationHookPath = path.join(SRC_DIR, 'hooks', 'integration', `use${feature.charAt(0).toUpperCase() + feature.slice(1)}Integration.ts`);
        if (fs.existsSync(integrationHookPath)) {
          diagram += `  ${feature} --> integration\n`;
        }
      } catch (error) {
        // Ignore file check errors
      }
    }
  });
  
  return diagram;
}

/**
 * Generate a Mermaid diagram showing layered architecture
 */
function generateLayeredArchitectureDiagram(features, uiLayers, pages) {
  let diagram = 'graph TD\n';
  
  // Add subgraphs for each layer
  
  // Pages layer
  diagram += '  subgraph Pages\n';
  pages.forEach(page => {
    diagram += `    ${page}["\`📄 ${page}\`"]\n`;
  });
  diagram += '  end\n\n';
  
  // UI layer
  if (uiLayers.length > 0) {
    diagram += '  subgraph UI\n';
    uiLayers.forEach(layer => {
      diagram += `    ${layer}["\`🎨 ${layer}\`"]\n`;
    });
    diagram += '  end\n\n';
  }
  
  // Features layer
  diagram += '  subgraph Features\n';
  features.forEach(feature => {
    const displayName = feature.charAt(0).toUpperCase() + feature.slice(1);
    const isAIFeature = feature.startsWith('ai-');
    
    if (isAIFeature) {
      diagram += `    ${feature}["\`🤖 ${displayName}\`"]\n`;
    } else {
      diagram += `    ${feature}["\`📦 ${displayName}\`"]\n`;
    }
  });
  diagram += '  end\n\n';
  
  // Integration layer
  diagram += '  subgraph Integration\n';
  diagram += '    hooks["\`🔄 Integration Hooks\`"]\n';
  diagram += '    redux["\`🔄 Redux Store\`"]\n';
  diagram += '  end\n\n';
  
  // Layer dependencies
  diagram += '  Pages --> UI\n';
  diagram += '  Pages --> Features\n';
  diagram += '  UI --> Integration\n';
  diagram += '  Features --> Integration\n';
  
  return diagram;
}

// Run the generator
generateArchitectureDiagram().catch(error => {
  console.error('Error generating architecture diagram:', error);
  process.exit(1);
});
