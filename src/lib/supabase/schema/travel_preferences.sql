-- Travel Preferences Table
-- This table stores user travel preferences captured during onboarding

CREATE TABLE IF NOT EXISTS travel_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Budget preferences (stored as JSONB for flexibility)
  budget_range JSONB NOT NULL DEFAULT '{"min": 500, "max": 2000}',
  budget_flexibility INTEGER NOT NULL DEFAULT 10,
  
  -- Trip duration (stored as JSONB for flexibility)
  travel_duration JSONB NOT NULL DEFAULT '{"min": 3, "max": 10}',
  
  -- Purpose and preferences
  planning_intent TEXT NOT NULL DEFAULT 'exploring',
  accommodation_types TEXT[] NOT NULL DEFAULT '{"hotel"}',
  accommodation_comfort TEXT[] NOT NULL DEFAULT '{"private-room", "private-bathroom"}',
  
  -- Location preferences
  departure_city TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read their own preferences"
  ON travel_preferences
  FOR SELECT
  USING (auth.uid() = userId);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON travel_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON travel_preferences
  FOR UPDATE
  USING (auth.uid() = userId);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updatedAt timestamp
CREATE TRIGGER update_travel_preferences_updated_at
BEFORE UPDATE ON travel_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
