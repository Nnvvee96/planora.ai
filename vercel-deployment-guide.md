# Planora Vercel Deployment Guide

This guide provides instructions for deploying Planora to Vercel while maintaining our architectural principles and code standards.

## Deployment Preparation

### 1. Code Architecture

Our updated codebase follows these key architectural principles:
- **Separation of Concerns**: Authentication logic is properly isolated from UI components
- **Feature-First Organization**: All code is organized by feature domain
- **No Redundancy**: Shared functionality like URL detection is centralized
- **Clean Code**: Consistent naming and documentation throughout

### 2. Vercel Configuration

1. Go to [Vercel's website](https://vercel.com) and create an account
2. Create a new project and connect your GitHub repository (or upload files directly)
3. Configure the following settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Development Command**: `npm run dev`

4. Add these environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. Deploy your application

## Authentication Configuration

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Find your OAuth 2.0 Client ID for Planora
4. Add these authorized redirect URIs:
   - `https://planora.vercel.app/auth/callback` (Production URL)
   - `http://localhost:5173/auth/callback` (Development)
   - `https://vwzbowcvbrchbpqjcnkg.supabase.co/auth/v1/callback` (Supabase project URL)

### 2. Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your Planora project
3. Navigate to "Authentication" → "URL Configuration"
4. Set the Site URL to your production URL:
   - `https://planora.vercel.app`
5. Update Redirect URLs:
   - Add: `https://planora.vercel.app/auth/callback` (Production)
   - Keep: `http://localhost:5173/auth/callback` (Development)

## Development Workflow

For local development:
1. Run `npm run dev` to start the development server
2. Access the app at `http://localhost:5173`

The authentication flow will automatically detect whether you're in development or production and use the appropriate URL.

## Troubleshooting

- **Authentication Issues**: If sign-in doesn't work, verify the Google Cloud Console and Supabase configurations
- **Deployment Failures**: Check the build logs in Vercel for specific error messages
- **Environment Variables**: Ensure all required environment variables are set correctly
