-- Account Deletion Schema for Planora.ai
-- This script creates the necessary structures for managing a soft-delete process,
-- allowing users a grace period to restore their account.

-- Ensure the uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create Account Deletion Requests Table
-- Stores requests for account deletion, providing a 30-day grace period for restoration.
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  scheduled_for_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL,
  restoration_token TEXT NOT NULL UNIQUE,
  is_restored BOOLEAN DEFAULT FALSE,
  restored_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.account_deletion_requests IS 'Logs user requests for account deletion and schedules the final deletion.';
COMMENT ON COLUMN public.account_deletion_requests.user_id IS 'The ID of the user requesting deletion.';
COMMENT ON COLUMN public.account_deletion_requests.scheduled_for_deletion_at IS 'The timestamp when the account is scheduled for permanent deletion.';
COMMENT ON COLUMN public.account_deletion_requests.restoration_token IS 'A secure, single-use token for the user to cancel the deletion request.';
COMMENT ON COLUMN public.account_deletion_requests.is_restored IS 'Flag indicating if the user has cancelled their deletion request.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_at ON public.account_deletion_requests(scheduled_for_deletion_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_deletion_requests_restoration_token ON public.account_deletion_requests(restoration_token);

-- RLS Policies for account_deletion_requests table
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion request.
CREATE POLICY "Users can view their own account deletion requests" 
  ON public.account_deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- The service_role can perform any action, as it will be used by Edge Functions to manage requests.
CREATE POLICY "Service role has full access to account deletion requests"
  ON public.account_deletion_requests
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant usage permissions to authenticated users and the service role.
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT ON TABLE public.account_deletion_requests TO authenticated;
GRANT ALL ON TABLE public.account_deletion_requests TO service_role;
