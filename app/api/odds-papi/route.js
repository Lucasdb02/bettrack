import { NextResponse } from 'next/server';

const BASE = 'https://api.oddspapi.io';
const SPORT_ID = 10; // Voetbal

// Bookmakers die we tonen in de vergelijkingstabel.
const BOOKMAKERS = [
  { slug: 'bet365', name: 'bet365' },
  { slug: 'unibet.nl', name: 'Unibet' },
  { slug: 'betcity.nl', name: 'BetCity' },
  { slug: 'leovegas', name: 'LeoVegas' },
  { slug: 'jacks.nl', name: "Jack's" },
];

// Marktdefinities (OddsPapi marketId → outcomeId → label) voor de markt-tabs in de UI.
const MARKETS = {
  'Match Winner':     { marketId: 101,    outcomes: { 101: 'Home', 102: 'Draw', 103: 'Away' } },
  'Both Teams Score': { marketId: 104,    outcomes: { 104: 'Yes', 105: 'No' } },
  'Goals Over/Under': { marketId: 1010,   outcomes: { 1010: 'Over', 1011: 'Under' } }, // lijn 2.5
  'Asian Handicap':   { marketId: 1072,   outcomes: { 1072: '1', 1073: '2' } },        // lijn 0
  'Double Chance':    { marketId: 101902, outcomes: { 101902: 'Home/Draw', 101903: 'Home/Away', 101904: 'Draw/Away' } },
};

// Landen met relevante voetbalcompetities (zelfde selectie als voorheen).
const ALLOWED_COUNTRIES = new Set([
  'England', 'Spain', 'Germany', 'France', 'Italy', 'Netherlands', 'Portugal', 'Belgium',
  'Turkey', 'Turkiye', 'Russia', 'Scotland', 'Greece', 'Switzerland', 'Austria', 'Poland',
  'Czech Republic', 'Croatia', 'Serbia', 'Romania', 'Ukraine', 'Denmark', 'Sweden',
  'Norway', 'Finland', 'Hungary', 'Slovakia', 'Slovenia', 'Bosnia', 'Bulgaria',
  'Ireland', 'Northern Ireland', 'Wales', 'Iceland',
  'Brazil', 'Argentina', 'Mexico', 'USA', 'Colombia', 'Chile', 'Peru', 'Ecuador',
  'Uruguay', 'Paraguay', 'Bolivia', 'Venezuela', 'Costa Rica', 'Jamaica', 'Canada',
  'Japan', 'South Korea', 'China', 'Saudi Arabia', 'UAE', 'Qatar', 'Iran', 'Israel',
  'Morocco', 'Egypt', 'Nigeria', 'Algeria', 'Tunisia', 'Senegal', 'South Africa',
  'Australia', 'International', 'International Clubs', 'World',
].map(normalizeKey));

function normalizeKey(s) {
  return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

// Patroon-filter: sluit jeugd, vrouwen, reserve, SRL en lagere klassen uit.
function isLeagueAllowed(name) {
  const n = (name || '').toLowerCase();
  if (/\bu\d{2}\b/.test(n)) return false; // U17, U18, U19, U20, U21, U22, U23
  if (/women|femenin|frauen|dames|feminino|feminin/.test(n)) return false;
  if (/reserve|amateur|youth|junioren|\bsrl\b|simulated/.test(n)) return false;
  return true;
}

// Europe/Amsterdam dag-grenzen → UTC ISO strings (DST-bewust via Intl).
function localDayRangeUtc(dateStr) {
  const noonUtc = new Date(`${dateStr}T12:00:00Z`);
  const hourInAmsterdam = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Amsterdam', hourCycle: 'h23', hour: '2-digit' }).format(noonUtc),
    10
  );
  const offsetHours = hourInAmsterdam - 12;
  const from = new Date(`${dateStr}T00:00:00Z`);
  from.setUTCHours(from.getUTCHours() - offsetHours);
  const to = new Date(`${dateStr}T23:59:59Z`);
  to.setUTCHours(to.getUTCHours() - offsetHours);
  return { from: from.toISOString(), to: to.toISOString() };
}

function mapStatus(statusId, startTime) {
  if (statusId === 1) return 'LIVE';
  if (statusId === 2) return 'FT';
  if (statusId === 3) return 'PP';
  if (statusId === 0) return 'NS';
  // Onbekende/ontbrekende status: afleiden uit kickoff-tijd
  return new Date(startTime).getTime() > Date.now() ? 'NS' : 'FT';
}

async function getFixtures(date, apiKey) {
  const { from, to } = localDayRangeUtc(date);
  const url = `${BASE}/v4/fixtures?sportId=${SPORT_ID}&from=${from}&to=${to}&apiKey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OddsPapi fixtures fout (${res.status}): ${t.slice(0, 200)}`);
  }
  return res.json();
}

async function getOdds(fixtureId, apiKey) {
  const bookmakers = BOOKMAKERS.map(b => b.slug).join(',');
  const url = `${BASE}/v4/odds?fixtureId=${encodeURIComponent(fixtureId)}&bookmakers=${bookmakers}&oddsFormat=decimal&apiKey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 45 } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OddsPapi odds fout (${res.status}): ${t.slice(0, 200)}`);
  }
  return res.json();
}

export async function GET(request) {
  const KEY = process.env.ODDS_API_KEY;
  if (!KEY) {
    return NextResponse.json({ error: 'ODDS_API_KEY niet geconfigureerd.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // ── Wedstrijden voor een datum ───────────────────────────────────────────
    if (action === 'fixtures') {
      const date = searchParams.get('date');
      if (!date) return NextResponse.json({ error: 'date vereist' }, { status: 400 });

      const raw = await getFixtures(date, KEY);
      const now = Date.now();

      const leagueMap = {};
      for (const f of raw || []) {
        if (!isLeagueAllowed(f.tournamentName)) continue;
        if (!ALLOWED_COUNTRIES.has(normalizeKey(f.categoryName))) continue;

        const status = mapStatus(f.statusId, f.startTime);
        let elapsed = null;
        if (status === 'LIVE' && f.trueStartTime) {
          elapsed = Math.max(0, Math.round((now - new Date(f.trueStartTime).getTime()) / 60000));
        }

        const fixture = {
          id: f.fixtureId,
          date: f.startTime,
          status,
          elapsed,
          homeTeam: f.participant1Name,
          awayTeam: f.participant2Name,
          hasOdds: !!f.hasOdds,
        };

        const lid = f.tournamentId;
        if (!leagueMap[lid]) {
          leagueMap[lid] = {
            id: lid,
            name: f.tournamentName,
            country: f.categoryName,
            fixtures: [],
          };
        }
        leagueMap[lid].fixtures.push(fixture);
      }

      const ORDER = { LIVE: 0, NS: 1, PP: 2, FT: 2 };
      for (const l of Object.values(leagueMap)) {
        l.fixtures.sort((a, b) => {
          const oa = ORDER[a.status] ?? 1;
          const ob = ORDER[b.status] ?? 1;
          if (oa !== ob) return oa - ob;
          return new Date(a.date) - new Date(b.date);
        });
      }

      return NextResponse.json(Object.values(leagueMap));
    }

    // ── Odds voor één wedstrijd, alle bookmakers in 1 call ──────────────────
    if (action === 'odds') {
      const fixtureId = searchParams.get('fixtureId');
      if (!fixtureId) return NextResponse.json({ error: 'fixtureId vereist' }, { status: 400 });

      const raw = await getOdds(fixtureId, KEY);
      const markets = {};

      for (const { slug, name } of BOOKMAKERS) {
        const odds = raw.bookmakerOdds?.[slug];
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
    }

    return NextResponse.json({ error: 'Ongeldig action parameter' }, { status: 400 });
  } catch (e) {
    console.error('OddsPapi error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
