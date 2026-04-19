'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import BookmakerIcon from '../../components/BookmakerIcon';
import { SPORTEN, sportEmoji, UITKOMSTEN, uitkomstConfig } from '../../lib/sports';
import TagInput, { TagChip } from '../../components/TagInput';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

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
      whiteSpace: 'nowrap', lineHeight: '18px',
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

function EditBetModal({bet, onSave, onClose}) {
  const { dark } = useTheme();
  const bg = dark ? '#161c2a' : '#ffffff';
  const bgSection = dark ? '#1e2738' : '#f9fafb';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const text1 = dark ? '#e6edf3' : '#1a1f36';
  const text2 = dark ? '#c9d1d9' : '#374151';
  const text3 = dark ? '#8b949e' : '#6b7280';
  const bgInput = dark ? '#0d1117' : '#ffffff';

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
                <input type="date" value={form.datum} onChange={e=>set('datum',e.target.value)} style={iS}/>
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
        <div style={{padding:'16px 24px',borderTop:`1px solid ${border}`,display:'flex',justifyContent:'flex-end',gap:10,position:'sticky',bottom:0,backgroundColor:bg}}>
          <button onClick={onClose} style={{padding:'8px 18px',border:`1px solid ${border}`,borderRadius:7,fontSize:13.5,fontWeight:600,color:text2,backgroundColor:bg,cursor:'pointer'}}>
            Annuleren
          </button>
          <button onClick={handleSave} style={{padding:'8px 22px',background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',boxShadow:'0 2px 16px rgba(84,105,212,0.45)',borderRadius:7,fontSize:13.5,fontWeight:600,cursor:'pointer'}}>
            Opslaan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BetsPage() {
  const { bets, deleteBet, updateBet, loaded } = useBets();
  const [filterU, setFilterU] = useState('alle');
  const [filterS, setFilterS] = useState('alle');
  const [filterT, setFilterT] = useState('alle');
  const [zoeken, setZoeken] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editBet, setEditBet] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>setMounted(true),[]);

  const sporten = useMemo(()=>['alle',...Array.from(new Set(bets.map(b=>b.sport))).sort()],[bets]);
  const allTags = useMemo(()=>Array.from(new Set(bets.flatMap(b=>b.tags||[]))).sort(),[bets]);
  const filtered = useMemo(()=>[...bets]
    .filter(b=>filterU==='alle'||b.uitkomst===filterU)
    .filter(b=>filterS==='alle'||b.sport===filterS)
    .filter(b=>filterT==='alle'||(b.tags||[]).includes(filterT))
    .filter(b=>!zoeken||[b.wedstrijd,b.selectie,b.bookmaker,...(b.tags||[])].join(' ').toLowerCase().includes(zoeken.toLowerCase()))
    .sort((a,b)=>new Date(b.datum)-new Date(a.datum))
  ,[bets,filterU,filterS,filterT,zoeken]);
  const totaal = useMemo(()=>filtered.filter(b=>b.uitkomst!=='lopend').reduce((s,b)=>s+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet)),0),[filtered]);

  const { fmtPnl } = useFmt();

  const handleSave = useCallback((updates) => {
    updateBet(editBet.id, updates);
    setEditBet(null);
  }, [editBet, updateBet]);

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{color:'var(--text-4)'}}>Laden...</div>;

  const sel = {padding:'7px 12px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,color:'var(--text-1)',backgroundColor:'var(--bg-card)',cursor:'pointer'};

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px' }} className="app-page">
      <div className="flex items-center justify-between mb-6 page-header">
        <div><h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Bets Overzicht</h1><p style={{fontSize:14,color:'var(--text-3)'}}>{bets.length} bets in totaal</p></div>
        <Link href="/bets/new" style={{background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',padding:'9px 18px',borderRadius:7,fontSize:13.5,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:7,boxShadow:'0 2px 16px rgba(84,105,212,0.45)',border:'1px solid rgba(255,255,255,0.2)'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Bet Invoeren
        </Link>
      </div>

      <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 20px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Zoeken op wedstrijd, selectie of bookmaker..." value={zoeken} onChange={e=>setZoeken(e.target.value)} style={{width:'100%',padding:'7px 12px 7px 30px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,color:'var(--text-1)',backgroundColor:'var(--bg-input)'}}/>
        </div>
        <select value={filterS} onChange={e=>setFilterS(e.target.value)} style={sel}>
          <option value="alle">Alle sporten</option>
          {sporten.filter(s=>s!=='alle').map(s=><option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
        </select>
        <select value={filterU} onChange={e=>setFilterU(e.target.value)} style={sel}>
          <option value="alle">Alle uitkomsten</option>
          {UITKOMSTEN.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        {allTags.length > 0 && (
          <select value={filterT} onChange={e=>setFilterT(e.target.value)} style={sel}>
            <option value="alle">Alle tags</option>
            {allTags.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        )}
        {(filterU!=='alle'||filterS!=='alle'||filterT!=='alle'||zoeken)&&(
          <button onClick={()=>{setFilterU('alle');setFilterS('alle');setFilterT('alle');setZoeken('');}} style={{padding:'7px 12px',border:'1px solid var(--border)',borderRadius:6,fontSize:12.5,color:'var(--text-3)',backgroundColor:'var(--bg-card)',cursor:'pointer'}}>Filters wissen</button>
        )}
      </div>

      <div style={{display:'flex',gap:20,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:13,color:'var(--text-3)'}}><strong style={{color:'var(--text-1)'}}>{filtered.length}</strong> bets gevonden</span>
        <span style={{fontSize:13,color:'var(--text-3)'}}>P&L gefilterd: <strong style={{color:totaal>=0?'var(--color-win)':'var(--color-loss)'}}>{fmtPnl(totaal)}</strong></span>
        <span className="bets-table-desktop" style={{fontSize:12,color:'var(--text-4)',marginLeft:'auto'}}>Dubbelklik op een rij om te bewerken</span>
      </div>

      {/* Desktop table */}
      <div className="bets-table-desktop table-scroll" style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{backgroundColor:'var(--bg-subtle)'}}>
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
                    <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.wedstrijd}</div>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',verticalAlign:'middle',maxWidth:120}}>
                    <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.markt}</div>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-2)',fontWeight:500,verticalAlign:'middle',maxWidth:160}}>
                    <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.selectie}</div>
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
          onClose={()=>setEditBet(null)}
        />
      )}
    </div>
  );
}
