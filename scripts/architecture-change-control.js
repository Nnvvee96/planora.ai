#!/usr/bin/env node

/**
 * Architecture Change Control System for Planora.ai
 * 
 * This script analyzes changes to ensure they comply with our architectural rules.
 * It's used in CI/CD to prevent architecture drift and maintain code quality.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration constants
const FEATURES_DIR = path.join(ROOT_DIR, 'src', 'features');
const UI_DIR = path.join(ROOT_DIR, 'src', 'ui');
const ARCHITECTURE_DOCS = [
  'ARCHITECTURE.md',
  'ARCHITECTURE_TOOLS.md',
  'ARCHITECTURE_DIAGRAM.md',
  'docs/ADR.md'
];

// Tracking issues
const issues = [];
const warnings = [];

console.log('🔍 Running Architecture Change Control System');
console.log('=============================================');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Function to run a command and get output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: ROOT_DIR }).trim();
  } catch (error) {
    return error.stdout ? error.stdout.toString() : '';
  }
}

// Validate all features have the required structure
function validateFeatureStructure() {
  console.log('\n🔷 Validating feature structure...');
  
  if (!fileExists(FEATURES_DIR)) {
    issues.push('Features directory is missing: src/features/');
    return;
  }
  
  const featureDirs = fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  featureDirs.forEach(featureDir => {
    const featurePath = path.join(FEATURES_DIR, featureDir);
    
    // Check for required API file
    if (!fileExists(path.join(featurePath, 'api.ts'))) {
      issues.push(`Feature "${featureDir}" is missing api.ts file`);
    }
    
    // Check for required types file
    if (!fileExists(path.join(featurePath, 'types.ts'))) {
      issues.push(`Feature "${featureDir}" is missing types.ts file`);
    }
    
    // Check for required subdirectories
    ['components', 'services', 'hooks'].forEach(subDir => {
      if (!fileExists(path.join(featurePath, subDir))) {
        warnings.push(`Feature "${featureDir}" is missing "${subDir}" directory`);
      }
    });
  });
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All features have the correct structure');
  } else {
    console.log('⚠️ Found some issues with feature structure');
  }
}

// Validate UI structure follows atomic design
function validateUIStructure() {
  console.log('\n🔷 Validating UI structure...');
  
  if (!fileExists(UI_DIR)) {
    issues.push('UI directory is missing: src/ui/');
    return;
  }
  
  // Check for atomic design directories
  ['atoms', 'molecules', 'organisms', 'templates'].forEach(atomicDir => {
    if (!fileExists(path.join(UI_DIR, atomicDir))) {
      issues.push(`UI directory is missing "${atomicDir}" directory`);
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ UI structure follows atomic design pattern');
  } else {
    console.log('⚠️ Found issues with UI structure');
  }
}

// Validate no index.ts files exist
function validateNoIndexFiles() {
  console.log('\n🔷 Checking for prohibited index files...');
  
  const indexFilesOutput = runCommand('find src -name "index.ts" -o -name "index.tsx" -o -name "index.js" -o -name "index.jsx"');
  
  if (indexFilesOutput) {
    const indexFiles = indexFilesOutput.split('\n').filter(line => line.trim());
    
    indexFiles.forEach(file => {
      issues.push(`Prohibited index file found: ${file}`);
    });
    
    console.log('⚠️ Found prohibited index files');
  } else {
    console.log('✅ No prohibited index files found');
  }
}

// Validate architecture documentation
function validateArchitectureDocs() {
  console.log('\n🔷 Validating architecture documentation...');
  
  ARCHITECTURE_DOCS.forEach(doc => {
    const docPath = path.join(ROOT_DIR, doc);
    
    if (!fileExists(docPath)) {
      warnings.push(`Architecture documentation missing: ${doc}`);
    }
  });
  
  if (warnings.length === 0) {
    console.log('✅ All architecture documentation is present');
  } else {
    console.log('⚠️ Some architecture documentation is missing');
  }
}

// Validate ESLint architectural rules
function validateESLintRules() {
  console.log('\n🔷 Validating code against ESLint architectural rules...');
  
  try {
    execSync('npx eslint --ext .ts,.tsx,.js,.jsx src/ --quiet --rule "planora-architecture/enforce-architecture: error"', 
      { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('✅ Code passes ESLint architectural rules');
  } catch (error) {
    console.error('❌ Code fails ESLint architectural rules');
    issues.push('ESLint architectural rules are violated - run `npx eslint --ext .ts,.tsx src/ --rule "planora-architecture/enforce-architecture: error"` for details');
  }
}

// Generate an architecture change report
function generateChangeReport() {
  console.log('\n🔷 Generating architecture change report...');
  
  const recentChanges = runCommand('git diff --name-status HEAD~5..HEAD');
  const changedFiles = recentChanges.split('\n')
    .filter(line => line.match(/^[AM]\tsrc\//))
    .map(line => line.split('\t')[1]);
  
  const report = [
    '# Architecture Change Report',
    `Generated on ${new Date().toISOString()}`,
    '',
    '## Recent Changes',
    ''
  ];
  
  if (changedFiles.length === 0) {
    report.push('No recent changes to analyze');
  } else {
    changedFiles.forEach(file => {
      const type = file.includes('/features/') ? 'Feature' : 
                   file.includes('/ui/') ? 'UI' :
                   file.includes('/hooks/') ? 'Hook' :
                   file.includes('/store/') ? 'Store' :
                   'Other';
                   
      report.push(`- [${type}] ${file}`);
    });
  }
  
  report.push('', '## Architecture Validation Results', '');
  
  if (issues.length === 0 && warnings.length === 0) {
    report.push('✅ All architecture validations passed!');
  } else {
    if (issues.length > 0) {
      report.push('### Issues');
      issues.forEach(issue => {
        report.push(`- ❌ ${issue}`);
      });
      report.push('');
    }
    
    if (warnings.length > 0) {
      report.push('### Warnings');
      warnings.forEach(warning => {
        report.push(`- ⚠️ ${warning}`);
      });
    }
  }
  
  const reportPath = path.join(ROOT_DIR, 'architecture-report.md');
  fs.writeFileSync(reportPath, report.join('\n'));
  
  console.log(`✅ Architecture change report generated: ${reportPath}`);
}

// Run all validations
validateFeatureStructure();
validateUIStructure();
validateNoIndexFiles();
validateArchitectureDocs();
validateESLintRules();
generateChangeReport();

// Summary
console.log('\n=============================================');
if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 Architecture validation PASSED! The codebase follows our architectural principles.');
  process.exit(0);
} else {
  if (issues.length > 0) {
    console.error(`❌ Architecture validation FAILED with ${issues.length} issues:`);
    issues.forEach(issue => console.error(`  - ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.warn(`⚠️ Architecture validation generated ${warnings.length} warnings:`);
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  process.exit(issues.length > 0 ? 1 : 0);
}

// Required for ES modules
export {};
