'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    // Hard fallback: never stay on Laden... longer than 8 seconds
    const fallback = setTimeout(() => setLoaded(true), 8000);

    async function fetchBets() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('datum', { ascending: false });
        if (error) console.error('[BetsContext] bets query error:', error);
        if (!error && data) setBets(data);
      } catch (e) {
        console.error('[BetsContext] fetchBets error:', e);
      } finally {
        clearTimeout(fallback);
        setLoaded(true);
      }
    }

    fetchBets();
    return () => clearTimeout(fallback);
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

  const replaceAutoImports = async (newBets) => addBets(newBets);
  const addScreenshotBets = async (newBets) => addBets(newBets);

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
