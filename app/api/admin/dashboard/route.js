import { createAdminClient, getUserFromRequest } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

const ADMIN_EMAILS = ['lucas@mybuqo.com', 'matthijs@mybuqo.com'];

function getLast12Months() {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export async function GET(request) {
  const caller = await getUserFromRequest(request);
  if (!caller || !ADMIN_EMAILS.includes(caller.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminClient();

  const [
    { data: { users = [] }, error: usersError },
    { data: subs   = [] },
    { data: betRows = [] },
    { data: txRows  = [] },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('subscriptions').select('user_id,plan,status,interval,created_at,stripe_customer_id'),
    admin.from('bets').select('user_id'),
    admin.from('transactions').select('user_id,type,amount'),
  ]);

  if (usersError) return Response.json({ error: usersError.message }, { status: 500 });

  const subMap = Object.fromEntries(subs.map(s => [s.user_id, s]));

  const betCountMap = {};
  betRows.forEach(b => { betCountMap[b.user_id] = (betCountMap[b.user_id] || 0) + 1; });

  const txMap = {};
  txRows.forEach(t => {
    if (!txMap[t.user_id]) txMap[t.user_id] = { count: 0, deposits: 0, withdrawals: 0, deposit_count: 0, withdrawal_count: 0 };
    const amt = Number(t.amount);
    txMap[t.user_id].count++;
    if (t.type === 'deposit')    { txMap[t.user_id].deposits    += amt; txMap[t.user_id].deposit_count++; }
    if (t.type === 'withdrawal') { txMap[t.user_id].withdrawals += amt; txMap[t.user_id].withdrawal_count++; }
  });

  // Stripe data
  let invoiceMap = {};
  let total_revenue = 0;
  let mrr = 0;
  let failed_payments = 0;
  let revenue_trend_map = {};

  try {
    const stripeClient = getStripe();

    const [allInvoices, activeStripeSubs, openInvoices] = await Promise.all([
      stripeClient.invoices.list({ status: 'paid', limit: 100 }).autoPagingToArray({ limit: 10000 }),
      stripeClient.subscriptions.list({ status: 'active', limit: 100 }).autoPagingToArray({ limit: 10000 }),
      stripeClient.invoices.list({ status: 'open', limit: 100 }).autoPagingToArray({ limit: 1000 }),
    ]);

    // Per-customer invoice map
    allInvoices.forEach(inv => {
      if (!invoiceMap[inv.customer]) invoiceMap[inv.customer] = { revenue: 0, invoice_count: 0 };
      const amt = (inv.amount_paid || 0) / 100;
      invoiceMap[inv.customer].revenue      += amt;
      invoiceMap[inv.customer].invoice_count++;
      total_revenue += amt;
      const m = new Date(inv.created * 1000).toISOString().slice(0, 7);
      revenue_trend_map[m] = (revenue_trend_map[m] || 0) + amt;
    });

    // MRR from active subscriptions
    activeStripeSubs.forEach(sub => {
      const price = sub.items.data[0]?.price;
      if (price?.unit_amount != null && price?.recurring?.interval) {
        mrr += price.recurring.interval === 'year'
          ? price.unit_amount / 100 / 12
          : price.unit_amount / 100;
      }
    });

    // Failed payments (open invoices with at least one failed attempt)
    failed_payments = openInvoices.filter(inv => inv.attempt_count > 0).length;
  } catch (e) {
    console.error('[admin] stripe error:', e.message);
  }

  const enriched = users.map(u => {
    const customerId = subMap[u.id]?.stripe_customer_id ?? null;
    const stripeData = customerId ? (invoiceMap[customerId] || null) : null;
    return {
      id:                u.id,
      email:             u.email,
      created_at:        u.created_at,
      last_sign_in_at:   u.last_sign_in_at,
      plan:              subMap[u.id]?.plan      ?? 'gratis',
      sub_status:        subMap[u.id]?.status    ?? null,
      sub_interval:      subMap[u.id]?.interval  ?? null,
      bet_count:         betCountMap[u.id]       ?? 0,
      tx_count:          txMap[u.id]?.count            ?? 0,
      deposits:          txMap[u.id]?.deposits         ?? 0,
      withdrawals:       txMap[u.id]?.withdrawals      ?? 0,
      deposit_count:     txMap[u.id]?.deposit_count    ?? 0,
      withdrawal_count:  txMap[u.id]?.withdrawal_count ?? 0,
      stripe_revenue:        stripeData?.revenue       ?? 0,
      stripe_invoice_count:  stripeData?.invoice_count ?? 0,
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Derived metrics
  const now = Date.now();
  const weekAgo    = new Date(now - 7  * 24 * 3600 * 1000);
  const monthAgo   = new Date(now - 30 * 24 * 3600 * 1000);
  const dayAgo     = new Date(now - 24 * 3600 * 1000);

  const total_users   = enriched.length;
  const paying_users  = enriched.filter(u => u.plan !== 'gratis').length;
  const new_this_week = enriched.filter(u => new Date(u.created_at) > weekAgo).length;
  const pro_users     = enriched.filter(u => u.plan === 'pro').length;
  const elite_users   = enriched.filter(u => u.plan === 'elite').length;
  const total_bets    = betRows.length;

  const mau = enriched.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > monthAgo).length;
  const wau = enriched.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > weekAgo).length;
  const dau = enriched.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > dayAgo).length;

  const trial_conversion = total_users > 0 ? (paying_users / total_users) * 100 : 0;
  const arpu = paying_users > 0 ? total_revenue / paying_users : 0;
  const arr  = mrr * 12;

  // MoM revenue growth (invoice-based)
  const thisMonth = new Date().toISOString().slice(0, 7);
  const prevDate  = new Date(); prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);
  const thisMonthRev = revenue_trend_map[thisMonth] || 0;
  const prevMonthRev = revenue_trend_map[prevMonth] || 0;
  const mrr_growth = prevMonthRev > 0 ? ((thisMonthRev - prevMonthRev) / prevMonthRev) * 100 : null;

  // Churn rate (cumulative: canceled / ever-subscribed)
  const canceled_count = subs.filter(s => s.status === 'canceled').length;
  const ever_subscribed = subs.length;
  const churn_rate = ever_subscribed > 0 ? (canceled_count / ever_subscribed) * 100 : 0;

  // Revenue & user trend (last 12 months)
  const userTrendMap = {};
  users.forEach(u => {
    const m = u.created_at?.slice(0, 7);
    if (m) userTrendMap[m] = (userTrendMap[m] || 0) + 1;
  });

  const last12 = getLast12Months();
  const revenue_trend = last12.map(m => ({
    month: m,
    revenue: Math.round((revenue_trend_map[m] || 0) * 100) / 100,
    new_users: userTrendMap[m] || 0,
  }));

  const stats = {
    total_users, new_this_week, pro_users, elite_users,
    total_bets, total_revenue,
    mrr, arr, mrr_growth, arpu,
    paying_users, trial_conversion,
    mau, wau, dau,
    churn_rate, failed_payments,
  };

  return Response.json({ users: enriched, stats, revenue_trend });
}
