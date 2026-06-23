'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

export function berekenWinst(uitkomst, odds, inzet, betType) {
  // Lay Bet: P&L is reversed (you're the bookmaker)
  if (betType === 'Lay Bet') {
    if (uitkomst === 'gewonnen')      return parseFloat((inzet).toFixed(2));
    if (uitkomst === 'verloren')      return parseFloat((-(odds - 1) * inzet).toFixed(2));
    if (uitkomst === 'half_gewonnen') return parseFloat((inzet / 2).toFixed(2));
    if (uitkomst === 'half_verloren') return parseFloat((-(odds - 1) * inzet / 2).toFixed(2));
    return 0;
  }
  // Bonus Bet SNR: stake was free so no real loss; profit = (odds-1)×stake
  if (betType === 'Bonus Bet (SNR)') {
    if (uitkomst === 'gewonnen')      return parseFloat(((odds - 1) * inzet).toFixed(2));
    if (uitkomst === 'half_gewonnen') return parseFloat(((odds - 1) * inzet / 2).toFixed(2));
    if (uitkomst === 'verloren' || uitkomst === 'half_verloren') return 0;
    return 0;
  }
  // Bonus Bet SR: stake returned so full return = profit; profit = odds×stake
  if (betType === 'Bonus Bet (SR)') {
    if (uitkomst === 'gewonnen')      return parseFloat((odds * inzet).toFixed(2));
    if (uitkomst === 'half_gewonnen') return parseFloat((odds * inzet / 2).toFixed(2));
    if (uitkomst === 'verloren' || uitkomst === 'half_verloren') return 0;
    return 0;
  }
  if (uitkomst === 'gewonnen')      return parseFloat(((odds - 1) * inzet).toFixed(2));
  if (uitkomst === 'verloren')      return parseFloat((-inzet).toFixed(2));
  if (uitkomst === 'half_gewonnen') return parseFloat(((odds - 1) * inzet / 2).toFixed(2));
  if (uitkomst === 'half_verloren') return parseFloat((-inzet / 2).toFixed(2));
  return 0;
}

export function BetsProvider({ children }) {
  const [bets, setBets]             = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const supabaseRef = useRef(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const userIdRef = useRef(null);

  const fetchBets = useCallback(async (userId) => {
    setFetchError(false);
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId)
        .order('datum', { ascending: false });
      if (error) throw error;
      setBets(data ?? []);
      setLoaded(true);
    } catch (e) {
      console.warn('[BetsContext] fetchBets mislukt:', e.message);
      setLoaded(true);
      setFetchError(true);
    }
  }, [supabase]);

  const reloadBets = useCallback(async () => {
    if (userIdRef.current) {
      setLoaded(false);
      await fetchBets(userIdRef.current);
    }
  }, [fetchBets]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        fetchBets(session.user.id);
      } else {
        setLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        userIdRef.current = session.user.id;
        fetchBets(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        setBets([]);
        setLoaded(true);
        setFetchError(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchBets, supabase]);

  const getUid = async () => {
    if (userIdRef.current) return userIdRef.current;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  };

  const addBet = async (bet) => {
    const uid = await getUid();
    if (!uid) return null;
    const { data, error } = await supabase.from('bets').insert(toDbRow(bet, uid)).select().single();
    if (error) { console.error('[addBet]', error); return null; }
    setBets(prev => [data, ...prev]);
    return data;
  };

  const addBets = async (newBets) => {
    const uid = await getUid();
    if (!uid) throw new Error('Niet ingelogd');
    const saved = [];
    for (const bet of newBets) {
      const { data, error } = await supabase.from('bets').insert(toDbRow(bet, uid)).select().single();
      if (!error && data) saved.push(data);
      else if (error) console.error('[addBets]', error);
    }
    if (saved.length > 0) setBets(prev => [...saved, ...prev]);
    return saved;
  };

  const replaceAutoImports = async (newBets) => addBets(newBets);

  const addScreenshotBets = async (newBets) => {
    const res = await fetch('/api/save-bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bets: newBets }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Opslaan mislukt');
    if (json.bets?.length) setBets(prev => [...json.bets, ...prev]);
    return json.bets || [];
  };

  const updateBet = async (id, updates) => {
    const uid = await getUid();
    if (!uid) return false;
    const prevBets = bets;
    setBets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    const dbUpdates = {};
    for (const field of SCHEMA_FIELDS) {
      if (updates[field] !== undefined) dbUpdates[field] = updates[field];
    }
    const { data, error } = await supabase
      .from('bets').update(dbUpdates).eq('id', id).eq('user_id', uid).select().single();
    if (error) { console.error('[updateBet]', error); setBets(prevBets); return false; }
    if (data) setBets(prev => prev.map(b => b.id === id ? data : b));
    return true;
  };

  const deleteBet = async (id) => {
    const prevBets = bets;
    setBets(prev => prev.filter(b => b.id !== id));
    const { error } = await supabase.from('bets').delete().eq('id', id);
    if (error) { console.error('[deleteBet]', error); setBets(prevBets); }
  };

  return (
    <BetsContext.Provider value={{ bets, addBet, addBets, replaceAutoImports, addScreenshotBets, updateBet, deleteBet, loaded, fetchError, reloadBets }}>
      {children}
    </BetsContext.Provider>
  );
}

export const useBets = () => useContext(BetsContext);
