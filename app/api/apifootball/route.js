import { NextResponse } from 'next/server';

const BASE = 'https://v3.football.api-sports.io';

function apiFetch(path, key) {
  return fetch(`${BASE}${path}`, {
    headers: { 'x-apisports-key': key },
    next: { revalidate: 60 },
  });
}

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request) {
  const KEY = process.env.API_FOOTBALL_KEY;
  if (!KEY) {
    return NextResponse.json({ error: 'API_FOOTBALL_KEY niet geconfigureerd in Vercel.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // ── Fixtures voor een datum ──────────────────────────────────────────────
    if (action === 'fixtures') {
      const date = searchParams.get('date') || localDateStr();
      const res = await apiFetch(`/fixtures?date=${date}&timezone=Europe/Amsterdam`, KEY);
      if (!res.ok) {
        const t = await res.text();
        console.error('API-Football fixtures', res.status, t.slice(0, 300));
        return NextResponse.json({ error: `API fout (${res.status})` }, { status: 502 });
      }
      const raw = await res.json();

      const leagueMap = {};
      for (const f of raw.response || []) {
        const fix = f.fixture;
        const league = f.league;
        const teams = f.teams;
        const goals = f.goals;
        const status = fix.status?.short || 'NS';
        const elapsed = fix.status?.elapsed;

        const fixture = {
          id: fix.id,
          date: fix.date,
          status,
          elapsed,
          homeTeam: teams.home.name,
          homeLogo: teams.home.logo,
          homeId: teams.home.id,
          awayTeam: teams.away.name,
          awayLogo: teams.away.logo,
          awayId: teams.away.id,
          homeScore: goals.home,
          awayScore: goals.away,
          halftimeHome: f.score?.halftime?.home,
          halftimeAway: f.score?.halftime?.away,
          venue: fix.venue?.name,
          referee: fix.referee,
        };

        const lid = league.id;
        if (!leagueMap[lid]) {
          leagueMap[lid] = {
            id: lid,
            name: league.name,
            logo: league.logo,
            country: league.country,
            flag: league.flag,
            season: league.season,
            round: league.round,
            fixtures: [],
          };
        }
        leagueMap[lid].fixtures.push(fixture);
      }

      // Sorteer elke competitie: live eerst, dan aankomend, dan afgelopen
      const ORDER = { '1H': 0, '2H': 0, 'HT': 0, 'ET': 0, 'P': 0, 'LIVE': 0, 'NS': 1, 'FT': 2, 'AET': 2, 'PEN': 2 };
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

    // ── Live wedstrijden ─────────────────────────────────────────────────────
    if (action === 'live') {
      const res = await apiFetch('/fixtures?live=all&timezone=Europe/Amsterdam', KEY);
      if (!res.ok) return NextResponse.json({ error: `API fout (${res.status})` }, { status: 502 });
      const raw = await res.json();
      return NextResponse.json(raw.response || []);
    }

    // ── Odds + Predictions voor één wedstrijd ─────────────────────────────────
    if (action === 'details') {
      const fixtureId = searchParams.get('fixtureId');
      if (!fixtureId) return NextResponse.json({ error: 'fixtureId vereist' }, { status: 400 });

      const [oddsRes, predRes] = await Promise.all([
        apiFetch(`/odds?fixture=${fixtureId}`, KEY),
        apiFetch(`/predictions?fixture=${fixtureId}`, KEY),
      ]);

      // Odds verwerken
      let markets = {};
      if (oddsRes.ok) {
        const oddsRaw = await oddsRes.json();
        for (const entry of oddsRaw.response || []) {
          for (const bookie of entry.bookmakers || []) {
            for (const bet of bookie.bets || []) {
              const marketName = bet.name;
              if (!markets[marketName]) markets[marketName] = [];
              const existing = markets[marketName].find(b => b.id === bookie.id);
              const values = {};
              for (const v of bet.values || []) {
                values[v.value] = parseFloat(v.odd);
              }
              if (existing) {
                Object.assign(existing.values, values);
              } else {
                markets[marketName].push({ id: bookie.id, name: bookie.name, values });
              }
            }
          }
        }
        // Sorteer bookmakers alfabetisch per markt
        for (const m of Object.values(markets)) {
          m.sort((a, b) => a.name.localeCompare(b.name));
        }
      }

      // Predictions verwerken
      let prediction = null;
      if (predRes.ok) {
        const predRaw = await predRes.json();
        const p = predRaw.response?.[0];
        if (p) {
          prediction = {
            advice: p.predictions?.advice,
            winner: p.predictions?.winner?.name,
            winnerComment: p.predictions?.winner?.comment,
            underOver: p.predictions?.under_over,
            goals: p.predictions?.goals,
            percent: {
              home: parseInt(p.predictions?.percent?.home) || 0,
              draw: parseInt(p.predictions?.percent?.draw) || 0,
              away: parseInt(p.predictions?.percent?.away) || 0,
            },
            homeForm: p.teams?.home?.league?.form,
            awayForm: p.teams?.away?.league?.form,
            homeAvgGoals: p.teams?.home?.league?.goals?.for?.average?.total,
            awayAvgGoals: p.teams?.away?.league?.goals?.for?.average?.total,
            homeAvgConceded: p.teams?.home?.league?.goals?.against?.average?.total,
            awayAvgConceded: p.teams?.away?.league?.goals?.against?.average?.total,
            comparison: p.comparison,
          };
        }
      }

      return NextResponse.json({ markets, prediction });
    }

    return NextResponse.json({ error: 'Ongeldig action parameter' }, { status: 400 });
  } catch (e) {
    console.error('API-Football error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
