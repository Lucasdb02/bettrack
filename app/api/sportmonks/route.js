import { NextResponse } from 'next/server';

const BASE = 'https://api.sportmonks.com/v3/football';

// Only return bookmakers active in the Dutch market
const NL_BOOKMAKER_NAMES = new Set([
  '711 casino', 'unibet', 'bet365', 'leovegas', 'tonybet', 'toto',
  'circus casino', '888sport', '888 sport', 'vbet', 'betmgm', 'one casino',
  'jacks.nl', 'betnation', 'zebet', 'betcity', 'bingoal',
  'holland casino online',
]);

const STATE_MAP = {
  1: 'NS',
  2: 'LIVE',
  3: 'HT',
  4: 'ET',
  5: 'FT',
  6: 'AET',
  7: 'PEN',
  8: 'BREAK',
  9: 'EXTRA_TIME',
  10: 'SUSP',
  11: 'INT',
  12: 'POSTP',
  13: 'CANC',
};

function getCurrentScore(scores, participantId) {
  const s = scores?.find(
    (sc) => sc.participant_id === participantId && sc.description === 'CURRENT'
  );
  return s?.score?.goals ?? null;
}

export async function GET(request) {
  const TOKEN = process.env.SPORTMONKS_API_TOKEN;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!TOKEN) {
    return NextResponse.json({ error: 'Sportmonks API token niet geconfigureerd. Herstart de dev server na het toevoegen van SPORTMONKS_API_TOKEN aan .env.local.' }, { status: 500 });
  }

  try {
    if (action === 'fixtures') {
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const date = searchParams.get('date') || localDate;

      const allFixtures = [];
      let page = 1;
      while (true) {
        const url = `${BASE}/fixtures/date/${date}?api_token=${TOKEN}&include=league;participants;scores&per_page=100&page=${page}`;
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) {
          const text = await res.text();
          console.error('Sportmonks fixtures error', res.status, text.slice(0, 300));
          return NextResponse.json({ error: `Sportmonks API fout (${res.status})` }, { status: 502 });
        }
        const raw = await res.json();
        const batch = raw.data || [];
        allFixtures.push(...batch);
        if (batch.length < 100) break;
        page++;
      }

      const leagueMap = {};
      for (const f of allFixtures) {
        const home = f.participants?.find((p) => p.meta?.location === 'home');
        const away = f.participants?.find((p) => p.meta?.location === 'away');
        const status = STATE_MAP[f.state_id] || 'NS';

        const fixture = {
          id: f.id,
          startingAt: f.starting_at,
          status,
          homeTeam: home?.name || '',
          homeLogo: home?.image_path || '',
          homeShortCode: home?.short_code || '',
          awayTeam: away?.name || '',
          awayLogo: away?.image_path || '',
          awayShortCode: away?.short_code || '',
          homeScore: getCurrentScore(f.scores, home?.id),
          awayScore: getCurrentScore(f.scores, away?.id),
          hasOdds: f.has_odds ?? false,
        };

        const lid = f.league?.id;
        if (!leagueMap[lid]) {
          leagueMap[lid] = {
            id: lid,
            name: f.league?.name || '',
            logo: f.league?.image_path || '',
            fixtures: [],
          };
        }
        leagueMap[lid].fixtures.push(fixture);
      }

      return NextResponse.json(Object.values(leagueMap));
    }

    if (action === 'odds') {
      const fixtureId = searchParams.get('fixtureId');
      if (!fixtureId) {
        return NextResponse.json({ error: 'fixtureId vereist' }, { status: 400 });
      }
      const url = `${BASE}/odds/pre-match/fixtures/${fixtureId}?api_token=${TOKEN}&include=bookmaker&filters=marketIds:1&per_page=200`;
      const res = await fetch(url, { next: { revalidate: 30 } });
      if (!res.ok) {
        const text = await res.text();
        console.error('Sportmonks odds error', res.status, text.slice(0, 300));
        return NextResponse.json({ error: `Sportmonks API fout (${res.status})` }, { status: 502 });
      }
      const raw = await res.json();

      const bookieMap = {};
      for (const o of raw.data || []) {
        if (o.market_id !== 1) continue; // only 1X2 Fulltime Result market
        const name = o.bookmaker?.name || '';
        if (!NL_BOOKMAKER_NAMES.has(name.toLowerCase())) continue;

        const bid = o.bookmaker_id;
        if (!bookieMap[bid]) {
          bookieMap[bid] = { id: bid, name };
        }
        const label = o.label?.toLowerCase();
        if (label === 'home' || label === '1') bookieMap[bid].home = parseFloat(o.value);
        else if (label === 'draw' || label === 'x') bookieMap[bid].draw = parseFloat(o.value);
        else if (label === 'away' || label === '2') bookieMap[bid].away = parseFloat(o.value);
      }

      const result = Object.values(bookieMap)
        .filter((b) => b.home && b.draw && b.away)
        .sort((a, b) => b.home - a.home);

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Ongeldig action parameter' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
