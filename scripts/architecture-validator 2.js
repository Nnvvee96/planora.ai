#!/usr/bin/env node
/**
 * Unified Architecture Validation Script for Planora.ai
 * 
 * This script provides a comprehensive validation of the codebase's
 * adherence to Planora's architectural principles:
 * 
 * - Feature-first organization
 * - Separation of concerns
 * - Modular design
 * - No redundancy
 * - No inconsistencies
 * - Clean code
 * - Future-proof design
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Run a command and capture its output
 */
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
}

/**
 * Print validation result
 */
function printResult(name, success, message = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  console.log(`${icon} ${color}${name}${colors.reset}${message ? ': ' + message : ''}`);
  return success;
}

// Start validation process
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);
console.log(`${colors.bold}${colors.blue} Planora.ai Architecture Validation ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);

// Array to track all validation results
let allValidationsPassed = true;

// 1. Validate Dependency Structure
printHeader('Dependency Structure Validation');
const depCheck = runCommand('npx depcruise --validate .dependency-cruiser.cjs src', { silent: true });
allValidationsPassed = printResult('Dependency boundaries', depCheck.success, 
  depCheck.success ? '' : 'Found architectural boundary violations') && allValidationsPassed;

// 2. ESLint Architecture Rules
printHeader('ESLint Architecture Rules');
const eslintCheck = runCommand('npm run lint -- --no-fix', { silent: true });
const architectureErrors = eslintCheck.output.includes('planora/enforce-architecture');

allValidationsPassed = printResult('ESLint architecture rules', !architectureErrors,
  architectureErrors ? 'Found violations in architecture rules' : '') && allValidationsPassed;

// 3. Check for index.ts files
printHeader('File Structure Validation');
const noIndexTsCheck = runCommand('find src -name "index.ts" -o -name "index.tsx"', { silent: true });
const hasIndexFiles = noIndexTsCheck.output.trim().length > 0;

allValidationsPassed = printResult('No index.ts files', !hasIndexFiles,
  hasIndexFiles ? 'Found forbidden index.ts files' : '') && allValidationsPassed;

// 4. Feature API Structure
printHeader('Feature API Structure');
const featureDirs = fs.readdirSync(path.join(rootDir, 'src', 'features'));
let featuresWithoutApi = [];

featureDirs.forEach(dir => {
  if (fs.statSync(path.join(rootDir, 'src', 'features', dir)).isDirectory()) {
    const apiFiles = fs.readdirSync(path.join(rootDir, 'src', 'features', dir))
      .filter(file => file.toLowerCase().includes('api') && file.endsWith('.ts'));
    
    if (apiFiles.length === 0) {
      featuresWithoutApi.push(dir);
    }
  }
});

allValidationsPassed = printResult('Feature API boundaries', featuresWithoutApi.length === 0,
  featuresWithoutApi.length > 0 ? `Features missing API: ${featuresWithoutApi.join(', ')}` : '') && allValidationsPassed;

// Final results
console.log(`\n${colors.bold}${colors.blue}====================================${colors.reset}`);
if (allValidationsPassed) {
  console.log(`${colors.bold}${colors.green}All architecture validations passed! ✅${colors.reset}`);
  console.log(`Your code follows Planora's architectural principles.`);
  process.exit(0);
} else {
  console.log(`${colors.bold}${colors.red}Architecture validation failed! ❌${colors.reset}`);
  console.log(`Please fix the issues above to maintain Planora's architectural integrity.`);
  process.exit(1);
}
