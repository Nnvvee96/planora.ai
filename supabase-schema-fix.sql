-- Add missing custom_date_flexibility column to travel_preferences table
ALTER TABLE public.travel_preferences
ADD COLUMN IF NOT EXISTS custom_date_flexibility TEXT DEFAULT '';
