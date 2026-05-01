'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const BetsContext = createContext();

const SCHEMA_FIELDS = ['datum', 'sport', 'wedstrijd', 'markt', 'selectie', 'odds', 'inzet', 'uitkomst', 'bookmaker', 'notities', 'tags'];

// Module-level cache: survives component remounts within the same browser session.
// Prevents the "Laden..." flash whenever BetsProvider re-mounts due to navigation or
// a router.refresh() cycle.
let _cache = null; // { userId: string, bets: Bet[] } | null

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
  const [bets, setBets] = useState(_cache?.bets ?? []);
  const [loaded, setLoaded] = useState(_cache !== null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBets() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { setLoaded(true); return; }

        // If we already have a fresh cache for this user, skip the fetch.
        if (_cache?.userId === session.user.id) return;

        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('datum', { ascending: false });
        if (error) console.error('[BetsContext] bets query error:', error);
        if (!error && data) {
          _cache = { userId: session.user.id, bets: data };
          setBets(data);
        }
      } catch (e) {
        console.error('[BetsContext] fetchBets error:', e);
      } finally {
        setLoaded(true);
      }
    }
    fetchBets();
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
    setBets((prev) => {
      const next = [data, ...prev];
      if (_cache) _cache = { ..._cache, bets: next };
      return next;
    });
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
      setBets((prev) => {
        const next = [...data, ...prev];
        if (_cache) _cache = { ..._cache, bets: next };
        return next;
      });
      return data;
    }
    return [];
  };

  const replaceAutoImports = async (newBets) => {
    return addBets(newBets);
  };

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
      if (_cache) _cache = { ..._cache, bets: prevBets };
      return false;
    }
    if (data) {
      setBets((prev) => {
        const next = prev.map((b) => (b.id === id ? data : b));
        if (_cache) _cache = { ..._cache, bets: next };
        return next;
      });
      return true;
    }
    setBets(prevBets);
    if (_cache) _cache = { ..._cache, bets: prevBets };
    return false;
  };

  const deleteBet = async (id) => {
    const { error } = await supabase
      .from('bets')
      .delete()
      .eq('id', id);
    if (!error) {
      setBets((prev) => {
        const next = prev.filter((b) => b.id !== id);
        if (_cache) _cache = { ..._cache, bets: next };
        return next;
      });
    }
  };

  return (
    <BetsContext.Provider value={{ bets, addBet, addBets, replaceAutoImports, addScreenshotBets, updateBet, deleteBet, loaded }}>
      {children}
    </BetsContext.Provider>
  );
}

export const useBets = () => useContext(BetsContext);
