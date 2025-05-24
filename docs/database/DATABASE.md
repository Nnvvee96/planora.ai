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
│   └── rls-policies.sql     # Row Level Security policies
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
