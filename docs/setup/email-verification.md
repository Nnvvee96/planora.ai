# Supabase Email Verification Setup

This guide will walk you through setting up email verification in Supabase for Planora.ai. It primarily covers Supabase dashboard configurations for standard email flows (like initial signup confirmation and password resets).

It's important to note that the Planora application also implements custom logic for managing verification codes for various purposes (e.g., email changes, potentially two-factor authentication). This involves a dedicated `verification_codes` table in the database and helper functions (like `public.generate_verification_code`) defined in the main schema script (`src/database/schema/consolidated-email-verification.sql`). For details on these application-level components, please refer to `docs/database/DATABASE.md`.

## 1. Access Your Supabase Project

Navigate to your project dashboard at: https://app.supabase.com and select your project.

## 2. Configure Email Templates

1. In the sidebar, navigate to **Authentication** → **Email Templates**
2. You'll find templates for:
   - Confirmation (for email verification)
   - Invitation
   - Magic Link
   - Reset Password

### Customizing the Confirmation Template

1. Click on the **Confirmation** template
2. Update the following fields:

**Subject Line:**
```
Verify your email for Planora.ai
```

**Email Body:**
```html
<h2>Welcome to Planora.ai!</h2>

<p>Please verify your email to start planning your trips with AI.</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(to right, #8a2be2, #ff69b4); color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
    Verify My Email
  </a>
</p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>
  Thanks,<br>
  The Planora.ai Team
</p>
```

## 3. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - Ensure "**Enable Email Signup**" is ON
   - Make sure "**Enable Email Confirmations**" is ON
   - Set "**Secure Email Change**" based on your preference

## 4. Set Your Site URL and Redirects

1. Under **URL Configuration**:
   - Set "Site URL" to your production URL (or `http://localhost:5173` for testing)
   - Add the following Redirect URLs:
     - `http://localhost:5173/auth/callback`
     - Your production URL + `/auth/callback`

## 5. Email Provider Configuration (Optional for Production)

For production use, you might want to configure a custom SMTP server:

1. Go to **Authentication** → **Email Settings**
2. Click "Use custom SMTP server"
3. Add your SMTP credentials from providers like SendGrid, Mailgun, etc.
4. Test the configuration to ensure it works

## 6. Testing the Email Verification Flow

To test the complete email verification flow:

1. Register a new user through your application
2. You should receive a verification email
   - In development, check Supabase's **Authentication** → **Users** section to see the email in the "Last Sign In" column
   - In production, the email will be sent to the user's inbox
3. Click the verification link
4. You should be redirected to your application and logged in automatically

## 7. Troubleshooting

If email verification is not working:

1. Check the **Auth Logs** in Supabase dashboard
2. Verify your site URL and redirect URL settings
3. Ensure your auth callback route (`/auth/callback`) is properly set up in your application
4. Check that your SMTP settings are correct (if using a custom provider).
5. Review the application's `verification_codes` table and any related Edge Functions or services (e.g., `verification-code-handler` if used) for issues in custom verification flows. Consult `docs/database/DATABASE.md` for schema details.

For development purposes, you can also manually confirm user emails in the Supabase dashboard under **Authentication** → **Users** → select user → **Actions** → **Confirm user email**.
