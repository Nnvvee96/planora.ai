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
 * - Async patterns for AI integrations
 * - API boundaries for isolation
 * 
 * Usage:
 *   node architecture-validator.js [options]
 * 
 * Options:
 *   --quick              Run only quick checks (good for pre-commit)
 *   --files="file1,file2" Only check specific files (comma-separated)
 *   --features          Only validate feature structure
 *   --deps              Only validate dependencies
 *   --ai                Run additional AI-specific validations
 *   --generate-docs     Generate architecture documentation
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  files: args.find(arg => arg.startsWith('--files='))?.split('=')[1]?.split(',') || [],
  featuresOnly: args.includes('--features'),
  depsOnly: args.includes('--deps'),
  aiValidation: args.includes('--ai'),
  generateDocs: args.includes('--generate-docs'),
  help: args.includes('--help') || args.includes('-h')
};

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
function printResult(name, success, message = '', details = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  console.log(`${icon} ${color}${name}${colors.reset}${message ? ': ' + message : ''}`);
  if (!success && details) {
    console.log(`${colors.yellow}Details:\n${details}${colors.reset}`);
  }
  return success;
}

// Show help if requested
if (options.help) {
  console.log(`
${colors.bold}${colors.blue}Planora.ai Architecture Validator${colors.reset}

Usage: node architecture-validator.js [options]

Options:
  --quick              Run only quick checks (good for pre-commit)
  --files="file1,file2" Only check specific files (comma-separated)
  --features          Only validate feature structure
  --deps              Only validate dependencies
  --ai                Run additional AI-specific validations
  --generate-docs     Generate architecture documentation
  --help, -h          Show this help message
  `);
  process.exit(0);
}

// Start validation process
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);
console.log(`${colors.bold}${colors.blue} Planora.ai Architecture Validation ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);

// Determine what files to check
let filesToCheck = [];
if (options.files.length > 0) {
  filesToCheck = options.files.map(file => path.resolve(rootDir, file));
  console.log(`${colors.cyan}Validating specific files: ${options.files.join(', ')}${colors.reset}\n`);
}

// Array to track all validation results
let allValidationsPassed = true;

// 1. Validate Dependency Structure
if (!options.featuresOnly && (!options.quick || options.depsOnly)) {
  printHeader('Dependency Structure Validation');
  const depCommand = filesToCheck.length > 0 
    ? `npx depcruise --validate ./.dependency-cruiser.cjs ${filesToCheck.join(' ')}`
    : 'npx depcruise --validate ./.dependency-cruiser.cjs src';
  const depCheck = runCommand(depCommand, { silent: true });
  allValidationsPassed = printResult('Dependency boundaries', depCheck.success, 
    depCheck.success ? '' : 'Found architectural boundary violations', depCheck.success ? '' : (depCheck.output || depCheck.error)) && allValidationsPassed;
}

// 2. ESLint Architecture Rules
if (!options.depsOnly && (!options.quick || options.featuresOnly)) {
  printHeader('ESLint Architecture Rules');
  const eslintCommand = filesToCheck.length > 0
    ? `npm run lint -- --no-fix ${filesToCheck.join(' ')}`
    : 'npm run lint -- --no-fix';
  const eslintCheck = runCommand(eslintCommand, { silent: true });
  const architectureErrors = eslintCheck.output.includes('planora/enforce-architecture');
  
  allValidationsPassed = printResult('ESLint architecture rules', !architectureErrors,
    architectureErrors ? 'Found violations in architecture rules' : '') && allValidationsPassed;
}

// 3. Check for index.ts files
if (!options.depsOnly && (!options.quick || options.featuresOnly)) {
  printHeader('File Structure Validation');
  const findCommand = filesToCheck.length > 0
    ? `find ${filesToCheck.join(' ')} -name "index.ts" -o -name "index.tsx" 2>/dev/null || true`
    : 'find src -name "index.ts" -o -name "index.tsx" 2>/dev/null || true';
  const noIndexTsCheck = runCommand(findCommand, { silent: true });
  const hasIndexFiles = noIndexTsCheck.output.trim().length > 0;

  allValidationsPassed = printResult('No index.ts files', !hasIndexFiles,
    hasIndexFiles ? 'Found forbidden index.ts files' : '') && allValidationsPassed;
}

// 4. Feature API Structure
if (!options.depsOnly) {
  printHeader('Feature API Structure');
  const featureDirs = fs.readdirSync(path.join(rootDir, 'src', 'features'));
  let featuresWithoutApi = [];
  let featuresWithNonStandardApi = [];
  let aiFeaturesMissingRequiredStructure = [];

// Helper function to convert kebab-case to camelCase
function kebabToCamelCase(kebabString) {
  return kebabString.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

featureDirs.forEach(dir => {
  if (fs.statSync(path.join(rootDir, 'src', 'features', dir)).isDirectory()) {
    // Convert kebab-case directory name to camelCase for API filename
    const camelCaseFeatureName = kebabToCamelCase(dir);
    
    // Check for standardized API file pattern: featureNameApi.ts
    const expectedApiFilename = `${camelCaseFeatureName}Api.ts`;
    const hasStandardApiFile = fs.existsSync(path.join(rootDir, 'src', 'features', dir, expectedApiFilename));
    
    // Check for any API files
    const apiFiles = fs.readdirSync(path.join(rootDir, 'src', 'features', dir))
      .filter(file => file.toLowerCase().includes('api') && file.endsWith('.ts'));
    
    if (apiFiles.length === 0) {
      featuresWithoutApi.push(dir);
    } else if (!hasStandardApiFile) {
      featuresWithNonStandardApi.push(dir);
    }
  }
});

allValidationsPassed = printResult('Feature API boundaries', featuresWithoutApi.length === 0,
  featuresWithoutApi.length > 0 ? `Features missing API: ${featuresWithoutApi.join(', ')}` : '') && allValidationsPassed;

  // 5. Check for standardized API naming pattern
  printHeader('API Naming Standards');
  allValidationsPassed = printResult('Standardized API naming pattern', featuresWithNonStandardApi.length === 0,
    featuresWithNonStandardApi.length > 0 ? `Features with non-standard API naming: ${featuresWithNonStandardApi.join(', ')}` : '') && allValidationsPassed;

  // 6. AI-specific validations
  if (options.aiValidation) {
    printHeader('AI Feature Validations');
    // Find all AI features (by convention, they start with 'ai-')
    const aiFeatures = featureDirs.filter(dir => dir.startsWith('ai-'));
    
    if (aiFeatures.length > 0) {
      console.log(`${colors.cyan}Found ${aiFeatures.length} AI features: ${aiFeatures.join(', ')}${colors.reset}`);
      
      aiFeatures.forEach(feature => {
        const featurePath = path.join(rootDir, 'src', 'features', feature);
        
        // 1. Check for required AI feature structure
        const requiredDirs = ['services', 'hooks', 'types'];
        const requiredFiles = [`${kebabToCamelCase(feature)}Api.ts`, 'README.md'];
        
        const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(featurePath, dir)));
        const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(featurePath, file)));
        
        if (missingDirs.length > 0 || missingFiles.length > 0) {
          aiFeaturesMissingRequiredStructure.push(feature);
          console.log(`${colors.yellow}AI feature ${feature} is missing required structure:${colors.reset}`);
          if (missingDirs.length > 0) console.log(`  - Missing directories: ${missingDirs.join(', ')}`);
          if (missingFiles.length > 0) console.log(`  - Missing files: ${missingFiles.join(', ')}`);
        }
        
        // 2. Check for try-catch patterns in async functions (basic check)
        const servicesDir = path.join(featurePath, 'services');
        if (fs.existsSync(servicesDir)) {
          const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
          
          for (const file of serviceFiles) {  
            const filePath = path.join(servicesDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for async functions without try-catch
            const asyncFunctions = content.match(/async\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
            const asyncFunctionsWithoutTryCatch = asyncFunctions.filter(fn => !fn.includes('try {'));
            
            if (asyncFunctionsWithoutTryCatch.length > 0) {
              console.log(`${colors.yellow}AI service ${file} has ${asyncFunctionsWithoutTryCatch.length} async functions without try-catch${colors.reset}`);
              allValidationsPassed = false;
            }
          }
        }
      });
      
      allValidationsPassed = printResult('AI feature structure', aiFeaturesMissingRequiredStructure.length === 0,
        aiFeaturesMissingRequiredStructure.length > 0 ? 
          `AI features missing required structure: ${aiFeaturesMissingRequiredStructure.join(', ')}` : 
          '') && allValidationsPassed;
    } else {
      console.log(`${colors.cyan}No AI features found. AI features should follow the naming convention 'ai-*'${colors.reset}`);
    }
  }
}

// Generate architecture documentation if requested
if (options.generateDocs) {
  printHeader('Generating Architecture Documentation');
  try {
    const docsResult = runCommand('node scripts/generate-architecture-diagram.js', { silent: false });
    if (docsResult.success) {
      console.log(`${colors.green}Successfully generated architecture documentation!${colors.reset}`);
    } else {
      console.log(`${colors.red}Failed to generate architecture documentation!${colors.reset}`);
      console.error(docsResult.error);
    }
  } catch (error) {
    console.log(`${colors.red}Failed to run documentation generator: ${error.message}${colors.reset}`);
  }
}

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
