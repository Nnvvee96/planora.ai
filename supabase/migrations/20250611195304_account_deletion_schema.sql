-- supabase/migrations/20250611195304_account_deletion_schema.sql

-- Create the table to track account deletion requests
DROP TABLE IF EXISTS public.account_deletion_requests CASCADE;
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for_deletion_at TIMESTAMPTZ NOT NULL,
    restoration_token TEXT NOT NULL UNIQUE,
    restored_at TIMESTAMPTZ,
    was_restored BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.account_deletion_requests IS 'Tracks user requests for account deletion, allowing for a 30-day grace period for restoration.';
COMMENT ON COLUMN public.account_deletion_requests.user_id IS 'The ID of the user who requested deletion.';
COMMENT ON COLUMN public.account_deletion_requests.requested_at IS 'Timestamp when the deletion was requested.';
COMMENT ON COLUMN public.account_deletion_requests.scheduled_for_deletion_at IS 'Timestamp when the account is scheduled for permanent deletion (typically 30 days after request).';
COMMENT ON COLUMN public.account_deletion_requests.restoration_token IS 'A unique, secure token sent to the user to allow them to cancel the deletion.';
COMMENT ON COLUMN public.account_deletion_requests.restored_at IS 'Timestamp when the account deletion was successfully canceled.';
COMMENT ON COLUMN public.account_deletion_requests.was_restored IS 'A flag indicating if the deletion request was canceled.';

-- Enable Row Level Security
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for the account_deletion_requests table

-- Policy: Users can view their own deletion requests.
DROP POLICY IF EXISTS "Allow users to view their own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Allow users to view their own deletion requests"
ON public.account_deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service roles can perform any action.
-- This is necessary for the Edge Functions to manage these records.
DROP POLICY IF EXISTS "Allow service_role to manage all requests" ON public.account_deletion_requests;
CREATE POLICY "Allow service_role to manage all requests"
ON public.account_deletion_requests
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);

-- Create an index on scheduled_for_deletion_at for the cron job to query efficiently
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_for_deletion_at ON public.account_deletion_requests(scheduled_for_deletion_at);
