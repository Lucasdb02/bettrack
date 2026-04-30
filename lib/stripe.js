import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const PRICE_IDS = {
  pro_monthly:    process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly:     process.env.STRIPE_PRICE_PRO_YEARLY,
  elite_monthly:  process.env.STRIPE_PRICE_ELITE_MONTHLY,
  elite_yearly:   process.env.STRIPE_PRICE_ELITE_YEARLY,
};

/* Map a Stripe Price ID → plan name */
export function planFromPriceId(priceId) {
  if (!priceId) return 'gratis';
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY   ||
      priceId === process.env.STRIPE_PRICE_PRO_YEARLY)    return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ELITE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ELITE_YEARLY)  return 'elite';
  return 'gratis';
}
