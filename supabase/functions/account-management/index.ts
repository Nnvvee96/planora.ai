import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function sendDeletionCancellationEmail(email: string, token: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set. Email not sent.');
    // Fail silently in production so the main flow doesn't break, but log the error.
    return;
  }

  // IMPORTANT: The "from" address must be a domain you have verified in your Resend account.
  const fromAddress = 'Planora <noreply@getplanora.app>';
  const restorationUrl = `https://www.getplanora.app/cancel-deletion?token=${token}`;

  const emailHtml = `
    <h1>Account Deletion Initiated</h1>
    <p>We have received a request to delete your Planora account. This deletion is scheduled to occur in 30 days.</p>
    <p>If you did not request this, or if you have changed your mind, you can cancel the deletion by clicking the link below:</p>
    <p><a href="${restorationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Cancel Account Deletion</a></p>
    <p>If you do not act, your account and all associated data will be permanently deleted in 30 days. This action cannot be undone.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Thank you,</p>
    <p>The Planora Team</p>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: 'Your Planora Account Deletion Has Been Scheduled',
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`Successfully dispatched deletion cancellation email to ${email}`);
    } else {
      const errorBody = await response.json();
      throw new Error(`Resend API Error: ${response.status} ${JSON.stringify(errorBody)}`);
    }
  } catch (error) {
    console.error(`Failed to send email via Resend: ${error.message}`);
    // Fail silently to avoid breaking the entire account deletion initiation flow for the user.
    // The core DB operations have succeeded at this point.
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    if (!user) throw new Error('Authentication error: User not found');

    switch (action) {
      case 'initiate-account-deletion': {
        const now = new Date();
        const restoration_token = crypto.randomUUID();
        const scheduled_for_deletion_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

        // 1. Set 'deactivated_at' on the user's profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ deactivated_at: now.toISOString() })
          .eq('id', user.id);

        if (profileError) throw new Error(`Failed to deactivate profile: ${profileError.message}`);

        // 2. Create a record in 'account_deletion_requests'
        const { error: requestError } = await supabaseAdmin
          .from('account_deletion_requests')
          .insert({
            user_id: user.id,
            scheduled_for_deletion_at: scheduled_for_deletion_at,
            restoration_token: restoration_token,
          });

        if (requestError) throw new Error(`Failed to create deletion request: ${requestError.message}`);

        // 3. Send a confirmation/cancellation email
        await sendDeletionCancellationEmail(user.email!, restoration_token);

        return new Response(JSON.stringify({ message: 'Account deletion process initiated. An email has been sent to you.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

            case 'cancel-account-deletion': {
        const { token } = payload;
        if (!token) throw new Error('Restoration token is required.');

        // 1. Find the deletion request by token
        const { data: requestData, error: requestError } = await supabaseAdmin
          .from('account_deletion_requests')
          .select('*')
          .eq('restoration_token', token)
          .single();

        if (requestError || !requestData) throw new Error('Invalid or expired restoration token.');
        if (requestData.is_restored) throw new Error('This account has already been restored.');

        // 2. Clear 'deactivated_at' on the user's profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ deactivated_at: null })
          .eq('id', requestData.user_id);

        if (profileError) throw new Error(`Failed to reactivate profile: ${profileError.message}`);

        // 3. Mark the request as restored
        const { error: updateRequestError } = await supabaseAdmin
          .from('account_deletion_requests')
          .update({ is_restored: true, restored_at: new Date().toISOString() })
          .eq('id', requestData.id);

        if (updateRequestError) throw new Error(`Failed to update deletion request: ${updateRequestError.message}`);

        return new Response(JSON.stringify({ message: 'Your account has been successfully restored.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

            case 'unbind-oauth-provider': {
        const { provider } = payload;
        if (!provider) throw new Error('OAuth provider name is required.');

        // 1. Verify the user has a password set to prevent lockout
        const hasPassword = user.identities?.some(identity => identity.provider === 'email');
        if (!hasPassword) {
          throw new Error('You must set a password before unlinking your social account.');
        }

        // 2. Find the identity to unlink
        const identityToUnlink = user.identities?.find(identity => identity.provider === provider);
        if (!identityToUnlink) {
          throw new Error(`You do not have a linked account with ${provider}.`);
        }

        // 3. Use admin client to unlink the provider identity
        const { error: unlinkError } = await supabaseAdmin.auth.unlinkIdentity(identityToUnlink);

        if (unlinkError) throw new Error(`Failed to unlink ${provider} account: ${unlinkError.message}`);

        return new Response(JSON.stringify({ message: `${provider} account has been successfully unlinked.` }), {
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
      status: 400,
    });
  }
});
