'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

const SubscriptionContext = createContext({});

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
  const [sub, setSub] = useState({
    plan: 'gratis', status: 'active', interval: null,
    currentPeriodEnd: null, cancelAtPeriodEnd: false, loading: true,
  });

  const supabaseRef = useRef(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  useEffect(() => {
    let active = true;

    async function load(session) {
      if (!session?.user) { setSub(s => ({ ...s, loading: false })); return; }

      const { data } = await supabase
        .from('subscriptions')
        .select('plan,status,interval,current_period_end,cancel_at_period_end')
        .eq('user_id', session.user.id)
        .single();

      if (!active) return;

      const isOwner = session.user.email === 'lucasdebruin0608@gmail.com';
      setSub({
        plan:              isOwner ? 'pro'   : (data?.plan               ?? 'gratis'),
        status:            'active',
        interval:          isOwner ? 'year'  : (data?.interval            ?? null),
        currentPeriodEnd:  isOwner ? null    : (data?.current_period_end  ?? null),
        cancelAtPeriodEnd: isOwner ? false   : (data?.cancel_at_period_end ?? false),
        loading: false,
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) load(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load(session);
      else if (event === 'SIGNED_OUT') setSub({ plan: 'gratis', status: 'active', interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, loading: false });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isPro   = sub.plan === 'pro'   && sub.status !== 'canceled';
  const isElite = sub.plan === 'elite' && sub.status !== 'canceled';

  async function checkout(priceId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }
    await startCheckout(priceId, session.access_token);
  }

  async function portal() {
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
