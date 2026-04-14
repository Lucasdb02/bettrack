'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PreferencesContext = createContext({});

export const ALL_BOOKMAKERS = [
  'bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',
  "Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino',
  'Tonybet','Starcasino','888','Betnation','ComeOn','Overig',
];

const DEFAULTS = {
  unitGrootte: 10,
  weergaveEenheden: 'euro', // 'euro' | 'units'
  gebruikersnaam: '',
  // { bookmakerNaam: { actief: boolean, startBalance: number } }
  bookmakersConfig: {},
};

export function PreferencesProvider({ children }) {
  const [prefs, setPrefsState] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bettrack_prefs');
      if (saved) setPrefsState({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {}
    setLoaded(true);
  }, []);

  const setPrefs = useCallback((next) => {
    setPrefsState(next);
    try { localStorage.setItem('bettrack_prefs', JSON.stringify(next)); } catch {}
  }, []);

  const updatePref = useCallback((key, value) => {
    setPrefs({ ...prefs, [key]: value });
  }, [prefs, setPrefs]);

  const updateBookmaker = useCallback((naam, updates) => {
    const current = prefs.bookmakersConfig[naam] || { actief: false, startBalance: 0 };
    setPrefs({
      ...prefs,
      bookmakersConfig: {
        ...prefs.bookmakersConfig,
        [naam]: { ...current, ...updates },
      },
    });
  }, [prefs, setPrefs]);

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs, updatePref, updateBookmaker, loaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);

/** Hook that returns formatting functions respecting the user's unit preference */
export function useFmt() {
  const { prefs } = useContext(PreferencesContext);
  const inUnits = prefs.weergaveEenheden === 'units' && prefs.unitGrootte > 0;
  const size = prefs.unitGrootte || 10;

  /** Format a P&L / profit value — always shows sign */
  const fmtPnl = useCallback((value) => {
    if (inUnits) {
      const u = value / size;
      return `${u >= 0 ? '+' : ''}${u.toFixed(2)}u`;
    }
    return `${value >= 0 ? '+€' : '-€'}${Math.abs(value).toFixed(2)}`;
  }, [inUnits, size]);

  /** Format a plain amount (inzet, balance) — no forced sign */
  const fmtAmt = useCallback((value) => {
    if (inUnits) {
      return `${(value / size).toFixed(2)}u`;
    }
    return `€${Math.abs(value).toFixed(2)}`;
  }, [inUnits, size]);

  /** Short unit label for axis ticks etc. */
  const unit = inUnits ? 'u' : '€';

  return { fmtPnl, fmtAmt, unit, inUnits };
}
