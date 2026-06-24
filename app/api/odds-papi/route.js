import { NextResponse } from 'next/server';

const BASE = 'https://api.oddspapi.io';
const SPORT_ID = 10; // Voetbal

const FD_BASE = 'https://api.football-data.org/v4';

// OddsPapi tournamentId → football-data.org competitiecode.
// Football-data's gratis plan dekt maar 13 competities — alleen die kunnen
// een vlag/logo/club-crest krijgen, de rest valt terug op de lege weergave.
const FD_COMPETITION_BY_TOURNAMENT = {
  17:  'PL',  // Premier League (Engeland)
  18:  'ELC', // Championship (Engeland)
  8:   'PD',  // La Liga (Spanje)
  35:  'BL1', // Bundesliga (Duitsland)
  23:  'SA',  // Serie A (Italië)
  34:  'FL1', // Ligue 1 (Frankrijk)
  37:  'DED', // Eredivisie (Nederland)
  238: 'PPL', // Primeira Liga (Portugal)
  7:   'CL',  // UEFA Champions League
  16:  'WC',  // FIFA World Cup
  325: 'BSA', // Brasileiro Série A
  384: 'CLI', // Copa Libertadores
};

// In-memory caches (per serverless-instance levensduur) zodat we niet
// constant tegen football-data.org's limiet van 10 requests/minuut aanlopen.
let competitionsCache = { data: null, fetchedAt: 0 };
const teamsCacheByCode = {};

function fdNormalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]/g, '');
}

async function getCompetitions(fdKey) {
  if (competitionsCache.data && Date.now() - competitionsCache.fetchedAt < 24 * 60 * 60 * 1000) {
    return competitionsCache.data;
  }
  const res = await fetch(`${FD_BASE}/competitions`, {
    headers: { 'X-Auth-Token': fdKey },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return competitionsCache.data || {};

  const json = await res.json();
  const byCode = {};
  for (const c of json.competitions || []) {
    byCode[c.code] = { emblem: c.emblem || null, flag: c.area?.flag || null };
  }
  competitionsCache = { data: byCode, fetchedAt: Date.now() };
  return byCode;
}

async function getTeamCrests(code, fdKey) {
  const cached = teamsCacheByCode[code];
  if (cached && Date.now() - cached.fetchedAt < 24 * 60 * 60 * 1000) {
    return cached.data;
  }
  const res = await fetch(`${FD_BASE}/competitions/${code}/teams`, {
    headers: { 'X-Auth-Token': fdKey },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return cached?.data || {};

  const json = await res.json();
  const byName = {};
  for (const t of json.teams || []) {
    if (!t.crest) continue;
    byName[fdNormalize(t.name)] = t.crest;
    byName[fdNormalize(t.shortName)] = t.crest;
  }
  teamsCacheByCode[code] = { data: byName, fetchedAt: Date.now() };
  return byName;
}

function findCrest(crestMap, teamName) {
  const n = fdNormalize(teamName);
  if (crestMap[n]) return crestMap[n];
  for (const [key, url] of Object.entries(crestMap)) {
    if (key && (n.includes(key) || key.includes(n))) return url;
  }
  return null;
}

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

// Landen met relevante voetbalcompetities — namen exact zoals OddsPapi's
// categoryName ze teruggeeft (afwijkt soms van API-Football's spelling).
const COUNTRY_NAMES = [
  'England', 'Spain', 'Germany', 'France', 'Italy', 'Netherlands', 'Portugal', 'Belgium',
  'Turkiye', 'Russia', 'Scotland', 'Greece', 'Switzerland', 'Austria', 'Poland',
  'Czechia', 'Croatia', 'Serbia', 'Romania', 'Ukraine', 'Denmark', 'Sweden',
  'Norway', 'Finland', 'Hungary', 'Slovakia', 'Slovenia', 'Bosnia & Herzegovina', 'Bulgaria',
  'Ireland', 'Northern Ireland', 'Wales', 'Iceland',
  'Brazil', 'Argentina', 'Mexico', 'USA', 'Colombia', 'Chile', 'Peru', 'Ecuador',
  'Uruguay', 'Paraguay', 'Bolivia', 'Venezuela', 'Costa Rica', 'Jamaica', 'Canada',
  'Japan', 'Republic of Korea', 'China', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Iran', 'Israel',
  'Morocco', 'Egypt', 'Nigeria', 'Algeria', 'Tunisia', 'Senegal', 'South Africa',
  'Australia',
];

// ISO 3166-1 alpha-2 (of GB-subdivisie) codes voor de flagcdn.com-fallback,
// gebruikt wanneer football-data.org geen vlag heeft (alle niet-13-competities).
const COUNTRY_ISO = {
  England: 'gb-eng', Spain: 'es', Germany: 'de', France: 'fr', Italy: 'it',
  Netherlands: 'nl', Portugal: 'pt', Belgium: 'be', Turkiye: 'tr', Russia: 'ru',
  Scotland: 'gb-sct', Greece: 'gr', Switzerland: 'ch', Austria: 'at', Poland: 'pl',
  Czechia: 'cz', Croatia: 'hr', Serbia: 'rs', Romania: 'ro', Ukraine: 'ua',
  Denmark: 'dk', Sweden: 'se', Norway: 'no', Finland: 'fi', Hungary: 'hu',
  Slovakia: 'sk', Slovenia: 'si', 'Bosnia & Herzegovina': 'ba', Bulgaria: 'bg',
  Ireland: 'ie', 'Northern Ireland': 'gb-nir', Wales: 'gb-wls', Iceland: 'is',
  Brazil: 'br', Argentina: 'ar', Mexico: 'mx', USA: 'us', Colombia: 'co',
  Chile: 'cl', Peru: 'pe', Ecuador: 'ec', Uruguay: 'uy', Paraguay: 'py',
  Bolivia: 'bo', Venezuela: 've', 'Costa Rica': 'cr', Jamaica: 'jm', Canada: 'ca',
  Japan: 'jp', 'Republic of Korea': 'kr', China: 'cn', 'Saudi Arabia': 'sa',
  'United Arab Emirates': 'ae', Qatar: 'qa', Iran: 'ir', Israel: 'il',
  Morocco: 'ma', Egypt: 'eg', Nigeria: 'ng', Algeria: 'dz', Tunisia: 'tn',
  Senegal: 'sn', 'South Africa': 'za', Australia: 'au',
};

const ALLOWED_COUNTRIES = new Set([
  ...COUNTRY_NAMES, 'International', 'International Clubs', 'World',
].map(normalizeKey));

const COUNTRY_ISO_BY_KEY = Object.fromEntries(
  Object.entries(COUNTRY_ISO).map(([name, iso]) => [normalizeKey(name), iso])
);

function normalizeKey(s) {
  return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

function flagFallbackUrl(countryName) {
  const iso = COUNTRY_ISO_BY_KEY[normalizeKey(countryName)];
  return iso ? `https://flagcdn.com/h40/${iso}.png` : null;
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
  const FD_KEY = process.env.FOOTBALL_DATA_API_KEY;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // ── Wedstrijden voor een datum ───────────────────────────────────────────
    if (action === 'fixtures') {
      const date = searchParams.get('date');
      if (!date) return NextResponse.json({ error: 'date vereist' }, { status: 400 });

      const raw = await getFixtures(date, KEY);
      const now = Date.now();

      const competitions = FD_KEY ? await getCompetitions(FD_KEY) : {};
      const crestsByCode = {};

      const leagueMap = {};
      for (const f of raw || []) {
        if (!isLeagueAllowed(f.tournamentName)) continue;
        if (!ALLOWED_COUNTRIES.has(normalizeKey(f.categoryName))) continue;

        const status = mapStatus(f.statusId, f.startTime);
        let elapsed = null;
        if (status === 'LIVE' && f.trueStartTime) {
          elapsed = Math.max(0, Math.round((now - new Date(f.trueStartTime).getTime()) / 60000));
        }

        const fdCode = FD_COMPETITION_BY_TOURNAMENT[f.tournamentId];
        let homeCrest = null, awayCrest = null;
        if (FD_KEY && fdCode) {
          if (!crestsByCode[fdCode]) crestsByCode[fdCode] = await getTeamCrests(fdCode, FD_KEY);
          homeCrest = findCrest(crestsByCode[fdCode], f.participant1Name);
          awayCrest = findCrest(crestsByCode[fdCode], f.participant2Name);
        }

        const fixture = {
          id: f.fixtureId,
          date: f.startTime,
          status,
          elapsed,
          homeTeam: f.participant1Name,
          awayTeam: f.participant2Name,
          homeCrest,
          awayCrest,
          hasOdds: !!f.hasOdds,
        };

        const lid = f.tournamentId;
        if (!leagueMap[lid]) {
          const fd = fdCode ? competitions[fdCode] : null;
          leagueMap[lid] = {
            id: lid,
            name: f.tournamentName,
            country: f.categoryName,
            emblem: fd?.emblem || null,
            flag: fd?.flag || flagFallbackUrl(f.categoryName),
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
