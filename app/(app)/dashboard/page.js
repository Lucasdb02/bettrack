'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import BookmakerIcon, { BOOKIE_BRAND_COLORS } from '../../components/BookmakerIcon';
import { uitkomstConfig } from '../../lib/sports';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine,
} from 'recharts';
import { createClient } from '@/lib/supabase';

const FALLBACK_BOOK_COLORS = ['#5469d4','#0e9f6e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
function bookColor(naam, idx) {
  return BOOKIE_BRAND_COLORS[naam] ?? FALLBACK_BOOK_COLORS[idx % FALLBACK_BOOK_COLORS.length];
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
  const { dark } = useTheme();
  const { fmtPnl } = useFmt();
  if (!active || !payload?.length) return null;
  const bg = dark ? '#1c2335' : '#ffffff';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const textMuted = dark ? '#8b949e' : '#6b7280';
  const textSub = dark ? '#c9d1d9' : '#374151';
  const fmtVal = (v) => {
    if (typeof v !== 'number') return v;
    if (suffix === '%') return `${v >= 0 ? '+' : ''}${v}%`;
    return fmtPnl(v);
  };
  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius:8, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', fontSize:13, pointerEvents:'none' }}>
      <p style={{ color: textMuted, marginBottom:6, fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom: i<payload.length-1?3:0 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:p.color, flexShrink:0 }}/>
          <span style={{ color: textSub, fontSize:12 }}>{p.name}:</span>
          <span style={{ fontWeight:700, color:p.color }}>{fmtVal(p.value)}</span>
        </div>
      ))}
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

/* ─── Stat card ─── */
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'20px 24px' }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize:11.5, color:'var(--text-3)', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
          <p style={{ fontSize:26, fontWeight:700, color:color||'var(--text-1)', lineHeight:1 }}>{value}</p>
          {sub && <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:6 }}>{sub}</p>}
        </div>
        {icon && <div style={{ backgroundColor:'var(--bg-brand)', width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>}
      </div>
    </div>
  );
}

/* ─── uitkomst badge ─── */
function UitkomstBadge({ u }) {
  const { dark } = useTheme();
  const cfg = uitkomstConfig(u);
  const bg        = dark ? cfg.darkBg        : cfg.bg;
  const border    = dark ? cfg.darkBorder    : cfg.border;
  const textColor = dark ? cfg.darkTextColor : cfg.textColor;
  return <span style={{ display:'inline-flex', alignItems:'center', verticalAlign:'middle', background:bg, color:textColor, border:`1px solid ${border}`, padding:'2px 8px', borderRadius:4, fontSize:11.5, fontWeight:600, lineHeight:'18px', whiteSpace:'nowrap' }}>{cfg.label}</span>;
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
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const current = PERIOD_OPTIONS.find(o => o.filter === filter);
  const isCustom = filter === 'custom';
  const isNonDefault = filter !== 'all';

  const label = isCustom && customRange
    ? `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`
    : 'Periode';

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
            backgroundColor:'#fff', border:'1px solid #e5e7eb',
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            overflow:'hidden', minWidth:220,
          }}>
            {PERIOD_OPTIONS.map((opt, i) => {
              const isLast = opt.filter === 'custom';
              return (
                <button key={opt.filter} onClick={() => { onSelect(opt.filter); close(); }} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  width:'100%', textAlign:'left', padding:'10px 16px',
                  fontSize:14, fontWeight: filter === opt.filter ? 600 : 400,
                  color: filter === opt.filter ? '#3b5bdb' : '#1a1f36',
                  backgroundColor: filter === opt.filter ? '#eef2ff' : 'transparent',
                  border:'none', borderTop: isLast ? '1px solid #f3f4f6' : 'none',
                  marginTop: isLast ? 4 : 0,
                  cursor:'pointer', transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (filter !== opt.filter) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={e => { if (filter !== opt.filter) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  {opt.label}
                  {filter === opt.filter && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
function MultiSelect({ label, icon, options, selected, onChange }) {
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const count = selected.length;

  const toggleOpt = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  const clear = (e) => { e.stopPropagation(); onChange([]); };

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:7,
        padding:'7px 11px', border:`1px solid ${count > 0 ? 'var(--brand)' : 'var(--border)'}`,
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
            backgroundColor:'#fff', border:'1px solid #e5e7eb',
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            minWidth:180, maxHeight:240, overflowY:'auto',
          }}>
            <div style={{ padding:'6px 8px', borderBottom:'1px solid #f3f4f6' }}>
              <button onClick={() => onChange([])} style={{ width:'100%', textAlign:'left', padding:'5px 8px', fontSize:12, color:'#6b7280', backgroundColor:'transparent', border:'none', cursor:'pointer', borderRadius:4 }}>
                Alles deselecteren
              </button>
            </div>
            {options.map(opt => {
              const checked = selected.includes(opt);
              return (
                <button key={opt} onClick={() => toggleOpt(opt)} style={{
                  display:'flex', alignItems:'center', gap:9, width:'100%',
                  textAlign:'left', padding:'9px 16px', fontSize:13,
                  color: checked ? '#3b5bdb' : '#1a1f36',
                  backgroundColor: checked ? '#eef2ff' : 'transparent',
                  border:'none', cursor:'pointer', transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={e => { if (!checked) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div style={{ width:15, height:15, borderRadius:4, border:`2px solid ${checked ? '#3b5bdb' : '#d1d5db'}`, backgroundColor: checked ? '#3b5bdb' : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                  </div>
                  {opt}
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
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const firstDow = new Date(year, month, 1).getDay();
  const offset   = (firstDow === 0 ? 6 : firstDow - 1); // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ flex:1 }}>
      <p style={{ textAlign:'center', fontSize:15, fontWeight:600, color:'#1a1f36', marginBottom:12 }}>
        {NL_MONTHS[month]} {year}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {NL_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#9ca3af', padding:'3px 0' }}>{d}</div>)}
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
                borderRadius: isSelected ? '50%' : inRange ? 0 : 4,
                backgroundColor: isSelected ? '#1e3a8a' : inRange ? 'rgba(59,91,219,0.1)' : 'transparent',
                color: isSelected ? '#fff' : '#1a1f36',
                outline: isToday && !isSelected ? '2px solid #1e3a8a' : 'none',
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
  const today = new Date(); today.setHours(0,0,0,0);
  const [navMonth, setNavMonth] = useState(today.getMonth() > 0 ? today.getMonth() - 1 : 0);
  const [navYear,  setNavYear]  = useState(today.getMonth() > 0 ? today.getFullYear() : today.getFullYear() - 1);

  const leftMonth  = navMonth;
  const leftYear   = navYear;
  const rightMonth = (navMonth + 1) % 12;
  const rightYear  = navMonth === 11 ? navYear + 1 : navYear;

  const [fromDate,  setFromDate]  = useState(initial?.from || null);
  const [toDate,    setToDate]    = useState(initial?.to   || null);
  const [selecting, setSelecting] = useState('from');
  const [hoverDate, setHoverDate] = useState(null);

  const handleDayClick = (date) => {
    if (selecting === 'from' || !fromDate) {
      setFromDate(date); setToDate(null); setSelecting('to');
    } else {
      if (date < fromDate) { setToDate(fromDate); setFromDate(date); }
      else { setToDate(date); }
      setSelecting('from');
    }
  };

  const prev = () => { if (navMonth === 0) { setNavMonth(11); setNavYear(y => y-1); } else setNavMonth(m => m-1); };
  const next = () => { if (navMonth === 11) { setNavMonth(0);  setNavYear(y => y+1); } else setNavMonth(m => m+1); };

  const canSave = fromDate && toDate;

  return createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:99999, backgroundColor:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ backgroundColor:'#fff', borderRadius:12, padding:'28px 32px', width:640, maxWidth:'95vw', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#1a1f36' }}>Aangepaste periode</h2>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, border:'1px solid #e5e7eb', backgroundColor:'transparent', cursor:'pointer', color:'#6b7280', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Navigation */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <button onClick={prev} style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', backgroundColor:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex:1 }}/>
          <button onClick={next} style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', backgroundColor:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Two calendars */}
        <div style={{ display:'flex', gap:32, marginBottom:24 }} onMouseLeave={() => setHoverDate(null)}>
          <CalendarMonth year={leftYear}  month={leftMonth}  fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
          <div style={{ width:1, backgroundColor:'#f3f4f6' }}/>
          <CalendarMonth year={rightYear} month={rightMonth} fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
        </div>

        {/* Selection hint */}
        <p style={{ fontSize:12.5, color:'#9ca3af', marginBottom:20, textAlign:'center' }}>
          {!fromDate ? 'Klik op een startdatum' : !toDate ? 'Klik op een einddatum' : `${fmtDate(fromDate)} – ${fmtDate(toDate)}`}
        </p>

        {/* Actions */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:7, border:'1px solid #e5e7eb', backgroundColor:'transparent', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer' }}>Annuleren</button>
          <button onClick={() => { if (canSave) { onSave({ from:fromDate, to:toDate }); onClose(); } }} disabled={!canSave}
            style={{ padding:'9px 22px', borderRadius:7, border:'none', backgroundColor: canSave ? '#1e3a8a' : '#9ca3af', color:'#fff', fontSize:13, fontWeight:600, cursor: canSave ? 'pointer' : 'not-allowed' }}>
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

  const [periodFilter,  setPeriodFilter]  = useState('all');
  const [customRange,   setCustomRange]   = useState(null);
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [sportFilter,   setSportFilter]   = useState([]);
  const [bookFilter,    setBookFilter]    = useState([]);
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
    if (sportFilter.length) r = r.filter(b => sportFilter.includes(b.sport||'Onbekend'));
    if (bookFilter.length)  r = r.filter(b => bookFilter.includes(b.bookmaker||'Onbekend'));
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
      { name:'Won',         value:stats.wins,    color:'#11B981',  pct:pct(stats.wins)    },
      { name:'Lost',        value:stats.losses,  color:'#F43F5E', pct:pct(stats.losses)  },
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
    const map = {};
    [...filtered].filter(b => b.uitkomst !== 'lopend')
      .sort((a, b) => new Date(a.datum) - new Date(b.datum))
      .forEach(b => {
        const lbl = new Date(b.datum).toLocaleDateString('nl-NL', {day:'numeric', month:'short'});
        cumPnl   += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
        cumInzet += Number(b.inzet);
        if (['gewonnen','half_gewonnen'].includes(b.uitkomst))       cumW++;
        else if (['verloren','half_verloren'].includes(b.uitkomst))  cumL++;
        else if (['push','void','onbeslist'].includes(b.uitkomst))   cumP++;
        map[lbl] = {
          pnl:  parseFloat(cumPnl.toFixed(2)),
          roi:  cumInzet > 0 ? parseFloat((cumPnl / cumInzet * 100).toFixed(1)) : 0,
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

  const ic = 'var(--brand)';
  const empty = (h=220) => <div style={{height:h,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-4)',fontSize:14}}>Voeg bets toe om de grafiek te zien</div>;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px' }} className="app-page">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-header">
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:14, color:'var(--text-3)' }}>Overzicht van al je bets en resultaten</p>
        </div>
        {/* Bet Invoeren — alleen desktop */}
        <Link href="/bets/new" className="hidden md:flex" style={{ background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color:'#fff', padding:'9px 18px', borderRadius:7, fontSize:13.5, fontWeight:600, textDecoration:'none', alignItems:'center', gap:7, boxShadow:'0 2px 16px rgba(84,105,212,0.45)', border:'1px solid rgba(255,255,255,0.2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Bet Invoeren
        </Link>
        {/* Account icoon — alleen mobiel */}
        <Link href="/account" className="flex md:hidden" style={{ width:38, height:38, borderRadius:'50%', background:'rgba(84,105,212,0.2)', border:'1px solid rgba(123,158,240,0.3)', alignItems:'center', justifyContent:'center', textDecoration:'none', flexShrink:0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28, flexWrap:'wrap' }}>
        <PeriodDropdown filter={periodFilter} onSelect={handlePeriodSelect} customRange={customRange}/>

        <MultiSelect
          label="Sport"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
          options={allSporten} selected={sportFilter} onChange={setSportFilter}
        />
        <MultiSelect
          label="Bookmaker"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
          options={allBookmakers} selected={bookFilter} onChange={setBookFilter}
        />

        {(periodFilter !== 'all' || sportFilter.length > 0 || bookFilter.length > 0) && (
          <button onClick={() => { setPeriodFilter('all'); setCustomRange(null); setSportFilter([]); setBookFilter([]); }}
            style={{ fontSize:12, color:'var(--text-3)', backgroundColor:'transparent', border:'none', cursor:'pointer', textDecoration:'underline', padding:'4px' }}>
            Filters wissen
          </button>
        )}
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
      <div className="grid gap-4 mb-7 grid-4-to-2" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        <StatCard label="Totale P&L" value={fmtAmt(stats.totalWinst)} sub={`${stats.settled.length} afgeronde bets`} color={stats.totalWinst>=0?'var(--color-win)':'var(--color-loss)'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>}/>
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W — ${stats.losses}L${stats.pushes>0?` — ${stats.pushes}P`:''}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}/>
        <StatCard label="ROI" value={`${stats.roi>=0?'+':''}${stats.roi.toFixed(1)}%`} sub={`Totale inzet: €${stats.totalInzet.toFixed(0)}`} color={stats.roi>=0?'var(--color-win)':'var(--color-loss)'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><polyline points="18 9 13 14 8 9 3 14"/></svg>}/>
        <StatCard label="Record" value={`${stats.wins}-${stats.losses}-${stats.pushes}`} sub={`W — L — P  •  ${stats.settled.length} bets`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}/>
      </div>

      {/* Chart 1: Cumulative P&L */}
      {(() => {
        const hp       = hoverIdx !== null ? cumulData[hoverIdx] : null;
        const dispPnl  = hp ? hp.pnl  : stats.totalWinst;
        const dispRoi  = hp ? hp.roi  : stats.roi;
        const dispW    = hp ? hp.w    : stats.wins;
        const dispL    = hp ? hp.l    : stats.losses;
        const dispP    = hp ? hp.p    : stats.pushes;
        const pnlColor = dispPnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)';
        const roiColor = dispRoi >= 0 ? 'var(--color-win)' : 'var(--color-loss)';
        return (
          <div className="dash-chart-section" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24, marginBottom:24 }}>
            {/* Header row */}
            <div className="dash-chart-hdr" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              {/* Left: P&L + ROI */}
              <div>
                <p style={{ fontSize:11.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Cumulatieve P&L</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <span style={{ fontSize:28, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>{fmtPnl(dispPnl)}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:roiColor }}>{dispRoi >= 0 ? '+' : ''}{dispRoi.toFixed(1)}% ROI</span>
                </div>
              </div>
              {/* Right: Record */}
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:11.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Record</p>
                <span style={{ fontSize:28, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>{dispW}-{dispL}-{dispP}</span>
              </div>
            </div>
            {cumulData.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={cumulData}
                  margin={isMobile ? {top:5,right:0,left:0,bottom:0} : {top:5,right:10,left:0,bottom:0}}
                  tabIndex={-1}
                  onMouseMove={(e) => { if (e?.activeTooltipIndex !== undefined) setHoverIdx(e.activeTooltipIndex); }}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#5469d4" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#5469d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="datum" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={isMobile ? 42 : 55} mirror={isMobile}/>
                  <Tooltip
                    content={() => null}
                    cursor={{ stroke: 'var(--border)', strokeDasharray:'3 3', strokeWidth:1 }}
                  />
                  <Area type="monotone" dataKey="pnl" name="P&L" stroke="#5469d4" strokeWidth={2.5} fill="url(#pg)" dot={false} activeDot={{r:5,fill:'#5469d4',stroke:'#fff',strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : empty()}
          </div>
        );
      })()}

      {/* Charts: Dagelijkse P&L + Status Breakdown */}
      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
        <div className="dash-chart-section" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24 }}>
          <div className="dash-chart-hdr mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>Dagelijkse P&L per Bookmaker</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Gestapeld per bookmaker</p></div>
          {stackedData.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stackedData} margin={isMobile ? {top:5,right:0,left:0,bottom:0} : {top:5,right:10,left:0,bottom:0}} tabIndex={-1} barCategoryGap="30%" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="datum" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={isMobile ? 42 : 48} mirror={isMobile}/>
                <Tooltip content={<ChartTip/>} cursor={false} wrapperStyle={{zIndex:9999,background:"none",border:"none",padding:0,boxShadow:"none"}}/>
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1}/>
                <Legend content={<BookieLegend/>}/>
                {bookmakers.map((bk,i)=><Bar key={bk} dataKey={bk} fill={bookColor(bk,i)} fillOpacity={0.85} maxBarSize={20} radius={[3,3,0,0]}/>)}
              </BarChart>
            </ResponsiveContainer>
          ):empty()}
        </div>

        {/* Balance per bookmaker donut */}
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24, userSelect:'none' }}>
          {bookieBalanceData.length > 0 ? (() => {
            const total = bookieBalanceData.reduce((s,d)=>s+d.value,0);
            return (
              <>
                <div className="mb-5" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>Balance per Bookmaker</h2>
                    <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Huidige verdeling van je totale balance</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>Totale balance</p>
                    <p style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>€{total.toFixed(2)}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart style={{outline:'none'}} tabIndex={-1}>
                    <Pie data={bookieBalanceData} cx="50%" cy="45%" innerRadius={62} outerRadius={88}
                      dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                      {bookieBalanceData.map((entry,i) => <Cell key={i} fill={entry.color}/>)}
                      <Label content={({ viewBox }) => {
                        const cx = viewBox?.cx; const cy = viewBox?.cy;
                        if (!cx || !cy) return null;
                        return (
                          <g>
                            <text x={cx} y={cy-8} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--text-1)">€{total.toFixed(0)}</text>
                            <text x={cx} y={cy+14} textAnchor="middle" fontSize={12} fill="var(--text-3)">Totaal</text>
                          </g>
                        );
                      }} position="center"/>
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
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 16px', marginTop:4 }}>
                  {bookieBalanceData.map((d,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:d.color, flexShrink:0 }}/>
                      <BookmakerIcon naam={d.name} size={14}/>
                      <span style={{ fontSize:12, color:'var(--text-3)' }}>{d.name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginLeft:4 }}>€{d.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })() : (
            <>
              <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>Balance per Bookmaker</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Huidige verdeling van je totale balance</p></div>
              {empty()}
            </>
          )}
        </div>
      </div>

      {/* Cumulatieve P&L per Bookmaker */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24, marginBottom:24 }}>
        <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>Cumulatieve P&L per Bookmaker</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Hoe presteren je bookmakers over tijd?</p></div>
        {bookLineData.length>1?(
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bookLineData} margin={{top:5,right:10,left:0,bottom:0}} tabIndex={-1}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="datum" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={55}/>
              <Tooltip content={<ChartTip/>} cursor={false} wrapperStyle={{zIndex:9999,background:"none",border:"none",padding:0,boxShadow:"none"}}/>
              <Legend content={<BookieLegend/>}/>
              {bookmakers.map((bk,i)=><Line key={bk} type="monotone" dataKey={bk} stroke={bookColor(bk,i)} strokeWidth={2} dot={false} activeDot={{r:4,stroke:'#fff',strokeWidth:2}}/>)}
            </LineChart>
          </ResponsiveContainer>
        ):empty()}
      </div>

      {/* ROI + Balance per Bookmaker */}
      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24 }}>
          <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>ROI per Bookmaker</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Vergelijk prestaties per platform</p></div>
          {roiData.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roiData} layout="vertical" margin={{top:0,right:20,left:10,bottom:0}} tabIndex={-1}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <YAxis type="category" dataKey="bk" tick={(props) => <BookieYTick {...props} colorMap={Object.fromEntries(bookmakers.map((bk,i)=>[bk,bookColor(bk,i)]))}/>} axisLine={false} tickLine={false} width={96}/>
                <Tooltip content={<ChartTip prefix="" suffix="%"/>} cursor={false} wrapperStyle={{zIndex:9999,background:'none',border:'none',padding:0,boxShadow:'none'}}/>
                <Bar dataKey="roi" name="ROI" radius={[0,4,4,0]} maxBarSize={22}>
                  {roiData.map((e,i)=><Cell key={i} fill={e.roi>=0?bookColor(e.bk,i):'#F43F5E'} fillOpacity={0.85}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ):empty()}
        </div>

        {/* Status Breakdown donut */}
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:24, userSelect:'none' }}>
          <div className="mb-5"><h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>Status Breakdown</h2><p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Verdeling van alle bet statussen</p></div>
          {(() => {
            const total = statusData.reduce((s,d)=>s+d.value,0);
            const center = total > 0 ? [...statusData].sort((a,b)=>b.value-a.value)[0] : null;
            return (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart style={{outline:'none'}} tabIndex={-1}>
                  <Pie data={statusData.filter(d=>d.value>0).length>0 ? statusData : [{name:'Geen data',value:1,color:'var(--border)'}]}
                    cx="50%" cy="45%" innerRadius={62} outerRadius={88}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {statusData.map((entry,i) => <Cell key={i} fill={entry.color} opacity={entry.value===0?0.2:1}/>)}
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
                <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:d.color, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>{d.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginLeft:'auto' }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bets */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
        <div className="flex items-center justify-between" style={{padding:'18px 24px',borderBottom:'1px solid var(--border-subtle)'}}>
          <h2 style={{fontSize:15,fontWeight:600,color:'var(--text-1)'}}>Recente Bets</h2>
          <Link href="/bets" style={{fontSize:12.5,color:'var(--brand)',textDecoration:'none',fontWeight:500}}>Alle bets bekijken →</Link>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Datum','Wedstrijd','Selectie','Bookmaker','Odds','Inzet','Uitkomst','P&L'].map(h=><th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {recent.map(bet=>{
              const w=berekenWinst(bet.uitkomst,Number(bet.odds),Number(bet.inzet));
              return <tr key={bet.id} className="bet-row" style={{borderTop:'1px solid var(--border-subtle)',verticalAlign:'middle'}}>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-3)',whiteSpace:'nowrap'}}>{new Date(bet.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short'})}</td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-1)',fontWeight:500,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.wedstrijd}</td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{bet.selectie}</td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}><div style={{display:'flex',alignItems:'center',gap:6}}><BookmakerIcon naam={bet.bookmaker} size={15}/>{bet.bookmaker}</div></td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-1)',fontWeight:600}}>{Number(bet.odds).toFixed(2)}</td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>€{Number(bet.inzet).toFixed(2)}</td>
                <td style={{padding:'12px 16px'}}><UitkomstBadge u={bet.uitkomst}/></td>
                <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:bet.uitkomst==='lopend'?'var(--text-3)':w>=0?'var(--color-win)':'var(--color-loss)'}}>{bet.uitkomst==='lopend'?'—':fmtPnl(w)}</td>
              </tr>;
            })}
            {recent.length===0&&<tr><td colSpan={7} style={{padding:'32px',textAlign:'center',color:'var(--text-4)',fontSize:14}}>Geen bets in deze periode</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
