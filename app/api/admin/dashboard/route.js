import { createAdminClient, getUserFromRequest } from '@/lib/supabase-admin';

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
    admin.from('subscriptions').select('user_id,plan,status,interval,created_at'),
    admin.from('bets').select('user_id'),
    admin.from('transactions').select('user_id,type,amount'),
  ]);

  if (usersError) return Response.json({ error: usersError.message }, { status: 500 });

  const subMap = Object.fromEntries(subs.map(s => [s.user_id, s]));

  const betCountMap = {};
  betRows.forEach(b => { betCountMap[b.user_id] = (betCountMap[b.user_id] || 0) + 1; });

  const txMap = {};
  txRows.forEach(t => {
    if (!txMap[t.user_id]) txMap[t.user_id] = { count: 0, deposits: 0, withdrawals: 0 };
    const amt = Number(t.amount);
    txMap[t.user_id].count++;
    if (t.type === 'deposit')    txMap[t.user_id].deposits    += amt;
    if (t.type === 'withdrawal') txMap[t.user_id].withdrawals += amt;
  });

  const enriched = users.map(u => ({
    id:               u.id,
    email:            u.email,
    created_at:       u.created_at,
    last_sign_in_at:  u.last_sign_in_at,
    plan:             subMap[u.id]?.plan      ?? 'gratis',
    sub_status:       subMap[u.id]?.status    ?? null,
    sub_interval:     subMap[u.id]?.interval  ?? null,
    bet_count:        betCountMap[u.id]       ?? 0,
    tx_count:         txMap[u.id]?.count      ?? 0,
    deposits:         txMap[u.id]?.deposits   ?? 0,
    withdrawals:      txMap[u.id]?.withdrawals ?? 0,
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stats = {
    total_users:   enriched.length,
    new_this_week: enriched.filter(u => new Date(u.created_at) > weekAgo).length,
    pro_users:     enriched.filter(u => u.plan === 'pro').length,
    elite_users:   enriched.filter(u => u.plan === 'elite').length,
    total_bets:    betRows.length,
  };

  return Response.json({ users: enriched, stats });
}
