'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const BetsContext = createContext();

const SAMPLE_BETS = [
  { id: '1', datum: '2026-01-05', sport: 'Voetbal', wedstrijd: 'Ajax vs PSV', markt: '1X2', selectie: 'Ajax', odds: 2.10, inzet: 50, uitkomst: 'gewonnen', bookmaker: 'Bet365', notities: '' },
  { id: '2', datum: '2026-01-08', sport: 'Voetbal', wedstrijd: 'Feyenoord vs AZ', markt: 'Over/Under', selectie: 'Over 2.5', odds: 1.85, inzet: 30, uitkomst: 'gewonnen', bookmaker: 'Unibet', notities: '' },
  { id: '3', datum: '2026-01-12', sport: 'Tennis', wedstrijd: 'Sinner vs Alcaraz', markt: 'Wedstrijd Winnaar', selectie: 'Sinner', odds: 1.95, inzet: 40, uitkomst: 'verloren', bookmaker: 'Betway', notities: '' },
  { id: '4', datum: '2026-01-15', sport: 'Voetbal', wedstrijd: 'Liverpool vs Chelsea', markt: 'Asian Handicap', selectie: 'Liverpool -1', odds: 2.20, inzet: 25, uitkomst: 'verloren', bookmaker: 'Bet365', notities: '' },
  { id: '5', datum: '2026-01-19', sport: 'Basketball', wedstrijd: 'LA Lakers vs Boston', markt: 'Handicap', selectie: 'Boston -5.5', odds: 1.90, inzet: 35, uitkomst: 'gewonnen', bookmaker: 'Unibet', notities: 'Goede vorm Boston' },
  { id: '6', datum: '2026-01-22', sport: 'Voetbal', wedstrijd: 'Barcelona vs Real Madrid', markt: 'BTTS', selectie: 'Ja', odds: 1.75, inzet: 60, uitkomst: 'gewonnen', bookmaker: 'Bet365', notities: '' },
  { id: '7', datum: '2026-01-26', sport: 'Tennis', wedstrijd: 'Djokovic vs Medvedev', markt: 'Wedstrijd Winnaar', selectie: 'Djokovic', odds: 1.65, inzet: 50, uitkomst: 'gewonnen', bookmaker: 'Betway', notities: '' },
  { id: '8', datum: '2026-01-30', sport: 'Voetbal', wedstrijd: 'PSG vs Lyon', markt: '1X2', selectie: 'PSG', odds: 1.60, inzet: 75, uitkomst: 'verloren', bookmaker: 'Unibet', notities: '' },
  { id: '9', datum: '2026-02-03', sport: 'Hockey', wedstrijd: 'Nederland vs Duitsland', markt: 'Wedstrijd Winnaar', selectie: 'Nederland', odds: 1.80, inzet: 40, uitkomst: 'gewonnen', bookmaker: 'Bet365', notities: '' },
  { id: '10', datum: '2026-02-07', sport: 'Voetbal', wedstrijd: 'Juventus vs Inter', markt: 'Over/Under', selectie: 'Under 2.5', odds: 2.05, inzet: 30, uitkomst: 'verloren', bookmaker: 'Betway', notities: '' },
  { id: '11', datum: '2026-02-10', sport: 'Basketball', wedstrijd: 'Golden State vs Miami', markt: 'Totaal Punten', selectie: 'Over 215.5', odds: 1.95, inzet: 45, uitkomst: 'gewonnen', bookmaker: 'Unibet', notities: '' },
  { id: '12', datum: '2026-02-14', sport: 'Voetbal', wedstrijd: 'Ajax vs Feyenoord', markt: '1X2', selectie: 'Gelijkspel', odds: 3.40, inzet: 20, uitkomst: 'verloren', bookmaker: 'Bet365', notities: 'Risicovol maar leuke odds' },
  { id: '13', datum: '2026-02-18', sport: 'Tennis', wedstrijd: 'Ruud vs Fritz', markt: 'Wedstrijd Winnaar', selectie: 'Fritz', odds: 2.30, inzet: 35, uitkomst: 'gewonnen', bookmaker: 'Betway', notities: '' },
  { id: '14', datum: '2026-02-22', sport: 'Voetbal', wedstrijd: 'Man City vs Arsenal', markt: 'Asian Handicap', selectie: 'Arsenal +0.5', odds: 2.00, inzet: 50, uitkomst: 'gewonnen', bookmaker: 'Unibet', notities: '' },
  { id: '15', datum: '2026-02-26', sport: 'Formule 1', wedstrijd: 'GP Australie', markt: 'Race Winnaar', selectie: 'Verstappen', odds: 2.75, inzet: 30, uitkomst: 'verloren', bookmaker: 'Bet365', notities: '' },
  { id: '16', datum: '2026-03-02', sport: 'Voetbal', wedstrijd: 'PSV vs Feyenoord', markt: '1X2', selectie: 'PSV', odds: 1.95, inzet: 55, uitkomst: 'gewonnen', bookmaker: 'Betway', notities: '' },
  { id: '17', datum: '2026-03-06', sport: 'Tennis', wedstrijd: 'Zverev vs Rublev', markt: 'Wedstrijd Winnaar', selectie: 'Zverev', odds: 1.70, inzet: 40, uitkomst: 'gewonnen', bookmaker: 'Unibet', notities: '' },
  { id: '18', datum: '2026-03-10', sport: 'Voetbal', wedstrijd: 'Atletico vs Valencia', markt: 'Over/Under', selectie: 'Under 2.5', odds: 1.80, inzet: 35, uitkomst: 'gewonnen', bookmaker: 'Bet365', notities: '' },
  { id: '19', datum: '2026-03-15', sport: 'Basketball', wedstrijd: 'Denver vs Phoenix', markt: 'Handicap', selectie: 'Denver -3.5', odds: 2.10, inzet: 40, uitkomst: 'verloren', bookmaker: 'Betway', notities: '' },
  { id: '20', datum: '2026-03-20', sport: 'Voetbal', wedstrijd: 'Bayern vs Dortmund', markt: '1X2', selectie: 'Bayern', odds: 1.75, inzet: 70, uitkomst: 'lopend', bookmaker: 'Unibet', notities: '' },
];

export function berekenWinst(uitkomst, odds, inzet) {
  if (uitkomst === 'gewonnen')      return parseFloat(((odds - 1) * inzet).toFixed(2));
  if (uitkomst === 'verloren')      return parseFloat((-inzet).toFixed(2));
  if (uitkomst === 'half_gewonnen') return parseFloat(((odds - 1) * inzet / 2).toFixed(2));
  if (uitkomst === 'half_verloren') return parseFloat((-inzet / 2).toFixed(2));
  // push, void, onbeslist → stake returned, no P&L
  return 0;
}

export function BetsProvider({ children }) {
  const [bets, setBets] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bettrack_bets');
      if (stored) {
        setBets(JSON.parse(stored));
      } else {
        setBets(SAMPLE_BETS);
        localStorage.setItem('bettrack_bets', JSON.stringify(SAMPLE_BETS));
      }
    } catch {
      setBets(SAMPLE_BETS);
    }
    setLoaded(true);
  }, []);

  const save = (updated) => {
    setBets(updated);
    localStorage.setItem('bettrack_bets', JSON.stringify(updated));
  };

  const addBet = (bet) => {
    const newBet = { ...bet, id: Date.now().toString() };
    save([...bets, newBet]);
    return newBet;
  };

  const addBets = (newBets) => {
    const withIds = newBets.map((bet, i) => ({ ...bet, id: (Date.now() + i).toString() }));
    save([...bets, ...withIds]);
    return withIds;
  };

  // Replaces all previously auto-imported bets with a fresh snapshot — prevents duplicates
  const replaceAutoImports = (newBets) => {
    const manual = bets.filter(b => b._source !== 'auto-import');
    const withIds = newBets.map((bet, i) => ({ ...bet, id: (Date.now() + i).toString() }));
    save([...manual, ...withIds]);
    return withIds;
  };

  // Adds screenshot-imported bets (each upload is a new set; existing screenshot bets kept)
  const addScreenshotBets = (newBets) => {
    const withIds = newBets.map((bet, i) => ({ ...bet, id: (Date.now() + i).toString() }));
    save([...bets, ...withIds]);
    return withIds;
  };

  const updateBet = (id, updates) => {
    save(bets.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBet = (id) => {
    save(bets.filter((b) => b.id !== id));
  };

  return (
    <BetsContext.Provider value={{ bets, addBet, addBets, replaceAutoImports, addScreenshotBets, updateBet, deleteBet, loaded }}>
      {children}
    </BetsContext.Provider>
  );
}

export const useBets = () => useContext(BetsContext);
