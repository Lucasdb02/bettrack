import { NextResponse } from 'next/server';

const BASE = 'https://api.oddspapi.io';
const SPORT_ID = 10; // Voetbal

// Bookmakers die we tonen — beperkt gehouden vanwege de strikte rate limit
// van OddsPapi (±1 request/seconde per key, geen parallelle calls mogelijk).
// Voorkeur voor .nl-specifieke feeds waar beschikbaar.
const BOOKMAKERS = [
  { slug: 'bet365', name: 'bet365' },
  { slug: 'unibet.nl', name: 'Unibet' },
  { slug: 'betcity.nl', name: 'BetCity' },
  { slug: 'leovegas', name: 'LeoVegas' },
  { slug: 'jacks.nl', name: "Jack's" },
];

// Marktdefinities (OddsPapi marketId → outcomeId → label).
// Komt overeen met de markt-keys die de odds-v2 UI al verwacht.
const MARKETS = {
  'Match Winner':     { marketId: 101,    outcomes: { 101: 'Home', 102: 'Draw', 103: 'Away' } },
  'Both Teams Score': { marketId: 104,    outcomes: { 104: 'Yes', 105: 'No' } },
  'Goals Over/Under': { marketId: 1010,   outcomes: { 1010: 'Over', 1011: 'Under' } }, // lijn 2.5
  'Asian Handicap':   { marketId: 1072,   outcomes: { 1072: '1', 1073: '2' } },        // lijn 0
  'Double Chance':    { marketId: 101902, outcomes: { 101902: 'Home/Draw', 101903: 'Home/Away', 101904: 'Draw/Away' } },
};

// API-Football league.name (+ country) → OddsPapi tournamentId.
// Alleen de competities die ook in API-Football's ALLOWED_COUNTRIES/odds-v2 relevant zijn.
const TOURNAMENTS = [
  { country: 'England',     name: 'Premier League',                tournamentId: 17 },
  { country: 'England',     name: 'Championship',                  tournamentId: 18 },
  { country: 'Spain',       name: 'La Liga',                        tournamentId: 8 },
  { country: 'Germany',     name: 'Bundesliga',                     tournamentId: 35 },
  { country: 'Germany',     name: '2. Bundesliga',                  tournamentId: 44 },
  { country: 'Italy',       name: 'Serie A',                        tournamentId: 23 },
  { country: 'France',      name: 'Ligue 1',                        tournamentId: 34 },
  { country: 'Netherlands', name: 'Eredivisie',                     tournamentId: 37 },
  { country: 'Belgium',     name: 'Jupiler Pro League',             tournamentId: 38 },
  { country: 'Turkey',      name: 'Süper Lig',                      tournamentId: 52 },
  { country: 'Scotland',    name: 'Premiership',                    tournamentId: 36 },
  { country: 'Portugal',    name: 'Primeira Liga',                  tournamentId: 238 },
  { country: 'World',       name: 'UEFA Champions League',          tournamentId: 7 },
  { country: 'World',       name: 'UEFA Europa League',             tournamentId: 679 },
  { country: 'World',       name: 'UEFA Europa Conference League',  tournamentId: 34480 },
];

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolveTournamentId(leagueName, leagueCountry) {
  const n = normalize(leagueName);
  for (const t of TOURNAMENTS) {
    if (normalize(t.name) !== n) continue;
    if (t.country === 'World' || normalize(t.country) === normalize(leagueCountry)) return t.tournamentId;
  }
  return null;
}

function normTeam(s) {
  return normalize(s).replace(/^(fc|cf|afc|sc|cd|ac|as|ss|us|ud|sd|rc|sv|vfl|vfb|tsv)|(fc|cf|afc|sc)$/g, '');
}

function teamsMatch(a, b) {
  const na = normTeam(a), nb = normTeam(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

// Participants worden sport-breed opgehaald (1 grote lijst) en in-memory gecached,
// zodat we niet bij elke request opnieuw 350k+ aan teamnamen moeten downloaden.
let participantsCache = { data: null, fetchedAt: 0 };

async function getParticipants(apiKey) {
  if (participantsCache.data && Date.now() - participantsCache.fetchedAt < 60 * 60 * 1000) {
    return participantsCache.data;
  }
  const res = await fetch(`${BASE}/v4/participants?sportId=${SPORT_ID}&apiKey=${apiKey}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return participantsCache.data || {};
  const data = await res.json();
  participantsCache = { data, fetchedAt: Date.now() };
  return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBookmakerFixtures(tournamentId, bookmakerSlug, apiKey) {
  const url = `${BASE}/v4/odds-by-tournaments?tournamentIds=${tournamentId}&bookmaker=${bookmakerSlug}&oddsFormat=decimal&apiKey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 90 } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function findMatch(fixtures, homeTeam, awayTeam, dateIso, participants) {
  const target = new Date(dateIso).getTime();
  let best = null;
  let bestDiff = Infinity;
  for (const f of fixtures) {
    const home = participants[f.participant1Id];
    const away = participants[f.participant2Id];
    if (!home || !away) continue;
    if (!teamsMatch(home, homeTeam) || !teamsMatch(away, awayTeam)) continue;
    const diff = Math.abs(new Date(f.startTime).getTime() - target);
    if (diff < bestDiff) { bestDiff = diff; best = f; }
  }
  // Sta tot 8 uur afwijking toe (tijdzone-verschillen tussen databronnen)
  return bestDiff < 8 * 60 * 60 * 1000 ? best : null;
}

export async function GET(request) {
  const KEY = process.env.ODDS_API_KEY;
  if (!KEY) {
    return NextResponse.json({ error: 'ODDS_API_KEY niet geconfigureerd.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action !== 'odds') {
    return NextResponse.json({ error: 'Ongeldig action parameter' }, { status: 400 });
  }

  const leagueName = searchParams.get('leagueName') || '';
  const leagueCountry = searchParams.get('leagueCountry') || '';
  const homeTeam = searchParams.get('home') || '';
  const awayTeam = searchParams.get('away') || '';
  const date = searchParams.get('date') || '';

  const tournamentId = resolveTournamentId(leagueName, leagueCountry);
  if (!tournamentId) {
    return NextResponse.json({ markets: {}, unsupported: true });
  }

  try {
    const participants = await getParticipants(KEY);
    const markets = {};

    for (let i = 0; i < BOOKMAKERS.length; i++) {
      const { slug, name } = BOOKMAKERS[i];
      if (i > 0) await sleep(1100); // rate limit: max ±1 req/sec

      const fixtures = await fetchBookmakerFixtures(tournamentId, slug, KEY);
      const match = findMatch(fixtures, homeTeam, awayTeam, date, participants);
      if (!match) continue;

      const odds = match.bookmakerOdds?.[slug];
      if (!odds || odds.suspended) continue;

      for (const [marketName, def] of Object.entries(MARKETS)) {
        const marketData = odds.markets?.[def.marketId];
        if (!marketData?.marketActive) continue;

        const values = {};
        for (const [outcomeId, label] of Object.entries(def.outcomes)) {
          const price = marketData.outcomes?.[outcomeId]?.players?.['0']?.price;
          if (typeof price === 'number') values[label] = price;
        }
        if (Object.keys(values).length === 0) continue;

        if (!markets[marketName]) markets[marketName] = [];
        markets[marketName].push({ id: slug, name, values });
      }
    }

    for (const m of Object.values(markets)) {
      m.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({ markets });
  } catch (e) {
    console.error('OddsPapi error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
