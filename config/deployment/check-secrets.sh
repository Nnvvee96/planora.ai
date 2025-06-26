#!/bin/bash
# Script to check for potentially exposed secrets in the codebase

echo "🔍 Checking for potentially exposed secrets..."

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any secrets were found
FOUND_SECRETS=0

# Function to check for patterns
check_pattern() {
    local pattern=$1
    local description=$2
    
    echo -e "\n${YELLOW}Looking for ${description}...${NC}"
    
    # Search for the pattern, excluding common safe files
    result=$(grep -r "$pattern" \
        --include="*.{js,ts,json,md,html,jsx,tsx,env,yml,yaml}" \
        --exclude-dir="node_modules" \
        --exclude-dir="dist" \
        --exclude-dir=".git" \
        --exclude="*.lock" \
        --exclude="*.example" \
        --exclude="check-secrets.sh" \
        . 2>/dev/null | head -20)
    
    if [ -n "$result" ]; then
        echo -e "${RED}⚠️  Found potential ${description}:${NC}"
        echo "$result" | head -10
        if [ $(echo "$result" | wc -l) -gt 10 ]; then
            echo "... and more (showing first 10 results)"
        fi
        FOUND_SECRETS=1
    else
        echo -e "${GREEN}✓ No ${description} found${NC}"
    fi
}

# JWT tokens
check_pattern "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" "JWT tokens"

# Generic API keys
check_pattern "['\"]?[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]" "API keys"

# Generic secrets
check_pattern "['\"]?[Ss][Ee][Cc][Rr][Ee][Tt][_-]?[Kk][Ee][Yy]['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]" "secret keys"

# AWS patterns
check_pattern "AKIA[0-9A-Z]{16}" "AWS Access Key IDs"
check_pattern "['\"]?aws[_-]?secret[_-]?access[_-]?key['\"]?\s*[:=]\s*['\"][a-zA-Z0-9/+=]{40}['\"]" "AWS Secret Keys"

# Google Cloud patterns
check_pattern "AIza[0-9A-Za-z_-]{35}" "Google API keys"
check_pattern "[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com" "Google OAuth IDs"

# Azure patterns
check_pattern "DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[a-zA-Z0-9+/=]{88}" "Azure Storage keys"

# Stripe patterns
check_pattern "sk_live_[0-9a-zA-Z]{24,}" "Stripe live secret keys"
check_pattern "rk_live_[0-9a-zA-Z]{24,}" "Stripe restricted keys"

# Database URLs with credentials
check_pattern "postgres://[^:]+:[^@]+@[^/]+/[^\s\"']+" "PostgreSQL URLs with credentials"
check_pattern "mysql://[^:]+:[^@]+@[^/]+/[^\s\"']+" "MySQL URLs with credentials"
check_pattern "mongodb(\+srv)?://[^:]+:[^@]+@[^/]+/[^\s\"']+" "MongoDB URLs with credentials"

# Private keys
check_pattern "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----" "private keys"

# Supabase specific (excluding environment variables)
check_pattern "sb[a-z]{0,10}-[a-zA-Z0-9_-]{20,}" "Supabase project references (non-env)"
check_pattern "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+" "Supabase anon/service keys (non-env)"

# Generic passwords (excluding form fields and validation)
check_pattern "['\"]?password['\"]?\s*[:=]\s*['\"][^'\"]{8,}['\"]" "hardcoded passwords (excluding UI fields)"

# Environment files that shouldn't be committed
echo -e "\n${YELLOW}Looking for environment files...${NC}"
env_files=$(find . -name ".env*" -not -name ".env.example" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$env_files" ]; then
    echo -e "${RED}⚠️  Found environment files that should not be committed:${NC}"
    echo "$env_files"
    FOUND_SECRETS=1
else
    echo -e "${GREEN}✓ No dangerous environment files found${NC}"
fi

# Summary
echo -e "\n${YELLOW}========================================${NC}"
if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ Security check passed! No secrets detected.${NC}"
    echo "Remember to always use environment variables for sensitive data."
    exit 0
else
    echo -e "${RED}❌ Security check failed! Potential secrets detected.${NC}"
    echo "Please review the findings above and:"
    echo "1. Move any real secrets to environment variables"
    echo "2. Rotate any exposed credentials immediately"
    echo "3. Add false positives to .gitignore or adjust the patterns"
    exit 1
fi
