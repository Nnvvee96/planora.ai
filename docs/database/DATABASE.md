# Database Structure

This document provides an overview of the Planora database structure and implementation.

## Architecture

The database implementation follows Planora's architectural principles:
- Feature-first organization
- Separation of concerns
- No redundancy
- Clean code with proper error handling

### Database Access Rules

**Critical**: The following rules must be strictly followed when accessing the database:

1. **No Direct Database Access in UI Components**
   - UI components must never directly import or use database clients
   - All database operations must be performed through service layers

2. **Feature Isolation**
   - Each feature must access only its own database tables through feature-specific services
   - Cross-feature data access must use integration hooks and API boundaries

3. **Type Safety**
   - All database operations must use proper type definitions
   - Database schemas must be mapped to application types via factory functions

4. **Error Handling**
   - All database operations must include proper error handling
   - Use fallback mechanisms for critical operations (e.g., upsert with onConflict for RLS)

## Structure

```
src/database/
├── client/
│   └── supabaseClient.ts    # Supabase client configuration
├── functions/               # Directory for database-related Edge Functions (locally defined part, if any)
├── schema/
│   ├── consolidated-email-verification.sql  # Main comprehensive schema (profiles, travel_preferences, auth support tables)
│   ├── chat-tables.sql                      # Schema definitions for chat features (messages, conversations)
│   ├── supabase-database-setup.sql        # Older/supplemental setup script (verify if still primary or part of consolidated)
│   └── unified-user-data-update.sql       # Specific data migration/update scripts
└── databaseApi.ts           # Public API for database exports (e.g., Supabase client)
```

## Tables

### profiles

Stores user profile information:
- `id`: UUID (Primary Key, references auth.users)
- `first_name`: TEXT
- `last_name`: TEXT
- `email`: TEXT
- `birthdate`: DATE (Standard field for birth date information)
- `country`: TEXT (User's country of residence)
- `city`: TEXT (User's city of residence)
- `custom_city`: TEXT (Custom city input when city is "Other")
- `avatar_url`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE
- `has_completed_onboarding`: BOOLEAN
- `email_verified`: BOOLEAN
- `account_status`: TEXT
- `deletion_requested_at`: TIMESTAMP WITH TIME ZONE
- `pending_email_change`: TEXT
- `email_change_requested_at`: TIMESTAMP WITH TIME ZONE

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
- `departure_country`: TEXT (User's country for departure)
- `departure_city`: TEXT (User's city for departure)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### verification_codes

Stores codes for various verification processes (email, password reset, etc.).
- `id`: BIGSERIAL (Primary Key)
- `user_id`: UUID (Can be null if code is for an unauthenticated action like initial email verification)
- `email`: TEXT (Email address the code was sent to)
- `code`: TEXT (The verification code itself)
- `type`: TEXT (e.g., 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE')
- `expires_at`: TIMESTAMP WITH TIME ZONE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT now()
- `used_at`: TIMESTAMP WITH TIME ZONE (Null if not used)

### account_deletion_requests

Tracks user requests for account deletion.
- `id`: UUID (Primary Key, references auth.users)
- `requested_at`: TIMESTAMP WITH TIME ZONE DEFAULT now()
- `processed_at`: TIMESTAMP WITH TIME ZONE
- `status`: TEXT (e.g., 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')
- `notes`: TEXT (Administrative notes)

### email_change_tracking

Stores information about pending email changes for users.
- `id`: BIGSERIAL (Primary Key)
- `user_id`: UUID (References auth.users)
- `old_email`: TEXT
- `new_email`: TEXT
- `verification_token`: TEXT (Token sent to the new email)
- `token_expires_at`: TIMESTAMP WITH TIME ZONE
- `status`: TEXT (e.g., 'PENDING_VERIFICATION', 'VERIFIED', 'EXPIRED')
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT now()
- `updated_at`: TIMESTAMP WITH TIME ZONE

### session_storage

Could be used for storing custom session-related data if needed beyond Supabase's built-in session management.
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users)
- `session_data`: JSONB (Flexible store for session attributes)
- `last_active`: TIMESTAMP WITH TIME ZONE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT now()
- `expires_at`: TIMESTAMP WITH TIME ZONE

### messages & conversations

These tables support the chat functionality. Their detailed structure is defined in `src/database/schema/chat-tables.sql`.
- **conversations**: Stores metadata about a chat conversation.
- **messages**: Stores individual messages within conversations.

## Database Setup

The database can be set up by executing the SQL scripts in the Supabase SQL Editor. The primary script for initial setup is `consolidated-email-verification.sql`, which defines core tables (profiles, travel_preferences, auth support tables), triggers, and RLS policies.

Other scripts like `chat-tables.sql` should be run subsequently if those features are needed.

### Setup Steps

1. Log in to your Supabase dashboard.
2. Navigate to the SQL Editor.
3. **Core Schema**: Copy the contents of `src/database/schema/consolidated-email-verification.sql` and execute it.
4. **Chat Schema**: If chat functionality is required, copy the contents of `src/database/schema/chat-tables.sql` and execute it.
5. Review other scripts in `src/database/schema/` (like `unified-user-data-update.sql` or `supabase-database-setup.sql`) for any specific migrations or supplemental setups that might be needed depending on the project's history or state.

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
import { supabase } from '@/database/databaseApi';

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
