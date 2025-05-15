#!/usr/bin/env node
/**
 * Comprehensive architecture validation script
 * 
 * This script runs all architecture validation checks to ensure
 * our clean architecture principles are maintained.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Print header
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);
console.log(`${colors.bold}${colors.blue} Planora.ai Architecture Validation ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================${colors.reset}`);
console.log();

const validationSteps = [
  {
    name: 'Dependency Boundaries',
    command: 'npx dependency-cruiser --config .dependency-cruiser.cjs --output-type err-long src',
    successMessage: 'All dependency boundaries are respected',
    errorMessage: 'Dependency boundary violations detected'
  },
  {
    name: 'ESLint Architecture Rules',
    command: 'npx eslint --ext .ts,.tsx --quiet ./src --no-error-on-unmatched-pattern',
    successMessage: 'ESLint architecture rules pass',
    errorMessage: 'ESLint architecture rules failed'
  },
  {
    name: 'No Index Files',
    command: 'find ./src -name "index.ts" -o -name "index.tsx" -o -name "index.js" -o -name "index.jsx"',
    successMessage: 'No index files found',
    errorMessage: 'Index files detected - please use descriptive filenames instead',
    invertResult: true
  },
  {
    name: 'Feature Export Validation',
    command: 'find ./src/features -type d -depth 1 -exec bash -c "test -f {}/api.ts" \\; -print',
    successMessage: 'All features have public API exports',
    errorMessage: 'Some features are missing public API exports',
    customEvaluation: (output, exitCode) => {
      // Get all feature directories
      const featureDirs = fs.readdirSync(path.join(process.cwd(), 'src', 'features'))
        .filter(item => fs.statSync(path.join(process.cwd(), 'src', 'features', item)).isDirectory());
      
      // Parse output to get features with api.ts
      const featuresWithApi = output.trim().split('\n').filter(Boolean)
        .map(line => path.basename(line));
      
      const missingApiFiles = featureDirs.filter(dir => !featuresWithApi.includes(dir));
      
      if (missingApiFiles.length > 0) {
        console.log(`${colors.red}The following features are missing api.ts files:${colors.reset}`);
        missingApiFiles.forEach(dir => console.log(`  - ${dir}`));
        return false;
      }
      
      return true;
    }
  }
];

let allPassed = true;

// Run each validation step
validationSteps.forEach((step, index) => {
  console.log(`${colors.cyan}[${index + 1}/${validationSteps.length}] ${step.name}...${colors.reset}`);
  
  try {
    const output = execSync(step.command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    let passed;
    if (step.customEvaluation) {
      passed = step.customEvaluation(output, 0);
    } else if (step.invertResult) {
      passed = output.trim() === '';
    } else {
      passed = true;
    }
    
    if (passed) {
      console.log(`  ${colors.green}✓ ${step.successMessage}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${step.errorMessage}${colors.reset}`);
      if (output.trim() !== '') {
        console.log(`  ${colors.yellow}${output}${colors.reset}`);
      }
      allPassed = false;
    }
  } catch (error) {
    if (step.invertResult) {
      console.log(`  ${colors.green}✓ ${step.successMessage}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${step.errorMessage}${colors.reset}`);
      if (error.stdout) {
        console.log(`  ${colors.yellow}${error.stdout}${colors.reset}`);
      }
      if (error.stderr) {
        console.log(`  ${colors.yellow}${error.stderr}${colors.reset}`);
      }
      allPassed = false;
    }
  }
  
  console.log();
});

// Print summary
if (allPassed) {
  console.log(`${colors.green}${colors.bold}✓ All architecture validation checks passed!${colors.reset}`);
} else {
  console.log(`${colors.red}${colors.bold}✗ Some architecture validation checks failed. Please fix the issues above.${colors.reset}`);
  process.exit(1);
}
