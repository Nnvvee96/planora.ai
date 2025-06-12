import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper to send verification email (placeholder)
async function sendVerificationEmail(email: string, code: string) {
  // In a real application, you would use a transactional email service.
  // Supabase's built-in auth emails are not directly available here.
  // For now, we'll log to the console. You can replace this with SendGrid, Postmark, etc.
  console.log(`Sending verification code ${code} to ${email}`);
  // Example of what you might do with a real email provider:
  // const { data, error } = await someEmailProvider.send({ to: email, subject: 'Your Verification Code', body: `Your code is ${code}` });
  // if (error) throw new Error('Failed to send verification email.');
  return Promise.resolve();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'initiate-signup': {
        const { email, password } = payload;
        if (!email || !password) {
          throw new Error('Email and password are required.');
        }

        // Generate a 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute expiry

        // Store the code and password in the verification_codes table
        const { error: insertError } = await supabaseAdmin
          .from('verification_codes')
          .insert({
            email: email,
            code: code,
            expires_at: expires_at,
            metadata: { password: password } // Temporarily store the password
          });

        if (insertError) throw insertError;

        await sendVerificationEmail(email, code);

        return new Response(JSON.stringify({ message: 'Signup initiated. Please check your email.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'complete-signup': {
        const { email, code } = payload;
        if (!email || !code) {
          throw new Error('Email and verification code are required.');
        }

        // Find the verification code
        const { data: codeData, error: codeError } = await supabaseAdmin
          .from('verification_codes')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .single();

        if (codeError || !codeData) throw new Error('Invalid verification code.');
        if (codeData.used) throw new Error('Verification code has already been used.');
        if (new Date() > new Date(codeData.expires_at)) throw new Error('Verification code has expired.');

        // Create the user
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: codeData.metadata.password,
          email_confirm: true, // Mark email as confirmed since they used the code
        });

        if (userError) throw userError;
        if (!user) throw new Error('Failed to create user.');

        // --- Assign Default 'user' Role ---
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        if (roleError || !roleData) throw new Error('Default user role not found.');

        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: user.id, role_id: roleData.id });

        if (userRoleError) throw new Error('Failed to assign default role to user.');

        // Mark the code as used
        await supabaseAdmin.from('verification_codes').update({ used: true }).eq('id', codeData.id);

        return new Response(JSON.stringify({ message: 'Signup successful!', userId: user.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Use 400 for client-side errors, 500 for true server errors
    });
  }
});
