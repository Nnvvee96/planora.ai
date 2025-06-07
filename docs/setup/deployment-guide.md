# Planora.ai Deployment Guide

This guide provides instructions for deploying Planora.ai to Vercel for production use.

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. [Git repository](https://github.com/new) with your Planora codebase
3. [Supabase project](https://supabase.com/) properly configured
4. All environment variables prepared

## Environment Variables

The following environment variables must be configured in your Vercel project:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | The URL of your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | The anon/public key for your Supabase project |
| `VITE_FEATURE_FLAGS_ENABLED` | Set to 'true' to enable feature flags |

## Configuration Files

Planora.ai includes several configuration files that are essential for deployment:

| File | Purpose |
|------|--------|
| `vercel.json` | Main Vercel configuration file for routing and headers |
| `vercel.build.json` | Configures build options with legacy-peer-deps |
| `vercel-deploy.sh` | Shell script for manual deployments with Vercel CLI |

These files ensure proper deployment with all necessary dependencies and configurations. They are located in the project's root directory. For a comprehensive overview of all project configuration files and their locations, please refer to the `docs/setup/configuration-guide.md`.

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the Planora.ai project

### 2. Configure Project Settings

1. Framework Preset: Select "Vite"
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Node.js Version: 18.x or higher

### 3. Add Environment Variables

1. Go to the "Environment Variables" section
2. Add all required variables from the table above
3. Click "Deploy" to proceed

### 4. Verify Deployment

1. Wait for the build to complete
2. Visit your deployed site and verify functionality
3. Test authentication and core features

## Custom Domains

To use a custom domain with your deployed Planora.ai site:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the verification steps provided by Vercel

## Continuous Deployment

Vercel automatically deploys new commits pushed to your main branch. To change this behavior:

1. Go to your project settings in Vercel
2. Navigate to "Git"
3. Adjust the production branch as needed
4. Configure the "ignored build step" if you wish to prevent deployments for certain changes

## Deployment Best Practices

1. **Always run tests before deploying**: `npm run test`
2. **Use preview deployments**: Push to a development branch before merging to main
3. **Monitor error logs**: Check Vercel's dashboard for any build or runtime errors
4. **Implement rollbacks**: If issues occur, revert to a previous deployment in Vercel

## Troubleshooting

### Build Failures

- Check build logs in Vercel for specific errors
- Validate all required environment variables are set correctly
- Ensure dependencies are correctly configured in package.json

### Runtime Errors

- Use browser developer tools to identify client-side errors
- Check Vercel's Function Logs for server-side issues
- Verify Supabase connectivity from the deployed application

## Security Considerations

- Never commit sensitive environment variables to your repository
- Regularly rotate your Supabase keys and update deployment
- Use environment-specific API keys for staging and production
- Follow the [security checklist](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#security) for Supabase integration

For additional support or questions, contact the repository maintainers.
