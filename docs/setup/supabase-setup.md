# Supabase Setup Guide for Planora.ai

This guide provides step-by-step instructions for setting up the Supabase backend for the Planora.ai application, enabling user authentication, profile management, and travel planning features.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project with a name of your choice
3. Make note of your project URL and anon/public key (you'll need these for the `.env` file)

## 2. Enable Authentication Providers

1. In the Supabase dashboard, navigate to **Authentication** → **Providers**
2. Ensure **Email** is enabled with the following settings:
   - Confirm emails: Enabled
   - Secure email change: Enabled
   - Custom email templates: Use defaults for now
3. For Google Authentication (optional but recommended):
   - Enable Google provider
   - Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/)
   - Configure the redirect URL as `https://your-project-id.supabase.co/auth/v1/callback`
   - Add your Google Client ID and Secret

## 3. Database Setup

The database schema, including tables, RLS policies, and triggers, is managed through SQL scripts located in the `src/database/schema/` directory. For a new setup, you should execute these scripts in the Supabase SQL Editor.

**Primary Setup Script:**

1.  Navigate to the Supabase SQL Editor for your project.
2.  Open the file `src/database/schema/consolidated-email-verification.sql` from your local project codebase.
3.  Copy the entire content of this script.
4.  Paste it into the Supabase SQL Editor and run it.

    This script will:
    *   Create core tables: `profiles`, `travel_preferences`, `verification_codes`, `email_change_tracking`, `account_deletion_requests`, `session_storage`, `rate_limit_storage`.
    *   Set up necessary columns, constraints, and default values.
    *   Implement Row Level Security (RLS) policies for these tables.
    *   Create triggers, such as `handle_new_user` for automatic profile creation.
    *   Add helper functions like `generate_verification_code`.

**Chat Feature Schema (Optional):**

*   If you intend to use the chat functionality, you also need to run the `src/database/schema/chat-tables.sql` script in the Supabase SQL Editor. This will set up the `messages` and `conversations` tables.

**Other Scripts:**

*   The `src/database/schema/` directory may contain other scripts like `unified-user-data-update.sql` or an older `supabase-database-setup.sql`. These are generally for specific data migrations or older setup versions. For a **new project setup**, `consolidated-email-verification.sql` (and `chat-tables.sql` if needed) should be sufficient. Review other scripts only if you are migrating an existing, older database or require a specific utility they provide.

## 4. Configure Environment Variables

1. Copy the `.env.example` file to `.env`
2. Fill in your Supabase URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Deploy to Vercel

1. Push your code to a GitHub repository
2. Create a new project in [Vercel](https://vercel.com/)
3. Import your GitHub repository
4. Add the environment variables from your `.env` file
5. Deploy the application

## Testing Authentication

Once deployed, you should be able to:

1. Register new users with email verification
2. Sign in with email and password
3. Sign in with Google (if configured)
4. Access protected routes only when authenticated
5. Update user profiles

## Troubleshooting

- **Email Verification Not Working**: Ensure your Supabase project has email confirmation enabled and check the "Site URL" in Authentication settings
- **Google Auth Redirect Issues**: Verify that your Google OAuth configuration has the correct redirect URI
- **Database Access Errors**: Check that Row Level Security (RLS) policies are configured correctly

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in the Planora.ai repository.
