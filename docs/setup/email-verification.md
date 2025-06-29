# Email Verification Setup - Simplified Authentication System

This guide covers the email verification setup for Planora.ai's simplified authentication system using standard Supabase email confirmation.

## Overview

Planora.ai uses **standard Supabase email confirmation** for secure, reliable email verification:

- ✅ **Simplified Flow**: No custom verification codes
- ✅ **Built-in Security**: Supabase handles all email verification logic
- ✅ **Reliable Delivery**: Uses Supabase's email infrastructure
- ✅ **Mobile-Friendly**: Standard email confirmation links work on all devices

## Authentication Flow

### Email Registration
```
1. User fills registration form
2. Supabase sends email confirmation link
3. User clicks link to verify email
4. Login is enabled
5. Onboarding is required before dashboard access
```

### Google OAuth
```
1. User signs in with Google
2. Email is automatically verified
3. User proceeds to onboarding
4. Dashboard access after onboarding completion
```

## Supabase Configuration

### Email Templates

Configure email templates in Supabase Dashboard → Authentication → Email Templates:

#### Confirm Signup Template
```html
<h2>Welcome to Planora!</h2>
<p>Thanks for signing up. Please click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
```

#### Magic Link Template
```html
<h2>Sign in to Planora</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

### URL Configuration

Set the following URLs in Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://yourdomain.com
Redirect URLs: 
  - https://yourdomain.com/auth/callback
  - https://yourdomain.com/auth/email-confirmation
  - http://localhost:5173/auth/callback (for development)
  - http://localhost:5173/auth/email-confirmation (for development)
```

## Frontend Implementation

### Registration Component
```typescript
// Standard Supabase registration
const handleRegistration = async (formData: RegisterFormData) => {
  const { user, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        city: formData.city,
        birthdate: formData.birthdate.toISOString(),
      },
      emailRedirectTo: `${window.location.origin}/auth/email-confirmation`,
    },
  });

  if (error) throw error;
  
  // Show success message
  toast({
    title: "Registration Successful!",
    description: "Please check your email to verify your account.",
  });
};
```

### Email Confirmation Handler
```typescript
// Handle email confirmation callback
export const EmailConfirmation = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Verification Failed",
          description: "Invalid or expired verification link.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (data.session?.user) {
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully.",
        });
        navigate("/onboarding");
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return <div>Verifying your email...</div>;
};
```

### Protected Route Implementation
```typescript
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    // Check email verification
    if (user && !user.email_confirmed_at) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email before continuing.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Check onboarding completion
    if (user && !user.user_metadata?.has_completed_onboarding) {
      navigate("/onboarding");
      return;
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user || !user.email_confirmed_at) return null;

  return <>{children}</>;
};
```

## Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URL
VITE_APP_URL=https://yourdomain.com
```

## Security Features

### Email Verification Security
- ✅ **Secure Tokens**: Supabase generates cryptographically secure verification tokens
- ✅ **Time-Limited Links**: Verification links expire automatically
- ✅ **Single Use**: Verification links can only be used once
- ✅ **Domain Validation**: Links only work for configured domains

### Route Protection
- ✅ **Email Verification Required**: Login blocked until email is verified
- ✅ **Onboarding Persistence**: Dashboard blocked until onboarding is complete
- ✅ **Session Management**: Proper token handling and expiration
- ✅ **Redirect Security**: Safe redirects to prevent open redirect attacks

## Troubleshooting

### Common Issues

#### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase email settings
4. Ensure SMTP configuration is correct

#### Verification Link Not Working
1. Check if link has expired
2. Verify redirect URLs are configured correctly
3. Ensure the link hasn't been used already
4. Check browser console for errors

#### Development Issues
1. Ensure localhost URLs are added to redirect URLs
2. Check environment variables are loaded correctly
3. Verify Supabase project settings match local config

### Debug Commands
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test Supabase connection
npm run dev
# Check browser console for connection errors
```

## Migration from Custom Verification

If migrating from a custom verification code system:

### Database Cleanup
```sql
-- Remove old verification code tables
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP FUNCTION IF EXISTS create_verification_code CASCADE;
DROP FUNCTION IF EXISTS verify_code CASCADE;

-- Update profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS verification_code,
DROP COLUMN IF EXISTS verification_code_expires_at;
```

### Frontend Updates
1. Remove custom verification components
2. Update registration flow to use Supabase signup
3. Add email confirmation handler
4. Update protected routes for email verification

### Benefits of Standard Supabase Email Verification
- ✅ **Reduced Complexity**: No custom verification code logic
- ✅ **Better Security**: Battle-tested Supabase security
- ✅ **Improved UX**: Standard email confirmation flow
- ✅ **Mobile Friendly**: Works seamlessly on all devices
- ✅ **Reliability**: Supabase handles email delivery and retries

## Testing

### Manual Testing
1. Register with a new email address
2. Check email for verification link
3. Click verification link
4. Verify redirect to onboarding
5. Complete onboarding
6. Verify dashboard access

### Automated Testing
```typescript
// Test email verification flow
describe('Email Verification', () => {
  it('should require email verification before login', async () => {
    // Test registration
    // Test email verification requirement
    // Test successful verification
    // Test onboarding redirect
  });
});
```

This simplified email verification system provides a secure, reliable, and user-friendly authentication experience while reducing complexity and maintenance overhead.
