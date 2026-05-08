'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const BetsContext = createContext();

const SCHEMA_FIELDS = ['datum', 'sport', 'wedstrijd', 'markt', 'selectie', 'odds', 'inzet', 'uitkomst', 'bookmaker', 'notities', 'tags'];

function toDbRow(bet, userId) {
  const row = { user_id: userId };
  for (const field of SCHEMA_FIELDS) {
    if (bet[field] !== undefined) row[field] = bet[field];
  }
  return row;
}

export function berekenWinst(uitkomst, odds, inzet) {
  if (uitkomst === 'gewonnen')      return parseFloat(((odds - 1) * inzet).toFixed(2));
  if (uitkomst === 'verloren')      return parseFloat((-inzet).toFixed(2));
  if (uitkomst === 'half_gewonnen') return parseFloat(((odds - 1) * inzet / 2).toFixed(2));
  if (uitkomst === 'half_verloren') return parseFloat((-inzet / 2).toFixed(2));
  return 0;
}

export function BetsProvider({ children }) {
  const [bets, setBets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchBets(userId) {
      try {
        const query = supabase
          .from('bets')
          .select('*')
          .eq('user_id', userId)
          .order('datum', { ascending: false });

        // If Supabase hangs (expired token refresh, network stall), resolve after 6s
        const { data, error } = await Promise.race([
          query,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('bets fetch timeout')), 6000)
          ),
        ]);

        if (!active) return;
        if (!error && data) setBets(data);
        else if (error) console.error('[BetsContext] bets query error:', error);
      } catch (e) {
        console.error('[BetsContext] fetchBets error:', e.message);
      } finally {
        if (active) setLoaded(true);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setBets([]);
        setLoaded(true);
      } else if (session?.user) {
        fetchBets(session.user.id);
      } else {
        setLoaded(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const addBet = async (bet) => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) { console.error('[addBet] auth error:', authError); return null; }
    const row = toDbRow(bet, session.user.id);
    try {
      const { data, error } = await Promise.race([
        supabase.from('bets').insert(row).select().single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('insert timeout')), 12000)),
      ]);
      if (error) { console.error('[addBet] supabase error:', error); return null; }
      setBets((prev) => [data, ...prev]);
      return data;
    } catch (e) {
      console.error('[addBet] error:', e.message);
      return null;
    }
  };

  const addBets = async (newBets) => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      const msg = authError?.message || 'Niet ingelogd';
      console.error('[addBets] auth error:', msg);
      throw new Error(`Auth mislukt: ${msg}`);
    }
    // Insert one at a time — batch inserts can hang; single inserts match addBet which works
    const saved = [];
    let lastError = null;
    for (const bet of newBets) {
      const row = toDbRow(bet, session.user.id);
      try {
        const { data, error } = await Promise.race([
          supabase.from('bets').insert(row).select().single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout per bet')), 10000)),
        ]);
        if (error) { lastError = error; console.error('[addBets] insert error:', error); }
        else if (data) saved.push(data);
      } catch (e) {
        lastError = e;
        console.error('[addBets] error:', e.message);
      }
    }
    if (saved.length === 0 && lastError) {
      throw new Error(lastError.message || 'Database fout');
    }
    if (saved.length > 0) setBets((prev) => [...saved, ...prev]);
    return saved;
  };

  const replaceAutoImports = async (newBets) => addBets(newBets);
  const addScreenshotBets  = async (newBets) => addBets(newBets);

  const updateBet = async (id, updates) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { console.error('[updateBet] auth error:', authError); return false; }
    const prevBets = bets;
    setBets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    const dbUpdates = {};
    for (const field of SCHEMA_FIELDS) {
      if (updates[field] !== undefined) dbUpdates[field] = updates[field];
    }
    const { data, error } = await supabase.from('bets').update(dbUpdates).eq('id', id).eq('user_id', user.id).select().single();
    if (error) { console.error('[updateBet] supabase error:', error); setBets(prevBets); return false; }
    if (data) { setBets((prev) => prev.map((b) => (b.id === id ? data : b))); return true; }
    setBets(prevBets);
    return false;
  };

  const deleteBet = async (id) => {
    const { error } = await supabase.from('bets').delete().eq('id', id);
    if (!error) setBets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BetsContext.Provider value={{ bets, addBet, addBets, replaceAutoImports, addScreenshotBets, updateBet, deleteBet, loaded }}>
      {children}
    </BetsContext.Provider>
  );
}

export const useBets = () => useContext(BetsContext);
