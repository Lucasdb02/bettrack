import { createAdminClient, getUserFromRequest } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

const ADMIN_EMAILS = ['lucas@mybuqo.com', 'matthijs@mybuqo.com'];

function berekenWinst(uitkomst, odds, inzet) {
  const o = Number(odds), i = Number(inzet);
  if (uitkomst === 'gewonnen')      return parseFloat(((o - 1) * i).toFixed(2));
  if (uitkomst === 'verloren')      return parseFloat((-i).toFixed(2));
  if (uitkomst === 'half_gewonnen') return parseFloat(((o - 1) * i / 2).toFixed(2));
  if (uitkomst === 'half_verloren') return parseFloat((-i / 2).toFixed(2));
  return 0;
}

export async function GET(request) {
  const caller = await getUserFromRequest(request);
  if (!caller || !ADMIN_EMAILS.includes(caller.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

  const admin = createAdminClient();

  const [
    { data: { user }, error: userError },
    { data: sub },
    { data: bets = [] },
    { data: txs  = [] },
    { data: bookmakers = [] },
  ] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('bets').select('*').eq('user_id', userId).order('datum', { ascending: false }),
    admin.from('transactions').select('*, bookmakers(naam)').eq('user_id', userId).order('datum', { ascending: false }),
    admin.from('bookmakers').select('*').eq('user_id', userId),
  ]);

  if (userError) return Response.json({ error: userError.message }, { status: 500 });

  // Betting stats
  const settled = bets.filter(b => b.uitkomst !== 'lopend');
  const won     = settled.filter(b => b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen');
  const lost    = settled.filter(b => b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren');
  const totalStake = settled.reduce((s, b) => s + Number(b.inzet), 0);
  const pnl        = settled.reduce((s, b) => s + berekenWinst(b.uitkomst, b.odds, b.inzet), 0);
  const roi        = totalStake > 0 ? (pnl / totalStake) * 100 : 0;
  const winRate    = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
  const avgOdds    = settled.length > 0 ? settled.reduce((s, b) => s + Number(b.odds), 0) / settled.length : 0;

  const bmCount = {};
  bets.forEach(b => { if (b.bookmaker) bmCount[b.bookmaker] = (bmCount[b.bookmaker] || 0) + 1; });
  const topBookmakers = Object.entries(bmCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([naam, count]) => ({ naam, count }));

  // Stripe invoices
  let stripeInvoices = [];
  let stripeSubscription = null;
  if (sub?.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const [invList, subObj] = await Promise.all([
        stripe.invoices.list({ customer: sub.stripe_customer_id, limit: 50 }),
        sub.stripe_subscription_id
          ? stripe.subscriptions.retrieve(sub.stripe_subscription_id).catch(() => null)
          : Promise.resolve(null),
      ]);
      stripeInvoices = invList.data.map(inv => ({
        id:                inv.id,
        created:           inv.created,
        amount_paid:       (inv.amount_paid || 0) / 100,
        amount_due:        (inv.amount_due  || 0) / 100,
        status:            inv.status,
        attempt_count:     inv.attempt_count,
        currency:          inv.currency?.toUpperCase(),
        hosted_invoice_url: inv.hosted_invoice_url,
        period_start:      inv.period_start,
        period_end:        inv.period_end,
      }));
      if (subObj) {
        stripeSubscription = {
          status:              subObj.status,
          current_period_end:  subObj.current_period_end,
          cancel_at_period_end: subObj.cancel_at_period_end,
          trial_end:           subObj.trial_end,
          price:               subObj.items.data[0]?.price?.unit_amount / 100,
          interval:            subObj.items.data[0]?.price?.recurring?.interval,
        };
      }
    } catch (e) {
      console.error('[user-detail] stripe error:', e.message);
    }
  }

  // Activity timeline
  const timeline = [];
  const push = (type, date, label, color) => { if (date) timeline.push({ type, date, label, color }); };

  push('signup',  user.created_at,       'Account aangemaakt', '#6b82f0');
  push('login',   user.last_sign_in_at,  'Laatste login',      '#9ca3af');
  if (sub?.created_at) push('subscription', sub.created_at, `Abonnement ${sub.plan} gestart`, '#f59e0b');

  // Bets grouped by day
  const betDays = {};
  bets.forEach(b => {
    const d = b.datum || b.created_at?.slice(0, 10);
    if (d) betDays[d] = (betDays[d] || 0) + 1;
  });
  Object.entries(betDays).forEach(([date, count]) => {
    push('bets', date + 'T12:00:00Z', `${count} bet${count > 1 ? 's' : ''} ingevoerd`, '#34d399');
  });

  stripeInvoices.forEach(inv => {
    const paid = inv.status === 'paid';
    push(
      paid ? 'payment' : 'payment_failed',
      new Date(inv.created * 1000).toISOString(),
      paid ? `Betaling €${inv.amount_paid.toFixed(2)} geslaagd` : `Betaling €${inv.amount_due.toFixed(2)} mislukt`,
      paid ? '#34d399' : '#fb7185',
    );
  });

  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  return Response.json({
    user: {
      id:               user.id,
      email:            user.email,
      created_at:       user.created_at,
      last_sign_in_at:  user.last_sign_in_at,
      full_name:        user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url:       user.user_metadata?.avatar_url || null,
      providers:        (user.identities || []).map(i => i.provider),
      is_anonymous:     user.is_anonymous,
      banned_until:     user.banned_until,
    },
    subscription: sub,
    stripe_subscription: stripeSubscription,
    bet_stats: {
      total_bets: bets.length,
      settled_bets: settled.length,
      lopend: bets.length - settled.length,
      won: won.length,
      lost: lost.length,
      win_rate: winRate,
      total_stake: totalStake,
      pnl,
      roi,
      avg_odds: avgOdds,
      top_bookmakers: topBookmakers,
    },
    bets: bets.slice(0, 50),
    transactions: txs,
    bookmakers,
    stripe_invoices: stripeInvoices,
    timeline: timeline.slice(0, 60),
  });
}
