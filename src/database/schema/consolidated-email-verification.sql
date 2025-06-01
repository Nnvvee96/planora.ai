-- Consolidated Email Verification SQL for Planora.ai
-- This file contains all SQL needed for email verification, including:
-- 1. Verification Codes Table
-- 2. Generate Verification Code Function
-- 3. Email Verification Synchronization Functions
-- 4. Row Level Security Policies

-- ==========================================
-- 1. Verification Codes Table
-- ==========================================
-- Drop existing verification_codes table if it exists (to update foreign key constraints)
DROP TABLE IF EXISTS public.verification_codes;

-- Create the verification_codes table with proper constraints
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- No foreign key constraint to avoid race conditions
  email TEXT NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS verification_codes_user_id_idx ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS verification_codes_used_idx ON public.verification_codes(used);

-- ==========================================
-- 2. Generate Verification Code Function
-- ==========================================
-- First drop the existing function to allow parameter name changes
DROP FUNCTION IF EXISTS public.generate_verification_code(uuid, text);

CREATE OR REPLACE FUNCTION public.generate_verification_code(p_user_id UUID, p_user_email TEXT)
RETURNS VARCHAR AS $$
DECLARE
  verification_code VARCHAR(6);
BEGIN
  -- Generate random 6-digit code
  verification_code := lpad(floor(random() * 1000000)::text, 6, '0');
  
  -- Insert new code, expire any previous ones
  UPDATE public.verification_codes 
  SET used = TRUE 
  WHERE user_id = p_user_id AND used = FALSE;
  
  INSERT INTO public.verification_codes (
    user_id, 
    email, 
    code, 
    expires_at
  ) VALUES (
    p_user_id, 
    p_user_email, 
    verification_code, 
    now() + interval '1 hour'
  );
  
  RETURN verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Helper Functions
-- ==========================================

-- Helper function to check if a user exists in any relevant table
-- This is used by the Edge Function to handle race conditions during user registration
DROP FUNCTION IF EXISTS public.user_exists(uuid);
CREATE OR REPLACE FUNCTION public.user_exists(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check auth.users and public.users (profiles) tables
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. Email Verification Synchronization Functions
-- ==========================================

-- Function to sync email verification status between auth.users and profiles
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When email_confirmed_at changes from NULL to a timestamp, update profile
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      email_verified = TRUE,
      updated_at = TIMEZONE('utc', NOW())
    WHERE id = NEW.id;
    
    RAISE LOG 'Email verification synced for user: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification sync
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE PROCEDURE public.sync_email_verification();

-- Function to sync verification code status when a valid code is verified
CREATE OR REPLACE FUNCTION public.mark_verification_code_used()
RETURNS TRIGGER AS $$
BEGIN
  -- When a code is marked as used, also update auth.users if not already verified
  IF NEW.used = TRUE AND OLD.used = FALSE THEN
    -- Get the user from auth.users
    DECLARE
      user_record RECORD;
    BEGIN
      SELECT * INTO user_record FROM auth.users WHERE id = NEW.user_id;
      
      -- If email_confirmed_at is NULL, update it
      IF user_record.email_confirmed_at IS NULL THEN
        UPDATE auth.users
        SET email_confirmed_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.user_id;
        
        RAISE LOG 'User email confirmed via verification code: %', NEW.user_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for verification code usage sync
DROP TRIGGER IF EXISTS on_verification_code_used ON public.verification_codes;
CREATE TRIGGER on_verification_code_used
  AFTER UPDATE ON public.verification_codes
  FOR EACH ROW
  WHEN (NEW.used = TRUE AND OLD.used = FALSE)
  EXECUTE PROCEDURE public.mark_verification_code_used();

-- ==========================================
-- 5. Row Level Security Policies
-- ==========================================

-- Enable Row Level Security for verification_codes table
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin has full access" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can read their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "verification_codes_user_isolation" ON public.verification_codes;
DROP POLICY IF EXISTS "verification_codes_service_role" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role has full access" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can manage their own verification codes" ON public.verification_codes;

-- Create comprehensive policies

-- Admin policy
-- Note: Since the profiles table doesn't have a role column, using service_role from JWT
CREATE POLICY "Service role has full access" ON public.verification_codes
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- User access policy - allows users to read and manage their own verification codes
CREATE POLICY "Users can manage their own verification codes" ON public.verification_codes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role policy already created above with "Service role has full access" policy
