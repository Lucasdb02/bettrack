'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useFmt } from '../../context/PreferencesContext';
import { useTheme } from '../../context/ThemeContext';
import BookmakerIcon from '../../components/BookmakerIcon';
import { SPORTEN, sportEmoji, UITKOMSTEN, uitkomstConfig } from '../../lib/sports';
import TagInput, { TagChip } from '../../components/TagInput';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import PeriodDropdown, { SingleDatePicker } from '../../components/PeriodDropdown';
import { getDateRange } from '../../lib/dateUtils';

const MARKTEN = ['1X2','Asian Handicap','Over/Under','BTTS','Wedstrijd Winnaar','Handicap','Totaal Punten','Race Winnaar','Eerste Doelpuntenmaker','Overig'];
const BOOKMAKERS = ['bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',"Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino','Tonybet','Starcasino','888','Betnation','ComeOn','Overig'];

function UitkomstBadge({ value }) {
  const { dark } = useTheme();
  const cfg = uitkomstConfig(value);
  const bg        = dark ? cfg.darkBg        : cfg.bg;
  const border    = dark ? cfg.darkBorder    : cfg.border;
  const textColor = dark ? cfg.darkTextColor : cfg.textColor;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 600,
      background: bg, color: textColor, border: `1px solid ${border}`,
      whiteSpace: 'nowrap', lineHeight: '18px', width: 80, boxSizing: 'border-box',
    }}>
      {cfg.label}
    </span>
  );
}

const iStyle = {width:'100%',padding:'8px 12px',border:'1px solid var(--border)',borderRadius:7,fontSize:13.5,color:'var(--text-1)',backgroundColor:'var(--bg-input)',transition:'border-color 0.15s'};

function FF({label,required,children,text2}) {
  return (
    <div>
      <label style={{display:'block',fontSize:12.5,fontWeight:600,color:text2||'var(--text-2)',marginBottom:5}}>
        {label}{required&&<span style={{color:'#e02424',marginLeft:3}}>*</span>}
      </label>
      {children}
    </div>
  );
}

function EditBetModal({bet, onSave, onClose, saveError}) {
  const { dark } = useTheme();
  const bg = 'var(--bg-card)';
  const border = 'var(--border)';
  const text1 = 'var(--text-1)';
  const text2 = 'var(--text-2)';
  const text3 = 'var(--text-3)';
  const bgInput = 'var(--bg-input)';

  const [form, setForm] = useState({
    datum: bet.datum||'',
    sport: bet.sport||'Voetbal',
    wedstrijd: bet.wedstrijd||'',
    markt: bet.markt||'1X2',
    selectie: bet.selectie||'',
    odds: bet.odds||'',
    inzet: bet.inzet||'',
    uitkomst: bet.uitkomst||'lopend',
    bookmaker: bet.bookmaker||'bet365',
    notities: bet.notities||'',
    tags: bet.tags||[],
  });
  const [fouten, setFouten] = useState({});
  const [totaalUitbetaling, setTotaalUitbetaling] = useState(() => {
    if (bet.odds && bet.inzet) return (Number(bet.odds) * Number(bet.inzet)).toFixed(2);
    return '';
  });

  const set = (f, v) => { setForm(p=>({...p,[f]:v})); if(fouten[f]) setFouten(p=>({...p,[f]:undefined})); };

  const setWithCalc = (f, v) => {
    set(f, v);
    if (f === 'odds') {
      const o = Number(v), s = Number(form.inzet);
      if (o >= 1 && s > 0) setTotaalUitbetaling((o * s).toFixed(2));
    } else if (f === 'inzet') {
      const o = Number(form.odds), s = Number(v);
      if (o >= 1 && s > 0) setTotaalUitbetaling((o * s).toFixed(2));
    }
  };

  const handleTotaalChange = (v) => {
    setTotaalUitbetaling(v);
    const t = Number(v), s = Number(form.inzet);
    if (t > 0 && s > 0) {
      const newOdds = t / s;
      if (newOdds >= 1) set('odds', newOdds.toFixed(3));
    }
  };

  const valideer = () => {
    const e={};
    if(!form.wedstrijd.trim()) e.wedstrijd='Verplicht veld';
    if(!form.selectie.trim()) e.selectie='Verplicht veld';
    if(!form.odds||isNaN(Number(form.odds))||Number(form.odds)<1) e.odds='Voer geldige odds in (≥ 1.00)';
    if(!form.inzet||isNaN(Number(form.inzet))||Number(form.inzet)<=0) e.inzet='Voer een geldig bedrag in';
    return e;
  };

  const handleSave = () => {
    const err = valideer();
    if(Object.keys(err).length>0){setFouten(err);return;}
    onSave({
      ...form,
      odds: parseFloat(Number(form.odds).toFixed(3)),
      inzet: parseFloat(Number(form.inzet).toFixed(2)),
    });
  };

  useEffect(()=>{
    const h = e => { if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[onClose]);

  const pot = form.odds&&form.inzet&&!isNaN(Number(form.odds))&&!isNaN(Number(form.inzet))
    ? ((Number(form.odds)-1)*Number(form.inzet)).toFixed(2) : null;

  const iS = {width:'100%',padding:'8px 12px',border:`1px solid ${border}`,borderRadius:7,fontSize:13.5,color:text1,backgroundColor:bgInput,transition:'border-color 0.15s'};

  return createPortal(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:10000,backgroundColor:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{backgroundColor:bg,border:`1px solid ${border}`,borderRadius:12,width:'100%',maxWidth:640,boxShadow:'0 20px 60px rgba(0,0,0,0.4)',maxHeight:'90vh',overflowY:'auto'}}>
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,backgroundColor:bg,zIndex:1}}>
          <div>
            <h2 style={{fontSize:17,fontWeight:700,color:text1,marginBottom:2}}>Bet Bewerken</h2>
            <p style={{fontSize:12.5,color:text3}}>{bet.wedstrijd}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:text3,padding:6,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:20}}>
          {/* Wedstrijd info */}
          <div>
            <p style={{fontSize:11.5,fontWeight:700,color:text3,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:12}}>Wedstrijd Info</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <FF label="Datum" required text2={text2}>
                <SingleDatePicker value={form.datum} onChange={v=>set('datum',v)} style={{width:'100%',height:38,boxSizing:'border-box'}}/>
              </FF>
              <FF label="Sport" required text2={text2}>
                <select value={form.sport} onChange={e=>set('sport',e.target.value)} style={iS}>
                  {SPORTEN.map(s=><option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
                </select>
              </FF>
              <FF label="Wedstrijd" required text2={text2}>
                <input type="text" value={form.wedstrijd} onChange={e=>set('wedstrijd',e.target.value)} style={{...iS,borderColor:fouten.wedstrijd?'#e02424':border}}/>
                {fouten.wedstrijd&&<p style={{fontSize:11,color:'#e02424',marginTop:3}}>{fouten.wedstrijd}</p>}
              </FF>
              <FF label="Markt" required text2={text2}>
                <select value={form.markt} onChange={e=>set('markt',e.target.value)} style={iS}>
                  {MARKTEN.map(m=><option key={m}>{m}</option>)}
                </select>
              </FF>
            </div>
          </div>

          {/* Bet details */}
          <div>
            <p style={{fontSize:11.5,fontWeight:700,color:text3,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:12}}>Bet Details</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
              <div style={{gridColumn:'1/-1'}}>
                <FF label="Selectie" required text2={text2}>
                  <input type="text" value={form.selectie} onChange={e=>set('selectie',e.target.value)} style={{...iS,borderColor:fouten.selectie?'#e02424':border}}/>
                  {fouten.selectie&&<p style={{fontSize:11,color:'#e02424',marginTop:3}}>{fouten.selectie}</p>}
                </FF>
              </div>
              <FF label="Odds" required text2={text2}>
                <input type="number" step="0.001" min="1" value={form.odds} onChange={e=>setWithCalc('odds',e.target.value)} style={{...iS,borderColor:fouten.odds?'#e02424':border}}/>
                {fouten.odds&&<p style={{fontSize:11,color:'#e02424',marginTop:3}}>{fouten.odds}</p>}
              </FF>
              <FF label="Inzet (€)" required text2={text2}>
                <input type="number" step="0.01" min="0.01" value={form.inzet} onChange={e=>setWithCalc('inzet',e.target.value)} style={{...iS,borderColor:fouten.inzet?'#e02424':border}}/>
                {fouten.inzet&&<p style={{fontSize:11,color:'#e02424',marginTop:3}}>{fouten.inzet}</p>}
              </FF>
              <FF label="Totale uitbetaling (€)" text2={text2}>
                <input type="number" step="0.01" min="0" placeholder="Bijv. 105.00" value={totaalUitbetaling} onChange={e=>handleTotaalChange(e.target.value)} style={iS}/>
              </FF>
            </div>
            {pot&&(
              <div style={{marginTop:12,padding:'10px 14px',backgroundColor:dark?'rgba(84,105,212,0.15)':'#eff6ff',borderRadius:8,border:`1px solid ${dark?'rgba(84,105,212,0.3)':'#bfdbfe'}`,display:'flex',gap:20}}>
                <div><p style={{fontSize:10.5,color:text3,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>Potentiële winst</p><p style={{fontSize:15,fontWeight:700,color:'var(--color-win)'}}>+€{pot}</p></div>
                <div><p style={{fontSize:10.5,color:text3,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>Totale uitbetaling</p><p style={{fontSize:15,fontWeight:700,color:text1}}>€{(Number(form.odds)*Number(form.inzet)).toFixed(2)}</p></div>
              </div>
            )}
          </div>

          {/* Administratie */}
          <div>
            <p style={{fontSize:11.5,fontWeight:700,color:text3,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:12}}>Administratie</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <FF label="Bookmaker" required text2={text2}>
                <select value={form.bookmaker} onChange={e=>set('bookmaker',e.target.value)} style={iS}>
                  {BOOKMAKERS.map(b=><option key={b}>{b}</option>)}
                </select>
              </FF>
              <FF label="Uitkomst" text2={text2}>
                <select value={form.uitkomst} onChange={e=>set('uitkomst',e.target.value)} style={iS}>
                  {UITKOMSTEN.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </FF>
              <div style={{gridColumn:'1/-1'}}>
                <FF label="Tags" text2={text2}>
                  <TagInput tags={form.tags} onChange={v=>set('tags',v)} inputStyle={{border:`1px solid ${border}`,backgroundColor:bgInput,color:text1}}/>
                </FF>
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <FF label="Notities" text2={text2}>
                  <textarea value={form.notities} onChange={e=>set('notities',e.target.value)} rows={3} placeholder="Reden voor bet, vorm analyse, ..." style={{...iS,resize:'vertical',lineHeight:1.5}}/>
                </FF>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'16px 24px',borderTop:`1px solid ${border}`,position:'sticky',bottom:0,backgroundColor:bg}}>
          {saveError && (
            <p style={{fontSize:12.5,color:'#e02424',marginBottom:10,textAlign:'center'}}>{saveError}</p>
          )}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
            <button onClick={onClose} style={{padding:'8px 18px',border:`1px solid ${border}`,borderRadius:7,fontSize:13.5,fontWeight:600,color:text2,backgroundColor:bg,cursor:'pointer'}}>
              Annuleren
            </button>
            <button onClick={handleSave} className="btn-primary-glass" style={{padding:'8px 22px',fontSize:13.5,fontWeight:600,cursor:'pointer'}}>
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
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

function Chevron({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, transition:'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function SportSelectDropdown({ value, onChange, options }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const isFiltered = value !== 'alle';

  const dropBg  = dark ? 'var(--bg-card)' : '#fff';
  const dropBdr = dark ? 'var(--border)'  : '#e5e7eb';
  const txtActive = dark ? 'var(--brand)' : '#3b5bdb';
  const bgActive  = dark ? 'var(--bg-brand)' : '#eef2ff';
  const txtDef    = dark ? 'var(--text-1)' : '#1a1f36';
  const hoverBg   = dark ? 'var(--bg-subtle)' : '#f9fafb';
  const divider   = dark ? 'var(--border-subtle)' : '#f3f4f6';

  const label = isFiltered ? `${sportEmoji(value)} ${value}` : 'Sporten';

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:6,
        height:36, padding:'0 10px', border:`1px solid ${isFiltered?'var(--brand)':'var(--border)'}`,
        borderRadius:8, backgroundColor:'var(--bg-card)',
        color: isFiltered?'var(--brand)':'var(--text-2)',
        fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
        width:'100%', boxSizing:'border-box', overflow:'hidden',
      }}>
        <svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor" style={{flexShrink:0}}>
          <path d="M256.07-0.047C114.467-0.047-0.326,114.746-0.326,256.349S114.467,512.744,256.07,512.744s256.395-114.792,256.395-256.395S397.673-0.047,256.07-0.047z M466.667,224v0.064c-19.353,12.05-40.515,20.917-62.677,26.261c-4.595-68.333-27.183-134.234-65.472-191.019C406.956,88.198,455.48,150.56,466.667,224z M256,42.667c5.397,0,10.667,0.405,15.979,0.811c53.223,58.444,84.842,133.342,89.6,212.245c-29.153,0.997-58.199-4.013-85.333-14.72c-4.247-72.136-38.705-139.14-94.912-184.555C205.188,47.391,230.484,42.722,256,42.667z M138.389,78.187c20.041,13.069,37.744,29.41,52.373,48.341C126.816,169.409,77.017,230.285,47.659,301.461C28.668,215.422,64.766,126.591,138.389,78.187z M71.595,362.773c21.296-81.459,71.492-152.392,141.227-199.573c12.627,25.943,19.835,54.187,21.184,83.008c-58.22,44.242-94.81,111.213-100.587,184.107C108.191,412.512,87.102,389.474,71.595,362.773z M256,469.333c-27.6-0.008-54.934-5.399-80.469-15.872c-0.47-27.519,4.398-54.867,14.336-80.533c70.121,31.128,147.992,40.413,223.467,26.645C373.07,443.969,315.934,469.303,256,469.333z M209.067,334.72c13.523-20.959,30.63-39.373,50.539-54.4c30.156,12.194,62.363,18.515,94.891,18.624c39.574-0.004,78.615-9.129,114.091-26.667c-1.999,26.074-8.82,51.551-20.117,75.136C369.697,371.777,284.821,367.277,209.067,334.72z"/>
        </svg>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',flex:1,textAlign:'left'}}>{label}</span>
        {isFiltered && (
          <span onClick={e=>{e.stopPropagation();onChange('alle');}} style={{width:14,height:14,borderRadius:'50%',backgroundColor:'var(--brand)',color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</span>
        )}
        <Chevron open={open}/>
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{position:'fixed',inset:0,zIndex:9998}}/>
          <div className="dropdown-panel" style={{position:'fixed',top:rect.bottom+4,left:rect.left,zIndex:9999,backgroundColor:dropBg,border:`1px solid ${dropBdr}`,borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',minWidth:180,maxHeight:280,overflowY:'auto'}}>
            <button onClick={()=>{onChange('alle');close();}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',textAlign:'left',padding:'10px 16px',fontSize:14,fontWeight:value==='alle'?600:400,color:value==='alle'?txtActive:txtDef,backgroundColor:value==='alle'?bgActive:'transparent',border:'none',borderBottom:`1px solid ${divider}`,cursor:'pointer',transition:'background 0.1s'}}
              onMouseEnter={e=>{if(value!=='alle')e.currentTarget.style.backgroundColor=hoverBg;}}
              onMouseLeave={e=>{if(value!=='alle')e.currentTarget.style.backgroundColor='transparent';}}>
              Alle sporten
              {value==='alle'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={txtActive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            {options.map(opt=>(
              <button key={opt} onClick={()=>{onChange(opt);close();}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',textAlign:'left',padding:'10px 16px',fontSize:14,fontWeight:value===opt?600:400,color:value===opt?txtActive:txtDef,backgroundColor:value===opt?bgActive:'transparent',border:'none',cursor:'pointer',transition:'background 0.1s'}}
                onMouseEnter={e=>{if(value!==opt)e.currentTarget.style.backgroundColor=hoverBg;}}
                onMouseLeave={e=>{if(value!==opt)e.currentTarget.style.backgroundColor='transparent';}}>
                <span>{sportEmoji(opt)} {opt}</span>
                {value===opt&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={txtActive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function UitkomstSelectDropdown({ value, onChange }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const isFiltered = value !== 'alle';

  const dropBg  = dark ? 'var(--bg-card)' : '#fff';
  const dropBdr = dark ? 'var(--border)'  : '#e5e7eb';
  const txtActive = dark ? 'var(--brand)' : '#3b5bdb';
  const bgActive  = dark ? 'var(--bg-brand)' : '#eef2ff';
  const txtDef    = dark ? 'var(--text-1)' : '#1a1f36';
  const hoverBg   = dark ? 'var(--bg-subtle)' : '#f9fafb';
  const divider   = dark ? 'var(--border-subtle)' : '#f3f4f6';

  const selected = UITKOMSTEN.find(u => u.value === value);
  const label = isFiltered && selected ? selected.label : 'Uitkomsten';

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:6,
        height:36, padding:'0 10px', border:`1px solid ${isFiltered?'var(--brand)':'var(--border)'}`,
        borderRadius:8, backgroundColor:'var(--bg-card)',
        color: isFiltered?'var(--brand)':'var(--text-2)',
        fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
        width:'100%', boxSizing:'border-box', overflow:'hidden',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',flex:1,textAlign:'left'}}>{label}</span>
        {isFiltered && (
          <span onClick={e=>{e.stopPropagation();onChange('alle');}} style={{width:14,height:14,borderRadius:'50%',backgroundColor:'var(--brand)',color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</span>
        )}
        <Chevron open={open}/>
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{position:'fixed',inset:0,zIndex:9998}}/>
          <div className="dropdown-panel" style={{position:'fixed',top:rect.bottom+4,left:rect.left,zIndex:9999,backgroundColor:dropBg,border:`1px solid ${dropBdr}`,borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',minWidth:180,maxHeight:320,overflowY:'auto'}}>
            <button onClick={()=>{onChange('alle');close();}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',textAlign:'left',padding:'10px 16px',fontSize:14,fontWeight:value==='alle'?600:400,color:value==='alle'?txtActive:txtDef,backgroundColor:value==='alle'?bgActive:'transparent',border:'none',borderBottom:`1px solid ${divider}`,cursor:'pointer',transition:'background 0.1s'}}
              onMouseEnter={e=>{if(value!=='alle')e.currentTarget.style.backgroundColor=hoverBg;}}
              onMouseLeave={e=>{if(value!=='alle')e.currentTarget.style.backgroundColor='transparent';}}>
              Alle uitkomsten
              {value==='alle'&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={txtActive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            {UITKOMSTEN.map(u=>(
              <button key={u.value} onClick={()=>{onChange(u.value);close();}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',textAlign:'left',padding:'10px 16px',fontSize:14,fontWeight:value===u.value?600:400,color:value===u.value?txtActive:txtDef,backgroundColor:value===u.value?bgActive:'transparent',border:'none',cursor:'pointer',transition:'background 0.1s'}}
                onMouseEnter={e=>{if(value!==u.value)e.currentTarget.style.backgroundColor=hoverBg;}}
                onMouseLeave={e=>{if(value!==u.value)e.currentTarget.style.backgroundColor='transparent';}}>
                {u.label}
                {value===u.value&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={txtActive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function filterBetsByPeriod(bets, filter, customRange) {
  if (filter === 'all') return bets;
  if (filter === 'custom') {
    if (!customRange) return bets;
    const { from, to } = customRange;
    const end = new Date(to); end.setDate(end.getDate() + 1);
    return bets.filter(b => { const d = new Date(b.datum); return d >= from && d < end; });
  }
  const range = getDateRange(filter);
  if (!range) return bets;
  return bets.filter(b => { const d = new Date(b.datum); return d >= range.from && d < range.to; });
}

export default function BetsPage() {
  const { bets, deleteBet, updateBet, loaded } = useBets();
  const [filterU, setFilterU] = useState('alle');
  const [filterS, setFilterS] = useState('alle');
  const [filterT, setFilterT] = useState('alle');
  const [filterPeriod, setFilterPeriod] = useState('last28');
  const [customPeriodRange, setCustomPeriodRange] = useState(null);
  const [zoeken, setZoeken] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editBet, setEditBet] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>setMounted(true),[]);

  const sporten = useMemo(()=>['alle',...Array.from(new Set(bets.map(b=>b.sport))).sort()],[bets]);
  const allTags = useMemo(()=>Array.from(new Set(bets.flatMap(b=>b.tags||[]))).sort(),[bets]);
  const filtered = useMemo(()=>filterBetsByPeriod([...bets], filterPeriod, customPeriodRange)
    .filter(b=>filterU==='alle'||b.uitkomst===filterU)
    .filter(b=>filterS==='alle'||b.sport===filterS)
    .filter(b=>filterT==='alle'||(b.tags||[]).includes(filterT))
    .filter(b=>!zoeken||[b.wedstrijd,b.selectie,b.bookmaker,...(b.tags||[])].join(' ').toLowerCase().includes(zoeken.toLowerCase()))
    .sort((a,b)=>new Date(b.datum)-new Date(a.datum))
  ,[bets,filterU,filterS,filterT,filterPeriod,customPeriodRange,zoeken]);
  const totaal = useMemo(()=>filtered.filter(b=>b.uitkomst!=='lopend').reduce((s,b)=>s+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet)),0),[filtered]);

  const { fmtPnl } = useFmt();

  const [saveError, setSaveError] = useState(null);

  const handleSave = useCallback(async (updates) => {
    const ok = await updateBet(editBet.id, updates);
    if (ok) {
      setEditBet(null);
      setSaveError(null);
    } else {
      setSaveError('Opslaan mislukt. Controleer de console voor details.');
    }
  }, [editBet, updateBet]);

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{color:'var(--text-4)'}}>Laden...</div>;

  const sel = {padding:'7px 11px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-1)',backgroundColor:'var(--bg-card)',cursor:'pointer'};

  return (
    <div style={{ padding:'24px' }} className="app-page">
      <div className="flex items-center justify-between mb-4 page-header">
        <div><h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Bets Overzicht</h1><p style={{fontSize:14,color:'var(--text-3)'}}>{bets.length} bets in totaal</p></div>
        <Link href="/bets/new" className="btn-primary-glass" style={{padding:'9px 18px',fontSize:13.5,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:7,borderRadius:9}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Bet Invoeren
        </Link>
      </div>

      <div className="bet-filter-bar" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:20}}>
        {/* Search — hidden on mobile */}
        <div className="bets-search-wrap" style={{position:'relative',flex:1,minWidth:0}}>
          <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Zoeken..." value={zoeken} onChange={e=>setZoeken(e.target.value)} style={{width:'100%',height:36,padding:'0 12px 0 32px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-1)',backgroundColor:'var(--bg-card)',boxSizing:'border-box'}}/>
        </div>
        {/* Periode */}
        <div style={{flexShrink:0}}>
          <PeriodDropdown filter={filterPeriod} onSelect={setFilterPeriod} customRange={customPeriodRange} onCustomRange={setCustomPeriodRange}/>
        </div>
        {/* Sport */}
        <div style={{flexShrink:0}}>
          <SportSelectDropdown value={filterS} onChange={setFilterS} options={sporten.filter(s=>s!=='alle')}/>
        </div>
        {/* Uitkomst */}
        <div style={{flexShrink:0}}>
          <UitkomstSelectDropdown value={filterU} onChange={setFilterU}/>
        </div>
        {allTags.length > 0 && (
          <div className="bet-filter-extra" style={{position:'relative',flexShrink:0}}>
            <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',pointerEvents:'none',zIndex:1}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <select value={filterT} onChange={e=>setFilterT(e.target.value)} style={{height:36,paddingLeft:30,paddingRight:28,paddingTop:0,paddingBottom:0,border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-1)',backgroundColor:'var(--bg-card)',appearance:'none',WebkitAppearance:'none',cursor:'pointer',boxSizing:'border-box',fontFamily:'inherit'}}>
              <option value="alle">Alle tags</option>
              {allTags.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <svg style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',pointerEvents:'none'}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        )}
        {(filterU!=='alle'||filterS!=='alle'||filterT!=='alle'||zoeken)&&(
          <button className="bet-filter-extra" onClick={()=>{setFilterU('alle');setFilterS('alle');setFilterT('alle');setZoeken('');}} style={{height:36,padding:'0 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:12.5,color:'var(--text-3)',backgroundColor:'var(--bg-card)',cursor:'pointer',flexShrink:0,boxSizing:'border-box',whiteSpace:'nowrap'}}>Filters wissen</button>
        )}
      </div>

      <div style={{display:'flex',gap:20,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:13,color:'var(--text-3)'}}><strong style={{color:'var(--text-1)'}}>{filtered.length}</strong> bets gevonden</span>
        <span style={{fontSize:13,color:'var(--text-3)'}}>P&L gefilterd: <strong style={{color:totaal>=0?'var(--color-win)':'var(--color-loss)'}}>{fmtPnl(totaal)}</strong></span>
        <span className="bets-table-desktop" style={{fontSize:12,color:'var(--text-4)',marginLeft:'auto'}}>Dubbelklik op een rij om te bewerken</span>
      </div>

      {/* Desktop table */}
      <div className="bets-table-desktop table-scroll" style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr className="bet-thead-row">
              {['Datum','Sport','Wedstrijd','Markt','Selectie','Odds','Inzet','Uitkomst','P&L','Bookmaker',''].map(h=>(
                <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10.5,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap',borderBottom:'1px solid var(--border)'}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={10} style={{padding:'48px 24px',textAlign:'center',color:'var(--text-4)',fontSize:14}}>Geen bets gevonden.</td></tr>
            ) : filtered.map(bet => {
              const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
              return (
                <tr
                  key={bet.id}
                  className="bet-row"
                  style={{borderTop:'1px solid var(--border-subtle)',cursor:'pointer',verticalAlign:'middle'}}
                  onDoubleClick={()=>setEditBet(bet)}
                  title="Dubbelklik om te bewerken"
                >
                  <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',whiteSpace:'nowrap',verticalAlign:'middle'}}>
                    {new Date(bet.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'2-digit'})}
                  </td>
                  <td style={{padding:'11px 14px',fontSize:12.5,verticalAlign:'middle',whiteSpace:'nowrap'}}>
                    <span style={{padding:'2px 7px',borderRadius:4,fontSize:11,fontWeight:600,backgroundColor:'var(--badge-bg)',color:'var(--badge-color)',display:'inline-flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                      {sportEmoji(bet.sport)} {bet.sport}
                    </span>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-1)',fontWeight:500,maxWidth:160,verticalAlign:'middle'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.wedstrijd}</div>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',verticalAlign:'middle',maxWidth:120}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.markt}</div>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-2)',fontWeight:500,verticalAlign:'middle',maxWidth:160}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.selectie}</div>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-1)',fontWeight:700,verticalAlign:'middle'}}>{Number(bet.odds).toFixed(2)}</td>
                  <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-2)',verticalAlign:'middle'}}>€{Number(bet.inzet).toFixed(2)}</td>
                  <td style={{padding:'11px 14px',verticalAlign:'middle'}}>
                    <UitkomstBadge value={bet.uitkomst} />
                  </td>
                  <td style={{padding:'11px 14px',fontSize:13,fontWeight:700,color:bet.uitkomst==='lopend'?'var(--text-3)':w>=0?'var(--color-win)':'var(--color-loss)',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                    {bet.uitkomst==='lopend'?'—':fmtPnl(w)}
                  </td>
                  <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',verticalAlign:'middle'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <BookmakerIcon naam={bet.bookmaker} size={16}/>
                      {bet.bookmaker}
                    </div>
                  </td>
                  <td style={{padding:'11px 14px',verticalAlign:'middle'}} onClick={e=>e.stopPropagation()}>
                    {confirmDelete===bet.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={()=>{deleteBet(bet.id);setConfirmDelete(null);}} style={{padding:'3px 8px',backgroundColor:'#FB7185',color:'#fff',border:'none',borderRadius:4,fontSize:11,cursor:'pointer'}}>Verwijder</button>
                        <button onClick={()=>setConfirmDelete(null)} style={{padding:'3px 8px',backgroundColor:'var(--bg-subtle)',color:'var(--text-3)',border:'none',borderRadius:4,fontSize:11,cursor:'pointer'}}>Annuleer</button>
                      </div>
                    ) : (
                      <button onClick={()=>setConfirmDelete(bet.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--border)',padding:4}} title="Verwijder bet">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="bets-cards-mobile">
        {filtered.length===0 ? (
          <div style={{padding:'48px 0',textAlign:'center',color:'var(--text-4)',fontSize:14}}>Geen bets gevonden.</div>
        ) : filtered.map(bet => {
          const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
          return (
            <div key={bet.id} className="bet-card" onDoubleClick={()=>setEditBet(bet)}>
              {/* Top row: date + sport + uitkomst badge */}
              <div className="bet-card-top">
                <div className="bet-card-meta">
                  <span style={{fontSize:11,fontWeight:600,color:'var(--text-4)'}}>
                    {new Date(bet.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'})}
                  </span>
                  <span style={{padding:'2px 7px',borderRadius:4,fontSize:10.5,fontWeight:600,backgroundColor:'var(--badge-bg)',color:'var(--badge-color)',display:'inline-flex',alignItems:'center',gap:3}}>
                    {sportEmoji(bet.sport)} {bet.sport}
                  </span>
                </div>
                <UitkomstBadge value={bet.uitkomst} />
              </div>

              {/* Match + selection */}
              <div>
                <div className="bet-card-match">{bet.wedstrijd}</div>
                <div style={{display:'flex',gap:6,marginTop:3,flexWrap:'wrap'}}>
                  <span className="bet-card-market">{bet.markt}</span>
                  {bet.markt && bet.selectie && <span className="bet-card-market" style={{color:'var(--border)'}}>·</span>}
                  <span className="bet-card-selection">{bet.selectie}</span>
                </div>
              </div>

              {/* Odds / Inzet / P&L */}
              <div className="bet-card-numbers">
                <div className="bet-card-num-cell">
                  <span className="bet-card-num-label">Odds</span>
                  <span className="bet-card-num-value">{Number(bet.odds).toFixed(2)}</span>
                </div>
                <div className="bet-card-num-cell">
                  <span className="bet-card-num-label">Inzet</span>
                  <span className="bet-card-num-value">€{Number(bet.inzet).toFixed(2)}</span>
                </div>
                <div className="bet-card-num-cell">
                  <span className="bet-card-num-label">P&L</span>
                  <span className="bet-card-num-value" style={{color:bet.uitkomst==='lopend'?'var(--text-3)':w>=0?'var(--color-win)':'var(--color-loss)'}}>
                    {bet.uitkomst==='lopend'?'—':fmtPnl(w)}
                  </span>
                </div>
              </div>

              {/* Bottom: bookmaker + actions */}
              <div className="bet-card-bottom">
                <div className="bet-card-bookmaker">
                  <BookmakerIcon naam={bet.bookmaker} size={15}/>
                  <span>{bet.bookmaker}</span>
                </div>
                <div className="bet-card-actions" onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>setEditBet(bet)} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,cursor:'pointer',color:'var(--text-3)',padding:'4px 10px',fontSize:11.5,fontWeight:600}}>
                    Bewerken
                  </button>
                  {confirmDelete===bet.id ? (
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>{deleteBet(bet.id);setConfirmDelete(null);}} style={{padding:'4px 8px',backgroundColor:'#FB7185',color:'#fff',border:'none',borderRadius:5,fontSize:11,cursor:'pointer',fontWeight:600}}>Verwijder</button>
                      <button onClick={()=>setConfirmDelete(null)} style={{padding:'4px 8px',backgroundColor:'var(--bg-subtle)',color:'var(--text-3)',border:'none',borderRadius:5,fontSize:11,cursor:'pointer'}}>Annuleer</button>
                    </div>
                  ) : (
                    <button onClick={()=>setConfirmDelete(bet.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--border)',padding:4}} title="Verwijder bet">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mounted && editBet && (
        <EditBetModal
          bet={editBet}
          onSave={handleSave}
          onClose={()=>{setEditBet(null);setSaveError(null);}}
          saveError={saveError}
        />
      )}
    </div>
  );
}
