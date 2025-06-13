import { serve } from 'std/http/server.ts';
import { createClient } from 'supabase';
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Webhook secret or signature is missing.');
    }
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === 'subscription') {
          const subscriptionId = checkoutSession.subscription;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          await upsertSubscription(subscription);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch(error) {
    console.error('Error handling webhook event:', error.message);
    return new Response('Webhook handler failed. View logs.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

async function upsertSubscription(subscription: Stripe.Subscription) {
  const subscriptionData = {
    id: subscription.id,
    user_id: subscription.metadata.user_id, // IMPORTANT: Ensure you set this in the checkout session
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    created: new Date(subscription.created * 1000).toISOString(),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    metadata: subscription.metadata,
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData);
  
  if (error) {
    console.error(`Error upserting subscription ${subscription.id}:`, error);
    throw error;
  }

  console.log(`Successfully upserted subscription ${subscription.id} for user ${subscription.metadata.user_id}`);
} 