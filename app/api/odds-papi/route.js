import { NextResponse } from 'next/server';

const BASE = 'https://api.oddspapi.io';
const SPORT_ID = 10; // Voetbal

// ── football-logos.cc: club-, competitie- en nationale-teamlogo's ──────────
// Geen officiële API, maar wel een SEO image-sitemap met alle ~3200 logo's
// (URL + titel). Eén keer per dag opgehaald en in-memory gecached.
const FL_SITEMAP_URL = 'https://football-logos.cc/image-sitemap.xml';

// Landnaam (zoals wij die gebruiken) → football-logos.cc map-slug.
// Wijkt op een aantal plekken af van zowel OddsPapi als ISO-namen.
const FL_COUNTRY_SLUG = {
  England: 'england', Spain: 'spain', Germany: 'germany', France: 'france', Italy: 'italy',
  Netherlands: 'netherlands', Portugal: 'portugal', Belgium: 'belgium', Turkiye: 'turkey', Russia: 'russia',
  Scotland: 'scotland', Greece: 'greece', Switzerland: 'switzerland', Austria: 'austria', Poland: 'poland',
  Czechia: 'czech-republic', Croatia: 'croatia', Serbia: 'serbia', Romania: 'romania', Ukraine: 'ukraine',
  Denmark: 'denmark', Sweden: 'sweden', Norway: 'norway', Finland: 'finland', Hungary: 'hungary',
  Slovakia: 'slovakia', Slovenia: 'slovenia', 'Bosnia & Herzegovina': 'bosnia-and-herzegovina', Bulgaria: 'bulgaria',
  Ireland: 'republic-of-ireland', 'Northern Ireland': 'northern-ireland', Wales: 'wales', Iceland: 'iceland',
  Brazil: 'brazil', Argentina: 'argentina', Mexico: 'mexico', USA: 'usa', Colombia: 'colombia',
  Chile: 'chile', Peru: 'peru', Ecuador: 'ecuador', Uruguay: 'uruguay', Paraguay: 'paraguay',
  Bolivia: 'bolivia', Venezuela: 'venezuela', 'Costa Rica': 'costa-rica', Jamaica: 'jamaica', Canada: 'canada',
  Japan: 'japan', 'Republic of Korea': 'south-korea', China: 'china', 'Saudi Arabia': 'saudi-arabia',
  'United Arab Emirates': 'uae', Qatar: 'qatar', Iran: 'iran', Israel: 'israel',
  Morocco: 'morocco', Egypt: 'egypt', Nigeria: 'nigeria', Algeria: 'algeria', Tunisia: 'tunisia',
  Senegal: 'senegal', 'South Africa': 'south-africa', Australia: 'australia',
};

// Bekende afwijkingen tussen OddsPapi-teamnaam (bij internationale toernooien,
// waar de teamnaam de landnaam IS) en de map-slug op football-logos.cc.
// Opgebouwd door alle WK 2026-deelnemers van OddsPapi één-voor-één te
// vergelijken met football-logos.cc's eigen folder-namen.
const FL_TEAM_COUNTRY_ALIAS = {
  'ivory coast': 'cote-d-ivoire',
  'cote d ivoire': 'cote-d-ivoire',
  'dr congo': 'congo-dr',
  'congo dr': 'congo-dr',
  'south korea': 'south-korea',
  'korea republic': 'south-korea',
  usa: 'usa',
  'united states': 'usa',
  turkiye: 'turkey',
  turkey: 'turkey',
  czechia: 'czech-republic',
  'czech republic': 'czech-republic',
  'cape verde': 'cabo-verde',
  'ir iran': 'iran',
  iran: 'iran',
  'bosnia and herzegovina': 'bosnia-and-herzegovina',
  'bosnia herzegovina': 'bosnia-and-herzegovina',
  'united arab emirates': 'uae',
  uae: 'uae',
};

const META_CATEGORIES = new Set(['international', 'internationalclubs', 'world', 'europe', 'southamerica'].map(normalizeKey));

let logoCatalogCache = { byFolder: null, fetchedAt: 0 };

function flSlugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function getLogoCatalog() {
  if (logoCatalogCache.byFolder && Date.now() - logoCatalogCache.fetchedAt < 7 * 24 * 60 * 60 * 1000) {
    return logoCatalogCache.byFolder;
  }
  const res = await fetch(FL_SITEMAP_URL, { next: { revalidate: 7 * 24 * 60 * 60 } });
  if (!res.ok) return logoCatalogCache.byFolder || {};

  const xml = await res.text();
  const byFolder = {};
  const urlBlockRe = /<url>\s*<loc>(.*?)<\/loc>\s*<image:image>\s*<image:loc>(.*?)<\/image:loc>\s*<image:title>(.*?)<\/image:title>/gs;
  let m;
  while ((m = urlBlockRe.exec(xml))) {
    const [, loc, imageLoc, rawTitle] = m;
    const path = loc.replace('https://football-logos.cc/', '').replace(/\/$/, '');
    const segments = path.split('/');
    if (segments.length !== 2) continue; // sla variant-pagina's (no-text/white/dark/unofficial) over
    const [folder, slug] = segments;
    const title = rawTitle.replace(/&apos;/g, "'").replace(/&amp;/g, '&');
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push({ slug, title, url: imageLoc });
  }
  logoCatalogCache = { byFolder, fetchedAt: Date.now() };
  return byFolder;
}

function flNormalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/\blogo\b/g, '').replace(/[^a-z0-9]/g, '');
}

const GENERIC_CLUB_WORDS = new Set(['fc', 'cf', 'afc', 'sc', 'cd', 'ac', 'as', 'ss', 'us', 'ud', 'sd', 'rc', 'logo']);

function flTokens(s) {
  const words = (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
  return new Set(words.filter(w => w && !GENERIC_CLUB_WORDS.has(w)));
}

// Woord-bewuste match in beide richtingen: ofwel zitten alle woorden van de
// titel in de teamnaam (bv. "Milan" in "Inter Milano" → afgewezen, want
// "milan" ≠ "milano"), ofwel zitten alle woorden van de teamnaam in de titel
// (bv. "Premier League" in "English Premier League" → geaccepteerd).
// Bij meerdere geldige kandidaten wint de kleinste woord-verschil-afstand.
function flFindByTitle(entries, query, exclude) {
  if (!entries) return null;
  const n = flNormalize(query);
  if (!n) return null;
  const queryTokens = flTokens(query);
  let best = null, bestDiff = Infinity;
  for (const e of entries) {
    if (exclude && exclude(e.title)) continue;
    const t = flNormalize(e.title);
    if (t === n) return e.url;

    const titleTokens = flTokens(e.title);
    if (titleTokens.size === 0) continue;
    const titleSubsetOfQuery = [...titleTokens].every(w => queryTokens.has(w));
    const querySubsetOfTitle = [...queryTokens].every(w => titleTokens.has(w));
    if (!titleSubsetOfQuery && !querySubsetOfTitle) continue;

    const diff = Math.abs(titleTokens.size - queryTokens.size);
    if (diff < bestDiff) { bestDiff = diff; best = e; }
  }
  return best?.url || null;
}

// Eén canonieke "X National Team"-pagina per land-folder — geen naam-match
// nodig, de juiste folder is al via slug/alias bepaald.
function flFindNationalTeam(entries) {
  if (!entries) return null;
  const hit = entries.find(e => /national team/i.test(e.title) && !/no text|white|dark|unofficial/i.test(e.title));
  return hit?.url || null;
}

// Bekende vertalingsverschillen tussen OddsPapi's tournamentName en
// football-logos.cc's titel (bv. Portugees "Brasileiro" vs. Engels "Brazilian").
const FL_TOURNAMENT_NAME_ALIAS = {
  'brasileiroseriea': 'brazilian serie a',
  'brasileiroserieb': 'brazilian serie b',
  'brasileiroseriec': 'brazilian serie c',
};

async function getLeagueLogo(tournamentName, categoryName, tournamentId) {
  const catalog = await getLogoCatalog();
  if (tournamentId === 16) { // FIFA World Cup — jaartal-specifiek
    const hit = flFindByTitle(catalog.tournaments, 'fifa world cup 2026', t => /no text|white|dark|unofficial/i.test(t));
    if (hit) return hit;
  }
  const query = FL_TOURNAMENT_NAME_ALIAS[normalizeKey(tournamentName)] || tournamentName;
  const isMeta = META_CATEGORIES.has(normalizeKey(categoryName));
  const folder = isMeta ? 'tournaments' : FL_COUNTRY_SLUG[Object.keys(FL_COUNTRY_SLUG).find(k => normalizeKey(k) === normalizeKey(categoryName))];
  const exclude = t => /no text|white|dark|unofficial|national team/i.test(t);
  const hit = (folder && flFindByTitle(catalog[folder], query, exclude))
    || flFindByTitle(catalog.tournaments, query, exclude);
  return hit || null;
}

async function getTeamLogo(teamName, categoryName) {
  const catalog = await getLogoCatalog();
  const isMeta = META_CATEGORIES.has(normalizeKey(categoryName));
  const exclude = t => /no text|white|dark|unofficial/i.test(t);

  if (isMeta) {
    // Teamnaam IS de landnaam — zoek het nationale team in dat land-folder.
    // Geen naam-match meer nodig zodra de folder vaststaat (voorkomt missers
    // bij vertaalde namen zoals "Ivory Coast" vs. "Côte d'Ivoire").
    const alias = FL_TEAM_COUNTRY_ALIAS[flNormalize2(teamName)];
    const folder = alias || flSlugify(teamName);
    return flFindNationalTeam(catalog[folder]) || null;
  }

  const folder = Object.keys(FL_COUNTRY_SLUG).find(k => normalizeKey(k) === normalizeKey(categoryName));
  const slug = folder && FL_COUNTRY_SLUG[folder];
  return flFindByTitle(catalog[slug], teamName, t => exclude(t) || /national team/i.test(t));
}

function flNormalize2(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Bookmakers die we tonen in de vergelijkingstabel.
const BOOKMAKERS = [
  { slug: 'bet365', name: 'bet365' },
  { slug: 'unibet.nl', name: 'Unibet' },
  { slug: 'betcity.nl', name: 'BetCity' },
  { slug: 'leovegas', name: 'LeoVegas' },
  { slug: 'jacks.nl', name: "Jack's" },
  { slug: 'betmgm', name: 'BetMGM' },
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

        const [homeCrest, awayCrest] = await Promise.all([
          getTeamLogo(f.participant1Name, f.categoryName),
          getTeamLogo(f.participant2Name, f.categoryName),
        ]);

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
          leagueMap[lid] = {
            id: lid,
            name: f.tournamentName,
            country: f.categoryName,
            emblem: await getLeagueLogo(f.tournamentName, f.categoryName, f.tournamentId),
            flag: flagFallbackUrl(f.categoryName),
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
