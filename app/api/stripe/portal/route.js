import { stripe } from '@/lib/stripe';
import { getUserFromRequest, createAdminClient } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const admin = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return Response.json({ error: 'Geen actief abonnement gevonden' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/pricing`,
    });

    return Response.json({ url: portalSession.url });
  } catch (err) {
    console.error('[stripe/portal]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
