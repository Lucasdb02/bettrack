'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import BookmakerIcon, { BOOKIE_BRAND_COLORS } from '../../components/BookmakerIcon';
import { uitkomstConfig, sportEmoji } from '../../lib/sports';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine,
} from 'recharts';
import { curveCardinal } from 'd3-shape';
// Subtle rounded corners at data points: tension 0.6 (0=full curve, 1=linear)
const cardinalCurve = curveCardinal.tension(0.6);
import { createClient } from '@/lib/supabase';

const FALLBACK_BOOK_COLORS = ['#5469d4','#0e9f6e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
function bookColor(naam, idx) {
  return BOOKIE_BRAND_COLORS[naam] ?? FALLBACK_BOOK_COLORS[idx % FALLBACK_BOOK_COLORS.length];
}

function lightenColor(hex, factor = 0.22) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const lc = c => Math.min(255, Math.round(c + (255 - c) * factor));
  return `#${lc(r).toString(16).padStart(2,'0')}${lc(g).toString(16).padStart(2,'0')}${lc(b).toString(16).padStart(2,'0')}`;
}

const PERIOD_OPTIONS = [
  { label:'Vandaag',                 filter:'today' },
  { label:'Gisteren',                filter:'yesterday' },
  { label:'Afgelopen 7 dagen',       filter:'last7' },
  { label:'Vorige week',             filter:'lastWeek' },
  { label:'Afgelopen 28 dagen',      filter:'last28' },
  { label:'Vorige maand',            filter:'lastMonth' },
  { label:'Deze maand',              filter:'thisMonth' },
  { label:'Dit jaar (vanaf 1 jan)',  filter:'thisYear' },
  { label:'Afgelopen 3 maanden',     filter:'last3m' },
  { label:'Afgelopen 6 maanden',     filter:'last6m' },
  { label:'Vorig jaar',              filter:'lastYear' },
  { label:'Alle tijd',               filter:'all' },
  { label:'Aangepaste periode',      filter:'custom' },
];

const NL_MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const NL_MONTHS_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const NL_DAYS = ['ma','di','wo','do','vr','za','zo'];

/* ─── Period filter logic ─── */
function getDateRange(filter) {
  const now  = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1);
  const d = today.getDay() || 7; // Mon=1..Sun=7

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

function filterBets(bets, filter, customRange) {
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

function fmtDate(d) {
  return d ? `${d.getDate()} ${NL_MONTHS_SHORT[d.getMonth()]}` : '';
}

/* ─── Shared tooltip ─── */
function ChartTip({ active, payload, label, suffix }) {
  const { fmtPnl } = useFmt();
  if (!active || !payload?.length) return null;
  const fmtVal = (v) => {
    if (typeof v !== 'number') return v;
    if (suffix === '%') return `${v >= 0 ? '+' : ''}${v}%`;
    return fmtPnl(v);
  };
  return (
    <div style={{ backgroundColor:'var(--tooltip-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', boxShadow:'var(--shadow-lg)', fontSize:13, pointerEvents:'none' }}>
      {label && <p style={{ color:'var(--text-3)', marginBottom:6, fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>}
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom: i<payload.length-1?3:0 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:p.color, flexShrink:0 }}/>
          <span style={{ color:'var(--text-3)', fontSize:12 }}>{p.name}:</span>
          <span style={{ fontWeight:700, color:p.color }}>{fmtVal(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Cumulative P&L tooltip ─── */
function CumulTip({ active, payload, label }) {
  const { fmtPnl } = useFmt();
  if (!active || !payload?.length) return null;
  const cum = payload.find(p => p.dataKey === 'pnl');
  const day = payload.find(p => p.dataKey === 'dayPnl');
  const cumVal = cum?.value;
  return (
    <div style={{ backgroundColor:'var(--tooltip-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', boxShadow:'var(--shadow-lg)', fontSize:13, pointerEvents:'none' }}>
      {label && <p style={{ color:'var(--text-3)', marginBottom:7, fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>}
      {cum && (
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
          <div style={{ width:8, height:2, backgroundColor:'#5469d4', borderRadius:1, flexShrink:0 }}/>
          <span style={{ color:'var(--text-3)', fontSize:12 }}>Cumulatief:</span>
          <span style={{ fontWeight:700, color: cumVal >= 0 ? '#00c951' : '#fb2b37' }}>{fmtPnl(cumVal)}</span>
        </div>
      )}
      {day && (
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:8, height:2, backgroundColor:'#f59e0b', borderRadius:1, flexShrink:0 }}/>
          <span style={{ color:'var(--text-3)', fontSize:12 }}>Dagelijks:</span>
          <span style={{ fontWeight:700, color: day.value >= 0 ? '#00c951' : '#fb2b37' }}>{fmtPnl(day.value)}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Bookmaker legend + Y-axis tick with icons ─── */
function BookieLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'6px 16px', paddingTop:12 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:entry.color, flexShrink:0 }}/>
          <BookmakerIcon naam={entry.dataKey || entry.value} size={15}/>
          <span style={{ fontSize:12, color:'var(--text-3)' }}>{entry.dataKey || entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function BookieYTick({ x, y, payload, colorMap }) {
  const naam  = payload?.value || '';
  const color = colorMap?.[naam] || '#9ca3af';
  const w = 84;
  return (
    <foreignObject x={x - w - 4} y={y - 10} width={w} height={20}>
      <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end', height:20 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:color, flexShrink:0 }}/>
        <BookmakerIcon naam={naam} size={14}/>
        <span style={{ fontSize:11, color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:48 }}>{naam}</span>
      </div>
    </foreignObject>
  );
}

function BookieXTick({ x, y, payload }) {
  const naam = payload?.value || '';
  return (
    <foreignObject x={x - 20} y={y + 3} width={40} height={30}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, height:30 }}>
        <BookmakerIcon naam={naam} size={14}/>
        <span style={{ fontSize:9, color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:38, textAlign:'center' }}>{naam.length > 7 ? naam.slice(0,6)+'…' : naam}</span>
      </div>
    </foreignObject>
  );
}

function GradBar({ x, y, width, height, fill }) {
  if (!width || !height || Math.abs(height) < 0.5) return null;
  const barY = height >= 0 ? y : y + height;
  const barH = Math.abs(height);
  const r = Math.min(3, barH / 2, width / 2);
  if (height >= 0) {
    return <path d={`M ${x},${barY+barH} H ${x+width} V ${barY+r} A ${r},${r} 0 0,0 ${x+width-r},${barY} H ${x+r} A ${r},${r} 0 0,0 ${x},${barY+r} Z`} fill={fill}/>;
  } else {
    return <path d={`M ${x},${barY} H ${x+width} V ${barY+barH-r} A ${r},${r} 0 0,1 ${x+width-r},${barY+barH} H ${x+r} A ${r},${r} 0 0,1 ${x},${barY+barH-r} Z`} fill={fill}/>;
  }
}

/* ─── Stat card ─── */
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 24px', boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.15s' }}>
      <div className="flex items-start justify-between">
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>{label}</p>
          <p style={{ fontSize:22, fontWeight:800, color:color||'var(--text-1)', lineHeight:1 }}>{value}</p>
          {sub && <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</p>}
        </div>
        {icon && <div className="stat-card-icon" style={{ background:'rgba(84,105,212,0.2)', border:'1px solid rgba(123,158,240,0.25)', width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>}
      </div>
    </div>
  );
}

function xTick(len, mob) {
  const max = mob ? 5 : 9;
  return len <= max ? 0 : Math.ceil(len / max) - 1;
}

/* ─── uitkomst badge ─── */
function UitkomstBadge({ u }) {
  const { dark } = useTheme();
  const cfg = uitkomstConfig(u);
  const bg        = dark ? cfg.darkBg        : cfg.bg;
  const border    = dark ? cfg.darkBorder    : cfg.border;
  const textColor = dark ? cfg.darkTextColor : cfg.textColor;
  return <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', verticalAlign:'middle', background:bg, color:textColor, border:`1px solid ${border}`, padding:'2px 8px', borderRadius:4, fontSize:11.5, fontWeight:600, lineHeight:'18px', whiteSpace:'nowrap', width:80, boxSizing:'border-box' }}>{cfg.label}</span>;
}

/* ─── Chevron ─── */
function Chevron({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, transition:'transform 0.15s', transform:open?'rotate(180deg)':'none' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

/* ─── Portal dropdown helper ─── */
function usePortalDropdown() {
  const btnRef  = useRef(null);
  const [open,  setOpen]  = useState(false);
  const [rect,  setRect]  = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  return { btnRef, open, rect, mounted, toggle, close };
}

/* ─── Period dropdown ─── */
function PeriodDropdown({ filter, onSelect, customRange }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const isCustom    = filter === 'custom';
  const isNonDefault = filter !== 'all';

  const label = isCustom && customRange
    ? `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`
    : 'Periode';

  const dropBg    = dark ? 'var(--bg-card)'    : '#fff';
  const dropBdr   = dark ? 'var(--border)'     : '#e5e7eb';
  const divider   = dark ? 'var(--border-subtle)' : '#f3f4f6';
  const txtActive = dark ? 'var(--brand)'      : '#3b5bdb';
  const bgActive  = dark ? 'var(--bg-brand)'   : '#eef2ff';
  const txtDef    = dark ? 'var(--text-1)'     : '#1a1f36';
  const hoverBg   = dark ? 'var(--bg-subtle)'  : '#f9fafb';

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:7,
        padding:'7px 11px', border:`1px solid ${isNonDefault ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius:8, backgroundColor:'var(--bg-card)',
        color: isNonDefault ? 'var(--brand)' : 'var(--text-2)',
        fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', width:'fit-content',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {label}
        <Chevron open={open}/>
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{ position:'fixed', inset:0, zIndex:9998 }}/>
          <div style={{
            position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex:9999,
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            overflow:'hidden', minWidth:220,
          }}>
            {PERIOD_OPTIONS.map((opt) => {
              const isLast   = opt.filter === 'custom';
              const isActive = filter === opt.filter;
              return (
                <button key={opt.filter} onClick={() => { onSelect(opt.filter); close(); }} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  width:'100%', textAlign:'left', padding:'10px 16px',
                  fontSize:14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? txtActive : txtDef,
                  backgroundColor: isActive ? bgActive : 'transparent',
                  border:'none', borderTop: isLast ? `1px solid ${divider}` : 'none',
                  marginTop: isLast ? 4 : 0,
                  cursor:'pointer', transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = hoverBg; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  {opt.label}
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={txtActive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

/* ─── Multi-select dropdown (portal) ─── */
function MultiSelect({ label, icon, options, selected, onChange, renderOption }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const allSelected = selected === null;
  const count       = selected ? selected.length : 0;

  const toggleOpt = (val) => {
    if (allSelected) {
      onChange(options.filter(v => v !== val));
    } else {
      const curr = selected || [];
      const next = curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val];
      onChange(next.length === options.length ? null : next);
    }
  };
  const clear = (e) => { e.stopPropagation(); onChange(null); };

  const dropBg    = dark ? 'var(--bg-card)'       : '#fff';
  const dropBdr   = dark ? 'var(--border)'        : '#e5e7eb';
  const divider   = dark ? 'var(--border-subtle)' : '#f3f4f6';
  const txtActive = dark ? 'var(--brand)'         : '#3b5bdb';
  const bgActive  = dark ? 'var(--bg-brand)'      : '#eef2ff';
  const txtDef    = dark ? 'var(--text-1)'        : '#1a1f36';
  const hoverBg   = dark ? 'var(--bg-subtle)'     : '#f9fafb';
  const chkBdr    = dark ? '#4b5563'              : '#d1d5db';

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:7,
        height:36, padding:'0 11px', boxSizing:'border-box',
        border:`1px solid ${count > 0 ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius:8, backgroundColor:'var(--bg-card)',
        color: count > 0 ? 'var(--brand)' : 'var(--text-2)',
        fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', width:'fit-content',
      }}>
        {icon}
        {label}{count > 0 ? ` (${count})` : ''}
        {count > 0 && (
          <span onClick={clear} style={{ width:14, height:14, borderRadius:'50%', backgroundColor:'var(--brand)', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</span>
        )}
        <Chevron open={open}/>
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{ position:'fixed', inset:0, zIndex:9998 }}/>
          <div style={{
            position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex:9999,
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            minWidth:190, maxHeight:280, overflowY:'auto',
          }}>
            {/* "Alle" master toggle at top — toggles between all selected and none selected */}
            <button onClick={() => onChange(allSelected ? [] : null)} style={{
              display:'flex', alignItems:'center', gap:9, width:'100%',
              textAlign:'left', padding:'9px 16px', fontSize:13,
              color: allSelected ? txtActive : txtDef,
              backgroundColor: allSelected ? bgActive : 'transparent',
              border:'none', borderBottom:`1px solid ${divider}`, cursor:'pointer',
              transition:'background 0.1s',
            }}
            onMouseEnter={e => { if (!allSelected) e.currentTarget.style.backgroundColor = hoverBg; }}
            onMouseLeave={e => { if (!allSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <div style={{ width:15, height:15, borderRadius:4, border:`2px solid ${allSelected ? txtActive : chkBdr}`, backgroundColor: allSelected ? txtActive : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {allSelected && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
              </div>
              Alle {label.toLowerCase()}s
            </button>
            {options.map(opt => {
              const checked = allSelected || (selected && selected.includes(opt));
              return (
                <button key={opt} onClick={() => toggleOpt(opt)} style={{
                  display:'flex', alignItems:'center', gap:9, width:'100%',
                  textAlign:'left', padding:'9px 16px', fontSize:13,
                  color: checked ? txtActive : txtDef,
                  backgroundColor: checked ? bgActive : 'transparent',
                  border:'none', cursor:'pointer', transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.backgroundColor = hoverBg; }}
                onMouseLeave={e => { if (!checked) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div style={{ width:15, height:15, borderRadius:4, border:`2px solid ${checked ? txtActive : chkBdr}`, backgroundColor: checked ? txtActive : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                  </div>
                  {renderOption ? renderOption(opt) : opt}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

/* ─── Calendar month grid ─── */
function CalendarMonth({ year, month, fromDate, toDate, hoverDate, selecting, onDayClick, onDayHover }) {
  const { dark } = useTheme();
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const firstDow = new Date(year, month, 1).getDay();
  const offset   = (firstDow === 0 ? 6 : firstDow - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const headTxt   = dark ? 'var(--text-1)' : '#1a1f36';
  const dayHdrTxt = dark ? 'var(--text-3)' : '#9ca3af';
  const dayTxt    = dark ? 'var(--text-1)' : '#1a1f36';
  const rangeColor = dark ? 'rgba(84,105,212,0.2)' : 'rgba(59,91,219,0.1)';
  const todayRing  = dark ? 'var(--brand)' : '#1e3a8a';

  return (
    <div style={{ flex:1 }}>
      <p style={{ textAlign:'center', fontSize:15, fontWeight:600, color: headTxt, marginBottom:12 }}>
        {NL_MONTHS[month]} {year}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {NL_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color: dayHdrTxt, padding:'3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`}/>;
          const t = date.getTime();
          const isToday  = t === today.getTime();
          const isFrom   = fromDate && t === fromDate.getTime();
          const isTo     = toDate   && t === toDate.getTime();
          const rangeEnd = (selecting === 'to' && hoverDate) ? hoverDate : toDate;
          const rangeMin = fromDate && rangeEnd ? (fromDate <= rangeEnd ? fromDate : rangeEnd) : null;
          const rangeMax = fromDate && rangeEnd ? (fromDate <= rangeEnd ? rangeEnd : fromDate) : null;
          const inRange  = rangeMin && rangeMax && t > rangeMin.getTime() && t < rangeMax.getTime();
          const isSelected = isFrom || isTo;

          return (
            <div key={t}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
              style={{
                textAlign:'center', lineHeight:'34px', height:34,
                fontSize:13, cursor:'pointer',
                fontWeight: isToday ? 700 : 400,
                borderRadius: isSelected ? 6 : inRange ? 6 : 4,
                backgroundColor: isSelected ? 'var(--brand)' : inRange ? rangeColor : 'transparent',
                color: isSelected ? '#fff' : dayTxt,
                outline: isToday && !isSelected ? `2px solid ${todayRing}` : 'none',
                outlineOffset: -2,
                transition:'background 0.1s',
              }}
            >{date.getDate()}</div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Date range modal ─── */
function DateRangeModal({ initial, onSave, onClose }) {
  const { dark } = useTheme();
  const [isMob, setIsMob] = useState(false);
  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const [navMonth, setNavMonth] = useState(today.getMonth());
  const [navYear,  setNavYear]  = useState(today.getFullYear());

  const [fromDate,  setFromDate]  = useState(initial?.from || null);
  const [toDate,    setToDate]    = useState(initial?.to   || null);
  const [selecting, setSelecting] = useState('from');
  const [hoverDate, setHoverDate] = useState(null);

  // desktop: left = navMonth-1, right = navMonth
  const rightMonth = navMonth;
  const rightYear  = navYear;
  const leftMonth  = navMonth === 0 ? 11 : navMonth - 1;
  const leftYear   = navMonth === 0 ? navYear - 1 : navYear;

  const handleDayClick = (date) => {
    if (selecting === 'from' || !fromDate) {
      setFromDate(date); setToDate(null); setSelecting('to');
    } else {
      if (date < fromDate) { setToDate(fromDate); setFromDate(date); }
      else setToDate(date);
      setSelecting('from');
    }
  };

  const prev = () => { if (navMonth === 0) { setNavMonth(11); setNavYear(y => y-1); } else setNavMonth(m => m-1); };
  const next = () => { if (navMonth === 11) { setNavMonth(0);  setNavYear(y => y+1); } else setNavMonth(m => m+1); };
  const canSave = fromDate && toDate;

  const YEARS = Array.from({ length: 12 }, (_, i) => today.getFullYear() - 6 + i);

  // theme vars
  const modalBg  = dark ? 'var(--bg-card)'    : '#fff';
  const bdr      = dark ? 'var(--border)'     : '#e5e7eb';
  const headTxt  = dark ? 'var(--text-1)'     : '#1a1f36';
  const mutedTxt = dark ? 'var(--text-3)'     : '#9ca3af';
  const bodyTxt  = dark ? 'var(--text-2)'     : '#374151';
  const navBtnBg = dark ? 'var(--bg-subtle)'  : '#f9fafb';
  const selBg    = dark ? 'var(--bg-subtle)'  : '#f9fafb';
  const selTxt   = dark ? 'var(--text-1)'     : '#1a1f36';
  const divColor = dark ? 'var(--border)'     : '#f3f4f6';

  const selectStyle = {
    padding:'5px 10px', borderRadius:7, border:`1px solid ${bdr}`,
    backgroundColor: selBg, color: selTxt,
    fontSize:14, fontWeight:600, cursor:'pointer', outline:'none',
  };

  const mobileStyle = isMob ? {
    position:'fixed', bottom:0, left:0, right:0,
    borderRadius:'16px 16px 0 0', padding:'20px 16px 28px',
    maxHeight:'90dvh', overflowY:'auto',
  } : {
    borderRadius:12, padding:'28px 32px', width:640, maxWidth:'95vw',
  };

  return createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:99999, backgroundColor:'rgba(0,0,0,0.45)', display:'flex', alignItems: isMob ? 'flex-end' : 'center', justifyContent:'center' }}>
      <div style={{ backgroundColor: modalBg, boxShadow:'0 24px 64px rgba(0,0,0,0.22)', ...mobileStyle }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color: headTxt }}>Aangepaste periode</h2>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${bdr}`, backgroundColor:'transparent', cursor:'pointer', color: mutedTxt, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Navigation */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <button onClick={prev} style={{ width:32, height:32, borderRadius:7, border:`1px solid ${bdr}`, backgroundColor: navBtnBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mutedTxt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {isMob ? (
            <>
              <select value={navMonth} onChange={e => setNavMonth(Number(e.target.value))} style={{ ...selectStyle, flex:1 }}>
                {NL_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={navYear} onChange={e => setNavYear(Number(e.target.value))} style={{ ...selectStyle, width:80 }}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          ) : (
            <div style={{ flex:1 }}/>
          )}
          <button onClick={next} style={{ width:32, height:32, borderRadius:7, border:`1px solid ${bdr}`, backgroundColor: navBtnBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mutedTxt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Calendar(s) */}
        {isMob ? (
          <div style={{ marginBottom:16 }} onMouseLeave={() => setHoverDate(null)}>
            <CalendarMonth year={navYear} month={navMonth} fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
          </div>
        ) : (
          <div style={{ display:'flex', gap:32, marginBottom:24 }} onMouseLeave={() => setHoverDate(null)}>
            <CalendarMonth year={leftYear}  month={leftMonth}  fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
            <div style={{ width:1, backgroundColor: divColor }}/>
            <CalendarMonth year={rightYear} month={rightMonth} fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
          </div>
        )}

        {/* Selection hint */}
        <p style={{ fontSize:12.5, color: mutedTxt, marginBottom:16, textAlign:'center' }}>
          {!fromDate ? 'Klik op een startdatum' : !toDate ? 'Klik op een einddatum' : `${fmtDate(fromDate)} – ${fmtDate(toDate)}`}
        </p>

        {/* Actions */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:7, border:`1px solid ${bdr}`, backgroundColor:'transparent', color: bodyTxt, fontSize:13, fontWeight:500, cursor:'pointer' }}>Annuleren</button>
          <button onClick={() => { if (canSave) { onSave({ from:fromDate, to:toDate }); onClose(); } }} disabled={!canSave}
            style={{ padding:'9px 22px', borderRadius:7, border:'none', backgroundColor: canSave ? 'var(--brand)' : (dark ? '#374151' : '#9ca3af'), color:'#fff', fontSize:13, fontWeight:600, cursor: canSave ? 'pointer' : 'not-allowed' }}>
            Opslaan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { bets, loaded } = useBets();
  const { fmtPnl, fmtAmt } = useFmt();

  const [periodFilter,  setPeriodFilter]  = useState('thisMonth');
  const [customRange,   setCustomRange]   = useState(null);
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [sportFilter,   setSportFilter]   = useState(null);
  const [bookFilter,    setBookFilter]    = useState(null);
  const [mounted,       setMounted]       = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [hoverIdx,      setHoverIdx]      = useState(null);
  const [dbBookmakers,  setDbBookmakers]  = useState([]);
  const [transactions,  setTransactions]  = useState([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      Promise.all([
        supabase.from('bookmakers').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
      ]).then(([bmRes, txRes]) => {
        if (!bmRes.error && bmRes.data) setDbBookmakers(bmRes.data);
        if (!txRes.error && txRes.data) setTransactions(txRes.data);
      });
    });
  }, []);

  const allSporten    = useMemo(() => [...new Set(bets.map(b => b.sport||'Onbekend'))].sort(), [bets]);
  const allBookmakers = useMemo(() => [...new Set(bets.map(b => b.bookmaker||'Onbekend'))].sort(), [bets]);

  const handlePeriodSelect = (filter) => {
    if (filter === 'custom') { setShowCalendar(true); return; }
    setPeriodFilter(filter);
  };

  const filtered = useMemo(() => {
    let r = filterBets(bets, periodFilter, customRange);
    if (sportFilter && sportFilter.length) r = r.filter(b => sportFilter.includes(b.sport||'Onbekend'));
    if (bookFilter  && bookFilter.length)  r = r.filter(b => bookFilter.includes(b.bookmaker||'Onbekend'));
    return r;
  }, [bets, periodFilter, customRange, sportFilter, bookFilter]);

  const stats = useMemo(() => {
    const settled    = filtered.filter(b => b.uitkomst !== 'lopend');
    const won        = settled.filter(b => b.uitkomst === 'gewonnen');
    const halfWon    = settled.filter(b => b.uitkomst === 'half_gewonnen');
    const lost       = settled.filter(b => b.uitkomst === 'verloren');
    const halfLost   = settled.filter(b => b.uitkomst === 'half_verloren');
    const pushVoid   = settled.filter(b => ['push','void','onbeslist'].includes(b.uitkomst));
    const wins       = won.length + halfWon.length;
    const losses     = lost.length + halfLost.length;
    const pushes     = pushVoid.length;
    const totalInzet = settled.reduce((s, b) => s + Number(b.inzet), 0);
    const totalWinst = settled.reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);
    return { settled, won, lost, halfWon, halfLost, pushVoid, wins, losses, pushes, totalInzet, totalWinst,
      winRate: (wins+losses)>0 ? (wins/(wins+losses))*100 : 0,
      roi: totalInzet>0 ? (totalWinst/totalInzet)*100 : 0,
      lopend: filtered.filter(b => b.uitkomst === 'lopend'),
    };
  }, [filtered]);

  const statusData = useMemo(() => {
    const ns    = stats.lopend.length;
    const total = stats.wins + stats.losses + stats.pushes + ns;
    const pct   = v => total > 0 ? parseFloat((v/total*100).toFixed(1)) : 0;
    return [
      { name:'Won',         value:stats.wins,    color:'#20a851',  pct:pct(stats.wins)    },
      { name:'Lost',        value:stats.losses,  color:'#cd3b3a', pct:pct(stats.losses)  },
      { name:'Push',        value:stats.pushes,  color:'#f59e0b', pct:pct(stats.pushes)  },
      { name:'Not settled', value:ns,            color:'#6b7280', pct:pct(ns)            },
    ];
  }, [stats]);

  const bookieBalanceData = useMemo(() => {
    return dbBookmakers.map((bm, i) => {
      const pnl = bets
        .filter(b => b.bookmaker === bm.naam && b.uitkomst !== 'lopend')
        .reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);
      const netTx = transactions
        .filter(tx => tx.bookmaker_id === bm.id)
        .reduce((s, tx) => s + (tx.type === 'deposit' ? Number(tx.amount) : -Number(tx.amount)), 0);
      const balance = parseFloat(((bm.saldo || 0) + pnl + netTx).toFixed(2));
      return { name: bm.naam, value: Math.max(balance, 0), color: bookColor(bm.naam, i) };
    }).filter(d => d.value > 0);
  }, [bets, dbBookmakers, transactions]);

  const bookmakers = useMemo(() => [...new Set(filtered.map(b => b.bookmaker||'Onbekend'))].slice(0,8), [filtered]);

  const cumulData = useMemo(() => {
    let cumPnl = 0, cumInzet = 0, cumW = 0, cumL = 0, cumP = 0;
    const dayPnlMap = {};
    const map = {};
    [...filtered].filter(b => b.uitkomst !== 'lopend')
      .sort((a, b) => new Date(a.datum) - new Date(b.datum))
      .forEach(b => {
        const lbl = new Date(b.datum).toLocaleDateString('nl-NL', {day:'numeric', month:'short'});
        const w = berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
        cumPnl   += w;
        cumInzet += Number(b.inzet);
        if (['gewonnen','half_gewonnen'].includes(b.uitkomst))       cumW++;
        else if (['verloren','half_verloren'].includes(b.uitkomst))  cumL++;
        else if (['push','void','onbeslist'].includes(b.uitkomst))   cumP++;
        dayPnlMap[lbl] = parseFloat(((dayPnlMap[lbl] || 0) + w).toFixed(2));
        map[lbl] = {
          pnl:    parseFloat(cumPnl.toFixed(2)),
          dayPnl: dayPnlMap[lbl],
          roi:    cumInzet > 0 ? parseFloat((cumPnl / cumInzet * 100).toFixed(1)) : 0,
          w: cumW, l: cumL, p: cumP,
        };
      });
    return Object.entries(map).map(([datum, v]) => ({ datum, ...v }));
  }, [filtered]);

  const bookLineData = useMemo(() => {
    const settled = [...filtered].filter(b=>b.uitkomst!=='lopend').sort((a,b)=>new Date(a.datum)-new Date(b.datum));
    const cum = {}; bookmakers.forEach(bk=>{cum[bk]=0;});
    const dayMap = {};
    settled.forEach(b => {
      const bk = b.bookmaker||'Onbekend';
      const lbl = new Date(b.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short'});
      if (!dayMap[lbl]) dayMap[lbl] = {...cum};
      cum[bk] = parseFloat((cum[bk]+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet))).toFixed(2));
      dayMap[lbl] = {...cum};
    });
    return Object.entries(dayMap).map(([datum,vals])=>({datum,...vals}));
  }, [filtered, bookmakers]);

  const stackedData = useMemo(() => {
    const map = {};
    [...filtered].filter(b=>b.uitkomst!=='lopend').sort((a,b)=>new Date(a.datum)-new Date(b.datum)).forEach(b => {
      const bk = b.bookmaker||'Onbekend';
      const lbl = new Date(b.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short'});
      if (!map[lbl]) { map[lbl]={datum:lbl}; bookmakers.forEach(k=>{map[lbl][k]=0;}); }
      map[lbl][bk] = parseFloat(((map[lbl][bk]||0)+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet))).toFixed(2));
    });
    return Object.values(map);
  }, [filtered, bookmakers]);

  const dailyData = useMemo(() => {
    const map = {};
    [...filtered].filter(b=>b.uitkomst!=='lopend').sort((a,b)=>new Date(a.datum)-new Date(b.datum)).forEach(b => {
      const key = b.datum; // YYYY-MM-DD
      const lbl = new Date(b.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short'});
      if (!map[key]) map[key] = {datum:lbl, pnl:0};
      map[key].pnl = parseFloat((map[key].pnl+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet))).toFixed(2));
    });
    if (periodFilter === 'thisMonth') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();
      for (let d = 1; d <= today; d++) {
        const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (!map[key]) {
          const lbl = new Date(year, month, d).toLocaleDateString('nl-NL',{day:'numeric',month:'short'});
          map[key] = {datum:lbl, pnl:0};
        }
      }
    }
    return Object.keys(map).sort().map(k => map[k]);
  }, [filtered, periodFilter]);

  const roiData = useMemo(() => {
    const map = {};
    filtered.filter(b=>b.uitkomst!=='lopend').forEach(b => {
      const bk = b.bookmaker||'Onbekend';
      if (!map[bk]) map[bk]={bk,inzet:0,winst:0};
      map[bk].inzet += Number(b.inzet);
      map[bk].winst += berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet));
    });
    return Object.values(map).map(r=>({...r,winst:parseFloat(r.winst.toFixed(2)),roi:r.inzet>0?parseFloat(((r.winst/r.inzet)*100).toFixed(1)):0})).sort((a,b)=>b.roi-a.roi);
  }, [filtered]);

  const distData = useMemo(() => {
    const settled = filtered.filter(b=>b.uitkomst!=='lopend');
    if (!settled.length) return [];
    const results = settled.map(b=>berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet)));
    const minV=Math.min(...results), maxV=Math.max(...results);
    const BUCKETS=10, range=maxV-minV||1, size=range/BUCKETS;
    const buckets = Array.from({length:BUCKETS},(_,i)=>({ label:`${(minV+i*size).toFixed(0)}`, count:0, positive:(minV+(i+0.5)*size)>=0 }));
    results.forEach(v=>{ let idx=Math.min(Math.floor((v-minV)/size),BUCKETS-1); buckets[idx].count++; });
    return buckets;
  }, [filtered]);

  const recent = useMemo(() => [...filtered].sort((a,b)=>new Date(b.datum)-new Date(a.datum)).slice(0,6), [filtered]);

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{color:'var(--text-4)'}}>Laden...</div>;

  const ic = '#7b9ef0';
  const empty = (h=220) => <div style={{height:h,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-4)',fontSize:14}}>Voeg bets toe om de grafiek te zien</div>;

  return (
    <div style={{ padding:'24px' }} className="app-page">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 page-header">
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:14, color:'var(--text-3)' }}>Overzicht van al je bets en resultaten</p>
        </div>
        {/* Bet Invoeren — alleen desktop */}
        <div className="hidden md:flex">
          <Link href="/bets/new" className="btn-primary-glass" style={{ textDecoration:'none', borderRadius:9 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Bet Invoeren
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <PeriodDropdown filter={periodFilter} onSelect={handlePeriodSelect} customRange={customRange}/>

        <MultiSelect
          label="Sport"
          icon={<svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor"><path d="M256.07-0.047C114.467-0.047-0.326,114.746-0.326,256.349S114.467,512.744,256.07,512.744s256.395-114.792,256.395-256.395S397.673-0.047,256.07-0.047z M466.667,224v0.064c-19.353,12.05-40.515,20.917-62.677,26.261c-4.595-68.333-27.183-134.234-65.472-191.019C406.956,88.198,455.48,150.56,466.667,224z M256,42.667c5.397,0,10.667,0.405,15.979,0.811c53.223,58.444,84.842,133.342,89.6,212.245c-29.153,0.997-58.199-4.013-85.333-14.72c-4.247-72.136-38.705-139.14-94.912-184.555C205.188,47.391,230.484,42.722,256,42.667z M138.389,78.187c20.041,13.069,37.744,29.41,52.373,48.341C126.816,169.409,77.017,230.285,47.659,301.461C28.668,215.422,64.766,126.591,138.389,78.187z M71.595,362.773c21.296-81.459,71.492-152.392,141.227-199.573c12.627,25.943,19.835,54.187,21.184,83.008c-58.22,44.242-94.81,111.213-100.587,184.107C108.191,412.512,87.102,389.474,71.595,362.773z M256,469.333c-27.6-0.008-54.934-5.399-80.469-15.872c-0.47-27.519,4.398-54.867,14.336-80.533c70.121,31.128,147.992,40.413,223.467,26.645C373.07,443.969,315.934,469.303,256,469.333z M209.067,334.72c13.523-20.959,30.63-39.373,50.539-54.4c30.156,12.194,62.363,18.515,94.891,18.624c39.574-0.004,78.615-9.129,114.091-26.667c-1.999,26.074-8.82,51.551-20.117,75.136C369.697,371.777,284.821,367.277,209.067,334.72z"/></svg>}
          options={allSporten} selected={sportFilter} onChange={setSportFilter}
          renderOption={(s) => `${sportEmoji(s)} ${s}`}
        />
        <MultiSelect
          label="Bookmaker"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
          options={allBookmakers} selected={bookFilter} onChange={setBookFilter}
        />

      </div>

      {/* Date range modal */}
      {mounted && showCalendar && (
        <DateRangeModal
          initial={customRange}
          onSave={(range) => { setCustomRange(range); setPeriodFilter('custom'); }}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Stat cards */}
      <div className="grid gap-4 mb-4 grid-4-to-2" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        <StatCard label="Totale P&L" value={fmtAmt(stats.totalWinst)} sub={`${stats.settled.length} afgeronde bets`} color={stats.totalWinst>=0?'var(--color-win)':'var(--color-loss)'} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>}/>
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W — ${stats.losses}L${stats.pushes>0?` — ${stats.pushes}P`:''}`} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}/>
        <StatCard label="ROI" value={`${stats.roi>=0?'+':''}${stats.roi.toFixed(1)}%`} sub={`Totale inzet: €${stats.totalInzet.toFixed(0)}`} color={stats.roi>=0?'var(--color-win)':'var(--color-loss)'} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><polyline points="18 9 13 14 8 9 3 14"/></svg>}/>
        <StatCard label="Record" value={`${stats.wins}-${stats.losses}-${stats.pushes}`} sub={`W — L — P  •  ${stats.settled.length} bets`} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}/>
      </div>

      {/* Cumulatieve P&L (70%) + Balance per Bookmaker (30%) */}
      <div style={{ display:'grid', gridTemplateColumns:'6fr 4fr', gap:16, marginBottom:16, alignItems:'stretch' }}>

        {/* LEFT 70%: Cumulative P&L */}
        {(() => {
          const hp         = hoverIdx !== null ? cumulData[hoverIdx] : null;
          const dispPnl    = hp ? hp.pnl    : stats.totalWinst;
          const dispRoi    = hp ? hp.roi    : stats.roi;
          const dispDayPnl = hp ? hp.dayPnl : null;
          const dispW      = hp ? hp.w      : stats.wins;
          const dispL      = hp ? hp.l      : stats.losses;
          const dispP      = hp ? hp.p      : stats.pushes;
          const roiColor   = dispRoi >= 0 ? 'var(--color-win)' : 'var(--color-loss)';
          const n = cumulData.length;
          const sumX  = (n * (n - 1)) / 2;
          const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
          const sumY  = cumulData.reduce((s, d) => s + d.pnl, 0);
          const sumXY = cumulData.reduce((s, d, i) => s + i * d.pnl, 0);
          const slope     = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
          const intercept = n > 1 ? (sumY - slope * sumX) / n : 0;
          const chartData = cumulData.map((d, i) => ({ ...d, trend: parseFloat((intercept + slope * i).toFixed(2)) }));
          // Y-axis domain based on all visible series, 15% padding
          const visVals = chartData.flatMap(d => [d.pnl, d.dayPnl, d.trend].filter(v => v != null));
          const yMin = Math.min(...visVals); const yMax = Math.max(...visVals);
          const yPad = (yMax - yMin) * 0.15;
          const yDomain = [Math.floor(yMin - yPad), Math.ceil(yMax + yPad)];
          return (
            <div className="dash-chart-section" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)' }}>
              <div className="dash-chart-hdr" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Cumulatieve P&L</p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                    <span style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>{fmtPnl(dispPnl)}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:roiColor }}>{dispRoi >= 0 ? '+' : ''}{dispRoi.toFixed(1)}% ROI</span>
                  </div>
                  {dispDayPnl !== null && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
                      <div style={{ width:10, height:2, backgroundColor:'#f59e0b', borderRadius:1 }}/>
                      <span style={{ fontSize:12, color:'var(--text-4)' }}>Dagelijks:</span>
                      <span style={{ fontSize:13, fontWeight:700, color: dispDayPnl >= 0 ? '#00c951' : '#fb2b37' }}>{fmtPnl(dispDayPnl)}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Record</p>
                  <span style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>{dispW}-{dispL}-{dispP}</span>
                  <div style={{ display:'flex', gap:14, justifyContent:'flex-end', marginTop:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:16, height:3, backgroundColor:'#5469d4', borderRadius:2 }}/>
                      <span style={{ fontSize:11, color:'var(--text-4)' }}>Cumulatief</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:16, height:3, backgroundColor:'#f59e0b', borderRadius:2 }}/>
                      <span style={{ fontSize:11, color:'var(--text-4)' }}>Dagelijks</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <svg width="16" height="3" viewBox="0 0 16 3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 2.5"/></svg>
                      <span style={{ fontSize:11, color:'var(--text-4)' }}>Trend</span>
                    </div>
                  </div>
                </div>
              </div>
              {cumulData.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData} margin={isMobile ? {top:5,right:0,left:0,bottom:0} : {top:5,right:10,left:0,bottom:0}} tabIndex={-1}
                    onMouseMove={(e) => { if (e?.activeTooltipIndex !== undefined) setHoverIdx(e.activeTooltipIndex); }}
                    onMouseLeave={() => setHoverIdx(null)}>
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#5469d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#5469d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                    <XAxis dataKey="datum" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval={xTick(cumulData.length, isMobile)}/>
                    <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={isMobile ? 0 : 55} mirror={isMobile} domain={yDomain}/>
                    <Tooltip content={<CumulTip/>} cursor={{ stroke:'var(--border)', strokeDasharray:'4 3', strokeWidth:1 }} wrapperStyle={{zIndex:9999,background:'none',border:'none',padding:0,boxShadow:'none'}}/>
                    <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1}/>
                    <Area type={cardinalCurve} dataKey="pnl" name="P&L" stroke="#5469d4" strokeWidth={2} fill="url(#pg)" dot={false} activeDot={{r:5,fill:'#5469d4',stroke:'#fff',strokeWidth:2}}/>
                    <Line type={cardinalCurve} dataKey="dayPnl" name="Dagelijks" stroke="#f59e0b" strokeWidth={1.5} dot={false} activeDot={{r:5,fill:'#f59e0b',stroke:'#fff',strokeWidth:2}}/>
                    <Line type="linear" dataKey="trend" name="Trend" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={false} legendType="none"/>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : empty(300)}
            </div>
          );
        })()}

        {/* RIGHT 30%: Balance per Bookmaker */}
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)', userSelect:'none', display:'flex', flexDirection:'column' }}>
          {bookieBalanceData.length > 0 ? (() => {
            const total = bookieBalanceData.reduce((s,d)=>s+d.value,0);
            return (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Balance per Bookmaker</p>
                    <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Verdeling over je bookmakers</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Totaal</p>
                    <span style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>€{total.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart style={{outline:'none'}} tabIndex={-1}>
                      <defs>
                        {bookieBalanceData.map((entry,i) => (
                          <linearGradient key={i} id={`bk-grad-${i}`} x1="0" y1="0" x2="0.6" y2="1">
                            <stop offset="0%" stopColor={lightenColor(entry.color)}/>
                            <stop offset="100%" stopColor={entry.color}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie data={bookieBalanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                        dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}
                        paddingAngle={3} cornerRadius={6}>
                        {bookieBalanceData.map((entry,i) => <Cell key={i} fill={`url(#bk-grad-${i})`}/>)}
                      </Pie>
                      <Tooltip wrapperStyle={{zIndex:9999}} content={({active,payload})=>{
                        if(!active||!payload?.length) return null;
                        const d = payload[0].payload;
                        const pct = total > 0 ? (d.value/total*100).toFixed(1) : 0;
                        return (
                          <div style={{backgroundColor:'var(--tooltip-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',fontSize:13,pointerEvents:'none'}}>
                            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                              <div style={{width:10,height:10,borderRadius:'50%',backgroundColor:d.color}}/>
                              <BookmakerIcon naam={d.name} size={14}/>
                              <span style={{fontWeight:700,color:'var(--text-1)'}}>{d.name}</span>
                            </div>
                            <p style={{color:'var(--text-3)',fontSize:12}}>€{d.value.toFixed(2)} · <b style={{color:d.color}}>{pct}%</b></p>
                          </div>
                        );
                      }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:12 }}>
                  {bookieBalanceData.map((d,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', backgroundColor:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:11.5, color:'var(--text-3)', flex:1 }}>{d.name}</span>
                      <span style={{ fontSize:11.5, fontWeight:700, color:'var(--text-2)' }}>€{d.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })() : (
            <>
              <div className="mb-5"><p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Balance per Bookmaker</p><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Verdeling over je bookmakers</p></div>
              {empty()}
            </>
          )}
        </div>
      </div>

      {/* Stake / Profit Ratio + Cumulatieve P&L per Bookmaker */}
      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="dash-chart-section" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)', display:'flex', flexDirection:'column' }}>
          <div className="dash-chart-hdr mb-5">
            <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Stake / Profit Ratio</h2>
            <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Verhouding inzet tot winst</p>
          </div>
          {(() => {
            const totalInzet = stats.totalInzet || 0;
            const totalWinst = stats.totalWinst || 0;
            const ratio = totalWinst !== 0 ? Math.abs(totalInzet / totalWinst) : null;
            const ratioColor = totalWinst >= 0 ? '#00c951' : '#fb2b37';
            return (
              <div style={{ display:'flex', flexDirection:'column', flex:1, gap:12 }}>
                <div style={{ background:'var(--bg-page)', borderRadius:10, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', minHeight:120 }}>
                  {ratio !== null ? (
                    <>
                      <span style={{ fontSize:52, fontWeight:800, color:ratioColor, lineHeight:1, letterSpacing:'-0.03em' }}>{ratio.toFixed(2)}</span>
                      <span style={{ fontSize:12, color:'var(--text-4)', marginTop:6, fontWeight:500 }}>€1 winst per €{ratio.toFixed(2)} inzet</span>
                    </>
                  ) : (
                    <span style={{ fontSize:32, fontWeight:800, color:'var(--text-4)', lineHeight:1 }}>—</span>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div style={{ background:'var(--bg-page)', borderRadius:8, padding:'14px 16px' }}>
                    <p style={{ fontSize:10.5, color:'var(--text-4)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Totale inzet</p>
                    <p style={{ fontSize:20, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>€{totalInzet.toFixed(2)}</p>
                  </div>
                  <div style={{ background:'var(--bg-page)', borderRadius:8, padding:'14px 16px' }}>
                    <p style={{ fontSize:10.5, color:'var(--text-4)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Winst</p>
                    <p style={{ fontSize:20, fontWeight:800, color: totalWinst >= 0 ? '#00c951' : '#fb2b37', lineHeight:1 }}>{fmtPnl(totalWinst)}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Cumulatieve P&L per Bookmaker */}
        <div className="dash-chart-section" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)' }}>
          <div className="dash-chart-hdr mb-5">
            <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Cumulatieve P&L per Bookmaker</h2>
            <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Hoe presteren je bookmakers over tijd?</p>
          </div>
          {bookLineData.length>1 ? (() => {
            const allBookVals = bookLineData.flatMap(d => bookmakers.map(bk => d[bk]).filter(v => v != null));
            const bkMin = Math.min(...allBookVals); const bkMax = Math.max(...allBookVals);
            const bkPad = (bkMax - bkMin) * 0.15;
            const bkDomain = [Math.floor(bkMin - bkPad), Math.ceil(bkMax + bkPad)];
            return (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={bookLineData} margin={isMobile?{top:5,right:0,left:0,bottom:0}:{top:5,right:10,left:0,bottom:0}} tabIndex={-1}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="datum" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval={xTick(bookLineData.length, isMobile)}/>
                  <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={isMobile?0:55} mirror={isMobile} domain={bkDomain}/>
                  <Tooltip content={<ChartTip/>} cursor={{ stroke:'var(--border)', strokeDasharray:'4 3', strokeWidth:1 }} wrapperStyle={{zIndex:9999,background:'none',border:'none',padding:0,boxShadow:'none'}}/>
                  <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1}/>
                  <Legend content={<BookieLegend/>}/>
                  {bookmakers.map((bk,i)=><Line key={bk} type={cardinalCurve} dataKey={bk} stroke={bookColor(bk,i)} strokeWidth={2} dot={false} activeDot={{r:4,fill:bookColor(bk,i),stroke:'#fff',strokeWidth:2}}/>)}
                </LineChart>
              </ResponsiveContainer>
            );
          })() : empty()}
        </div>
      </div>

      {/* ROI + Balance per Bookmaker */}
      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)' }}>
          <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>ROI per Bookmaker</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Vergelijk prestaties per platform</p></div>
          {roiData.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roiData} margin={isMobile?{top:5,right:0,left:0,bottom:0}:{top:5,right:10,left:0,bottom:0}} tabIndex={-1} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="bk" tick={(props) => <BookieXTick {...props}/>} axisLine={false} tickLine={false} height={36}/>
                <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} width={isMobile?0:46} mirror={isMobile}/>
                <Tooltip content={<ChartTip prefix="" suffix="%"/>} cursor={false} wrapperStyle={{zIndex:9999,background:'none',border:'none',padding:0,boxShadow:'none'}}/>
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1}/>
                <Bar dataKey="roi" name="ROI" maxBarSize={24} shape={GradBar}>
                  {roiData.map((e,i)=><Cell key={i} fill={e.roi>=0?bookColor(e.bk,i):'#cd3b3a'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ):empty()}
        </div>

        {/* Status Breakdown donut */}
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)', userSelect:'none' }}>
          <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Status Breakdown</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Verdeling van alle bet statussen</p></div>
          {(() => {
            const total = statusData.reduce((s,d)=>s+d.value,0);
            const center = total > 0 ? [...statusData].sort((a,b)=>b.value-a.value)[0] : null;
            return (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart style={{outline:'none'}} tabIndex={-1}>
                  <defs>
                    {statusData.map((entry,i) => (
                      <linearGradient key={i} id={`st-grad-${i}`} x1="0" y1="0" x2="0.6" y2="1">
                        <stop offset="0%" stopColor={lightenColor(entry.color)}/>
                        <stop offset="100%" stopColor={entry.color}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={statusData.filter(d=>d.value>0).length>0 ? statusData : [{name:'Geen data',value:1,color:'var(--border)'}]}
                    cx="50%" cy="45%" innerRadius={52} outerRadius={92}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}
                    paddingAngle={3} cornerRadius={6}>
                    {statusData.map((entry,i) => <Cell key={i} fill={entry.value===0 ? entry.color : `url(#st-grad-${i})`} opacity={entry.value===0?0.2:1}/>)}
                    {center && (
                      <Label content={({ viewBox }) => {
                        const cx = viewBox?.cx; const cy = viewBox?.cy;
                        if (!cx || !cy) return null;
                        return (
                          <g>
                            <text x={cx} y={cy-8} textAnchor="middle" fontSize={20} fontWeight={800} fill={center.color}>{center.pct}%</text>
                            <text x={cx} y={cy+14} textAnchor="middle" fontSize={12} fill="var(--text-3)">{center.name}</text>
                          </g>
                        );
                      }} position="center"/>
                    )}
                  </Pie>
                  <Tooltip wrapperStyle={{zIndex:9999}} content={({active,payload})=>{
                    if(!active||!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{backgroundColor:'var(--tooltip-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',fontSize:13,pointerEvents:'none'}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                          <div style={{width:10,height:10,borderRadius:'50%',backgroundColor:d.color}}/>
                          <span style={{fontWeight:700,color:'var(--text-1)'}}>{d.name}</span>
                        </div>
                        <p style={{color:'var(--text-3)',fontSize:12}}>{d.value} bets · <b style={{color:d.color}}>{d.pct}%</b></p>
                      </div>
                    );
                  }}/>
                </PieChart>
              </ResponsiveContainer>
            );
          })()}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px', marginTop:4 }}>
            {statusData.map((d,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div className="pulse-dot" style={{ width:8, height:8, borderRadius:'50%', backgroundColor:d.color, flexShrink:0, '--dot-color': d.color + '99' }}/>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>{d.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginLeft:'auto' }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bets */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border-subtle)' }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>Recente Bets</h2>
            <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Laatste {recent.length} weddenschappen</p>
          </div>
          <Link href="/bets" style={{ fontSize:12.5, color:'var(--brand)', textDecoration:'none', fontWeight:500 }}>Alle bets bekijken →</Link>
        </div>

        {/* Desktop table */}
        <div className="bets-table-desktop" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'9%' }}/>
              <col style={{ width:'10%' }}/>
              <col style={{ width:'12%' }}/>
              <col style={{ width:'10%' }}/>
              <col style={{ width:'14%' }}/>
              <col style={{ width:'7%' }}/>
              <col style={{ width:'8%' }}/>
              <col style={{ width:'11%' }}/>
              <col style={{ width:'7%' }}/>
              <col style={{ width:'12%' }}/>
            </colgroup>
            <thead>
              <tr className="bet-thead-row">
                {['Datum','Sport','Wedstrijd','Markt','Selectie','Odds','Inzet','Uitkomst','P&L','Bookmaker'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={10} style={{ padding:'40px', textAlign:'center', color:'var(--text-4)', fontSize:14 }}>Geen bets in deze periode</td></tr>
              )}
              {recent.map(bet => {
                const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
                return (
                  <tr key={bet.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                    <td style={{ padding:'13px 14px', fontSize:12.5, color:'var(--text-3)', whiteSpace:'nowrap', verticalAlign:'middle' }}>
                      {new Date(bet.datum).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'2-digit' })}
                    </td>
                    <td style={{ padding:'13px 14px', verticalAlign:'middle' }}>
                      <span style={{ padding:'3px 8px', borderRadius:5, fontSize:11, fontWeight:600, backgroundColor:'var(--badge-bg)', color:'var(--badge-color)', display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                        {sportEmoji(bet.sport)} {bet.sport}
                      </span>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:13, color:'var(--text-1)', fontWeight:600, verticalAlign:'middle', overflow:'hidden' }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bet.wedstrijd}</div>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:12.5, color:'var(--text-3)', verticalAlign:'middle', overflow:'hidden' }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bet.markt || '—'}</div>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:12.5, color:'var(--text-2)', verticalAlign:'middle', overflow:'hidden' }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bet.selectie || '—'}</div>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:13, color:'var(--text-1)', fontWeight:700, verticalAlign:'middle' }}>
                      {Number(bet.odds).toFixed(2)}
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:13, color:'var(--text-2)', verticalAlign:'middle', whiteSpace:'nowrap' }}>
                      €{Number(bet.inzet).toFixed(2)}
                    </td>
                    <td style={{ padding:'13px 14px', verticalAlign:'middle' }}>
                      <UitkomstBadge u={bet.uitkomst}/>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:13, fontWeight:700, color: bet.uitkomst==='lopend' ? 'var(--text-3)' : w >= 0 ? 'var(--color-win)' : 'var(--color-loss)', verticalAlign:'middle', whiteSpace:'nowrap' }}>
                      {bet.uitkomst === 'lopend' ? '—' : fmtPnl(w)}
                    </td>
                    <td style={{ padding:'13px 14px', verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <BookmakerIcon naam={bet.bookmaker} size={15}/>
                        <span style={{ fontSize:12.5, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bet.bookmaker}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="bets-cards-mobile" style={{ padding:'0 12px 12px' }}>
          {recent.length === 0 && <p style={{ padding:'24px', textAlign:'center', color:'var(--text-4)', fontSize:14 }}>Geen bets in deze periode</p>}
          {recent.map(bet => {
            const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
            return (
              <div key={bet.id} className="bet-card">
                <div className="bet-card-top">
                  <div className="bet-card-meta">
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text-4)' }}>{new Date(bet.datum).toLocaleDateString('nl-NL', { day:'numeric', month:'short' })}</span>
                    <span style={{ padding:'2px 7px', borderRadius:4, fontSize:10.5, fontWeight:600, backgroundColor:'var(--badge-bg)', color:'var(--badge-color)', display:'inline-flex', alignItems:'center', gap:3 }}>
                      {sportEmoji(bet.sport)} {bet.sport}
                    </span>
                  </div>
                  <UitkomstBadge u={bet.uitkomst}/>
                </div>
                <div className="bet-card-match">{bet.wedstrijd}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {bet.markt && <span className="bet-card-market">{bet.markt}</span>}
                  {bet.markt && bet.selectie && <span className="bet-card-market" style={{ color:'var(--border)' }}>·</span>}
                  {bet.selectie && <span className="bet-card-selection">{bet.selectie}</span>}
                </div>
                <div className="bet-card-numbers">
                  <div className="bet-card-num-cell"><span className="bet-card-num-label">Odds</span><span className="bet-card-num-value">{Number(bet.odds).toFixed(2)}</span></div>
                  <div className="bet-card-num-cell"><span className="bet-card-num-label">Inzet</span><span className="bet-card-num-value">€{Number(bet.inzet).toFixed(2)}</span></div>
                  <div className="bet-card-num-cell"><span className="bet-card-num-label">P&L</span><span className="bet-card-num-value" style={{ color: bet.uitkomst==='lopend' ? 'var(--text-3)' : w >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>{bet.uitkomst==='lopend' ? '—' : fmtPnl(w)}</span></div>
                </div>
                <div className="bet-card-bottom">
                  <div className="bet-card-bookmaker"><BookmakerIcon naam={bet.bookmaker} size={14}/>{bet.bookmaker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
