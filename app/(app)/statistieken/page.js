'use client';
import { useState, useMemo, useEffect } from 'react';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import BookmakerIcon from '../../components/BookmakerIcon';
import { TagChip } from '../../components/TagInput';
import { sportEmoji } from '../../lib/sports';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

// ── helpers ────────────────────────────────────────────────────────────────────

const ODDS_BRACKETS = [
  { label: '1.01–1.50', min: 1.01, max: 1.50 },
  { label: '1.51–2.00', min: 1.51, max: 2.00 },
  { label: '2.01–2.50', min: 2.01, max: 2.50 },
  { label: '2.51–3.00', min: 2.51, max: 3.00 },
  { label: '3.01–5.00', min: 3.01, max: 5.00 },
  { label: '5.01+',     min: 5.01, max: Infinity },
];
const WEEKDAGEN = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function finalize(map) {
  return Object.values(map)
    .map(g => ({
      ...g,
      totalWinst: parseFloat(g.totalWinst.toFixed(2)),
      roi: g.totalInzet > 0 ? parseFloat(((g.totalWinst / g.totalInzet) * 100).toFixed(1)) : 0,
      winRate: (g.gewonnen + g.verloren) > 0
        ? parseFloat(((g.gewonnen / (g.gewonnen + g.verloren)) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.totalWinst - a.totalWinst);
}

function countRow(map, key, b) {
  if (!map[key]) map[key] = { key, bets: [], gewonnen: 0, verloren: 0, totalInzet: 0, totalWinst: 0 };
  map[key].bets.push(b);
  map[key].totalInzet += Number(b.inzet);
  map[key].totalWinst += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
  if (b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen') map[key].gewonnen++;
  else if (b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren') map[key].verloren++;
}

function groepeerOp(bets, veld) {
  const map = {};
  bets.forEach(b => countRow(map, b[veld] || 'Onbekend', b));
  return finalize(map);
}

function groepeerOpTags(bets) {
  const map = {};
  bets.forEach(b => { (b.tags || []).forEach(tag => countRow(map, tag, b)); });
  return finalize(map);
}

function maandelijksPnL(bets) {
  const map = {};
  bets.filter(b => b.uitkomst !== 'lopend').forEach(b => {
    const d = new Date(b.datum);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
    if (!map[key]) map[key] = { key, label, pnl: 0, bets: 0 };
    map[key].pnl += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
    map[key].bets++;
  });
  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => ({ ...m, pnl: parseFloat(m.pnl.toFixed(2)) }));
}

function equityCurve(bets) {
  const sorted = [...bets]
    .filter(b => b.uitkomst !== 'lopend')
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));
  let running = 0;
  return sorted.map((b, i) => {
    running += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
    return { i: i + 1, pnl: parseFloat(running.toFixed(2)) };
  });
}

function berekenDrawdown(bets) {
  const sorted = [...bets]
    .filter(b => b.uitkomst !== 'lopend')
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));
  let peak = 0, maxDD = 0, running = 0;
  sorted.forEach(b => {
    running += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDD) maxDD = dd;
  });
  return parseFloat(maxDD.toFixed(2));
}

function dagAnalyse(bets) {
  const map = Array(7).fill(null).map((_, i) => ({ dag: WEEKDAGEN[i], pnl: 0, bets: 0, wins: 0, losses: 0 }));
  bets.forEach(b => {
    const d = (new Date(b.datum).getDay() + 6) % 7; // Mon=0 … Sun=6
    map[d].pnl += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
    map[d].bets++;
    if (b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen') map[d].wins++;
    else if (b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren') map[d].losses++;
  });
  return map.map(m => ({ ...m, pnl: parseFloat(m.pnl.toFixed(2)) }));
}

function oddsRangeAnalyse(bets) {
  return ODDS_BRACKETS.map(br => {
    const inBracket = bets.filter(b => {
      const o = Number(b.odds);
      return o >= br.min && (br.max === Infinity ? true : o <= br.max);
    });
    if (!inBracket.length) return null;
    const pnl = inBracket.reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);
    const totalInzet = inBracket.reduce((s, b) => s + Number(b.inzet), 0);
    const wins = inBracket.filter(b => b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen').length;
    const losses = inBracket.filter(b => b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren').length;
    return {
      label: br.label,
      pnl: parseFloat(pnl.toFixed(2)),
      roi: totalInzet > 0 ? parseFloat(((pnl / totalInzet) * 100).toFixed(1)) : 0,
      bets: inBracket.length, wins, losses,
    };
  }).filter(Boolean);
}

function huidigeReeks(bets) {
  const sorted = [...bets]
    .filter(b => b.uitkomst !== 'lopend')
    .sort((a, b) => new Date(b.datum) - new Date(a.datum));
  let type = null, count = 0;
  for (const b of sorted) {
    const isWin = b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen';
    const isLoss = b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren';
    if (!type) {
      if (isWin) { type = 'win'; count = 1; }
      else if (isLoss) { type = 'loss'; count = 1; }
    } else {
      if (type === 'win' && isWin) count++;
      else if (type === 'loss' && isLoss) count++;
      else break;
    }
  }
  return { type, count };
}

// ── chart tooltips ─────────────────────────────────────────────────────────────

function Tip({ active, payload, label }) {
  const { dark } = useTheme();
  const { fmtPnl } = useFmt();
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const bg = dark ? '#1c2335' : '#ffffff';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const muted = dark ? '#8b949e' : '#6b7280';
  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: 13 }}>
      {label && <p style={{ color: muted, marginBottom: 4, fontWeight: 600 }}>{label}</p>}
      <p style={{ fontWeight: 700, color: v >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
        {typeof v === 'number' ? fmtPnl(v) : v}
      </p>
    </div>
  );
}

// ── GroepTabel ─────────────────────────────────────────────────────────────────

function GroepTabel({ data, title, type, isMobile }) {
  const { fmtPnl } = useFmt();
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{title}</h2>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Categorie', 'Bets', 'W', 'V', 'Win Rate', 'Inzet', 'P&L', 'ROI'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.key} className="bet-row" style={{ borderTop: '1px solid var(--border-subtle)', verticalAlign: 'middle' }}>
              <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                {type === 'tag'
                  ? <TagChip tag={row.key} />
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {type === 'bookmaker'
                        ? <BookmakerIcon naam={row.key} size={16} />
                        : <span style={{ fontSize: 16, lineHeight: 1 }}>{sportEmoji(row.key)}</span>
                      }
                      {(!isMobile || (type !== 'sport' && type !== 'bookmaker')) && row.key}
                    </div>
                }
              </td>
              <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-2)' }}>{row.bets.length}</td>
              <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--color-win)', fontWeight: 600 }}>{row.gewonnen}</td>
              <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--color-loss)', fontWeight: 600 }}>{row.verloren}</td>
              <td style={{ padding: '11px 14px', fontSize: 13 }}>
                {isMobile ? (
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{row.winRate}%</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1, height: 5, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden', minWidth: 50 }}>
                      <div style={{ width: `${row.winRate}%`, height: '100%', backgroundColor: 'var(--brand)', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', minWidth: 34 }}>{row.winRate}%</span>
                  </div>
                )}
              </td>
              <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-2)' }}>€{row.totalInzet.toFixed(2)}</td>
              <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: row.totalWinst >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>{fmtPnl(row.totalWinst)}</td>
              <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: row.roi >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>{row.roi >= 0 ? '+' : ''}{row.roi}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── filter style ───────────────────────────────────────────────────────────────

const iFilter = {
  padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6,
  fontSize: 12.5, color: 'var(--text-1)', backgroundColor: 'var(--bg-input)', cursor: 'pointer',
};

// ── page ───────────────────────────────────────────────────────────────────────

export default function StatistiekenPage() {
  const { bets, loaded } = useBets();
  const { fmtPnl, fmtAmt } = useFmt();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // filters
  const [fSport, setFSport] = useState('');
  const [fBookmaker, setFBookmaker] = useState('');
  const [fMarkt, setFMarkt] = useState('');
  const [fDateFrom, setFDateFrom] = useState('');
  const [fDateTo, setFDateTo] = useState('');

  const allSports     = useMemo(() => [...new Set(bets.map(b => b.sport))].sort(),     [bets]);
  const allBookmakers = useMemo(() => [...new Set(bets.map(b => b.bookmaker))].sort(), [bets]);
  const allMarkten    = useMemo(() => [...new Set(bets.map(b => b.markt))].sort(),     [bets]);

  const filtered = useMemo(() => bets.filter(b => {
    if (fSport     && b.sport     !== fSport)     return false;
    if (fBookmaker && b.bookmaker !== fBookmaker) return false;
    if (fMarkt     && b.markt     !== fMarkt)     return false;
    if (fDateFrom  && b.datum < fDateFrom)        return false;
    if (fDateTo    && b.datum > fDateTo)          return false;
    return true;
  }), [bets, fSport, fBookmaker, fMarkt, fDateFrom, fDateTo]);

  const settled = useMemo(() => filtered.filter(b => b.uitkomst !== 'lopend'), [filtered]);
  const hasFilters = fSport || fBookmaker || fMarkt || fDateFrom || fDateTo;

  // computed data
  const perSport     = useMemo(() => groepeerOp(settled, 'sport'),     [settled]);
  const perBookmaker = useMemo(() => groepeerOp(settled, 'bookmaker'), [settled]);
  const perMarkt     = useMemo(() => groepeerOp(settled, 'markt'),     [settled]);
  const perTag       = useMemo(() => groepeerOpTags(settled),          [settled]);
  const maandData    = useMemo(() => maandelijksPnL(filtered),         [filtered]);
  const dagData      = useMemo(() => dagAnalyse(settled),              [settled]);
  const oddsData     = useMemo(() => oddsRangeAnalyse(settled),        [settled]);
  const curve        = useMemo(() => equityCurve(filtered),            [filtered]);
  const maxDrawdown  = useMemo(() => berekenDrawdown(filtered),        [filtered]);
  const huidig       = useMemo(() => huidigeReeks(filtered),           [filtered]);

  const gemOdds  = useMemo(() => settled.length > 0 ? (settled.reduce((s, b) => s + Number(b.odds), 0) / settled.length).toFixed(2) : 0, [settled]);
  const gemInzet = useMemo(() => settled.length > 0 ? (settled.reduce((s, b) => s + Number(b.inzet), 0) / settled.length).toFixed(2) : 0, [settled]);

  const series = useMemo(() => {
    let mW = 0, mL = 0, cW = 0, cL = 0;
    [...settled].sort((a, b) => new Date(a.datum) - new Date(b.datum)).forEach(b => {
      if (b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen') { cW++; cL = 0; mW = Math.max(mW, cW); }
      else if (b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren') { cL++; cW = 0; mL = Math.max(mL, cL); }
      else { cW = 0; cL = 0; }
    });
    return { mW, mL };
  }, [settled]);

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-4)' }}>Laden...</div>;

  const empty = (h = 160) => (
    <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: 13.5 }}>
      Geen data beschikbaar
    </div>
  );

  const curveColor = curve.length > 0 && curve[curve.length - 1].pnl >= 0 ? '#11B981' : '#F43F5E';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }} className="app-page">

      {/* Header */}
      <div className="mb-6 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Statistieken</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Diepgaande analyse van je bettinggedrag</p>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Filter</span>
        <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} style={iFilter} title="Van datum" />
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>–</span>
        <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} style={iFilter} title="Tot datum" />
        <select value={fSport} onChange={e => setFSport(e.target.value)} style={iFilter}>
          <option value="">Alle sporten</option>
          {allSports.map(s => <option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
        </select>
        <select value={fBookmaker} onChange={e => setFBookmaker(e.target.value)} style={iFilter}>
          <option value="">Alle bookmakers</option>
          {allBookmakers.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={fMarkt} onChange={e => setFMarkt(e.target.value)} style={iFilter}>
          <option value="">Alle markten</option>
          {allMarkten.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFSport(''); setFBookmaker(''); setFMarkt(''); setFDateFrom(''); setFDateTo(''); }}
            style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Wis filters
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="stats-grid-6 grid gap-4 mb-6">
        {[
          { label: 'Gem. odds',     v: gemOdds,         sub: `${settled.length} bets` },
          { label: 'Gem. inzet',    v: `€${gemInzet}`,  sub: 'Per bet' },
          { label: 'Max drawdown',  v: maxDrawdown > 0 ? `-€${maxDrawdown.toFixed(2)}` : '—', sub: 'Grootste daling', c: maxDrawdown > 0 ? 'var(--color-loss)' : 'var(--text-1)' },
          { label: 'Winstserie',    v: series.mW,        sub: 'Langste ooit',   c: 'var(--color-win)' },
          { label: 'Verliesserie',  v: series.mL,        sub: 'Langste ooit',   c: 'var(--color-loss)' },
          {
            label: 'Huidige reeks',
            v: huidig.count > 0 ? `${huidig.count}× ${huidig.type === 'win' ? 'W' : 'V'}` : '—',
            sub: huidig.type === 'win' ? 'Winstserie' : huidig.type === 'loss' ? 'Verliesserie' : 'Geen data',
            c: huidig.type === 'win' ? 'var(--color-win)' : huidig.type === 'loss' ? 'var(--color-loss)' : 'var(--text-1)',
          },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
            <p style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.c || 'var(--text-1)', lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 5 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Maandelijkse P&L + Dag van de Week */}
      <div className="chart-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Maandelijkse P&L</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Winst/verlies per maand</p>
          {maandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={maandData} margin={{ top: 4, right: 8, left: 0, bottom: isMobile ? 28 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} angle={isMobile ? -35 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 38 : 20} interval={isMobile ? 'preserveStartEnd' : 0} />
                <YAxis tick={{ fontSize: 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 0 : 52} mirror={isMobile} />
                <Tooltip content={<Tip />} cursor={false} wrapperStyle={{ zIndex: 9999, background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                <Bar dataKey="pnl" maxBarSize={44}>
                  {maandData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#11B981' : '#F43F5E'} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : empty(185)}
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Dag van de Week</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Op welke dag presteer je het best?</p>
          {settled.length > 0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={dagData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="dag" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 0 : 46} mirror={isMobile} />
                <Tooltip content={<Tip />} cursor={false} wrapperStyle={{ zIndex: 9999, background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                <Bar dataKey="pnl" maxBarSize={30}>
                  {dagData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#11B981' : '#F43F5E'} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : empty(185)}
        </div>
      </div>

      {/* Equity Curve */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Equity Curve</h2>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Cumulatieve P&L over alle bets — toont groei én drawdowns</p>
          </div>
          {maxDrawdown > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Max Drawdown</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-loss)' }}>-€{maxDrawdown.toFixed(2)}</p>
            </div>
          )}
        </div>
        {curve.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={curve} margin={{ top: 4, right: 10, left: 0, bottom: isMobile ? 4 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="i" tick={{ fontSize: 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false}
                interval={isMobile ? Math.max(1, Math.ceil(curve.length / 5)) : 'preserveStartEnd'}
                label={!isMobile ? { value: 'Bet #', position: 'insideBottomRight', offset: -4, fontSize: 10.5, fill: 'var(--text-4)' } : undefined} />
              <YAxis tick={{ fontSize: 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 0 : 55} mirror={isMobile} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }} wrapperStyle={{ zIndex: 9999, background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
              <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
              <Line type="monotone" dataKey="pnl" stroke={curveColor} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: curveColor }} />
            </LineChart>
          </ResponsiveContainer>
        ) : empty(200)}
      </div>

      {/* Odds Range Analyse */}
      {oddsData.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Odds Range Analyse</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>In welke odds bracket presteer je het best?</p>
          <div className="odds-range-inner">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={oddsData} margin={{ top: 4, right: 10, left: 0, bottom: isMobile ? 28 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} angle={isMobile ? -35 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 38 : 20} />
                <YAxis tick={{ fontSize: 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={isMobile ? 0 : 50} mirror={isMobile} />
                <Tooltip content={<Tip />} cursor={false} wrapperStyle={{ zIndex: 9999, background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                <Bar dataKey="pnl" name="P&L" maxBarSize={44}>
                  {oddsData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#11B981' : '#F43F5E'} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <table style={{ width: '100%', borderCollapse: 'collapse', alignSelf: 'start' }}>
              <thead>
                <tr>
                  {['Bracket', 'Bets', 'Win%', 'ROI', 'P&L'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Bracket' ? 'left' : 'right', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {oddsData.map(row => {
                  const wr = (row.wins + row.losses) > 0 ? `${((row.wins / (row.wins + row.losses)) * 100).toFixed(0)}%` : '—';
                  return (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'middle' }}>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{row.label}</td>
                      <td style={{ padding: '9px 10px', fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>{row.bets}</td>
                      <td style={{ padding: '9px 10px', fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>{wr}</td>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 600, color: row.roi >= 0 ? 'var(--color-win)' : 'var(--color-loss)', textAlign: 'right' }}>{row.roi >= 0 ? '+' : ''}{row.roi}%</td>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 700, color: row.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)', textAlign: 'right' }}>{isMobile ? fmtAmt(Math.abs(row.pnl)) : fmtPnl(row.pnl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* P&L per Sport chart */}
      {perSport.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>P&L per Sport</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Waar verdien je het meest?</p>
          <ResponsiveContainer width="100%" height={Math.max(160, perSport.length * 36)}>
            <BarChart data={perSport} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <YAxis type="category" dataKey="key" tick={{ fontSize: 12, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} width={isMobile ? 28 : 90} tickFormatter={v => isMobile ? sportEmoji(v) : `${sportEmoji(v)} ${v}`} />
              <Tooltip content={<Tip />} cursor={false} wrapperStyle={{ zIndex: 9999, background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
              <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1} />
              <Bar dataKey="totalWinst" maxBarSize={22}>
                {perSport.map((e, i) => <Cell key={i} fill={e.totalWinst >= 0 ? '#11B981' : '#F43F5E'} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detail tables */}
      {perSport.length     > 0 && <GroepTabel data={perSport}     title="Analyse per Sport"     type="sport"     isMobile={isMobile} />}
      {perBookmaker.length > 0 && <GroepTabel data={perBookmaker} title="Analyse per Bookmaker" type="bookmaker" isMobile={isMobile} />}
      {perMarkt.length     > 0 && <GroepTabel data={perMarkt}     title="Analyse per Markt"     type="markt"     isMobile={isMobile} />}
      {perTag.length       > 0 && <GroepTabel data={perTag}       title="Analyse per Tag"       type="tag"       isMobile={isMobile} />}

    </div>
  );
}
