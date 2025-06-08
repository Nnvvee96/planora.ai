# Planora.ai Deployment Guide (Cloudflare Pages)

This guide provides instructions for deploying Planora.ai to Cloudflare Pages for production use.

## Prerequisites

Before deploying, ensure you have:

1. A [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. A [GitHub repository](https://github.com/new) with your Planora codebase
3. A [Supabase project](https://supabase.com/) properly configured (see `docs/setup/supabase-setup.md`)
4. All necessary environment variables prepared

## Environment Variables

The following environment variables must be configured in your Cloudflare Pages project (Settings > Environment variables > Production and Preview):

| Variable                      | Description                                     | Example Value                               |
|-------------------------------|-------------------------------------------------|---------------------------------------------|
| `VITE_SUPABASE_URL`           | The URL of your Supabase project                | `https://your-project-id.supabase.co`       |
| `VITE_SUPABASE_ANON_KEY`      | The anon/public key for your Supabase project   | `your-anon-key`                             |
| `VITE_APP_URL`                | The production URL of your application          | `https://getplanora.app`                    |
| `VITE_GOOGLE_AUTH_REDIRECT_URI` | Google Auth redirect URI for production       | `https://getplanora.app/auth/callback`      |
| `VITE_APPLE_AUTH_REDIRECT_URI`  | Apple Auth redirect URI for production        | `https://getplanora.app/auth/callback`      |
| `VITE_ENABLE_GOOGLE_AUTH`     | Enable Google Authentication ('true' or 'false')| `true`                                      |
| `VITE_ENABLE_APPLE_AUTH`      | Enable Apple Authentication ('true' or 'false') | `true`                                      |
| `VITE_ENABLE_EMAIL_AUTH`      | Enable Email Authentication ('true' or 'false') | `true`                                      |
| `NODE_VERSION`                | Specify Node.js version for build environment   | `18` or `20` (as per your project needs)    |
| `VITE_NODE_ENV`               | Set to `production` for production builds       | `production`                                |
<!-- Add other relevant environment variables from your .env file -->

## Deployment Steps

### 1. Connect Your Repository to Cloudflare Pages

1.  Log in to your [Cloudflare dashboard](https://dash.cloudflare.com/).
2.  In the account Home, select **Workers & Pages**.
3.  Click **Create application**.
4.  Select the **Pages** tab.
5.  Click **Connect to Git**.
6.  Choose your GitHub account and select the Planora.ai repository.
7.  Click **Begin setup**.

### 2. Configure Build Settings

On the "Set up builds and deployments" page:

1.  **Project name**: Enter a name for your project (e.g., `planora-ai`). This will be part of your `*.pages.dev` subdomain.
2.  **Production branch**: Select your main production branch (e.g., `main`).
3.  **Framework preset**: Select `Vite`. Cloudflare should auto-detect this.
4.  **Build command**: If not auto-filled, set to `npm run build` or `vite build`.
5.  **Build output directory**: If not auto-filled, set to `dist`.
6.  **Root directory** (under Build configurations): Leave as is (root of your repo) unless your project is in a monorepo subdirectory.
7.  **Environment variables (Build system)**: Add `NODE_VERSION` (e.g., `18` or `20`). You can add other build-time variables here if needed. Runtime variables should be added in the project settings after the first deployment.

### 3. Save and Deploy

1.  Click **Save and Deploy**.
2.  Cloudflare Pages will start building and deploying your application. You can monitor the progress.

### 4. Add Runtime Environment Variables

After the first deployment is successful:

1.  Go to your new Pages project in the Cloudflare dashboard.
2.  Navigate to **Settings** > **Environment variables**.
3.  Add all the runtime environment variables listed above (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`, etc.) for both **Production** and **Preview** environments.
    *   **Important**: Ensure `VITE_APP_URL` and auth redirect URIs point to your custom domain if you've set one up (e.g., `https://getplanora.app`), or to the `*.pages.dev` domain if you're using that.
    *   Set `VITE_NODE_ENV` to `production`.

### 5. Verify Deployment

1.  Once the deployment is complete, visit your `*.pages.dev` URL (e.g., `planora-ai.pages.dev`).
2.  Test all core functionalities, especially authentication and Supabase interactions.

## Custom Domains

To use a custom domain (e.g., `getplanora.app`) with your Cloudflare Pages project:

1.  In your Pages project settings, go to **Custom domains**.
2.  Click **Set up a custom domain**.
3.  Enter your custom domain and follow the instructions. This usually involves adding a `CNAME` record in your DNS settings (if your DNS is managed outside Cloudflare) or Cloudflare will handle it if your domain's DNS is managed by Cloudflare.
    *   For the root domain (`getplanora.app`), use a `CNAME` record pointing to your `*.pages.dev` domain (e.g., `planora-ai.pages.dev`). Cloudflare supports CNAME flattening.
    *   For subdomains like `www.getplanora.app`, also use a `CNAME` record pointing to your `*.pages.dev` domain.
4.  Ensure SSL/TLS encryption mode is set to "Full" or "Full (Strict)" in your Cloudflare SSL/TLS settings for the domain.

## Continuous Deployment

Cloudflare Pages automatically deploys new commits pushed to your configured production branch. It also creates preview deployments for pull requests by default.

## Troubleshooting

### Build Failures

*   Check the build logs in the Cloudflare Pages dashboard for specific errors.
*   Ensure `NODE_VERSION` is set correctly.
*   Verify that all dependencies in `package.json` are compatible and can be installed.
*   Make sure your build command (`npm run build`) and output directory (`dist`) are correct.

### Runtime Errors

*   Use browser developer tools to identify client-side errors.
*   Check that all required environment variables are set correctly in Cloudflare Pages project settings for both Production and Preview environments.
*   Verify Supabase connectivity and that the URLs/keys are correct.
*   If using Cloudflare Access or other security features, ensure they are configured correctly.

For additional support, refer to the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).
