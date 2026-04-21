'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createPortal } from 'react-dom';

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

// selected = null  → all selected (Alle checked, no filter)
// selected = []    → nothing selected (nothing checked, no filter)
// selected = [..] → filter to these items
export default function MultiSelect({ label, icon, options, selected, onChange }) {
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
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            minWidth:190, maxHeight:280, overflowY:'auto',
          }}>
            {/* "Alle" master toggle — clicking when allSelected deselects all */}
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
