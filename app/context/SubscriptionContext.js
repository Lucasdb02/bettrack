'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const SubscriptionContext = createContext({
  plan: 'gratis',
  status: 'active',
  interval: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  loading: true,
  isPro: false,
  isElite: false,
  startCheckout,
  openPortal,
});

async function startCheckout(priceId, token) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ priceId }),
  });
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  window.location.href = url;
}

async function openPortal(token) {
  const res = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  window.location.href = url;
}

export function SubscriptionProvider({ children }) {
  const [sub, setSub] = useState({ plan: 'gratis', status: 'active', interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, loading: true });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSub(s => ({ ...s, loading: false })); return; }

      const { data } = await supabase
        .from('subscriptions')
        .select('plan,status,interval,current_period_end,cancel_at_period_end')
        .eq('user_id', session.user.id)
        .single();

      setSub({
        plan:              data?.plan              ?? 'gratis',
        status:            data?.status            ?? 'active',
        interval:          data?.interval          ?? null,
        currentPeriodEnd:  data?.current_period_end ?? null,
        cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
        loading: false,
      });
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  const isPro   = sub.plan === 'pro'   && sub.status !== 'canceled';
  const isElite = sub.plan === 'elite' && sub.status !== 'canceled';

  async function checkout(priceId) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }
    await startCheckout(priceId, session.access_token);
  }

  async function portal() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await openPortal(session.access_token);
  }

  return (
    <SubscriptionContext.Provider value={{ ...sub, isPro, isElite, startCheckout: checkout, openPortal: portal }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
