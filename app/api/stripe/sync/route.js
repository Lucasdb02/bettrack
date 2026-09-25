import { stripe, syncCheckoutSession } from '@/lib/stripe';
import { getUserFromRequest, createAdminClient } from '@/lib/supabase-admin';

/* Direct na terugkeer van Stripe: haal de checkout-sessie op en zet het abonnement,
   zodat de klant niet hoeft te wachten tot de webhook binnen is. */
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId?.startsWith('cs_')) {
      return Response.json({ error: 'Ongeldige sessie' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.supabase_user_id !== user.id) {
      return Response.json({ error: 'Sessie hoort niet bij deze gebruiker' }, { status: 403 });
    }

    const row = await syncCheckoutSession(session, createAdminClient());
    return Response.json({ synced: !!row, status: session.status });
  } catch (err) {
    console.error('[stripe/sync]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
