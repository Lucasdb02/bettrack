import { createAdminClient, getUserFromRequest } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

const ADMIN_EMAIL = 'lucas@mybuqo.com';

export async function GET(request) {
  const caller = await getUserFromRequest(request);
  if (!caller || caller.email !== ADMIN_EMAIL) {
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

  // Stripe: fetch all paid invoices and group by customer ID
  let invoiceMap = {};
  let total_revenue = 0;
  try {
    const stripeClient = getStripe();
    const allInvoices = await stripeClient.invoices.list({ status: 'paid', limit: 100 }).autoPagingToArray({ limit: 10000 });
    allInvoices.forEach(inv => {
      if (!invoiceMap[inv.customer]) invoiceMap[inv.customer] = { revenue: 0, invoice_count: 0 };
      const amt = (inv.amount_paid || 0) / 100;
      invoiceMap[inv.customer].revenue      += amt;
      invoiceMap[inv.customer].invoice_count++;
      total_revenue += amt;
    });
  } catch (e) {
    console.error('[admin] stripe fetch error:', e.message);
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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stats = {
    total_users:   enriched.length,
    new_this_week: enriched.filter(u => new Date(u.created_at) > weekAgo).length,
    pro_users:     enriched.filter(u => u.plan === 'pro').length,
    elite_users:   enriched.filter(u => u.plan === 'elite').length,
    total_bets:    betRows.length,
    total_revenue,
  };

  return Response.json({ users: enriched, stats });
}
