#!/bin/bash
# Script to check for potentially exposed secrets in the codebase

echo "Checking for potentially exposed secrets..."
echo "Looking for JWT patterns..."
grep -r "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" --include="*.{js,ts,json,md,html,jsx,tsx}" .

echo "Looking for environment files..."
find . -name ".env*" -not -name ".env.example"

echo "Looking for API keys..."
grep -r "api[_-]key\|apikey\|key\|token\|secret\|password\|credential" --include="*.{js,ts,json,md,html,jsx,tsx}" .

echo "Done. Review any findings carefully."
echo "Remember to use environment variables for all secrets and never commit them to the repo."
