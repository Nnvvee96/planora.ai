import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// This function is designed to be run on a schedule (e.g., via a cron job).

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (req.headers.get('Authorization') !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    console.log('Running scheduled account deletion job...');
    const now = new Date().toISOString();

    // 1. Find all non-restored deletion requests where the deletion date has passed.
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('user_id')
      .lt('scheduled_for_deletion_at', now)
      .eq('is_restored', false);

    if (fetchError) throw new Error(`Failed to fetch deletion requests: ${fetchError.message}`);

    if (!requests || requests.length === 0) {
      console.log('No accounts are scheduled for deletion at this time.');
      return new Response(JSON.stringify({ message: 'No accounts to delete.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. For each request, permanently delete the user from auth.users.
    const deletionPromises = requests.map(request => 
      supabaseAdmin.auth.admin.deleteUser(request.user_id)
    );

    const results = await Promise.allSettled(deletionPromises);
    let deletedCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Successfully deleted user: ${requests[index].user_id}`);
        deletedCount++;
      } else {
        console.error(`Failed to delete user ${requests[index].user_id}:`, result.reason);
      }
    });

    const message = `Scheduled account deletion job completed. Deleted ${deletedCount} of ${requests.length} targeted accounts.`;
    console.log(message);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scheduled account deletion job:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
