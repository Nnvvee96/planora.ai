-- Account Deletion and Recovery System Setup
-- This script adds the necessary columns and tables for the 30-day account deletion system
-- Execute this in the Supabase SQL Editor to fix missing columns and tables

-- Add account_status and deletion_requested_at to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;

-- Add constraint to account_status
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS account_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT account_status_check 
CHECK (account_status IN ('active', 'pending_deletion', 'deleted'));

-- Create account_deletion_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  scheduled_purge_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  purged_at TIMESTAMP WITH TIME ZONE,
  recovery_token TEXT,
  CONSTRAINT unique_active_request UNIQUE (user_id, status)
);

-- Enable RLS on the new table
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for account_deletion_requests table
DROP POLICY IF EXISTS "Users can view their own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Users can view their own deletion requests" 
ON public.account_deletion_requests FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Service role can manage all deletion requests" 
ON public.account_deletion_requests 
USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx ON public.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS deletion_requests_token_idx ON public.account_deletion_requests(recovery_token);

-- Verify setup and display the new schema
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('profiles', 'account_deletion_requests')
ORDER BY 
  table_name, 
  ordinal_position;
