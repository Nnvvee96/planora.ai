-- Migration: Update Travel Preferences Schema
-- Date: 2025-01-14
-- Description: Updates the travel_preferences table to include all modern fields expected by the application

-- Add missing columns to travel_preferences table
ALTER TABLE public.travel_preferences 
ADD COLUMN IF NOT EXISTS budget_min INTEGER,
ADD COLUMN IF NOT EXISTS budget_max INTEGER,
ADD COLUMN IF NOT EXISTS budget_flexibility INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS travel_duration TEXT DEFAULT 'week',
ADD COLUMN IF NOT EXISTS date_flexibility TEXT DEFAULT 'flexible-few',
ADD COLUMN IF NOT EXISTS planning_intent TEXT DEFAULT 'exploring',
ADD COLUMN IF NOT EXISTS accommodation_types TEXT[] DEFAULT ARRAY['hotel'],
ADD COLUMN IF NOT EXISTS accommodation_comfort TEXT[] DEFAULT ARRAY['private-room'],
ADD COLUMN IF NOT EXISTS comfort_level TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS location_preference TEXT DEFAULT 'anywhere',
ADD COLUMN IF NOT EXISTS city_distance_preference TEXT,
ADD COLUMN IF NOT EXISTS flight_type TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS prefer_cheaper_with_stopover BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS departure_country TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS departure_city TEXT DEFAULT '';

-- Migrate existing data from old columns to new columns where possible
UPDATE public.travel_preferences 
SET 
  budget_min = COALESCE(budget_range_min, 500),
  budget_max = COALESCE(budget_range_max, 2000),
  travel_duration = COALESCE(
    CASE 
      WHEN trip_duration_min <= 3 THEN 'weekend'
      WHEN trip_duration_min <= 7 THEN 'week' 
      WHEN trip_duration_min <= 14 THEN 'two-weeks'
      ELSE 'longer'
    END, 
    'week'
  ),
  accommodation_types = CASE 
    WHEN accommodation_type IS NOT NULL THEN ARRAY[accommodation_type]
    ELSE ARRAY['hotel']
  END,
  location_preference = CASE 
    WHEN destination_type = 'city' THEN 'center'
    WHEN destination_type = 'beach' THEN 'beach'
    ELSE 'anywhere'
  END
WHERE budget_min IS NULL OR budget_max IS NULL OR travel_duration IS NULL OR accommodation_types IS NULL OR location_preference IS NULL;

-- Add constraints for enum-like fields
ALTER TABLE public.travel_preferences 
ADD CONSTRAINT check_travel_duration 
  CHECK (travel_duration IN ('weekend', 'week', 'two-weeks', 'longer')),
ADD CONSTRAINT check_date_flexibility 
  CHECK (date_flexibility IN ('flexible-few', 'flexible-week', 'fixed', 'very-flexible')),
ADD CONSTRAINT check_planning_intent 
  CHECK (planning_intent IN ('exploring', 'planning')),
ADD CONSTRAINT check_comfort_level 
  CHECK (comfort_level IN ('budget', 'standard', 'premium', 'luxury')),
ADD CONSTRAINT check_location_preference 
  CHECK (location_preference IN ('center', 'beach', 'anywhere')),
ADD CONSTRAINT check_city_distance_preference 
  CHECK (city_distance_preference IS NULL OR city_distance_preference IN ('very-close', 'up-to-5km', 'up-to-10km', 'more-than-10km')),
ADD CONSTRAINT check_flight_type 
  CHECK (flight_type IN ('direct', 'any'));

-- Update budget constraint to use new columns
ALTER TABLE public.travel_preferences 
DROP CONSTRAINT IF EXISTS budget_check,
ADD CONSTRAINT budget_check CHECK (budget_min <= budget_max);

-- Add comments for new columns
COMMENT ON COLUMN public.travel_preferences.budget_min IS 'Minimum budget range for travel';
COMMENT ON COLUMN public.travel_preferences.budget_max IS 'Maximum budget range for travel';
COMMENT ON COLUMN public.travel_preferences.budget_flexibility IS 'Budget flexibility percentage (0-25)';
COMMENT ON COLUMN public.travel_preferences.travel_duration IS 'Preferred trip duration (weekend, week, two-weeks, longer)';
COMMENT ON COLUMN public.travel_preferences.date_flexibility IS 'Date flexibility preference';
COMMENT ON COLUMN public.travel_preferences.planning_intent IS 'Travel planning intent (exploring, planning)';
COMMENT ON COLUMN public.travel_preferences.accommodation_types IS 'Array of preferred accommodation types';
COMMENT ON COLUMN public.travel_preferences.accommodation_comfort IS 'Array of comfort preferences';
COMMENT ON COLUMN public.travel_preferences.comfort_level IS 'Overall comfort level preference';
COMMENT ON COLUMN public.travel_preferences.location_preference IS 'Preferred location type (center, beach, anywhere)';
COMMENT ON COLUMN public.travel_preferences.city_distance_preference IS 'Distance preference from city center when location is center';
COMMENT ON COLUMN public.travel_preferences.flight_type IS 'Flight preference (direct, any)';
COMMENT ON COLUMN public.travel_preferences.prefer_cheaper_with_stopover IS 'Whether to prefer cheaper flights with stopovers';
COMMENT ON COLUMN public.travel_preferences.departure_country IS 'Departure country';
COMMENT ON COLUMN public.travel_preferences.departure_city IS 'Departure city';

-- Update table comment
COMMENT ON TABLE public.travel_preferences IS 'Stores comprehensive user travel preferences aligned with onboarding flow'; 