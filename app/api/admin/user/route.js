import { createAdminClient, getUserFromRequest } from '@/lib/supabase-admin';

const ADMIN_EMAILS = ['lucas@mybuqo.com', 'matthijs@mybuqo.com'];

export async function PATCH(request) {
  const caller = await getUserFromRequest(request);
  if (!caller || !ADMIN_EMAILS.includes(caller.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, plan } = await request.json();
  if (!userId || !plan) return Response.json({ error: 'userId and plan required' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('subscriptions')
    .upsert({ user_id: userId, plan, status: 'active' }, { onConflict: 'user_id' });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const caller = await getUserFromRequest(request);
  if (!caller || !ADMIN_EMAILS.includes(caller.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
