'use client';
import { useState, useMemo, useEffect } from 'react';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import BookmakerIcon from '../../components/BookmakerIcon';
import { TagChip } from '../../components/TagInput';
import { sportEmoji } from '../../lib/sports';
import PeriodDropdown from '../../components/PeriodDropdown';
import MultiSelect from '../../components/MultiSelect';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

// ── period filter helpers ──────────────────────────────────────────────────────

function getDateRange(filter) {
  const now  = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1);
  const d = today.getDay() || 7;
  switch (filter) {
    case 'today':     return { from: today, to: tom };
    case 'yesterday': { const y = new Date(today); y.setDate(y.getDate()-1); return { from:y, to:today }; }
    case 'last7':     { const f = new Date(today); f.setDate(f.getDate()-7); return { from:f, to:tom }; }
    case 'lastWeek':  { const mon = new Date(today); mon.setDate(today.getDate()-(d+6)); const nxt = new Date(mon); nxt.setDate(mon.getDate()+7); return { from:mon, to:nxt }; }
    case 'last28':    { const f = new Date(today); f.setDate(f.getDate()-28); return { from:f, to:tom }; }
    case 'lastMonth': { const f = new Date(now.getFullYear(), now.getMonth()-1, 1); const t = new Date(now.getFullYear(), now.getMonth(), 1); return { from:f, to:t }; }
    case 'thisMonth': { const f = new Date(now.getFullYear(), now.getMonth(), 1); return { from:f, to:tom }; }
    case 'thisYear':  { const f = new Date(now.getFullYear(), 0, 1); return { from:f, to:tom }; }
    case 'last3m':    { const f = new Date(today); f.setMonth(f.getMonth()-3); return { from:f, to:tom }; }
    case 'last6m':    { const f = new Date(today); f.setMonth(f.getMonth()-6); return { from:f, to:tom }; }
    case 'lastYear':  { const f = new Date(now.getFullYear()-1, 0, 1); const t = new Date(now.getFullYear(), 0, 1); return { from:f, to:t }; }
    default: return null;
  }
}

function filterBetsByPeriod(bets, filter, customRange) {
  if (filter === 'all') return bets;
  if (filter === 'custom') {
    if (!customRange) return bets;
    const { from, to } = customRange;
    const end = new Date(to); end.setDate(end.getDate()+1);
    return bets.filter(b => { const d = new Date(b.datum); return d >= from && d < end; });
  }
  const range = getDateRange(filter);
  if (!range) return bets;
  return bets.filter(b => { const d = new Date(b.datum); return d >= range.from && d < range.to; });
}

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
  const { fmtPnl } = useFmt();
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div style={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: 13 }}>
      {label && <p style={{ color: 'var(--text-3)', marginBottom: 4, fontWeight: 600 }}>{label}</p>}
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
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
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
                        : type === 'sport'
                          ? <span style={{ fontSize: 16, lineHeight: 1 }}>{sportEmoji(row.key)}</span>
                          : null
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
  const [periodFilter, setPeriodFilter] = useState('all');
  const [customRange,  setCustomRange]  = useState(null);
  const [sportFilter,  setSportFilter]  = useState(null);
  const [bookFilter,   setBookFilter]   = useState(null);

  const allSporten    = useMemo(() => [...new Set(bets.map(b => b.sport||'Onbekend'))].sort(),     [bets]);
  const allBookmakers = useMemo(() => [...new Set(bets.map(b => b.bookmaker||'Onbekend'))].sort(), [bets]);

  const filtered = useMemo(() => {
    let r = filterBetsByPeriod(bets, periodFilter, customRange);
    if (sportFilter && sportFilter.length) r = r.filter(b => sportFilter.includes(b.sport||'Onbekend'));
    if (bookFilter  && bookFilter.length)  r = r.filter(b => bookFilter.includes(b.bookmaker||'Onbekend'));
    return r;
  }, [bets, periodFilter, customRange, sportFilter, bookFilter]);

  const settled = useMemo(() => filtered.filter(b => b.uitkomst !== 'lopend'), [filtered]);
  const hasFilters = periodFilter !== 'all' || (sportFilter?.length > 0) || (bookFilter?.length > 0);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <PeriodDropdown
          filter={periodFilter}
          onSelect={(f) => { if (f !== 'custom') setPeriodFilter(f); }}
          customRange={customRange}
          onCustomRange={(range) => { setCustomRange(range); setPeriodFilter('custom'); }}
        />
        <MultiSelect
          label="Sport"
          icon={<svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor"><path d="M256.07-0.047C114.467-0.047-0.326,114.746-0.326,256.349S114.467,512.744,256.07,512.744s256.395-114.792,256.395-256.395S397.673-0.047,256.07-0.047z M466.667,224v0.064c-19.353,12.05-40.515,20.917-62.677,26.261c-4.595-68.333-27.183-134.234-65.472-191.019C406.956,88.198,455.48,150.56,466.667,224z M256,42.667c5.397,0,10.667,0.405,15.979,0.811c53.223,58.444,84.842,133.342,89.6,212.245c-29.153,0.997-58.199-4.013-85.333-14.72c-4.247-72.136-38.705-139.14-94.912-184.555C205.188,47.391,230.484,42.722,256,42.667z M138.389,78.187c20.041,13.069,37.744,29.41,52.373,48.341C126.816,169.409,77.017,230.285,47.659,301.461C28.668,215.422,64.766,126.591,138.389,78.187z M71.595,362.773c21.296-81.459,71.492-152.392,141.227-199.573c12.627,25.943,19.835,54.187,21.184,83.008c-58.22,44.242-94.81,111.213-100.587,184.107C108.191,412.512,87.102,389.474,71.595,362.773z M256,469.333c-27.6-0.008-54.934-5.399-80.469-15.872c-0.47-27.519,4.398-54.867,14.336-80.533c70.121,31.128,147.992,40.413,223.467,26.645C373.07,443.969,315.934,469.303,256,469.333z M209.067,334.72c13.523-20.959,30.63-39.373,50.539-54.4c30.156,12.194,62.363,18.515,94.891,18.624c39.574-0.004,78.615-9.129,114.091-26.667c-1.999,26.074-8.82,51.551-20.117,75.136C369.697,371.777,284.821,367.277,209.067,334.72z"/></svg>}
          options={allSporten}
          selected={sportFilter}
          onChange={setSportFilter}
        />
        <MultiSelect
          label="Bookmaker"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
          options={allBookmakers}
          selected={bookFilter}
          onChange={setBookFilter}
        />
        {hasFilters && (
          <button
            onClick={() => { setPeriodFilter('all'); setCustomRange(null); setSportFilter(null); setBookFilter(null); }}
            style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-3)', fontSize: 12.5, cursor: 'pointer' }}
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
          <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.c || 'var(--text-1)', lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 5 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Maandelijkse P&L + Dag van de Week */}
      <div className="chart-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Maandelijkse P&L</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>Winst/verlies per maand</p>
          {maandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={maandData} margin={{ top: 4, right: 8, left: 0, bottom: isMobile ? 28 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} angle={isMobile ? -35 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 38 : 20} interval={isMobile ? Math.max(0, Math.ceil(maandData.length / 5) - 1) : 0} />
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

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
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
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Odds Range Analyse</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 18 }}>In welke odds bracket presteer je het best?</p>
          <div className="odds-range-inner">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={oddsData} margin={{ top: 4, right: 10, left: 0, bottom: isMobile ? 28 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 10.5, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} angle={isMobile ? -35 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 38 : 20} interval={isMobile ? Math.max(0, Math.ceil(oddsData.length / 5) - 1) : 0} />
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
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
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
