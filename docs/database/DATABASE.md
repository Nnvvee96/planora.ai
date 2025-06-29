# Database Structure

This document provides an overview of the Planora database structure and implementation.

## Architecture

The database implementation follows Planora's architectural principles:
- Feature-first organization
- Separation of concerns
- No redundancy
- Clean code with proper error handling
- **Simplified authentication with email confirmation**
- **Subscription-based access control**

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
supabase/
├── migrations/             # Database migrations (versioned)
├── functions/              # Edge functions for server-side operations
└── import_map.json        # Deno import map for edge functions
```

## Tables

### profiles

Stores user profile information with simplified authentication:
- `id`: UUID (Primary Key, references auth.users)
- `first_name`: TEXT
- `last_name`: TEXT
- `email`: TEXT
- `birthdate`: DATE
- `general_country`: TEXT (User's country of residence)
- `general_city`: TEXT (User's city of residence)
- `onboarding_departure_country`: TEXT (Departure country from onboarding)
- `onboarding_departure_city`: TEXT (Departure city from onboarding)
- `custom_city`: TEXT (Custom city input when city is "Other")
- `avatar_url`: TEXT
- `has_completed_onboarding`: BOOLEAN (Dashboard access control)
- `email_verified`: BOOLEAN (Email confirmation status)
- `subscription_tier`: TEXT DEFAULT 'free' (Subscription tier: free, explorer, wanderer_pro, global_elite)
- `deactivated_at`: TIMESTAMP WITH TIME ZONE (Account deletion tracking)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### travel_preferences

Stores comprehensive user travel preferences:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References profiles.id)
- `budget_min`: INTEGER
- `budget_max`: INTEGER
- `budget_flexibility`: INTEGER (0-100 percentage)
- `travel_duration`: TEXT
- `date_flexibility`: TEXT
- `custom_date_flexibility`: TEXT
- `planning_intent`: TEXT
- `accommodation_types`: TEXT[] (Array of accommodation preferences)
- `accommodation_comfort`: TEXT[] (Array of comfort preferences)
- `comfort_level`: TEXT (Overall comfort level: budget, standard, premium, luxury)
- `location_preference`: TEXT (center, outskirts, etc.)
- `city_distance_preference`: TEXT (Distance from city center when location is center)
- `flight_type`: TEXT (direct, connecting)
- `prefer_cheaper_with_stopover`: BOOLEAN
- `departure_country`: TEXT
- `departure_city`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### Subscription Management Tables

#### products
Stores Stripe product information:
- `id`: TEXT (Primary Key, Stripe product ID)
- `active`: BOOLEAN
- `name`: TEXT
- `description`: TEXT
- `image`: TEXT
- `metadata`: JSONB

#### prices
Stores Stripe pricing information:
- `id`: TEXT (Primary Key, Stripe price ID)
- `product_id`: TEXT (References products.id)
- `active`: BOOLEAN
- `description`: TEXT
- `unit_amount`: BIGINT
- `currency`: TEXT
- `type`: TEXT
- `interval`: TEXT
- `interval_count`: INTEGER
- `trial_period_days`: INTEGER
- `metadata`: JSONB

#### subscriptions
Stores user subscription information:
- `id`: TEXT (Primary Key, Stripe subscription ID)
- `user_id`: UUID (References auth.users.id)
- `status`: TEXT
- `price_id`: TEXT (References prices.id)
- `quantity`: INTEGER
- `cancel_at_period_end`: BOOLEAN
- `created`: TIMESTAMP WITH TIME ZONE
- `current_period_start`: TIMESTAMP WITH TIME ZONE
- `current_period_end`: TIMESTAMP WITH TIME ZONE
- `ended_at`: TIMESTAMP WITH TIME ZONE
- `cancel_at`: TIMESTAMP WITH TIME ZONE
- `canceled_at`: TIMESTAMP WITH TIME ZONE
- `trial_start`: TIMESTAMP WITH TIME ZONE
- `trial_end`: TIMESTAMP WITH TIME ZONE
- `metadata`: JSONB

### Support Tables

#### account_deletion_requests
Tracks account deletion requests with 30-day grace period:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users.id)
- `requested_at`: TIMESTAMP WITH TIME ZONE
- `scheduled_for_deletion_at`: TIMESTAMP WITH TIME ZONE
- `restoration_token`: TEXT (Unique token for cancellation)
- `restored_at`: TIMESTAMP WITH TIME ZONE
- `was_restored`: BOOLEAN

#### email_change_tracking
Manages secure email change requests:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users.id)
- `old_email`: TEXT
- `new_email`: TEXT
- `token`: TEXT (Verification token)
- `token_expires_at`: TIMESTAMP WITH TIME ZONE
- `status`: TEXT (pending, verified, expired, completed)
- `requested_at`: TIMESTAMP WITH TIME ZONE
- `verified_at`: TIMESTAMP WITH TIME ZONE

#### session_storage
Temporary session data storage:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users.id)
- `session_key`: TEXT
- `session_data`: JSONB
- `expires_at`: TIMESTAMP WITH TIME ZONE
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

#### messages & conversations
Chat functionality support:
- **conversations**: Chat conversation metadata
- **messages**: Individual chat messages

### Legacy Tables (Removed)

The following tables were removed during authentication system simplification:
- ❌ `verification_codes` - Replaced with standard Supabase email confirmation
- ❌ `roles` - Replaced with subscription-based access control
- ❌ `user_roles` - Replaced with subscription_tier column in profiles

## Database Functions

### Subscription Management

#### update_user_subscription_tier
Updates user subscription tier based on Stripe webhook events:
```sql
update_user_subscription_tier(user_id UUID, new_tier TEXT) RETURNS BOOLEAN
```

Valid tiers: `free`, `explorer`, `wanderer_pro`, `global_elite`

### User Management

#### handle_new_user
Automatically creates profile when new user signs up:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, first_name, last_name, email, 
    subscription_tier, email_verified, 
    has_completed_onboarding
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    NEW.email,
    'free',
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Authentication Flow

Planora implements a simplified, secure authentication flow:

### User Registration Flow
1. **Email Registration**: User fills form → Email confirmation link → Login enabled
2. **Google OAuth**: Direct login → Email auto-verified
3. **Onboarding Required**: Dashboard blocked until completion
4. **Subscription Management**: Automatic tier assignment via Stripe

### Registration Status Checks
The system determines user flow based on:
- Email verification status
- Onboarding completion status
- Subscription tier level

### Onboarding Persistence
- Dashboard access is blocked until `has_completed_onboarding = true`
- Travel preferences are saved during onboarding
- Profile metadata is updated for backup verification

## Security

### Row Level Security (RLS)
All tables implement proper RLS policies:

#### User Data Access
- Users can only access their own profile and travel preferences
- Subscription data is read-only for users
- Admin functions require service role access

#### Subscription-Based Access
- Feature access controlled by `subscription_tier`
- RLS policies check tier requirements for premium features
- Automatic tier updates via Stripe webhooks

### Email Verification
- Standard Supabase email confirmation flow
- Login blocked until email is verified
- `email_verified` flag tracked in profiles

## Database Setup

### Migration Process
Migrations are applied automatically via Supabase:

1. **Core Schema**: User profiles and authentication
2. **Travel Preferences**: Comprehensive preference storage
3. **Subscription System**: Stripe integration tables
4. **Support Features**: Account management and chat

### Key Migrations
- `20250615000000_simplify_auth_system.sql` - Authentication simplification
- `20250629092337_update_subscription_tier_names.sql` - Tier name updates

## Usage Examples

### Profile Management
```typescript
// Get user profile with subscription tier
const { data: profile } = await supabase
  .from('profiles')
  .select('*, subscription_tier')
  .eq('id', userId)
  .single();
```

### Subscription Tier Checking
```typescript
// Check if user has premium access
const hasFeatureAccess = (userTier: string, requiredTier: string) => {
  const tierLevels = ['free', 'explorer', 'wanderer_pro', 'global_elite'];
  return tierLevels.indexOf(userTier) >= tierLevels.indexOf(requiredTier);
};
```

### Travel Preferences
```typescript
// Save comprehensive travel preferences
const { error } = await supabase
  .from('travel_preferences')
  .upsert({
    user_id: userId,
    budget_min: 1000,
    budget_max: 5000,
    accommodation_types: ['hotel', 'apartment'],
    subscription_tier: 'explorer'
  });
```

## Edge Functions

### Active Functions
- **account-management**: Account deletion and OAuth unlinking
- **scheduled-account-deleter**: Automated cleanup of expired deletion requests
- **create-checkout-session**: Stripe checkout session creation
- **stripe-webhook-handler**: Automatic subscription tier assignment

### Removed Functions
- ❌ **verification-code-handler**: Removed with verification code system simplification
