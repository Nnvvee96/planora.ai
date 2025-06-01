#!/bin/bash
# Script to deploy to Vercel with proper configuration

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null
then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (will prompt if not already logged in)
vercel login

# Deploy with legacy-peer-deps flag to handle dependency conflicts
vercel --prod --build-env NPM_FLAGS="--legacy-peer-deps"

echo "Deployment initiated! Check the Vercel dashboard for progress."
