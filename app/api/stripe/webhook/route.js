import { stripe, planFromPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {

      /* Checkout afgerond → subscription koppelen */
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const userId     = session.metadata?.supabase_user_id;
        const customerId = session.customer;
        const subId      = session.subscription;

        if (!userId) break;

        /* Haal price ID op uit de subscription */
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        const priceId   = stripeSub.items.data[0]?.price?.id;
        const plan      = planFromPriceId(priceId);

        await admin.from('subscriptions').upsert({
          user_id:                 userId,
          stripe_customer_id:      customerId,
          stripe_subscription_id:  subId,
          plan,
          status:                  stripeSub.status,
          interval:                stripeSub.items.data[0]?.plan?.interval,
          current_period_end:      new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end:    stripeSub.cancel_at_period_end,
          updated_at:              new Date().toISOString(),
        }, { onConflict: 'user_id' });
        break;
      }

      /* Subscription gewijzigd (upgrade / downgrade / hernieuwd) */
      case 'customer.subscription.updated': {
        const sub     = event.data.object;
        const priceId = sub.items.data[0]?.price?.id;
        const plan    = planFromPriceId(priceId);

        await admin.from('subscriptions')
          .update({
            plan,
            status:               sub.status,
            interval:             sub.items.data[0]?.plan?.interval,
            current_period_end:   new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at:           new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      /* Subscription beëindigd → terug naar gratis */
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await admin.from('subscriptions')
          .update({
            plan:                    'gratis',
            status:                  'canceled',
            stripe_subscription_id:  null,
            current_period_end:      null,
            cancel_at_period_end:    false,
            updated_at:              new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      /* Betaling mislukt */
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await admin.from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
