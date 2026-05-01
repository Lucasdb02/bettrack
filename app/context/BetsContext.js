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
  // push, void, onbeslist → inzet terug, geen P&L
  return 0;
}

export function BetsProvider({ children }) {
  const [bets, setBets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBets(userId) {
      try {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', userId)
          .order('datum', { ascending: false });
        if (error) console.error('[BetsContext] bets query error:', error);
        if (!error && data) setBets(data);
      } catch (e) {
        console.error('[BetsContext] fetchBets error:', e);
      } finally {
        setLoaded(true);
      }
    }

    // Initial load: check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchBets(session.user.id);
      } else {
        setLoaded(true);
      }
    });

    // Re-fetch whenever auth state changes (sign-in, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchBets(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setBets([]);
        setLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addBet = async (bet) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { console.error('[addBet] auth error:', authError); return null; }
    const row = toDbRow(bet, user.id);
    console.log('[addBet] inserting row:', row);
    const { data, error } = await supabase
      .from('bets')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('[addBet] supabase error:', error); return null; }
    setBets((prev) => [data, ...prev]);
    return data;
  };

  const addBets = async (newBets) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const rows = newBets.map((bet) => toDbRow(bet, user.id));
    const { data, error } = await supabase
      .from('bets')
      .insert(rows)
      .select();
    if (!error && data) {
      setBets((prev) => [...data, ...prev]);
      return data;
    }
    return [];
  };

  // Vervangt alle eerder auto-geïmporteerde bets door een nieuwe snapshot.
  // Zonder een _source kolom in de DB valt dit terug op een gewone bulk-insert.
  const replaceAutoImports = async (newBets) => {
    return addBets(newBets);
  };

  // Voegt screenshot-geïmporteerde bets toe (elke upload is een nieuwe set).
  const addScreenshotBets = async (newBets) => {
    return addBets(newBets);
  };

  const updateBet = async (id, updates) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { console.error('[updateBet] auth error:', authError); return false; }

    const prevBets = bets;
    setBets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

    const dbUpdates = {};
    for (const field of SCHEMA_FIELDS) {
      if (updates[field] !== undefined) dbUpdates[field] = updates[field];
    }
    const { data, error } = await supabase
      .from('bets')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) {
      console.error('[updateBet] supabase error:', error);
      setBets(prevBets);
      return false;
    }
    if (data) {
      setBets((prev) => prev.map((b) => (b.id === id ? data : b)));
      return true;
    }
    setBets(prevBets);
    return false;
  };

  const deleteBet = async (id) => {
    const { error } = await supabase
      .from('bets')
      .delete()
      .eq('id', id);
    if (!error) {
      setBets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <BetsContext.Provider value={{ bets, addBet, addBets, replaceAutoImports, addScreenshotBets, updateBet, deleteBet, loaded }}>
      {children}
    </BetsContext.Provider>
  );
}

export const useBets = () => useContext(BetsContext);
