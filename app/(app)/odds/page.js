'use client';

import { useState, useMemo } from 'react';

// ── Sportmonks API token → .env.local: NEXT_PUBLIC_SPORTMONKS_TOKEN=3HFmgsmoC4FOoyoADcVqb4GsniX6AuuH5Z5cpe1ZvHb1B1IjLRwf6ixJrsLT
// Replace MOCK_LEAGUES below with live data from https://api.sportmonks.com/v3/football

const BOOKIES = ['Bet365', 'Unibet', 'BetMGM', 'William Hill', 'Betway', '1xBet'];
const BOOKIE_COLORS = {
  Bet365: '#027b5b',
  Unibet: '#007832',
  BetMGM: '#c8a84b',
  'William Hill': '#f59e0b',
  Betway: '#00a86b',
  '1xBet': '#e3261c',
};

function makeOdds(base) {
  return BOOKIES.map((b) => ({
    bookie: b,
    home: +(base[0] + (Math.random() * 0.18 - 0.09)).toFixed(2),
    draw: +(base[1] + (Math.random() * 0.18 - 0.09)).toFixed(2),
    away: +(base[2] + (Math.random() * 0.18 - 0.09)).toFixed(2),
  }));
}

function bestOf(bookies, key) {
  return Math.max(...bookies.map((b) => b[key]));
}

const MOCK_LEAGUES = [
  {
    id: 1, name: 'Premier League', country: 'Engeland', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'PL',
    fixtures: [
      { id: 101, time: '13:30', status: 'LIVE', minute: 67, homeTeam: 'Arsenal', awayTeam: 'Man City', homeLogo: 'ARS', awayLogo: 'MCI', homeScore: 1, awayScore: 1, bestOdds: { home: 2.10, draw: 3.40, away: 3.20 }, bookies: makeOdds([2.10, 3.40, 3.20]) },
      { id: 102, time: '16:00', status: 'NS', homeTeam: 'Liverpool', awayTeam: 'Chelsea', homeLogo: 'LIV', awayLogo: 'CHE', bestOdds: { home: 1.85, draw: 3.60, away: 4.20 }, bookies: makeOdds([1.85, 3.60, 4.20]) },
      { id: 103, time: '18:30', status: 'NS', homeTeam: 'Man United', awayTeam: 'Tottenham', homeLogo: 'MUN', awayLogo: 'TOT', bestOdds: { home: 2.40, draw: 3.10, away: 3.00 }, bookies: makeOdds([2.40, 3.10, 3.00]) },
    ],
  },
  {
    id: 2, name: 'La Liga', country: 'Spanje', flag: '🇪🇸', logo: 'LL',
    fixtures: [
      { id: 201, time: '14:00', status: 'FT', homeTeam: 'Barcelona', awayTeam: 'Atletico Madrid', homeLogo: 'BAR', awayLogo: 'ATM', homeScore: 2, awayScore: 1, bestOdds: { home: 1.70, draw: 3.80, away: 5.00 }, bookies: makeOdds([1.70, 3.80, 5.00]) },
      { id: 202, time: '20:00', status: 'NS', homeTeam: 'Real Madrid', awayTeam: 'Sevilla', homeLogo: 'RMA', awayLogo: 'SEV', bestOdds: { home: 1.55, draw: 4.00, away: 6.50 }, bookies: makeOdds([1.55, 4.00, 6.50]) },
    ],
  },
  {
    id: 3, name: 'Bundesliga', country: 'Duitsland', flag: '🇩🇪', logo: 'BL',
    fixtures: [
      { id: 301, time: '15:30', status: 'LIVE', minute: 23, homeTeam: 'Bayern München', awayTeam: 'Borussia Dortmund', homeLogo: 'BAY', awayLogo: 'BVB', homeScore: 1, awayScore: 0, bestOdds: { home: 1.60, draw: 4.10, away: 5.50 }, bookies: makeOdds([1.60, 4.10, 5.50]) },
      { id: 302, time: '17:30', status: 'NS', homeTeam: 'RB Leipzig', awayTeam: 'Leverkusen', homeLogo: 'RBL', awayLogo: 'LEV', bestOdds: { home: 2.20, draw: 3.30, away: 3.10 }, bookies: makeOdds([2.20, 3.30, 3.10]) },
    ],
  },
  {
    id: 4, name: 'Serie A', country: 'Italië', flag: '🇮🇹', logo: 'SA',
    fixtures: [
      { id: 401, time: '12:30', status: 'FT', homeTeam: 'Juventus', awayTeam: 'AC Milan', homeLogo: 'JUV', awayLogo: 'ACM', homeScore: 0, awayScore: 2, bestOdds: { home: 2.30, draw: 3.20, away: 3.10 }, bookies: makeOdds([2.30, 3.20, 3.10]) },
      { id: 402, time: '20:45', status: 'NS', homeTeam: 'Inter Milan', awayTeam: 'Napoli', homeLogo: 'INT', awayLogo: 'NAP', bestOdds: { home: 1.90, draw: 3.50, away: 4.00 }, bookies: makeOdds([1.90, 3.50, 4.00]) },
    ],
  },
  {
    id: 5, name: 'Ligue 1', country: 'Frankrijk', flag: '🇫🇷', logo: 'L1',
    fixtures: [
      { id: 501, time: '21:00', status: 'NS', homeTeam: 'PSG', awayTeam: 'Marseille', homeLogo: 'PSG', awayLogo: 'MAR', bestOdds: { home: 1.50, draw: 4.20, away: 7.00 }, bookies: makeOdds([1.50, 4.20, 7.00]) },
    ],
  },
  {
    id: 6, name: 'Eredivisie', country: 'Nederland', flag: '🇳🇱', logo: 'ED',
    fixtures: [
      { id: 601, time: '14:30', status: 'LIVE', minute: 55, homeTeam: 'Ajax', awayTeam: 'PSV', homeLogo: 'AJX', awayLogo: 'PSV', homeScore: 2, awayScore: 3, bestOdds: { home: 2.80, draw: 3.30, away: 2.50 }, bookies: makeOdds([2.80, 3.30, 2.50]) },
      { id: 602, time: '16:45', status: 'NS', homeTeam: 'Feyenoord', awayTeam: 'AZ', homeLogo: 'FEY', awayLogo: 'AZ_', bestOdds: { home: 1.95, draw: 3.40, away: 3.90 }, bookies: makeOdds([1.95, 3.40, 3.90]) },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function statusColor(s) {
  if (s === 'LIVE') return '#22c55e';
  if (s === 'FT')   return 'var(--text-4)';
  if (s === 'HT')   return '#f59e0b';
  return 'var(--text-3)';
}

function statusLabel(f) {
  if (f.status === 'LIVE') return `${f.minute}'`;
  if (f.status === 'FT')   return 'FT';
  if (f.status === 'HT')   return 'HT';
  return f.time;
}

function buildDateTabs() {
  const NL_DAYS  = ['zo','ma','di','wo','do','vr','za'];
  const NL_MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const today = new Date();
  return [-1, 0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return `${NL_DAYS[d.getDay()]} ${d.getDate()} ${NL_MONTHS[d.getMonth()]}`;
  });
}

// ── OddsChip ───────────────────────────────────────────────────────────────

function OddsChip({ value, isBest }) {
  return (
    <div style={{
      background: isBest ? 'rgba(234,179,8,0.12)' : 'var(--bg-subtle)',
      border: `1px solid ${isBest ? 'rgba(234,179,8,0.4)' : 'var(--border)'}`,
      color: isBest ? '#f59e0b' : 'var(--text-2)',
      borderRadius: 6,
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: isBest ? 700 : 500,
      minWidth: 54,
      textAlign: 'center',
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      letterSpacing: '0.03em',
      transition: 'all 0.15s',
    }}>
      {value.toFixed(2)}
    </div>
  );
}

// ── BookieRow ──────────────────────────────────────────────────────────────

function BookieRow({ bookie, isBest }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '150px 1fr 1fr 1fr',
      alignItems: 'center',
      padding: '7px 16px',
      borderBottom: '1px solid var(--border-subtle)',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: BOOKIE_COLORS[bookie.bookie] ?? '#6366f1',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
          {bookie.bookie}
        </span>
      </div>
      <OddsChip value={bookie.home} isBest={isBest[0]} />
      <OddsChip value={bookie.draw} isBest={isBest[1]} />
      <OddsChip value={bookie.away} isBest={isBest[2]} />
    </div>
  );
}

// ── FixtureRow ─────────────────────────────────────────────────────────────

function FixtureRow({ fixture }) {
  const [expanded, setExpanded] = useState(false);
  const isLive = fixture.status === 'LIVE';
  const isFT   = fixture.status === 'FT';

  const bestHome = bestOf(fixture.bookies, 'home');
  const bestDraw = bestOf(fixture.bookies, 'draw');
  const bestAway = bestOf(fixture.bookies, 'away');

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Compact row */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'grid',
          gridTemplateColumns: '58px 1fr auto auto auto 28px',
          alignItems: 'center',
          padding: '10px 16px',
          cursor: 'pointer',
          gap: 10,
          background: expanded ? 'var(--bg-subtle)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = expanded ? 'var(--bg-subtle)' : 'transparent'; }}
      >
        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: statusColor(fixture.status),
            fontFamily: 'ui-monospace, "SF Mono", monospace',
          }}>
            {statusLabel(fixture)}
          </span>
          {isLive && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              display: 'block',
            }} />
          )}
        </div>

        {/* Teams + score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: 'var(--text-4)', background: 'var(--bg-subtle)',
              border: '1px solid var(--border)', borderRadius: 3,
              padding: '1px 5px', flexShrink: 0,
            }}>{fixture.homeLogo}</span>
            <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fixture.homeTeam}
            </span>
            {(isLive || isFT) && (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginLeft: 'auto', paddingLeft: 4 }}>
                {fixture.homeScore}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: 'var(--text-4)', background: 'var(--bg-subtle)',
              border: '1px solid var(--border)', borderRadius: 3,
              padding: '1px 5px', flexShrink: 0,
            }}>{fixture.awayLogo}</span>
            <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fixture.awayTeam}
            </span>
            {(isLive || isFT) && (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginLeft: 'auto', paddingLeft: 4 }}>
                {fixture.awayScore}
              </span>
            )}
          </div>
        </div>

        {/* Best odds */}
        <OddsChip value={fixture.bestOdds.home} />
        <OddsChip value={fixture.bestOdds.draw} />
        <OddsChip value={fixture.bestOdds.away} />

        {/* Chevron */}
        <span style={{
          color: 'var(--text-4)', fontSize: 10,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>▼</span>
      </div>

      {/* Expanded bookie breakdown */}
      {expanded && (
        <div style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr 1fr 1fr',
            padding: '6px 16px',
            gap: 8,
          }}>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Bookie</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'center' }}>Thuis (1)</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'center' }}>Gelijk (X)</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'center' }}>Uit (2)</span>
          </div>
          {fixture.bookies.map((b) => (
            <BookieRow
              key={b.bookie}
              bookie={b}
              isBest={[b.home === bestHome, b.draw === bestDraw, b.away === bestAway]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── LeagueSection ──────────────────────────────────────────────────────────

function LeagueSection({ league, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const liveCount = league.fixtures.filter((f) => f.status === 'LIVE').length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      {/* League header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          cursor: 'pointer',
          background: open ? 'var(--bg-subtle)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open ? 'var(--bg-subtle)' : 'transparent'; }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{league.flag}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--bg-brand)',
          border: '1px solid var(--brand-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8.5, fontWeight: 800, color: 'var(--brand)',
          letterSpacing: '0.04em', flexShrink: 0,
        }}>
          {league.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{league.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{league.country}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {liveCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 4, padding: '2px 7px',
            }}>
              {liveCount} LIVE
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
            {league.fixtures.length} wedstrijden
          </span>
          <span style={{
            color: 'var(--text-4)', fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* Column header + fixture rows */}
      {open && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '58px 1fr auto auto auto 28px',
            padding: '5px 16px',
            gap: 10,
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-page)',
          }}>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Tijd</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Wedstrijd</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, minWidth: 54, textAlign: 'center' }}>1</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, minWidth: 54, textAlign: 'center' }}>X</span>
            <span style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, minWidth: 54, textAlign: 'center' }}>2</span>
            <span />
          </div>
          {league.fixtures.map((f) => (
            <FixtureRow key={f.id} fixture={f} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const FILTERS = ['Alles', 'Live', 'Vandaag', 'Afgelopen'];

export default function OddsPage() {
  const [activeFilter, setActiveFilter] = useState('Alles');
  const [activeDate, setActiveDate] = useState(1);
  const [search, setSearch] = useState('');

  const dateTabs = useMemo(() => buildDateTabs(), []);

  const totalLive = MOCK_LEAGUES
    .flatMap((l) => l.fixtures)
    .filter((f) => f.status === 'LIVE').length;

  const filtered = useMemo(() =>
    MOCK_LEAGUES
      .map((l) => ({
        ...l,
        fixtures: l.fixtures.filter((f) => {
          if (activeFilter === 'Live' && f.status !== 'LIVE') return false;
          if (activeFilter === 'Afgelopen' && f.status !== 'FT') return false;
          if (search) {
            const q = search.toLowerCase();
            if (!f.homeTeam.toLowerCase().includes(q) && !f.awayTeam.toLowerCase().includes(q)) return false;
          }
          return true;
        }),
      }))
      .filter((l) => l.fixtures.length > 0),
    [activeFilter, search]
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px' }} className="app-page">

      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 3 }}>
            Odds Vergelijker
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Beste kansen per bookie over de top competities
          </p>
        </div>
        {totalLive > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 20, padding: '6px 14px',
            flexShrink: 0,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              display: 'block',
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
              {totalLive} Live
            </span>
          </div>
        )}
      </div>

      {/* Date tabs */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 20,
        overflowX: 'auto', paddingBottom: 2,
        borderBottom: '1px solid var(--border)',
      }}>
        {dateTabs.map((d, i) => (
          <button
            key={d}
            onClick={() => setActiveDate(i)}
            style={{
              padding: '8px 16px',
              fontSize: 12, fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none', cursor: 'pointer',
              background: activeDate === i ? 'var(--bg-brand)' : 'transparent',
              color: activeDate === i ? 'var(--brand)' : 'var(--text-3)',
              borderBottom: activeDate === i ? '2px solid var(--brand)' : '2px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              marginBottom: -1,
            }}
          >
            {i === 1 ? `${d} (vandaag)` : d}
          </button>
        ))}
      </div>

      {/* Filter bar + search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600,
                borderRadius: 20, border: '1px solid', cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: activeFilter === f ? 'var(--brand)' : 'var(--border)',
                background: activeFilter === f ? 'var(--bg-brand)' : 'transparent',
                color: activeFilter === f ? 'var(--brand)' : 'var(--text-3)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-4)' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek team..."
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '6px 14px 6px 30px',
              fontSize: 12, color: 'var(--text-1)',
              outline: 'none', width: 180,
            }}
          />
        </div>
      </div>

      {/* Odds legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Beste odds</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 5, padding: '3px 10px',
        }}>
          <span style={{
            fontSize: 12, color: '#f59e0b', fontWeight: 700,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
          }}>2.40</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>= hoogste over alle bookies</span>
        </div>
      </div>

      {/* Mock data notice */}
      <div style={{
        background: 'var(--bg-brand)',
        border: '1px solid var(--brand-soft)',
        borderRadius: 8, padding: '10px 14px',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>🔌</span>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>Mock data actief</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>
            Koppel de Sportmonks API via{' '}
            <code style={{
              background: 'var(--bg-subtle)', padding: '1px 5px',
              borderRadius: 3, fontSize: 10, color: 'var(--text-2)',
            }}>NEXT_PUBLIC_SPORTMONKS_TOKEN</code>{' '}
            in <code style={{
              background: 'var(--bg-subtle)', padding: '1px 5px',
              borderRadius: 3, fontSize: 10, color: 'var(--text-2)',
            }}>.env.local</code>
          </span>
        </div>
      </div>

      {/* League list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--text-4)', fontSize: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
        }}>
          Geen wedstrijden gevonden
        </div>
      ) : (
        filtered.map((league, i) => (
          <LeagueSection key={league.id} league={league} defaultOpen={i < 2} />
        ))
      )}
    </div>
  );
}
