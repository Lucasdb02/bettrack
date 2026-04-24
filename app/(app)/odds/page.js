'use client';

import { useState, useMemo, useEffect } from 'react';

// Dutch bookmaker allowlist — name-matched against API response (lowercase)
const NL_BOOKMAKER_NAMES = new Set([
  '711 casino', 'unibet', 'bet365', 'leovegas', 'tonybet', 'toto',
  'circus casino', '888sport', '888 sport', 'vbet', 'betmgm', 'one casino',
  'jacks.nl', 'betnation', 'zebet', 'betcity', 'bingoal',
  'holland casino online',
]);

const NL_BOOKIE_COLORS = {
  'bet365':   '#027b5b',
  '888sport': '#e31b23',
  'unibet':   '#007832',
  'leovegas': '#f97316',
  'toto':     '#e31837',
  'vbet':     '#1a56db',
  'betmgm':   '#c8a84b',
  'betcity':  '#005bac',
  'bingoal':  '#00b140',
};
function bookieColor(name) {
  return NL_BOOKIE_COLORS[name?.toLowerCase()] ?? '#5469d4';
}

function buildDateTabs() {
  const NL_DAYS   = ['zo','ma','di','wo','do','vr','za'];
  const NL_MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const today = new Date();
  return [-1, 0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      label: `${NL_DAYS[d.getDay()]} ${d.getDate()} ${NL_MONTHS[d.getMonth()]}`,
      date: dateStr,
    };
  });
}

function formatKickoff(startingAt) {
  if (!startingAt) return '';
  const d = new Date(startingAt.replace(' ', 'T') + 'Z');
  return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });
}

function statusColor(s) {
  if (s === 'LIVE')                          return '#11b981';
  if (s === 'HT')                            return '#f59e0b';
  if (['FT','AET','PEN'].includes(s))        return 'var(--text-4)';
  return 'var(--text-3)';
}
function statusBg(s) {
  if (s === 'LIVE') return 'rgba(17,185,129,0.12)';
  if (s === 'HT')   return 'rgba(245,158,11,0.12)';
  if (['FT','AET','PEN'].includes(s)) return 'var(--bg-subtle)';
  return 'transparent';
}
function statusBorder(s) {
  if (s === 'LIVE') return '1px solid rgba(17,185,129,0.3)';
  if (s === 'HT')   return '1px solid rgba(245,158,11,0.3)';
  return '1px solid transparent';
}
function statusText(f) {
  if (f.status === 'LIVE') return 'LIVE';
  if (f.status === 'HT')   return 'HT';
  if (['FT','AET','PEN'].includes(f.status)) return f.status;
  return formatKickoff(f.startingAt);
}

function TeamLogo({ src, shortCode, size = 20 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={shortCode}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
      color: 'var(--text-4)', background: 'var(--bg-subtle)',
      border: '1px solid var(--border)', borderRadius: 3,
      padding: '1px 5px', flexShrink: 0, lineHeight: 1.6,
    }}>
      {(shortCode || '?').slice(0, 3)}
    </span>
  );
}

function OddsCell({ value, isBest }) {
  if (value == null) {
    return (
      <td style={{
        textAlign: 'center', fontFamily: 'ui-monospace,"SF Mono",monospace',
        fontSize: 13, color: 'var(--text-4)', padding: '8px 6px',
      }}>—</td>
    );
  }
  return (
    <td style={{ textAlign: 'center', padding: '8px 6px' }}>
      <span style={{
        display: 'inline-block',
        background: isBest ? 'rgba(17,185,129,0.12)' : 'var(--bg-subtle)',
        border: `1px solid ${isBest ? 'rgba(17,185,129,0.4)' : 'var(--border)'}`,
        color: isBest ? '#11b981' : 'var(--text-2)',
        borderRadius: 6, padding: '3px 10px',
        fontSize: 13, fontWeight: isBest ? 700 : 500,
        fontFamily: 'ui-monospace,"SF Mono",monospace',
        letterSpacing: '0.02em', minWidth: 52,
        transition: 'all 0.15s',
      }}>
        {value.toFixed(2)}
      </span>
    </td>
  );
}

function OddsBreakdown({ odds, loading, hasOdds }) {
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '18px 20px', color: 'var(--text-4)', fontSize: 13,
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid var(--border)', borderTopColor: 'var(--brand)',
          animation: 'spin 0.7s linear infinite', flexShrink: 0,
        }} />
        Odds laden...
      </div>
    );
  }
  if (odds && typeof odds === 'object' && !Array.isArray(odds) && odds.error) {
    return (
      <div style={{ padding: '14px 20px', color: '#ef4444', fontSize: 13 }}>
        Fout bij laden van odds: {odds.error}
      </div>
    );
  }
  if (!hasOdds || !odds) {
    return (
      <div style={{ padding: '14px 20px', color: 'var(--text-4)', fontSize: 13 }}>
        Geen odds beschikbaar voor deze wedstrijd.
      </div>
    );
  }
  if (odds.length === 0) {
    return (
      <div style={{ padding: '14px 20px', color: 'var(--text-4)', fontSize: 13 }}>
        Geen Nederlandse bookmakers gevonden voor deze wedstrijd.
      </div>
    );
  }

  const bestHome = Math.max(...odds.map((b) => b.home ?? 0));
  const bestDraw = Math.max(...odds.map((b) => b.draw ?? 0));
  const bestAway = Math.max(...odds.map((b) => b.away ?? 0));

  return (
    <div style={{ padding: '0 0 4px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <th style={{ textAlign: 'left', padding: '7px 20px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bookmaker</th>
            <th style={{ textAlign: 'center', padding: '7px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Thuis&nbsp;1</th>
            <th style={{ textAlign: 'center', padding: '7px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gelijk&nbsp;X</th>
            <th style={{ textAlign: 'center', padding: '7px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingRight: 20 }}>Uit&nbsp;2</th>
          </tr>
        </thead>
        <tbody>
          {odds.map((b) => (
            <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: bookieColor(b.name), flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{b.name}</span>
                </div>
              </td>
              <OddsCell value={b.home} isBest={b.home === bestHome} />
              <OddsCell value={b.draw} isBest={b.draw === bestDraw} />
              <OddsCell value={b.away} isBest={b.away === bestAway} />
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(17,185,129,0.6)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Groen = beste odds bij Nederlandse bookmakers</span>
      </div>
    </div>
  );
}

function FixtureRow({ fixture }) {
  const [expanded, setExpanded]     = useState(false);
  const [odds, setOdds]             = useState(null);
  const [oddsLoading, setOddsLoading] = useState(false);

  const isLive = fixture.status === 'LIVE' || fixture.status === 'HT';
  const isFT   = ['FT','AET','PEN'].includes(fixture.status);

  async function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && odds === null && fixture.hasOdds) {
      setOddsLoading(true);
      try {
        const res  = await fetch(`/api/sportmonks?action=odds&fixtureId=${fixture.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Fout (${res.status})`);
        setOdds(Array.isArray(data) ? data : []);
      } catch (err) {
        setOdds({ error: err.message });
      }
      setOddsLoading(false);
    }
  }

  return (
    <>
      <tr
        onClick={handleToggle}
        style={{
          borderBottom: expanded ? 'none' : '1px solid var(--border-subtle)',
          cursor: 'pointer',
          background: expanded ? 'var(--bg-subtle)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = expanded ? 'var(--bg-subtle)' : 'transparent'; }}
      >
        {/* Status */}
        <td style={{ padding: '10px 20px', width: 72 }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 8px', borderRadius: 5,
            fontSize: 11, fontWeight: 700,
            color: statusColor(fixture.status),
            background: statusBg(fixture.status),
            border: statusBorder(fixture.status),
            fontFamily: 'ui-monospace,"SF Mono",monospace',
            whiteSpace: 'nowrap',
          }}>
            {statusText(fixture)}
          </span>
        </td>

        {/* Wedstrijd */}
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <TeamLogo src={fixture.homeLogo} shortCode={fixture.homeShortCode} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fixture.homeTeam}
              </span>
              {(isLive || isFT) && fixture.homeScore !== null && (
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginLeft: 'auto' }}>
                  {fixture.homeScore}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <TeamLogo src={fixture.awayLogo} shortCode={fixture.awayShortCode} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fixture.awayTeam}
              </span>
              {(isLive || isFT) && fixture.awayScore !== null && (
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginLeft: 'auto' }}>
                  {fixture.awayScore}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Odds placeholders (best odds na laden) */}
        <td style={{ textAlign: 'center', padding: '10px 6px', color: 'var(--text-4)', fontSize: 12, fontFamily: 'ui-monospace,"SF Mono",monospace', width: 60 }}>1</td>
        <td style={{ textAlign: 'center', padding: '10px 6px', color: 'var(--text-4)', fontSize: 12, fontFamily: 'ui-monospace,"SF Mono",monospace', width: 60 }}>X</td>
        <td style={{ textAlign: 'center', padding: '10px 6px', color: 'var(--text-4)', fontSize: 12, fontFamily: 'ui-monospace,"SF Mono",monospace', width: 60, paddingRight: 8 }}>2</td>

        {/* Chevron */}
        <td style={{ padding: '10px 16px 10px 4px', width: 28 }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-4)', fontSize: 10,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▼</span>
        </td>
      </tr>

      {/* Uitklap */}
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <td colSpan={6} style={{ padding: 0, background: 'var(--bg-page)' }}>
            <OddsBreakdown odds={odds} loading={oddsLoading} hasOdds={fixture.hasOdds} />
          </td>
        </tr>
      )}
    </>
  );
}

function LeagueCard({ league, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const liveCount = league.fixtures.filter((f) => f.status === 'LIVE').length;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* League header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', cursor: 'pointer',
          background: 'none', border: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          transition: 'background 0.15s', textAlign: 'left',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        {league.logo ? (
          <img src={league.logo} alt={league.name} style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--bg-brand)', border: '1px solid var(--brand-soft)', flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', flex: 1, textAlign: 'left' }}>{league.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {liveCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#11b981',
              background: 'rgba(17,185,129,0.1)', border: '1px solid rgba(17,185,129,0.25)',
              borderRadius: 4, padding: '2px 8px',
            }}>
              {liveCount} LIVE
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
            {league.fixtures.length} wedstrijden
          </span>
          <span style={{
            color: 'var(--text-4)', fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>▼</span>
        </div>
      </button>

      {/* Fixture table */}
      {open && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '6px 20px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 72 }}>Status</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wedstrijd</th>
              <th style={{ textAlign: 'center', padding: '6px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60 }}>1</th>
              <th style={{ textAlign: 'center', padding: '6px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60 }}>X</th>
              <th style={{ textAlign: 'center', padding: '6px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60, paddingRight: 8 }}>2</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {league.fixtures.map((f) => (
              <FixtureRow key={f.id} fixture={f} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const FILTERS = ['Alles', 'Aankomend', 'Live', 'Afgelopen'];

export default function OddsPage() {
  const [activeFilter, setActiveFilter] = useState('Alles');
  const [activeDate, setActiveDate]     = useState(1);
  const [search, setSearch]             = useState('');
  const [leagues, setLeagues]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const dateTabs = useMemo(() => buildDateTabs(), []);

  useEffect(() => {
    let cancelled = false;
    setActiveFilter('Alles');
    async function load() {
      setLoading(true);
      setError(null);
      setLeagues([]);
      try {
        const date = dateTabs[activeDate].date;
        const res  = await fetch(`/api/sportmonks?action=fixtures&date=${date}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `API fout (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) setLeagues(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [activeDate]);

  const totalFixtures = useMemo(() => leagues.flatMap((l) => l.fixtures).length, [leagues]);
  const totalLive     = useMemo(() => leagues.flatMap((l) => l.fixtures).filter((f) => f.status === 'LIVE').length, [leagues]);

  const filtered = useMemo(
    () =>
      leagues
        .map((l) => ({
          ...l,
          fixtures: l.fixtures.filter((f) => {
            if (activeFilter === 'Aankomend' && f.status !== 'NS') return false;
            if (activeFilter === 'Live' && !['LIVE','HT'].includes(f.status)) return false;
            if (activeFilter === 'Afgelopen' && !['FT','AET','PEN'].includes(f.status)) return false;
            if (search) {
              const q = search.toLowerCase();
              return f.homeTeam.toLowerCase().includes(q) || f.awayTeam.toLowerCase().includes(q);
            }
            return true;
          }),
        }))
        .filter((l) => l.fixtures.length > 0),
    [leagues, activeFilter, search]
  );

  return (
    <div className="app-page" style={{ padding: '40px 32px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Paginaheader ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
          Odds Vergelijker
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
          Actuele 1X2 kansen bij Nederlandse bookmakers — data via Sportmonks
        </p>
      </div>

      {/* ── Stat-balk ── */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Wedstrijden', value: totalFixtures, color: 'var(--text-1)' },
            {
              label: 'Live',
              value: totalLive,
              color: totalLive > 0 ? '#11b981' : 'var(--text-4)',
              dot: totalLive > 0,
            },
            { label: 'Competities', value: leagues.length, color: 'var(--text-1)' },
          ].map(({ label, value, color, dot }) => (
            <div key={label} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#11b981', boxShadow: '0 0 6px #11b981', flexShrink: 0 }} />}
                <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Nederlandse bookmakers info ── */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 20px',
        marginBottom: 24,
        display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            Nederlandse bookmakers
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Odds worden gefilterd op bookmakers die actief zijn in Nederland. Klik op een wedstrijd om de vergelijking per bookie te zien.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { name: 'bet365',   color: '#027b5b' },
            { name: 'Unibet',   color: '#007832' },
            { name: '888Sport', color: '#e31b23' },
          ].map(({ name, color }) => (
            <span key={name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 6,
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {name}
            </span>
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>
            + meer naarmate abonnement groeit
          </span>
        </div>
      </div>

      {/* ── Datum-tabs ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {dateTabs.map((d, i) => (
          <button
            key={d.date}
            onClick={() => setActiveDate(i)}
            style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 600,
              borderRadius: '7px 7px 0 0', border: 'none', cursor: 'pointer',
              background: activeDate === i ? 'var(--bg-brand)' : 'transparent',
              color: activeDate === i ? 'var(--brand)' : 'var(--text-4)',
              borderBottom: activeDate === i ? '2px solid var(--brand)' : '2px solid transparent',
              transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: -1,
            }}
          >
            {i === 1 ? `${d.label} (vandaag)` : d.label}
          </button>
        ))}
      </div>

      {/* ── Filter-/zoekbalk ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
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
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 14px 6px 30px',
              fontSize: 12, color: 'var(--text-1)', outline: 'none', width: 190,
            }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '60px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--brand)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>Wedstrijden ophalen...</span>
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '32px 24px', textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '12px 18px',
          }}>
            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Fout bij laden:</span>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{error}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '60px 24px',
          textAlign: 'center', color: 'var(--text-4)', fontSize: 14,
        }}>
          Geen wedstrijden gevonden voor deze dag
        </div>
      ) : (
        filtered.map((league, i) => (
          <LeagueCard key={league.id} league={league} defaultOpen={i < 3} />
        ))
      )}
    </div>
  );
}
