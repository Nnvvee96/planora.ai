-- Consolidated Email Verification SQL for Planora.ai
-- This file contains all SQL needed for email verification, including:
-- 1. Verification Codes Table (for fallback/testing verification)
-- 2. Generate Verification Code Function
-- 3. Email Verification Synchronization Functions (bidirectional sync between Supabase Auth and profiles)
-- 4. Row Level Security Policies
--
-- IMPORTANT: As of June 2025, Planora.ai uses Supabase Auth's built-in email verification as the primary method.
-- This schema supports both the built-in flow and our custom verification code flow, with the custom flow
-- primarily used for testing purposes or as a fallback mechanism.
/**
 * Verification Code Handler Edge Function
 * 
 * This Supabase Edge Function handles email verification code generation, sending, and verification.
 * It includes comprehensive retry logic and race condition handling for reliable email verification.
 * 
 * Features:
 * - Exponential backoff for handling race conditions during user creation
 * - Multiple fallback strategies
 * - Detailed error logging and structured error responses
 * - Type-safe implementation
 * - Configurable CORS support
 * - Rate limiting for security
 * - Enhanced service degradation handling
 * - Test mode support for development environments
 * 
 * Deploy to Supabase:
 * supabase functions deploy verification-code-handler
 */ 
// Deno standard library imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ======== Configuration ========
// Verification callback URLs
const VERIFICATION_CALLBACK_URLS = {
  development: 'http://localhost:5173/auth/callback',
  production: 'https://planora-ai-plum.vercel.app/auth/callback'
};

// All allowed origins (both development and production)
const ALLOWED_ORIGINS = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:5173',
  // Production origins
  'https://planora.ai',
  'https://www.planora.ai',
  'https://app.planora.ai',
  'https://planora-ai-plum.vercel.app',
  'https://planora-ai.vercel.app'
];

// Rate limiting configuration
const RATE_LIMITS = {
  send: {
    maxAttempts: 5,
    windowMs: 3600000
  },
  verify: {
    maxAttempts: 10,
    windowMs: 3600000
  }
};

// Tracking key in session storage for rate limiting
const RATE_LIMIT_KEY_PREFIX = 'planora_rate_limit_';

// ======== CORS Headers ========
const getCorsHeaders = (requestOrigin)=>{
  // Check if origin is in our allowed list
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin' // Important for proper caching with CORS
    };
  }
  // If origin not in allowed list or missing, return safe default (wildcard for development only)
  console.log(`CORS: Unknown origin ${requestOrigin}, using wildcard`);
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
};

// ======== Environment Detection ========
const isTestMode = (origin) => {
  // Consider test mode if:
  // 1. We're in a development environment (localhost)
  // 2. The EDGE_RUNTIME env var is set to "test" or "development"
  const environment = Deno.env.get('EDGE_RUNTIME') || 'production';
  const isDevelopmentOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
  
  return environment !== 'production' || isDevelopmentOrigin;
};

// ======== Supabase Client ========
const createSupabaseClient = ()=>{
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or service role key');
  }
  return createClient(supabaseUrl, supabaseKey);
};

// ======== Direct Database Access ========
const createDirectDbClient = async ()=>{
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing database configuration');
    }
    const connectionString = `${supabaseUrl}/rest/v1/?apikey=${serviceKey}`;
    return {
      query: async (sql, params = [])=>{
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
          },
          body: JSON.stringify({
            sql,
            params
          })
        });
        if (!response.ok) {
          throw new Error(`Database query failed: ${await response.text()}`);
        }
        return await response.json();
      }
    };
  } catch (error) {
    console.error('Error creating direct DB client:', error);
    throw error;
  }
};

// ======== Error Tracking ========
const logError = (context, error, userId, additionalInfo)=>{
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorObj = {
    timestamp: new Date().toISOString(),
    context,
    userId,
    errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo
  };
  console.error(JSON.stringify(errorObj));
  return errorObj;
};

// ======== Rate Limiting ========
const checkRateLimit = async (supabase, userId, action)=>{
  // Build key for this specific action and user
  const key = `${RATE_LIMIT_KEY_PREFIX}${action}_${userId}`;
  const now = new Date();
  // Get current rate limit info
  const { data, error } = await supabase.from('session_storage').select('*').eq('key', key).single();
  if (error && error.code !== 'PGRST116') {
    console.warn('Error checking rate limit:', error);
    // Fail open if we can't check rate limit
    return {
      remainingAttempts: RATE_LIMITS[action].maxAttempts,
      resetTime: new Date(now.getTime() + RATE_LIMITS[action].windowMs)
    };
  }
  if (!data) {
    // No existing rate limit record, create one
    const resetTime = new Date(now.getTime() + RATE_LIMITS[action].windowMs);
    await supabase.from('session_storage').insert({
      key,
      value: JSON.stringify({
        attempts: 1,
        resetAt: resetTime.toISOString()
      }),
      expires_at: resetTime.toISOString()
    });
    return {
      remainingAttempts: RATE_LIMITS[action].maxAttempts - 1,
      resetTime
    };
  }
  // Existing rate limit found, check if it's still valid
  const limitInfo = JSON.parse(data.value);
  const resetAt = new Date(limitInfo.resetAt);
  if (now > resetAt) {
    // Window expired, reset counter
    const newResetTime = new Date(now.getTime() + RATE_LIMITS[action].windowMs);
    await supabase.from('session_storage').update({
      value: JSON.stringify({
        attempts: 1,
        resetAt: newResetTime.toISOString()
      }),
      expires_at: newResetTime.toISOString()
    }).eq('key', key);
    return {
      remainingAttempts: RATE_LIMITS[action].maxAttempts - 1,
      resetTime: newResetTime
    };
  }
  // Still within window, increment counter
  const attempts = limitInfo.attempts + 1;
  const remainingAttempts = Math.max(0, RATE_LIMITS[action].maxAttempts - attempts);
  await supabase.from('session_storage').update({
    value: JSON.stringify({
      attempts,
      resetAt: resetAt.toISOString()
    })
  }).eq('key', key);
  return {
    remainingAttempts,
    resetTime: resetAt
  };
};

// ======== User Existence Check ========
const checkUserExists = async (supabase, userId)=>{
  try {
    const { data, error } = await supabase.rpc('user_exists', {
      user_id_param: userId
    });
    if (error) {
      logError('checkUserExists', error, userId);
      return false;
    }
    return !!data;
  } catch (err) {
    logError('checkUserExists:exception', err, userId);
    return false;
  }
};

// ======== Verification Code Generation ========
const generateVerificationCode = async (supabase, userId, email, testMode, maxRetries = 5)=>{
  let retryCount = 0;
  let lastError = null;
  // Exponential backoff retry strategy
  const getBackoffTime = (attempt)=>Math.min(1000 * Math.pow(2, attempt), 8000);
  while(retryCount < maxRetries){
    try {
      // First, check if the user exists in auth.users
      const userExists = await checkUserExists(supabase, userId);
      if (!userExists) {
        console.log(`User ${userId} not found on attempt ${retryCount + 1}, waiting before retry...`);
        // Wait with exponential backoff before retrying
        await new Promise((resolve)=>setTimeout(resolve, getBackoffTime(retryCount)));
        retryCount++;
        continue;
      }
      // User exists, generate code using the database function
      const { data, error } = await supabase.rpc('generate_verification_code', {
        p_user_id: userId,
        p_user_email: email,
        p_is_test_mode: testMode
      });
      if (error) {
        logError('generateVerificationCode', error, userId, {
          email,
          attempt: retryCount + 1
        });
        lastError = error;
        // If this is a foreign key violation, retry after a delay
        if (error.message && error.message.includes('foreign key')) {
          await new Promise((resolve)=>setTimeout(resolve, getBackoffTime(retryCount)));
          retryCount++;
          continue;
        }
        break;
      }
      // Successfully generated code
      return {
        success: true,
        code: data
      };
    } catch (err) {
      logError('generateVerificationCode:exception', err, userId, {
        email,
        attempt: retryCount + 1
      });
      lastError = err;
      await new Promise((resolve)=>setTimeout(resolve, getBackoffTime(retryCount)));
      retryCount++;
    }
  }
  // If we've exhausted retries or hit a non-retriable error, try direct insertion
  try {
    console.log('Falling back to direct verification code generation');
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    // Expire any existing unused codes for this user
    await supabase.from('verification_codes').update({
      used: true
    }).eq('user_id', userId).eq('used', false);
    // Insert new code directly
    const { error: insertError } = await supabase.from('verification_codes').insert({
      user_id: userId,
      email: email,
      code: code,
      expires_at: expiresAt.toISOString(),
      used: false,
      is_test_mode: testMode
    });
    if (insertError) {
      logError('generateVerificationCode:fallback', insertError, userId, {
        email
      });
      return {
        success: false,
        error: `Failed to generate code after ${maxRetries} attempts`,
        errorCode: 'VERIFICATION_GEN_FAILED',
        details: {
          originalError: lastError?.message,
          fallbackError: insertError.message
        }
      };
    }
    return {
      success: true,
      code
    };
  } catch (finalErr) {
    logError('generateVerificationCode:fatal', finalErr, userId, {
      email
    });
    return {
      success: false,
      error: `All code generation attempts failed`,
      errorCode: 'VERIFICATION_FATAL',
      details: {
        originalError: lastError?.message,
        finalError: finalErr instanceof Error ? finalErr.message : String(finalErr)
      }
    };
  }
};

// ======== Code Verification ========
const verifyCode = async (supabase, userId, code)=>{
  try {
    // First, check if the code exists and is valid
    const { data: codeData, error: codeError } = await supabase.from('verification_codes').select('*').eq('user_id', userId).eq('code', code).eq('used', false).gt('expires_at', new Date().toISOString()).single();
    if (codeError || !codeData) {
      // Check if we can find an expired code to give better feedback
      const { data: expiredData } = await supabase.from('verification_codes').select('*').eq('user_id', userId).eq('code', code).eq('used', false).lte('expires_at', new Date().toISOString()).single();
      if (expiredData) {
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.',
          errorCode: 'CODE_EXPIRED'
        };
      }
      // Check if the code was already used
      const { data: usedData } = await supabase.from('verification_codes').select('*').eq('user_id', userId).eq('code', code).eq('used', true).single();
      if (usedData) {
        return {
          success: false,
          error: 'This verification code has already been used.',
          errorCode: 'CODE_ALREADY_USED'
        };
      }
      // General invalid code error
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again.',
        errorCode: 'INVALID_CODE'
      };
    }
    // Mark code as used
    const { error: updateError } = await supabase.from('verification_codes').update({
      used: true
    }).eq('id', codeData.id);
    if (updateError) {
      logError('verifyCode:markUsed', updateError, userId, {
        codeId: codeData.id
      });
    // Continue anyway - code verification is successful
    }
    // Update user profile
    await updateVerificationStatus(supabase, userId);
    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (err) {
    logError('verifyCode', err, userId);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred during verification',
      errorCode: 'VERIFICATION_ERROR'
    };
  }
};

// ======== Update Verification Status ========
const updateVerificationStatus = async (supabase, userId)=>{
  try {
    const timestamp = new Date().toISOString();
    // 1. Update profiles table
    const { error: profileError } = await supabase.from('profiles').update({
      email_verified: true,
      updated_at: timestamp
    }).eq('id', userId);
    if (profileError) {
      logError('updateVerificationStatus:profile', profileError, userId);
    // Continue despite error - we have multiple update mechanisms
    }
    // 2. Update auth.users (requires admin privileges)
    const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirmed_at: timestamp,
      user_metadata: {
        email_verified: true,
        email_verified_at: timestamp
      }
    });
    if (userError) {
      logError('updateVerificationStatus:auth', userError, userId);
    // Continue despite error
    }
    console.log('Verification status updated for user:', userId);
  } catch (err) {
    logError('updateVerificationStatus:exception', err, userId);
    throw err;
  }
};

// ======== Service Status Checker ========
const checkServiceStatus = async (supabase)=>{
  try {
    // Use the profiles table instead of non-existent _service_health table
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      logError('serviceStatus', error);
      // Fail open rather than closed to prevent blocking users
      return true;
    }
    return true;
  } catch (err) {
    logError('serviceStatus', err);
    // Fail open rather than closed to prevent blocking users
    return true;
  }
};

// ======== Direct Email Magic Link Sending ========
const sendSupabaseMagicLink = async (supabase, email, redirectTo)=>{
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo
      }
    });
    if (error) {
      logError('sendSupabaseMagicLink', error, undefined, {
        email
      });
      return {
        success: false,
        error: error.message,
        errorCode: 'MAGIC_LINK_FAILED'
      };
    }
    return {
      success: true,
      message: 'Magic link sent successfully'
    };
  } catch (err) {
    logError('sendSupabaseMagicLink', err, undefined, {
      email
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
      errorCode: 'MAGIC_LINK_ERROR'
    };
  }
};

// ======== Main Request Handler ========
const handleRequest = async (req)=>{
  // Get origin for CORS
  const origin = req.headers.get('origin');
  console.log('Request origin:', origin);
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    const supabase = createSupabaseClient();
    
    // Quick service health check
    const serviceAvailable = await checkService
-- ==========================================
-- 1. Verification Codes Table
-- ==========================================
-- NOTE: This table is primarily used for testing/fallback verification
-- as Planora now uses Supabase Auth's built-in email verification.
-- However, we maintain this table for:
-- 1. Testing mode where codes are displayed to users
-- 2. Fallback verification if needed
-- 3. Historical record of verification attempts

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
  used BOOLEAN DEFAULT FALSE,
  is_test_mode BOOLEAN DEFAULT FALSE -- Flag to indicate test mode codes
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS verification_codes_user_id_idx ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS verification_codes_used_idx ON public.verification_codes(used);

-- ==========================================
-- 2. Generate Verification Code Function
-- ==========================================
-- ==========================================
-- 2. Generate Verification Code Function
-- ==========================================
-- This function generates verification codes for testing or fallback verification
-- It returns the code to the caller, which is useful for testing mode

-- First drop the existing function to allow parameter changes
DROP FUNCTION IF EXISTS public.generate_verification_code(uuid, text);
DROP FUNCTION IF EXISTS public.generate_verification_code(uuid, text, boolean);

CREATE OR REPLACE FUNCTION public.generate_verification_code(
  p_user_id UUID, 
  p_user_email TEXT,
  p_is_test_mode BOOLEAN DEFAULT FALSE
)
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
  
  -- Insert the new verification code
  INSERT INTO public.verification_codes (
    user_id, 
    email, 
    code, 
    expires_at,
    is_test_mode
  ) VALUES (
    p_user_id, 
    p_user_email, 
    verification_code, 
    now() + interval '1 hour',
    p_is_test_mode
  );
  
  -- Log for debugging/auditing
  IF p_is_test_mode THEN
    RAISE LOG 'Test mode verification code generated for user %: %', p_user_id, verification_code;
  ELSE
    RAISE LOG 'Verification code generated for user %', p_user_id;
  END IF;
  
  RETURN verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Helper Functions
-- ==========================================

-- Helper function to check if a user exists in any relevant table
-- This is used to handle race conditions during user registration
-- and verification checks
DROP FUNCTION IF EXISTS public.user_exists(uuid);
CREATE OR REPLACE FUNCTION public.user_exists(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check auth.users table (primary source of truth)
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user's email is verified in Supabase Auth
-- This helps with the bidirectional verification sync
DROP FUNCTION IF EXISTS public.is_email_verified(uuid);
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id_param AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. Email Verification Synchronization Functions
-- ==========================================

-- Function to sync email verification status between auth.users and profiles
-- This is triggered when Supabase Auth's built-in verification confirms an email
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When email_confirmed_at changes from NULL to a timestamp, update profile
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Update the profiles table to maintain consistency
    UPDATE public.profiles
    SET 
      email_verified = TRUE,
      updated_at = TIMEZONE('utc', NOW())
    WHERE id = NEW.id;
    
    RAISE LOG 'Email verification synced from Supabase Auth to profiles for user: %', NEW.id;
    
    -- Also update any pending verification codes to prevent confusion
    UPDATE public.verification_codes
    SET used = TRUE
    WHERE user_id = NEW.id AND used = FALSE;
    
    RAISE LOG 'Marked all pending verification codes as used for user: %', NEW.id;
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
-- This is triggered when our custom verification code system marks a code as used
-- It ensures bidirectional sync with Supabase Auth's email_confirmed_at field
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
      
      -- If user exists but email_confirmed_at is NULL, update it
      IF user_record.id IS NOT NULL AND user_record.email_confirmed_at IS NULL THEN
        -- Update Supabase Auth's email_confirmed_at
        UPDATE auth.users
        SET 
          email_confirmed_at = TIMEZONE('utc', NOW()),
          updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.user_id;
        
        RAISE LOG 'User email confirmed via custom verification code: %', NEW.user_id;
        
        -- Also update the profiles table directly to ensure consistency
        UPDATE public.profiles
        SET 
          email_verified = TRUE,
          updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.user_id;
        
        RAISE LOG 'Profile updated for verification via code: %', NEW.user_id;
      ELSE
        RAISE LOG 'No update needed for verification code - user already verified or not found: %', NEW.user_id;
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
