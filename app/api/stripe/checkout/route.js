import { stripe } from '@/lib/stripe';
import { getUserFromRequest, createAdminClient } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { priceId } = await request.json();
    if (!priceId) {
      return Response.json({ error: 'Geen priceId' }, { status: 400 });
    }

    const admin = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    /* Haal bestaande subscription op (voor stripe_customer_id) */
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = sub?.stripe_customer_id;

    /* Maak Stripe customer aan als nog niet bestaat */
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      /* Sla customer ID op */
      await admin.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: 'gratis',
        status: 'active',
      }, { onConflict: 'user_id' });
    }

    /* Maak Stripe Checkout Session aan */
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user.id },
      },
      metadata: { supabase_user_id: user.id },
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url:  `${appUrl}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
