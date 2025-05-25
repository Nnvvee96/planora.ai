// Scheduled Account Purge Edge Function
// This function automatically purges user accounts that have passed their 30-day recovery period
// Deploy to Supabase Edge Functions and set up a cron schedule (e.g., daily at midnight)

import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create Supabase admin client with service role permissions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Starting scheduled account purge job');
    
    // Find accounts scheduled for deletion that are past their purge date
    const { data: deletionRequests, error: requestError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_purge_at', new Date().toISOString());
      
    if (requestError) {
      console.error('Error fetching deletion requests:', requestError);
      return new Response(JSON.stringify({ error: requestError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    console.log(`Found ${deletionRequests.length} accounts to purge`);
    
    const results = [];
    
    // Process each account for deletion
    for (const request of deletionRequests) {
      const userId = request.user_id;
      
      try {
        console.log(`Processing account deletion for user ${userId}`);
        
        // Step 1: Delete from travel_preferences
        const { error: travelPrefError } = await supabaseAdmin
          .from('travel_preferences')
          .delete()
          .eq('user_id', userId);
          
        if (travelPrefError) {
          console.warn(`Warning: Error deleting travel preferences for ${userId}:`, travelPrefError);
          // Continue anyway - we still want to delete the user account
        }
        
        // Step 2: Delete from profiles
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        if (profileError) {
          console.error(`Error deleting profile for ${userId}:`, profileError);
          results.push({ userId, success: false, error: profileError.message });
          continue; // Skip to next user
        }
        
        // Step 3: Delete the auth user (requires admin privileges)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error(`Error deleting auth user ${userId}:`, authError);
          results.push({ userId, success: false, error: authError.message });
          continue; // Skip to next user
        }
        
        // Step 4: Update deletion request status
        const { error: updateError } = await supabaseAdmin
          .from('account_deletion_requests')
          .update({
            status: 'completed',
            purged_at: new Date().toISOString()
          })
          .eq('id', request.id);
          
        if (updateError) {
          console.error(`Error updating deletion request for ${userId}:`, updateError);
          // Don't fail the entire operation for this error
        }
        
        results.push({ userId, success: true });
        console.log(`Successfully purged user ${userId}`);
        
      } catch (error) {
        console.error(`Unexpected error purging user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }
    
    // Return summary of the purge operation
    return new Response(JSON.stringify({ 
      processedAt: new Date().toISOString(),
      totalProcessed: deletionRequests.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Unexpected error during account purging:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
