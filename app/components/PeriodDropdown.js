'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const firstDow    = new Date(year, month, 1).getDay();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;
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
                borderRadius: isSelected ? '50%' : inRange ? 0 : 4,
                backgroundColor: isSelected ? '#1e3a8a' : inRange ? 'rgba(59,91,219,0.1)' : 'transparent',
                color: isSelected ? '#fff' : '#1a1f36',
                outline: isToday && !isSelected ? '2px solid #1e3a8a' : 'none',
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
      else setToDate(date);
      setSelecting('from');
    }
  };

  const prev = () => { if (navMonth === 0) { setNavMonth(11); setNavYear(y => y-1); } else setNavMonth(m => m-1); };
  const next = () => { if (navMonth === 11) { setNavMonth(0);  setNavYear(y => y+1); } else setNavMonth(m => m+1); };
  const canSave = fromDate && toDate;

  return createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:99999, backgroundColor:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ backgroundColor:'#fff', borderRadius:12, padding:'28px 32px', width:640, maxWidth:'95vw', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#1a1f36' }}>Aangepaste periode</h2>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, border:'1px solid #e5e7eb', backgroundColor:'transparent', cursor:'pointer', color:'#6b7280', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <button onClick={prev} style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', backgroundColor:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex:1 }}/>
          <button onClick={next} style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', backgroundColor:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div style={{ display:'flex', gap:32, marginBottom:24 }} onMouseLeave={() => setHoverDate(null)}>
          <CalendarMonth year={leftYear}  month={leftMonth}  fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
          <div style={{ width:1, backgroundColor:'#f3f4f6' }}/>
          <CalendarMonth year={rightYear} month={rightMonth} fromDate={fromDate} toDate={toDate} hoverDate={hoverDate} selecting={selecting} onDayClick={handleDayClick} onDayHover={setHoverDate}/>
        </div>
        <p style={{ fontSize:12.5, color:'#9ca3af', marginBottom:20, textAlign:'center' }}>
          {!fromDate ? 'Klik op een startdatum' : !toDate ? 'Klik op een einddatum' : `${fmtDate(fromDate)} – ${fmtDate(toDate)}`}
        </p>
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

/* ── Main export ── */
export default function PeriodDropdown({ filter, onSelect, customRange, onCustomRange }) {
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
            {PERIOD_OPTIONS.map(opt => {
              const isLast = opt.filter === 'custom';
              return (
                <button key={opt.filter} onClick={() => handleSelect(opt.filter)} style={{
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
