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

Run the following SQL commands in the Supabase SQL Editor to create the necessary tables and functions:

```sql
-- Create profiles table to store user profile information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB
);

-- Create travel_plans table to store trip information
CREATE TABLE public.travel_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    budget NUMERIC,
    status TEXT DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profile reading
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Create policy for profile updating (users can only update their own profile)
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Set up Row Level Security (RLS) for travel plans
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for travel plans (users can only view their own travel plans)
CREATE POLICY "Users can view their own travel plans" 
ON public.travel_plans FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for travel plans (users can only manage their own travel plans)
CREATE POLICY "Users can manage their own travel plans" 
ON public.travel_plans FOR ALL 
USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, email, created_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

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
