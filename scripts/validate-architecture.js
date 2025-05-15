#!/usr/bin/env node

/**
 * Architecture validation script for Planora.ai
 * 
 * This script validates that the codebase follows the established
 * architectural patterns and boundaries.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Validating Planora.ai architecture...');

// Track validation results
const issues = [];

// Validate dependency boundaries
try {
  console.log('\n📊 Checking dependency boundaries...');
  execSync('npx depcruise --validate .dependency-cruiser.cjs src', { stdio: 'inherit' });
  console.log('✅ Dependency validation passed!');
} catch (error) {
  console.error('❌ Dependency validation failed!');
  issues.push('Dependency violations detected - run `npx depcruise --validate .dependency-cruiser.cjs src` for details');
}

// Validate ESLint architectural rules
try {
  console.log('\n📏 Checking ESLint architectural rules...');
  // Using the updated ESLint command format compatible with eslint.config.js
  execSync('npx eslint "src/**/*.{js,jsx,ts,tsx}" --quiet', { stdio: 'inherit' });
  console.log('✅ ESLint validation passed!');
} catch (error) {
  console.error('❌ ESLint validation failed!');
  issues.push('ESLint violations detected - run `npx eslint "src/**/*.{js,jsx,ts,tsx}"` for details');
}

// Check for disallowed index.ts files
console.log('\n🔍 Checking for disallowed index.ts files...');
const indexFiles = execSync('find src -name "index.ts" -o -name "index.tsx" -o -name "index.js" -o -name "index.jsx"', { encoding: 'utf-8' }).trim();

if (indexFiles) {
  console.error('❌ Found prohibited index files:');
  console.error(indexFiles);
  issues.push('Index files detected - these are not allowed in our architecture');
} else {
  console.log('✅ No prohibited index files found!');
}

// Validate directory structure
console.log('\n📁 Validating directory structure...');
const requiredDirectories = [
  'src/ui/atoms',
  'src/ui/molecules',
  'src/ui/organisms',
  'src/ui/templates',
  'src/features',
  'src/hooks',
  'src/hooks/integration',
  'src/store',
  'src/constants',
  'src/utils'
];

for (const dir of requiredDirectories) {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Required directory missing: ${dir}`);
    issues.push(`Missing required directory: ${dir}`);
  }
}

if (issues.length === 0) {
  console.log('\n✅ All directory structure validations passed!');
} else {
  console.error('\n❌ Directory structure validation failed!');
}

// Summary
console.log('\n==========================');
if (issues.length === 0) {
  console.log('🎉 Architecture validation PASSED! The codebase follows our architectural principles.');
  process.exit(0);
} else {
  console.error(`❌ Architecture validation FAILED with ${issues.length} issues:`);
  issues.forEach(issue => console.error(`  - ${issue}`));
  process.exit(1);
}

// Required for ES modules
export {};
