# Planora Production Setup Guide

## Configuring Authentication for Production

Now that you're moving from a tunnel-based development setup to a proper production deployment, you need to update your configurations in both Google Cloud Console and Supabase.

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Find your OAuth 2.0 Client ID for Planora
4. Add these authorized redirect URIs:
   - `https://planora.windsurf.build/auth/callback` (Production Netlify URL)
   - `http://localhost:5173/auth/callback` (Development)
   - `https://vwzbowcvbrchbpqjcnkg.supabase.co/auth/v1/callback` (Supabase project URL)
5. Remove any tunnel URLs (like `https://planora-ai.loca.lt/auth/callback`)

### 2. Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your Planora project
3. Navigate to "Authentication" → "URL Configuration"
4. Set the Site URL to your production URL:
   - `https://planora.windsurf.build` (Production URL)
5. Update Redirect URLs:
   - Add: `https://planora.windsurf.build/auth/callback` (Production)
   - Keep: `http://localhost:5173/auth/callback` (Development)
   - Remove any tunnel URLs

### 3. Netlify Deployment Configuration

For a successful Netlify deployment, ensure your `netlify.toml` file is properly configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Environment Variables

Make sure to add these environment variables in your Netlify deployment settings:

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Testing Authentication in Production

After deployment, use these steps to verify authentication is working:

1. Visit your production site at `https://planora.windsurf.build`
2. Try signing in with Google
3. Confirm you're properly redirected back to the application
4. Verify your user data loads correctly

## Local Development Setup

For local development, you simply need to:

1. Run your development server with `npm run dev`
2. Access the app at `http://localhost:5173`
3. Google sign-in should work seamlessly between environments now

## Troubleshooting Common Issues

- **"Invalid redirect_uri"**: Check that your URL is correctly registered in Google Cloud Console
- **"Not authorized"**: Confirm your Supabase project has the correct site URLs configured
- **404 errors after login**: Ensure your Netlify redirects are properly configured in `netlify.toml`
