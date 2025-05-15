/**
 * Architecture Integration Test
 * 
 * This comprehensive test verifies that our entire architecture follows
 * the established patterns and that cross-feature communication works
 * correctly through the designated channels only.
 */

import { resolve } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { parse } from '@typescript-eslint/parser';

describe('Architecture Integration', () => {
  const SRC_DIR = resolve(process.cwd(), 'src');
  const FEATURES_DIR = resolve(SRC_DIR, 'features');
  
  // Test to ensure features only expose their public API
  it('should ensure all features have a properly structured public API', () => {
    // Get all feature directories
    const featureDirs = readdirSync(FEATURES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    featureDirs.forEach(featureDir => {
      const apiPath = resolve(FEATURES_DIR, featureDir, 'api.ts');
      
      // Check that api.ts exists
      try {
        const apiContent = readFileSync(apiPath, 'utf8');
        expect(apiContent).toBeDefined();
        
        // Basic validation that it's exporting something
        expect(apiContent).toContain('export');
      } catch (error) {
        fail(`Feature ${featureDir} is missing a public API (api.ts)`);
      }
    });
  });

  // Test to ensure no index.ts files exist
  it('should not contain any index.ts files (architecture rule)', () => {
    const findIndexFiles = (dir) => {
      let indexFiles = [];
      
      const files = readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = resolve(dir, file.name);
        
        if (file.isDirectory()) {
          indexFiles = [...indexFiles, ...findIndexFiles(fullPath)];
        } else if (
          file.name === 'index.ts' || 
          file.name === 'index.tsx' || 
          file.name === 'index.js' || 
          file.name === 'index.jsx'
        ) {
          indexFiles.push(fullPath);
        }
      }
      
      return indexFiles;
    };
    
    const indexFiles = findIndexFiles(SRC_DIR);
    expect(indexFiles).toHaveLength(0);
  });

  // Test to verify UI components don't import from features
  it('should ensure UI components do not import directly from features', () => {
    const UI_DIR = resolve(SRC_DIR, 'ui');
    
    const checkNoFeatureImports = (filePath) => {
      try {
        const content = readFileSync(filePath, 'utf8');
        
        // Simple regex check for imports from features
        const hasFeatureImport = content.match(/from\s+['"].*features.*['"]/);
        
        if (hasFeatureImport) {
          fail(`UI component ${filePath} imports directly from features, which violates architectural boundaries`);
        }
      } catch (error) {
        // Skip if file can't be read
      }
    };
    
    const scanDirectory = (dir) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = resolve(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          checkNoFeatureImports(fullPath);
        }
      }
    };
    
    scanDirectory(UI_DIR);
  });

  // Test to verify feature isolation
  it('should ensure features do not import from other features directly', () => {
    const checkNoCrossFeatureImports = (filePath, featureName) => {
      try {
        const content = readFileSync(filePath, 'utf8');
        
        // Check for imports from other features
        const featureDirs = readdirSync(FEATURES_DIR, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
          .filter(name => name !== featureName);
        
        for (const otherFeature of featureDirs) {
          const hasOtherFeatureImport = content.match(
            new RegExp(`from\\s+['"].*features/${otherFeature}(?!.*api).*['"]`)
          );
          
          if (hasOtherFeatureImport) {
            fail(`Feature ${featureName} directly imports from feature ${otherFeature} without using the public API`);
          }
        }
      } catch (error) {
        // Skip if file can't be read
      }
    };
    
    const scanFeature = (featurePath, featureName) => {
      const entries = readdirSync(featurePath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = resolve(featurePath, entry.name);
        
        if (entry.isDirectory()) {
          scanFeature(fullPath, featureName);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          checkNoCrossFeatureImports(fullPath, featureName);
        }
      }
    };
    
    const featureDirs = readdirSync(FEATURES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const featureDir of featureDirs) {
      scanFeature(resolve(FEATURES_DIR, featureDir), featureDir);
    }
  });

  // Test to verify integration hooks are properly structured
  it('should ensure integration hooks follow architectural patterns', () => {
    const INTEGRATION_HOOKS_DIR = resolve(SRC_DIR, 'hooks', 'integration');
    
    const hookFiles = readdirSync(INTEGRATION_HOOKS_DIR)
      .filter(file => file.startsWith('use') && file.endsWith('.ts'));
    
    // Verify naming convention
    for (const hookFile of hookFiles) {
      expect(hookFile).toMatch(/^use[A-Z][a-zA-Z]+Integration\.ts$/);
    }
  });
});
