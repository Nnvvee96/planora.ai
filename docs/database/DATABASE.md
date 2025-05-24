# Database Structure

This document provides an overview of the Planora database structure and implementation.

## Architecture

The database implementation follows Planora's architectural principles:
- Feature-first organization
- Separation of concerns
- No redundancy
- Clean code with proper error handling

## Structure

```
src/database/
├── client/
│   └── supabaseClient.ts    # Supabase client configuration
├── schema/
│   ├── schema.sql           # Main database schema with tables definitions
│   ├── rls-policies.sql     # Row Level Security policies
│   └── database-setup.sql   # Complete database setup script
└── databaseExports.ts       # Named exports for database components
```

## Tables

### profiles

Stores user profile information:
- `id`: UUID (Primary Key, references auth.users)
- `first_name`: TEXT
- `last_name`: TEXT
- `email`: TEXT (UNIQUE)
- `birthday`: DATE
- `avatar_url`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE
- `has_completed_onboarding`: BOOLEAN

### travel_preferences

Stores user travel preferences:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users)
- `budget_min`: INTEGER
- `budget_max`: INTEGER
- `budget_flexibility`: INTEGER
- `travel_duration`: TEXT
- `date_flexibility`: TEXT
- `custom_date_flexibility`: TEXT
- `planning_intent`: TEXT
- `accommodation_types`: TEXT[]
- `accommodation_comfort`: TEXT[]
- `location_preference`: TEXT
- `flight_type`: TEXT
- `prefer_cheaper_with_stopover`: BOOLEAN
- `departure_city`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

## Database Setup

The database can be set up by executing the SQL scripts in the Supabase SQL Editor. The recommended approach is to use the `database-setup.sql` script, which combines table creation, triggers, and RLS policies in one script.

### Setup Steps

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/database/schema/database-setup.sql`
4. Execute the script in the SQL Editor

### Important Components

1. **Tables**: The script creates the `profiles` and `travel_preferences` tables with appropriate columns and constraints.

2. **Automatic Profile Creation**: A trigger automatically creates a profile entry when a new user signs up.

   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, first_name, last_name)
     VALUES (new.id, new.email, ...) -- Extracts data from auth.users
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. **Row Level Security (RLS)**: The script configures RLS policies to ensure users can only access their own data.

## Authentication Flow

Planora implements a comprehensive authentication flow that handles both new and returning users, with proper redirection to onboarding or dashboard based on their status.

### User Registration Status Checks

The `supabaseAuthService` provides a `checkUserRegistrationStatus` function that determines:

- If a user is new or returning
- If they have completed onboarding
- If they have travel preferences saved

This check uses multiple data sources for reliability:

```typescript
// Example: Checking user registration status
const registrationDetails = await supabaseAuthService.checkUserRegistrationStatus(userId);

if (registrationDetails.isNewUser) {
  // Redirect to onboarding
} else if (registrationDetails.hasCompletedOnboarding) {
  // Redirect to dashboard
} else {
  // Redirect to onboarding with returning=true flag
}
```

### Onboarding Data Persistence

When a user completes onboarding, their travel preferences are saved to the database with proper error handling and RLS consideration:

1. The travel preferences are saved to the `travel_preferences` table
2. The profile is updated to mark onboarding as completed
3. User metadata is updated as a backup source of truth

## Security

The database uses Row Level Security (RLS) to ensure that users can only access their own data:

- Users can only view, update, or delete their own profile
- Users can only view, update, or delete their own travel preferences
- Service role can access all profiles for administrative purposes

## Usage

To use the database client in feature code:

```typescript
// Import the Supabase client
import { supabase } from '@/database/databaseExports';

// Example query
const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};
```
