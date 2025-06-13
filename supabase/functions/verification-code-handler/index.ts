import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper to send verification email (placeholder)
async function sendVerificationEmail(email: string, code: string) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      // In a real production environment, you'd want to handle this more gracefully.
      // For now, we'll log an error. This function should not be called if the key is missing.
      console.error('RESEND_API_KEY is not set in environment variables.');
      // We throw an error to halt the process if the API key is missing.
      // This prevents the user from being told an email was sent when it wasn't.
      throw new Error('Email service is not configured.');
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4A4A4A;">Welcome to Planora!</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #6A4CFF;">${code}</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">&copy; Planora.ai - Your AI-Powered Life Planner</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Planora <noreply@getplanora.app>', // Use the verified Resend domain
        to: [email],
        subject: 'Your Planora Verification Code',
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error('Failed to send verification email:', errorBody);
      throw new Error(`Failed to send verification email. Status: ${res.status}`);
    }

    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error.message);
    // Re-throw the error to be caught by the main handler
    throw error;
  }
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
            target: email,
            code_type: 'EMAIL_VERIFICATION',
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
          .eq('target', email)
          .eq('code_type', 'EMAIL_VERIFICATION')
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
