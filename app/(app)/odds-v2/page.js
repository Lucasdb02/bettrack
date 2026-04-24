'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

// ── Datum helpers ─────────────────────────────────────────────────────────────
function buildDateTabs() {
  const NL_DAYS   = ['zo','ma','di','wo','do','vr','za'];
  const NL_MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const today = new Date();
  return [-1, 0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return {
      label: `${NL_DAYS[d.getDay()]} ${d.getDate()} ${NL_MONTHS[d.getMonth()]}`,
      date: dateStr,
    };
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('nl-NL', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
  });
}

// ── Status helpers ────────────────────────────────────────────────────────────
const LIVE_STATUSES = new Set(['1H','2H','HT','ET','P','BT','INT']);
const FT_STATUSES   = new Set(['FT','AET','PEN']);

function isLive(s) { return LIVE_STATUSES.has(s); }
function isFT(s)   { return FT_STATUSES.has(s); }
function isNS(s)   { return s === 'NS'; }

function statusLabel(f) {
  if (isLive(f.status)) {
    if (f.status === 'HT') return 'HT';
    return f.elapsed ? `${f.elapsed}'` : f.status;
  }
  if (isFT(f.status)) return f.status;
  return formatTime(f.date);
}

function statusColor(s) {
  if (isLive(s)) return '#11b981';
  if (isFT(s))   return 'var(--text-4)';
  return 'var(--text-3)';
}

// ── Kleine UI-componenten ─────────────────────────────────────────────────────
function TeamLogo({ src, name, size = 22 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, background: 'var(--bg-subtle)',
      border: '1px solid var(--border)', flexShrink: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 7, fontWeight: 800, color: 'var(--text-4)',
    }}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

function FormBadge({ form }) {
  if (!form) return null;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {form.slice(-5).split('').map((r, i) => (
        <span key={i} style={{
          width: 14, height: 14, borderRadius: 3, fontSize: 8, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: r === 'W' ? 'rgba(17,185,129,0.2)' : r === 'L' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
          color: r === 'W' ? '#11b981' : r === 'L' ? '#ef4444' : '#f59e0b',
          border: `1px solid ${r === 'W' ? 'rgba(17,185,129,0.3)' : r === 'L' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
        }}>{r}</span>
      ))}
    </div>
  );
}

function PredictionBar({ home, draw, away, homeName, awayName }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-3)' }}>
        <span>{homeName} <strong style={{ color: 'var(--text-1)' }}>{home}%</strong></span>
        <span>Gelijk <strong style={{ color: 'var(--text-1)' }}>{draw}%</strong></span>
        <span><strong style={{ color: 'var(--text-1)' }}>{away}%</strong> {awayName}</span>
      </div>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8 }}>
        <div style={{ flex: home, background: 'rgba(84,105,212,0.7)' }} />
        <div style={{ flex: draw, background: 'rgba(245,158,11,0.5)', borderLeft: '1px solid var(--bg-page)', borderRight: '1px solid var(--bg-page)' }} />
        <div style={{ flex: away, background: 'rgba(239,68,68,0.5)' }} />
      </div>
    </div>
  );
}

function OddsTable({ bookmakers, keys, headers }) {
  if (!bookmakers || bookmakers.length === 0) {
    return <p style={{ color: 'var(--text-4)', fontSize: 13, padding: '12px 0' }}>Geen odds beschikbaar.</p>;
  }

  const bests = keys.map(k => Math.max(...bookmakers.map(b => b.values?.[k] ?? 0)));

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bookmaker</th>
          {headers.map(h => (
            <th key={h} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookmakers.map((b) => (
          <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-2)' }}>{b.name}</td>
            {keys.map((k, i) => {
              const val = b.values?.[k];
              const best = val != null && val === bests[i] && val > 0;
              return (
                <td key={k} style={{ textAlign: 'center', padding: '6px 4px' }}>
                  {val != null ? (
                    <span style={{
                      display: 'inline-block', minWidth: 52,
                      background: best ? 'rgba(17,185,129,0.12)' : 'var(--bg-subtle)',
                      border: `1px solid ${best ? 'rgba(17,185,129,0.4)' : 'var(--border)'}`,
                      color: best ? '#11b981' : 'var(--text-2)',
                      borderRadius: 6, padding: '3px 8px',
                      fontFamily: 'ui-monospace,"SF Mono",monospace',
                      fontSize: 13, fontWeight: best ? 700 : 500,
                    }}>{val.toFixed(2)}</span>
                  ) : (
                    <span style={{ color: 'var(--text-4)' }}>—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Detail panel (odds + predictions) ─────────────────────────────────────────
function FixtureDetail({ fixture, data, loading }) {
  const [marketTab, setMarketTab] = useState('Match Winner');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px', color: 'var(--text-4)', fontSize: 13 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--brand)', animation: 'spin 0.7s linear infinite' }} />
        Odds & voorspellingen laden...
      </div>
    );
  }
  if (!data) return null;

  const { markets = {}, prediction } = data;
  const availableMarkets = Object.keys(markets);
  const PRIORITY = ['Match Winner', 'Goals Over/Under', 'Both Teams Score', 'Asian Handicap', 'Double Chance'];
  const orderedMarkets = [
    ...PRIORITY.filter(m => availableMarkets.includes(m)),
    ...availableMarkets.filter(m => !PRIORITY.includes(m)),
  ];

  if (!orderedMarkets.includes(marketTab) && orderedMarkets.length > 0) {
    // reset
  }

  const current = markets[marketTab] || [];

  function marketConfig(name) {
    if (name === 'Match Winner') return { keys: ['Home','Draw','Away'], headers: ['1 Thuis','X Gelijk','2 Uit'] };
    if (name === 'Goals Over/Under') {
      const allKeys = [...new Set(current.flatMap(b => Object.keys(b.values || {})))].sort();
      return { keys: allKeys, headers: allKeys };
    }
    if (name === 'Both Teams Score') return { keys: ['Yes','No'], headers: ['Ja','Nee'] };
    if (name === 'Double Chance') return { keys: ['Home/Draw','Home/Away','Draw/Away'], headers: ['1X','12','X2'] };
    const allKeys = [...new Set(current.flatMap(b => Object.keys(b.values || {})))].sort();
    return { keys: allKeys, headers: allKeys };
  }

  const { keys, headers } = marketConfig(marketTab);

  return (
    <div style={{ padding: '0 20px 16px' }}>

      {/* Prediction */}
      {prediction && (
        <div style={{ marginBottom: 20, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Voorspelling</span>
            {prediction.advice && (
              <span style={{ fontSize: 11, color: 'var(--brand)', background: 'var(--bg-brand)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>
                {prediction.advice}
              </span>
            )}
          </div>

          <PredictionBar
            home={prediction.percent.home}
            draw={prediction.percent.draw}
            away={prediction.percent.away}
            homeName={fixture.homeTeam}
            awayName={fixture.awayTeam}
          />

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-3)' }}>
            {prediction.underOver && (
              <span>Verwacht: <strong style={{ color: 'var(--text-1)' }}>{prediction.underOver}</strong></span>
            )}
            {prediction.goals?.home && (
              <span>Goals thuis: <strong style={{ color: 'var(--text-1)' }}>{prediction.goals.home}</strong></span>
            )}
            {prediction.goals?.away && (
              <span>Goals uit: <strong style={{ color: 'var(--text-1)' }}>{prediction.goals.away}</strong></span>
            )}
          </div>

          {/* Vorm + statistieken */}
          {(prediction.homeForm || prediction.awayForm) && (
            <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-4)', display: 'block', marginBottom: 4 }}>Vorm {fixture.homeTeam}</span>
                <FormBadge form={prediction.homeForm} />
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-4)', display: 'block', marginBottom: 4 }}>Vorm {fixture.awayTeam}</span>
                <FormBadge form={prediction.awayForm} />
              </div>
              {prediction.homeAvgGoals && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-4)', display: 'block', marginBottom: 4 }}>Gem. goals</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {prediction.homeAvgGoals} – {prediction.awayAvgGoals}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Markt-tabs */}
      {orderedMarkets.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
            {orderedMarkets.map(m => (
              <button key={m} onClick={() => setMarketTab(m)} style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                borderColor: marketTab === m ? 'var(--brand)' : 'var(--border)',
                background: marketTab === m ? 'var(--bg-brand)' : 'transparent',
                color: marketTab === m ? 'var(--brand)' : 'var(--text-3)',
              }}>{m}</button>
            ))}
          </div>

          <OddsTable bookmakers={current} keys={keys} headers={headers} />

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(17,185,129,0.6)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Groen = beste odds</span>
          </div>
        </>
      )}

      {orderedMarkets.length === 0 && !prediction && (
        <p style={{ color: 'var(--text-4)', fontSize: 13 }}>Geen data beschikbaar voor deze wedstrijd.</p>
      )}
    </div>
  );
}

// ── Fixture row ───────────────────────────────────────────────────────────────
function FixtureRow({ fixture }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const live = isLive(fixture.status);
  const ft   = isFT(fixture.status);

  async function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && detail === null) {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/apifootball?action=details&fixtureId=${fixture.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDetail(data);
      } catch (e) {
        setDetail({ markets: {}, prediction: null });
      }
      setDetailLoading(false);
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
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = expanded ? 'var(--bg-subtle)' : 'transparent'; }}
      >
        {/* Status / tijd */}
        <td style={{ padding: '10px 20px', width: 68, whiteSpace: 'nowrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
            color: statusColor(fixture.status),
            background: live ? 'rgba(17,185,129,0.1)' : ft ? 'var(--bg-subtle)' : 'transparent',
            border: live ? '1px solid rgba(17,185,129,0.25)' : '1px solid transparent',
            fontFamily: 'ui-monospace,"SF Mono",monospace',
          }}>
            {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#11b981', animation: 'pulse 1.5s infinite' }} />}
            {statusLabel(fixture)}
          </span>
        </td>

        {/* Wedstrijd */}
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TeamLogo src={fixture.homeLogo} name={fixture.homeTeam} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fixture.homeTeam}
              </span>
              {(live || ft) && fixture.homeScore !== null && (
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', marginLeft: 'auto', fontFamily: 'ui-monospace,"SF Mono",monospace' }}>
                  {fixture.homeScore}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TeamLogo src={fixture.awayLogo} name={fixture.awayTeam} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fixture.awayTeam}
              </span>
              {(live || ft) && fixture.awayScore !== null && (
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', marginLeft: 'auto', fontFamily: 'ui-monospace,"SF Mono",monospace' }}>
                  {fixture.awayScore}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Info snippets */}
        <td style={{ padding: '10px 8px 10px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            {fixture.venue && (
              <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{fixture.venue}</span>
            )}
            <span style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'ui-monospace,"SF Mono",monospace' }}>
              #{fixture.id}
            </span>
          </div>
        </td>

        {/* Chevron */}
        <td style={{ padding: '10px 16px 10px 4px', width: 24 }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-4)', fontSize: 10,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▼</span>
        </td>
      </tr>

      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <td colSpan={4} style={{ padding: 0, background: 'var(--bg-page)' }}>
            <FixtureDetail fixture={fixture} data={detail} loading={detailLoading} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── League card ───────────────────────────────────────────────────────────────
function LeagueCard({ league, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const liveCount = league.fixtures.filter(f => isLive(f.status)).length;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', cursor: 'pointer', background: 'none', border: 'none',
        borderBottom: open ? '1px solid var(--border)' : 'none',
        transition: 'background 0.15s', textAlign: 'left',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
      >
        {league.logo ? (
          <img src={league.logo} alt={league.name} style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} onError={e => e.target.style.display='none'} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--bg-brand)', border: '1px solid var(--brand-soft)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', display: 'block' }}>{league.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{league.country} · {league.round}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {liveCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#11b981', background: 'rgba(17,185,129,0.1)', border: '1px solid rgba(17,185,129,0.25)', borderRadius: 4, padding: '2px 8px' }}>
              {liveCount} LIVE
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{league.fixtures.length} wedstrijden</span>
          <span style={{ color: 'var(--text-4)', fontSize: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </div>
      </button>

      {open && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '6px 20px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 68 }}>Tijd</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wedstrijd</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Info</th>
              <th style={{ width: 24 }} />
            </tr>
          </thead>
          <tbody>
            {league.fixtures.map(f => <FixtureRow key={f.id} fixture={f} />)}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Hoofd pagina ──────────────────────────────────────────────────────────────
const FILTERS = ['Alles', 'Aankomend', 'Live', 'Afgelopen'];

export default function OddsV2Page() {
  const [activeDate, setActiveDate]     = useState(1);
  const [activeFilter, setActiveFilter] = useState('Alles');
  const [search, setSearch]             = useState('');
  const [leagues, setLeagues]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const dateTabs = useMemo(() => buildDateTabs(), []);

  useEffect(() => {
    let cancelled = false;
    setActiveFilter('Alles');
    setSearch('');
    async function load() {
      setLoading(true);
      setError(null);
      setLeagues([]);
      try {
        const date = dateTabs[activeDate].date;
        const res  = await fetch(`/api/apifootball?action=fixtures&date=${date}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Fout (${res.status})`);
        if (!cancelled) setLeagues(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [activeDate]);

  const totalFixtures = useMemo(() => leagues.flatMap(l => l.fixtures).length, [leagues]);
  const totalLive     = useMemo(() => leagues.flatMap(l => l.fixtures).filter(f => isLive(f.status)).length, [leagues]);

  const filtered = useMemo(() => {
    return leagues.map(l => ({
      ...l,
      fixtures: l.fixtures.filter(f => {
        if (activeFilter === 'Aankomend' && !isNS(f.status)) return false;
        if (activeFilter === 'Live'     && !isLive(f.status)) return false;
        if (activeFilter === 'Afgelopen' && !isFT(f.status)) return false;
        if (search) {
          const q = search.toLowerCase();
          return f.homeTeam.toLowerCase().includes(q) || f.awayTeam.toLowerCase().includes(q);
        }
        return true;
      }),
    })).filter(l => l.fixtures.length > 0);
  }, [leagues, activeFilter, search]);

  return (
    <div className="app-page" style={{ padding: '40px 32px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>Odds Vergelijker v2</h1>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', background: 'var(--bg-brand)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '3px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>API-Football</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
          Odds, voorspellingen & statistieken — alle beschikbare markten per wedstrijd
        </p>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Wedstrijden', value: totalFixtures },
            { label: 'Live', value: totalLive, live: totalLive > 0 },
            { label: 'Competities', value: leagues.length },
          ].map(({ label, value, live }) => (
            <div key={label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#11b981', boxShadow: '0 0 6px #11b981', animation: 'pulse 1.5s infinite' }} />}
                <span style={{ fontSize: 22, fontWeight: 800, color: live ? '#11b981' : 'var(--text-1)' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Datum-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {dateTabs.map((d, i) => (
          <button key={d.date} onClick={() => setActiveDate(i)} style={{
            padding: '7px 16px', fontSize: 12, fontWeight: 600,
            borderRadius: '7px 7px 0 0', border: 'none', cursor: 'pointer',
            background: activeDate === i ? 'var(--bg-brand)' : 'transparent',
            color: activeDate === i ? 'var(--brand)' : 'var(--text-4)',
            borderBottom: activeDate === i ? '2px solid var(--brand)' : '2px solid transparent',
            transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: -1,
          }}>
            {i === 1 ? `${d.label} (vandaag)` : d.label}
          </button>
        ))}
      </div>

      {/* Filter + zoek */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600,
              borderRadius: 20, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              borderColor: activeFilter === f ? 'var(--brand)' : 'var(--border)',
              background: activeFilter === f ? 'var(--bg-brand)' : 'transparent',
              color: activeFilter === f ? 'var(--brand)' : 'var(--text-3)',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-4)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek team..."
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px 6px 30px', fontSize: 12, color: 'var(--text-1)', outline: 'none', width: 190 }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>Wedstrijden ophalen via API-Football...</span>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 18px' }}>
            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Fout bij laden:</span>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{error}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 24px', textAlign: 'center', color: 'var(--text-4)', fontSize: 14 }}>
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
