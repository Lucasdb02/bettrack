import Stripe from 'stripe';

let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return _stripe;
}

/* Backward-compatible proxy so existing `stripe.xyz` calls still work */
export const stripe = new Proxy({}, {
  get: (_, prop) => Reflect.get(getStripe(), prop),
});

export const PRICE_IDS = {
  pro_monthly:    process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly:     process.env.STRIPE_PRICE_PRO_YEARLY,
  elite_monthly:  process.env.STRIPE_PRICE_ELITE_MONTHLY,
  elite_yearly:   process.env.STRIPE_PRICE_ELITE_YEARLY,
};

export function planFromPriceId(priceId) {
  if (!priceId) return 'gratis';
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY   ||
      priceId === process.env.STRIPE_PRICE_PRO_YEARLY)    return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ELITE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ELITE_YEARLY)  return 'elite';
  return 'gratis';
}

/* Zet een afgeronde checkout-sessie om naar een rij in `subscriptions`.
   Gebruikt door de webhook én door /api/stripe/sync (direct na terugkeer van Stripe). */
export async function syncCheckoutSession(session, admin) {
  if (session.mode !== 'subscription' || session.status !== 'complete') return null;

  const userId = session.metadata?.supabase_user_id;
  const subId  = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!userId || !subId) return null;

  const stripeSub = await getStripe().subscriptions.retrieve(subId);
  /* Opgezegd/verlopen abonnement (bv. duplicaat of vertraagde retry) niet over het huidige heen zetten */
  if (['canceled', 'incomplete_expired'].includes(stripeSub.status)) return null;

  const priceId = stripeSub.items.data[0]?.price?.id;
  const row = {
    user_id:                userId,
    stripe_customer_id:     typeof session.customer === 'string' ? session.customer : session.customer?.id,
    stripe_subscription_id: subId,
    plan:                   planFromPriceId(priceId),
    status:                 stripeSub.status,
    interval:               stripeSub.items.data[0]?.plan?.interval,
    current_period_end:     new Date(stripeSub.current_period_end * 1000).toISOString(),
    cancel_at_period_end:   stripeSub.cancel_at_period_end,
    updated_at:             new Date().toISOString(),
  };
  await admin.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  return row;
}
