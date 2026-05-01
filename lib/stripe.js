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
