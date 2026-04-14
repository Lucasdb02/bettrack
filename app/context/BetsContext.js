'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const BetsContext = createContext();

const SCHEMA_FIELDS = ['datum', 'sport', 'wedstrijd', 'markt', 'selectie', 'odds', 'inzet', 'uitkomst', 'bookmaker', 'notities'];

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
    async function fetchBets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('datum', { ascending: false });
      if (!error && data) {
        setBets(data);
      }
      setLoaded(true);
    }
    fetchBets();
  }, []);

  const addBet = async (bet) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('bets')
      .insert(toDbRow(bet, user.id))
      .select()
      .single();
    if (!error && data) {
      setBets((prev) => [data, ...prev]);
      return data;
    }
    return null;
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
    const dbUpdates = {};
    for (const field of SCHEMA_FIELDS) {
      if (updates[field] !== undefined) dbUpdates[field] = updates[field];
    }
    const { data, error } = await supabase
      .from('bets')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setBets((prev) => prev.map((b) => (b.id === id ? data : b)));
    }
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
