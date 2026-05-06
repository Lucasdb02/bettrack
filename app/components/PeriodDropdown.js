'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createPortal } from 'react-dom';

export const PERIOD_OPTIONS = [
  { label:'Vandaag',                filter:'today' },
  { label:'Gisteren',               filter:'yesterday' },
  { label:'Afgelopen 7 dagen',      filter:'last7' },
  { label:'Vorige week',            filter:'lastWeek' },
  { label:'Afgelopen 28 dagen',     filter:'last28' },
  { label:'Vorige maand',           filter:'lastMonth' },
  { label:'Deze maand',             filter:'thisMonth' },
  { label:'Dit jaar (vanaf 1 jan)', filter:'thisYear' },
  { label:'Afgelopen 3 maanden',    filter:'last3m' },
  { label:'Afgelopen 6 maanden',    filter:'last6m' },
  { label:'Vorig jaar',             filter:'lastYear' },
  { label:'Aangepaste periode',     filter:'custom' },
];

const NL_MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const NL_MONTHS_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const NL_DAYS = ['ma','di','wo','do','vr','za','zo'];

export function fmtDate(d) {
  return d ? `${d.getDate()} ${NL_MONTHS_SHORT[d.getMonth()]}` : '';
}

function Chevron({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, transition:'transform 0.15s', transform:open?'rotate(180deg)':'none' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function usePortalDropdown() {
  const btnRef  = useRef(null);
  const [open,    setOpen]    = useState(false);
  const [rect,    setRect]    = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [open]);

  return { btnRef, open, rect, mounted, toggle, close };
}

/* ── Calendar month grid ── */
function CalendarMonth({ year, month, fromDate, toDate, hoverDate, selecting, onDayClick, onDayHover }) {
  const { dark } = useTheme();
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const firstDow    = new Date(year, month, 1).getDay();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const headTxt    = dark ? 'var(--text-1)' : '#1a1f36';
  const dayHdrTxt  = dark ? 'var(--text-3)' : '#9ca3af';
  const dayTxt     = dark ? 'var(--text-1)' : '#1a1f36';
  const rangeColor = dark ? 'rgba(84,105,212,0.2)' : 'rgba(59,91,219,0.1)';
  const todayRing  = dark ? 'var(--brand)'  : '#1e3a8a';

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
          const isToday    = t === today.getTime();
          const isFrom     = fromDate && t === fromDate.getTime();
          const isTo       = toDate   && t === toDate.getTime();
          const rangeEnd   = (selecting === 'to' && hoverDate) ? hoverDate : toDate;
          const rangeMin   = fromDate && rangeEnd ? (fromDate <= rangeEnd ? fromDate : rangeEnd) : null;
          const rangeMax   = fromDate && rangeEnd ? (fromDate <= rangeEnd ? rangeEnd : fromDate) : null;
          const inRange    = rangeMin && rangeMax && t > rangeMin.getTime() && t < rangeMax.getTime();
          const isSelected = isFrom || isTo;
          return (
            <div key={t}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
              style={{
                textAlign:'center', lineHeight:'34px', height:34, fontSize:13, cursor:'pointer',
                fontWeight: isToday ? 700 : 400,
                borderRadius: isSelected ? 6 : inRange ? 6 : 4,
                backgroundColor: isSelected ? '#1e3a8a' : inRange ? rangeColor : 'transparent',
                color: isSelected ? '#fff' : dayTxt,
                outline: isToday && !isSelected ? `2px solid ${todayRing}` : 'none',
                outlineOffset: -2, transition:'background 0.1s',
              }}
            >{date.getDate()}</div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Date range modal ── */
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

  const rightMonth = navMonth;
  const rightYear  = navYear;
  const leftMonth  = navMonth === 0 ? 11 : navMonth - 1;
  const leftYear   = navMonth === 0 ? navYear - 1 : navYear;

  const [fromDate,  setFromDate]  = useState(initial?.from || null);
  const [toDate,    setToDate]    = useState(initial?.to   || null);
  const [selecting, setSelecting] = useState('from');
  const [hoverDate, setHoverDate] = useState(null);

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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color: headTxt }}>Aangepaste periode</h2>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${bdr}`, backgroundColor:'transparent', cursor:'pointer', color: mutedTxt, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
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
        <p style={{ fontSize:12.5, color: mutedTxt, marginBottom:16, textAlign:'center' }}>
          {!fromDate ? 'Klik op een startdatum' : !toDate ? 'Klik op een einddatum' : `${fmtDate(fromDate)} – ${fmtDate(toDate)}`}
        </p>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:7, border:`1px solid ${bdr}`, backgroundColor:'transparent', color: bodyTxt, fontSize:13, fontWeight:500, cursor:'pointer' }}>Annuleren</button>
          <button onClick={() => { if (canSave) { onSave({ from:fromDate, to:toDate }); onClose(); } }} disabled={!canSave}
            style={{ padding:'9px 22px', borderRadius:7, border:'none', backgroundColor: canSave ? 'var(--brand)' : (dark ? '#374151' : '#cbd5e1'), color:'#fff', fontSize:13, fontWeight:600, cursor: canSave ? 'pointer' : 'not-allowed' }}>
            Opslaan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main export ── */
export default function PeriodDropdown({ filter, onSelect, customRange, onCustomRange }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const [showCalendar, setShowCalendar] = useState(false);

  const isCustom     = filter === 'custom';
  const isNonDefault = filter !== 'all';

  const label = isCustom && customRange
    ? `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`
    : 'Periode';

  const handleSelect = (f) => {
    if (f === 'custom') { close(); setShowCalendar(true); return; }
    onSelect(f);
    close();
  };

  const dropBg    = dark ? 'var(--bg-card)'       : '#fff';
  const dropBdr   = dark ? 'var(--border)'        : '#e5e7eb';
  const divider   = dark ? 'var(--border-subtle)' : '#f3f4f6';
  const txtActive = dark ? 'var(--brand)'         : '#3b5bdb';
  const bgActive  = dark ? 'var(--bg-brand)'      : '#eef2ff';
  const txtDef    = dark ? 'var(--text-1)'        : '#1a1f36';
  const hoverBg   = dark ? 'var(--bg-subtle)'     : '#f9fafb';

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
          <div className="dropdown-panel" style={{
            position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex:9999,
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            overflow:'hidden', minWidth:220,
          }}>
            {PERIOD_OPTIONS.map(opt => {
              const isLast   = opt.filter === 'custom';
              const isActive = filter === opt.filter;
              return (
                <button key={opt.filter} onClick={() => handleSelect(opt.filter)} style={{
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

      {showCalendar && (
        <DateRangeModal
          initial={customRange}
          onSave={range => { onCustomRange(range); onSelect('custom'); }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  );
}

/* ── Single-day date picker ── */
export function SingleDatePicker({ value, onChange, style }) {
  const { dark } = useTheme();
  const [open, setOpen]       = useState(false);
  const [rect, setRect]       = useState(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const parsed = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const [navYear,  setNavYear]  = useState(() => parsed ? parsed.getFullYear()  : today.getFullYear());
  const [navMonth, setNavMonth] = useState(() => parsed ? parsed.getMonth()     : today.getMonth());

  const toggle = () => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [open]);

  const prev = () => { if (navMonth === 0) { setNavMonth(11); setNavYear(y => y - 1); } else setNavMonth(m => m - 1); };
  const next = () => { if (navMonth === 11) { setNavMonth(0); setNavYear(y => y + 1); } else setNavMonth(m => m + 1); };

  const handleDayClick = (date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    onChange(iso);
    close();
  };

  const label = parsed
    ? `${parsed.getDate()} ${NL_MONTHS_SHORT[parsed.getMonth()]} ${parsed.getFullYear()}`
    : 'Kies datum';

  const dropBg  = dark ? 'var(--bg-card)' : '#fff';
  const dropBdr = dark ? 'var(--border)'  : '#e5e7eb';
  const navBg   = dark ? 'var(--bg-subtle)' : '#f9fafb';
  const mutedTxt = dark ? 'var(--text-3)' : '#9ca3af';

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{
          display:'flex', alignItems:'center', gap:7,
          padding:'9px 10px', border:'1px solid var(--border)',
          borderRadius:7, fontSize:13, color:'var(--text-1)',
          backgroundColor:'var(--bg-input)', cursor:'pointer',
          whiteSpace:'nowrap', width:'fit-content', fontFamily:'inherit',
          ...style,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {label}
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{ position:'fixed', inset:0, zIndex:10001 }}/>
          <div style={{
            position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex:10002,
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            padding:'16px', minWidth:260,
          }}>
            {/* Month navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <button onClick={prev} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${dropBdr}`, backgroundColor: navBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={mutedTxt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontSize:14, fontWeight:600, color: dark ? 'var(--text-1)' : '#1a1f36' }}>
                {NL_MONTHS[navMonth]} {navYear}
              </span>
              <button onClick={next} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${dropBdr}`, backgroundColor: navBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={mutedTxt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <SingleCalendarMonth
              year={navYear} month={navMonth}
              selected={parsed}
              onDayClick={handleDayClick}
              dark={dark}
            />
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function SingleCalendarMonth({ year, month, selected, onDayClick, dark }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const firstDow    = new Date(year, month, 1).getDay();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const dayHdrTxt = dark ? 'var(--text-3)' : '#9ca3af';
  const dayTxt    = dark ? 'var(--text-1)' : '#1a1f36';
  const todayRing = dark ? 'var(--brand)'  : '#1e3a8a';

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
        {NL_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:10.5, fontWeight:700, color: dayHdrTxt, padding:'2px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`}/>;
          const t = date.getTime();
          const isToday    = t === today.getTime();
          const isSelected = selected && t === selected.getTime();
          return (
            <div key={t}
              onClick={() => onDayClick(date)}
              style={{
                textAlign:'center', lineHeight:'32px', height:32, fontSize:13, cursor:'pointer',
                fontWeight: isToday ? 700 : 400,
                borderRadius: 6,
                backgroundColor: isSelected ? '#1e3a8a' : 'transparent',
                color: isSelected ? '#fff' : dayTxt,
                outline: isToday && !isSelected ? `2px solid ${todayRing}` : 'none',
                outlineOffset: -2, transition:'background 0.1s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = dark ? 'rgba(84,105,212,0.2)' : 'rgba(59,91,219,0.1)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >{date.getDate()}</div>
          );
        })}
      </div>
    </div>
  );
}
