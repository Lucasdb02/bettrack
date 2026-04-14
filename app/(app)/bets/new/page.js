'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useBets, berekenWinst } from '../../../context/BetsContext';
import { SPORTEN, sportEmoji, UITKOMSTEN, uitkomstConfig } from '../../../lib/sports';
import TagInput from '../../../components/TagInput';
import BookmakerIcon from '../../../components/BookmakerIcon';
import { useTheme } from '../../../context/ThemeContext';

const MARKTEN = ['1X2','Asian Handicap','Over/Under','BTTS','Wedstrijd Winnaar','Handicap','Totaal Punten','Race Winnaar','Eerste Doelpuntenmaker','Overig'];
const BOOKMAKERS = ['bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',"Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino','Tonybet','Starcasino','888','Betnation','ComeOn','Overig'];
const today = () => new Date().toISOString().split('T')[0];
const LEEG = { datum:today(), sport:'Voetbal', wedstrijd:'', markt:'1X2', selectie:'', odds:'', inzet:'', uitkomst:'lopend', bookmaker:'bet365', notities:'', tags:[] };

const iStyle = { width:'100%', padding:'8px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:13.5, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function FF({ label, required, hint, children }) {
  return (
    <div>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>
        {label}{required && <span style={{color:'#FB7185',marginLeft:3}}>*</span>}
      </label>
      {children}
      {hint && <p style={{fontSize:11.5,color:'var(--text-4)',marginTop:4}}>{hint}</p>}
    </div>
  );
}

// ── API field mapping ──────────────────────────────────────────────────────────

// ── Normalise status → TrackMijnBets uitkomst ──────────────────────────────────────

function normalizeOutcome(status) {
  switch ((status || '').toLowerCase().trim()) {
    case 'won':        return 'gewonnen';
    case 'lost':       return 'verloren';
    case 'returned':   return 'push';
    case 'void':       return 'void';
    case 'cashed out': return 'lopend'; // treat cashout as settled-open for now
    case 'open':       return 'lopend';
    default:           return 'lopend';
  }
}

// ── Normalise datum string → YYYY-MM-DD ────────────────────────────────────────

function normDatum(raw) {
  if (!raw) return today();
  try {
    const d = new Date(raw);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  } catch {}
  return today();
}

// ── Deduplicate on composite key ───────────────────────────────────────────────

function makeBetKey(b) {
  return [b.bookmaker, b.selectie, b.wedstrijd, b.inzet, b.odds, b.uitkomst].join('|');
}

function dedupeBets(bets) {
  const seen = new Set();
  return bets.filter(b => {
    const key = makeBetKey(b);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Flatten API response and map to TrackMijnBets model ────────────────────────────

function flattenAndMap(data) {
  const imports = Array.isArray(data.imports) ? data.imports : [];
  const flat = imports.flatMap(importItem => {
    const bets = Array.isArray(importItem.bets) ? importItem.bets : [];
    return bets.map(bet => ({
      datum:     normDatum(importItem.receivedAt || importItem.date),
      bookmaker: importItem.bookmaker || bet.bookmaker || 'Overig',
      sport:     'Overig', // extension doesn't expose sport yet
      wedstrijd: bet.event || bet.selection || '',
      markt:     bet.market || bet.betType  || 'Overig',
      selectie:  bet.selection || '',
      odds:      parseFloat(bet.odds  ?? 1),
      inzet:     parseFloat(bet.stake ?? 0),
      uitkomst:  normalizeOutcome(bet.status),
      notities:  [
        bet.betType ? `Type: ${bet.betType}` : '',
        bet.payout  ? `Uitbetaling: €${bet.payout}` : '',
        bet.cashOut ? `Cashout: €${bet.cashOut}` : '',
        importItem.pageType ? `Bron: ${importItem.pageType}` : '',
      ].filter(Boolean).join(' · '),
      tags: [],
      _source: 'auto-import',
    }));
  });
  return dedupeBets(flat);
}

// ── Handmatig tab ─────────────────────────────────────────────────────────────

function HandmatigForm({ onSaved }) {
  const { addBet } = useBets();
  const router = useRouter();
  const [form, setForm] = useState(LEEG);
  const [fouten, setFouten] = useState({});
  const [opgeslagen, setOpgeslagen] = useState(false);

  const set = (f, v) => { setForm(p=>({...p,[f]:v})); if(fouten[f]) setFouten(p=>({...p,[f]:undefined})); };

  const valideer = () => {
    const e = {};
    if (!form.wedstrijd.trim()) e.wedstrijd = 'Verplicht veld';
    if (!form.selectie.trim())  e.selectie  = 'Verplicht veld';
    if (!form.odds || isNaN(Number(form.odds)) || Number(form.odds) < 1) e.odds = 'Voer geldige odds in (≥ 1.00)';
    if (!form.inzet || isNaN(Number(form.inzet)) || Number(form.inzet) <= 0) e.inzet = 'Voer een geldig bedrag in';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = valideer();
    if (Object.keys(err).length > 0) { setFouten(err); return; }
    addBet({ ...form, odds: parseFloat(Number(form.odds).toFixed(3)), inzet: parseFloat(Number(form.inzet).toFixed(2)) });
    setOpgeslagen(true);
    setTimeout(() => { setOpgeslagen(false); setForm(LEEG); router.push('/bets'); }, 1000);
  };

  const pot = form.odds && form.inzet && !isNaN(Number(form.odds)) && !isNaN(Number(form.inzet))
    ? ((Number(form.odds) - 1) * Number(form.inzet)).toFixed(2) : null;

  const sh = { fontSize:13.5, fontWeight:700, color:'var(--text-1)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.04em' };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',marginBottom:20}}>

        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border-subtle)'}}>
          <h2 style={sh}>Wedstrijd Info</h2>
          <div className="grid gap-4" style={{gridTemplateColumns:'1fr 1fr'}}>
            <FF label="Datum" required>
              <input type="date" value={form.datum} onChange={e=>set('datum',e.target.value)} style={iStyle}/>
            </FF>
            <FF label="Sport" required>
              <select value={form.sport} onChange={e=>set('sport',e.target.value)} style={iStyle}>
                {SPORTEN.map(s=><option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
              </select>
            </FF>
            <FF label="Wedstrijd" required>
              <input type="text" placeholder="bv. Ajax vs PSV" value={form.wedstrijd} onChange={e=>set('wedstrijd',e.target.value)} style={{...iStyle,borderColor:fouten.wedstrijd?'#FB7185':'var(--border)'}}/>
              {fouten.wedstrijd && <p style={{fontSize:11.5,color:'#FB7185',marginTop:4}}>{fouten.wedstrijd}</p>}
            </FF>
            <FF label="Markt" required>
              <select value={form.markt} onChange={e=>set('markt',e.target.value)} style={iStyle}>
                {MARKTEN.map(m=><option key={m}>{m}</option>)}
              </select>
            </FF>
          </div>
        </div>

        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border-subtle)'}}>
          <h2 style={sh}>Bet Details</h2>
          <div className="grid gap-4" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div style={{gridColumn:'1/2'}}>
              <FF label="Selectie" required hint="Wat bet je op?">
                <input type="text" placeholder="bv. Ajax, Over 2.5" value={form.selectie} onChange={e=>set('selectie',e.target.value)} style={{...iStyle,borderColor:fouten.selectie?'#FB7185':'var(--border)'}}/>
                {fouten.selectie && <p style={{fontSize:11.5,color:'#FB7185',marginTop:4}}>{fouten.selectie}</p>}
              </FF>
            </div>
            <FF label="Odds" required>
              <input type="number" step="0.001" min="1" placeholder="2.100" value={form.odds} onChange={e=>set('odds',e.target.value)} style={{...iStyle,borderColor:fouten.odds?'#FB7185':'var(--border)'}}/>
              {fouten.odds && <p style={{fontSize:11.5,color:'#FB7185',marginTop:4}}>{fouten.odds}</p>}
            </FF>
            <FF label="Inzet (€)" required>
              <input type="number" step="0.01" min="0.01" placeholder="50.00" value={form.inzet} onChange={e=>set('inzet',e.target.value)} style={{...iStyle,borderColor:fouten.inzet?'#FB7185':'var(--border)'}}/>
              {fouten.inzet && <p style={{fontSize:11.5,color:'#FB7185',marginTop:4}}>{fouten.inzet}</p>}
            </FF>
          </div>
          {pot && (
            <div style={{marginTop:16,padding:'12px 16px',backgroundColor:'var(--bg-brand)',borderRadius:8,border:'1px solid var(--brand-soft)',display:'flex',gap:20}}>
              <div><p style={{fontSize:11,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>Potentiële winst</p><p style={{fontSize:16,fontWeight:700,color:'var(--color-win)'}}>+€{pot}</p></div>
              <div><p style={{fontSize:11,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>Totale uitbetaling</p><p style={{fontSize:16,fontWeight:700,color:'var(--text-1)'}}>€{(Number(form.odds)*Number(form.inzet)).toFixed(2)}</p></div>
            </div>
          )}
        </div>

        <div style={{padding:'20px 24px'}}>
          <h2 style={sh}>Administratie</h2>
          <div className="grid gap-4" style={{gridTemplateColumns:'1fr 1fr'}}>
            <FF label="Bookmaker" required>
              <select value={form.bookmaker} onChange={e=>set('bookmaker',e.target.value)} style={iStyle}>
                {BOOKMAKERS.map(b=><option key={b}>{b}</option>)}
              </select>
            </FF>
            <FF label="Uitkomst">
              <select value={form.uitkomst} onChange={e=>set('uitkomst',e.target.value)} style={iStyle}>
                {UITKOMSTEN.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </FF>
            <div style={{gridColumn:'1/-1'}}>
              <FF label="Tags" hint="Gebruik tags om bets te categoriseren (bv. value bet, tipster, systeem)">
                <TagInput tags={form.tags} onChange={v=>set('tags',v)}/>
              </FF>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <FF label="Notities" hint="Optioneel — voeg extra context toe">
                <textarea placeholder="Reden voor bet, vorm analyse, ..." value={form.notities} onChange={e=>set('notities',e.target.value)} rows={3} style={{...iStyle,resize:'vertical',lineHeight:1.5}}/>
              </FF>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={()=>router.back()} style={{padding:'9px 18px',border:'1px solid var(--border)',borderRadius:7,fontSize:13.5,fontWeight:600,color:'var(--text-2)',backgroundColor:'var(--bg-card)',cursor:'pointer'}}>
          Annuleren
        </button>
        <button type="submit" style={{padding:'9px 24px',background:opgeslagen?'#11B981':'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',border:opgeslagen?'none':'1px solid rgba(255,255,255,0.12)',boxShadow:opgeslagen?'none':'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:7,fontSize:13.5,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.2s'}}>
          {opgeslagen
            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Opgeslagen!</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Bet Opslaan</>
          }
        </button>
      </div>
    </form>
  );
}

// ── Automatisch tab ───────────────────────────────────────────────────────────

function AutomatischImport() {
  const { replaceAutoImports, addScreenshotBets } = useBets();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | loading | preview | importing | done | error
  const [preview, setPreview] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [importCount, setImportCount] = useState(0);

  const ophalen = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/current-imports');
      if (!res.ok) throw new Error(`Server antwoordde met status ${res.status}`);
      const data = await res.json();
      const mapped = flattenAndMap(data);
      if (!mapped.length) throw new Error('Geen bets gevonden — controleer of de extension al bets heeft opgeslagen');
      setPreview(mapped);
      setSelected(new Set(mapped.map((_, i) => i)));
      setStatus('preview');
    } catch (err) {
      setErrorMsg(err.message || 'Verbinding mislukt');
      setStatus('error');
    }
  };

  const toggleAll = () => {
    if (selected.size === preview.length) setSelected(new Set());
    else setSelected(new Set(preview.map((_, i) => i)));
  };

  const toggle = (i) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const importeer = () => {
    setStatus('importing');
    const toImport = preview.filter((_, i) => selected.has(i));
    replaceAutoImports(toImport);
    setImportCount(toImport.length);
    setStatus('done');
    setTimeout(() => router.push('/bets'), 1500);
  };

  const updatePreview = (i, field, value) => {
    setPreview(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const uitkomstKleur = (u) => {
    if (u === 'gewonnen' || u === 'half_gewonnen') return '#34D399';
    if (u === 'verloren' || u === 'half_verloren') return '#FB7185';
    if (u === 'lopend') return 'var(--brand)';
    return 'var(--text-3)';
  };

  return (
    <div>
      {/* Instructie kaart */}
      <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'20px 24px',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:16}}>
          <div style={{width:40,height:40,borderRadius:9,backgroundColor:'var(--bg-brand)',border:'1px solid var(--brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)',marginBottom:4}}>Automatisch importeren via Chrome Extension</p>
            <p style={{fontSize:13,color:'var(--text-3)',lineHeight:1.6}}>
              Zorg dat je Chrome Extension actief is op <strong style={{color:'var(--text-2)'}}>localhost:3001</strong>. 
              Klik op "Bets ophalen" om alle bets op te halen en bekijk een preview voordat je importeert.
            </p>
          </div>
        </div>
      </div>

      {/* Idle state */}
      {status === 'idle' && (
        <div style={{textAlign:'center',padding:'48px 24px',backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10}}>
          <div style={{width:56,height:56,borderRadius:12,backgroundColor:'var(--bg-brand)',border:'1px solid var(--brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </div>
          <p style={{fontSize:15,fontWeight:600,color:'var(--text-1)',marginBottom:6}}>Klaar om te importeren</p>
          <p style={{fontSize:13,color:'var(--text-3)',marginBottom:24}}>Verbindt met je Chrome Extension API om bets op te halen</p>
          <button onClick={ophalen} style={{padding:'10px 28px',background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:7,fontSize:14,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Bets ophalen
          </button>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div style={{textAlign:'center',padding:'48px 24px',backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10}}>
          <div style={{width:40,height:40,border:'3px solid var(--border)',borderTopColor:'var(--brand)',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 0.8s linear infinite'}}/>
          <p style={{fontSize:14,color:'var(--text-3)'}}>Verbinding maken met localhost:3001…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <div style={{padding:'16px 20px',borderRadius:9,backgroundColor:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',marginBottom:20}}>
            <p style={{fontSize:14,fontWeight:700,color:'#FB7185',marginBottom:4}}>Verbinding mislukt</p>
            <p style={{fontSize:13,color:'var(--text-3)'}}>{errorMsg}</p>
          </div>
          <div style={{fontSize:13,color:'var(--text-3)',marginBottom:20,lineHeight:1.7}}>
            <p style={{fontWeight:600,color:'var(--text-2)',marginBottom:8}}>Controleer het volgende:</p>
            <ul style={{paddingLeft:18,display:'flex',flexDirection:'column',gap:4}}>
              <li>Is de Chrome Extension actief?</li>
              <li>Draait de lokale server op poort 3001?</li>
              <li>Staat CORS ingeschakeld in de extension API?</li>
            </ul>
          </div>
          <button onClick={ophalen} style={{padding:'9px 20px',background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:7,fontSize:13.5,fontWeight:600,cursor:'pointer'}}>
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Preview */}
      {status === 'preview' && (
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
          {/* Header */}
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)'}}>Preview — {preview.length} bets gevonden</p>
              <p style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{selected.size} van {preview.length} geselecteerd voor import · Velden zijn bewerkbaar</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={ophalen} style={{padding:'7px 14px',border:'1px solid var(--border)',borderRadius:6,fontSize:12.5,fontWeight:600,color:'var(--text-2)',backgroundColor:'var(--bg-card)',cursor:'pointer'}}>
                Vernieuwen
              </button>
              <button
                onClick={importeer}
                disabled={selected.size === 0}
                style={{padding:'7px 20px',background:selected.size===0?'var(--bg-subtle)':'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:selected.size===0?'var(--text-4)':'#fff',border:selected.size===0?'1px solid var(--border)':'1px solid rgba(255,255,255,0.12)',boxShadow:selected.size===0?'none':'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:6,fontSize:13,fontWeight:600,cursor:selected.size===0?'default':'pointer',display:'flex',alignItems:'center',gap:6,transition:'all 0.15s'}}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Importeer {selected.size > 0 ? `${selected.size} bets` : ''}
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div style={{display:'grid',gridTemplateColumns:'36px 0.7fr 1fr 68px 74px 118px 100px 110px',gap:0,backgroundColor:'var(--bg-subtle)',borderBottom:'1px solid var(--border)',padding:'0 4px'}}>
            <div style={{padding:'8px 10px',display:'flex',alignItems:'center'}}>
              <input type="checkbox" checked={selected.size===preview.length} onChange={toggleAll} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--brand)'}}/>
            </div>
            {['Wedstrijd','Selectie','Odds','Inzet','Uitkomst','Bookmaker','Sport'].map(h=>(
              <div key={h} style={{padding:'8px 6px',fontSize:10.5,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</div>
            ))}
          </div>

          {/* Editable rows */}
          <div>
            {preview.map((bet, i) => {
              const ef = { // editable field style
                width:'100%', padding:'5px 7px', fontSize:12.5, color:'var(--text-1)',
                backgroundColor:'transparent', border:'1px solid transparent', borderRadius:5,
                transition:'border-color 0.1s, background-color 0.1s',
              };
              const isSelected = selected.has(i);
              return (
                <div key={i} style={{borderTop:'1px solid var(--border-subtle)',opacity:isSelected?1:0.45,transition:'opacity 0.15s',padding:'2px 4px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'36px 0.7fr 1fr 68px 74px 118px 100px 110px',gap:0,alignItems:'center'}}>
                    {/* Checkbox */}
                    <div style={{padding:'8px 10px'}}>
                      <input type="checkbox" checked={isSelected} onChange={()=>toggle(i)} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--brand)'}}/>
                    </div>
                    {/* Wedstrijd */}
                    <div style={{padding:'4px 2px'}}>
                      <input
                        value={bet.wedstrijd} onChange={e=>updatePreview(i,'wedstrijd',e.target.value)}
                        style={ef} placeholder="Wedstrijd"
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      />
                      <div style={{fontSize:10.5,color:'var(--text-4)',paddingLeft:7,marginTop:1}}>{bet.datum}</div>
                    </div>
                    {/* Selectie */}
                    <div style={{padding:'4px 2px'}}>
                      <input
                        value={bet.selectie} onChange={e=>updatePreview(i,'selectie',e.target.value)}
                        style={ef} placeholder="Selectie"
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      />
                      <div style={{fontSize:10.5,color:'var(--text-4)',paddingLeft:7,marginTop:1}}>{bet.markt}</div>
                    </div>
                    {/* Odds */}
                    <div style={{padding:'4px 2px'}}>
                      <input
                        type="number" step="0.01" min="1" value={bet.odds}
                        onChange={e=>updatePreview(i,'odds',parseFloat(e.target.value)||1)}
                        style={{...ef,fontWeight:600}}
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      />
                    </div>
                    {/* Inzet */}
                    <div style={{padding:'4px 2px'}}>
                      <input
                        type="number" step="0.01" min="0" value={bet.inzet}
                        onChange={e=>updatePreview(i,'inzet',parseFloat(e.target.value)||0)}
                        style={ef}
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      />
                    </div>
                    {/* Uitkomst */}
                    <div style={{padding:'4px 2px'}}>
                      <select
                        value={bet.uitkomst} onChange={e=>updatePreview(i,'uitkomst',e.target.value)}
                        style={{...ef,cursor:'pointer',color:uitkomstKleur(bet.uitkomst),fontWeight:600}}
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      >
                        {UITKOMSTEN.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </div>
                    {/* Bookmaker */}
                    <div style={{padding:'4px 2px'}}>
                      <select
                        value={BOOKMAKERS.includes(bet.bookmaker)?bet.bookmaker:'Overig'}
                        onChange={e=>updatePreview(i,'bookmaker',e.target.value)}
                        style={{...ef,cursor:'pointer'}}
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      >
                        {BOOKMAKERS.map(b=><option key={b}>{b}</option>)}
                      </select>
                    </div>
                    {/* Sport */}
                    <div style={{padding:'4px 2px'}}>
                      <select
                        value={bet.sport} onChange={e=>updatePreview(i,'sport',e.target.value)}
                        style={{...ef,cursor:'pointer'}}
                        onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.backgroundColor='var(--bg-input)';}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.backgroundColor='transparent';}}
                      >
                        {SPORTEN.map(s=><option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done */}
      {(status === 'done' || status === 'importing') && (
        <div style={{textAlign:'center',padding:'48px 24px',backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10}}>
          <div style={{width:56,height:56,borderRadius:'50%',backgroundColor:'rgba(17,185,129,0.15)',border:'1px solid rgba(17,185,129,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#11B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{fontSize:16,fontWeight:700,color:'var(--text-1)',marginBottom:6}}>{importCount} bets geïmporteerd!</p>
          <p style={{fontSize:13,color:'var(--text-3)'}}>Je wordt doorgestuurd naar het overzicht…</p>
        </div>
      )}
    </div>
  );
}

// ── Edit modal for screenshot preview rows ────────────────────────────────────

function EditPreviewModal({ bet, onSave, onClose }) {
  const { dark } = useTheme();
  const bg       = dark ? '#161c2a' : '#ffffff';
  const border   = dark ? '#2a3347' : '#e5e7eb';
  const text1    = dark ? '#e6edf3' : '#1a1f36';
  const text2    = dark ? '#c9d1d9' : '#374151';
  const text3    = dark ? '#8b949e' : '#6b7280';
  const bgInput  = dark ? '#0d1117' : '#ffffff';

  const [form, setForm] = useState({ ...bet });
  const [fouten, setFouten] = useState({});
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (fouten[f]) setFouten(p => ({ ...p, [f]: undefined })); };

  const valideer = () => {
    const e = {};
    if (!form.wedstrijd?.trim()) e.wedstrijd = 'Verplicht veld';
    if (!form.selectie?.trim())  e.selectie  = 'Verplicht veld';
    if (!form.odds || isNaN(Number(form.odds)) || Number(form.odds) < 1) e.odds = 'Voer geldige odds in (≥ 1.00)';
    if (!form.inzet || isNaN(Number(form.inzet)) || Number(form.inzet) <= 0) e.inzet = 'Voer een geldig bedrag in';
    return e;
  };

  const handleSave = () => {
    const err = valideer();
    if (Object.keys(err).length > 0) { setFouten(err); return; }
    onSave({ ...form, odds: parseFloat(Number(form.odds).toFixed(3)), inzet: parseFloat(Number(form.inzet).toFixed(2)) });
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const pot = form.odds && form.inzet && !isNaN(Number(form.odds)) && !isNaN(Number(form.inzet))
    ? ((Number(form.odds) - 1) * Number(form.inzet)).toFixed(2) : null;

  const iS = { width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 7, fontSize: 13.5, color: text1, backgroundColor: bgInput, transition: 'border-color 0.15s' };

  const FField = ({ label, required, children }) => (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: text2, marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#e02424', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 12, width: '100%', maxWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: bg, zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 2 }}>Bet Bewerken</h2>
            <p style={{ fontSize: 12.5, color: text3 }}>{bet.wedstrijd || 'Nieuwe bet'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: text3, padding: 6, display: 'flex', borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Wedstrijd info */}
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Wedstrijd Info</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FField label="Datum" required><input type="date" value={form.datum} onChange={e => set('datum', e.target.value)} style={iS}/></FField>
              <FField label="Sport" required>
                <select value={form.sport} onChange={e => set('sport', e.target.value)} style={iS}>
                  {SPORTEN.map(s => <option key={s} value={s}>{sportEmoji(s)} {s}</option>)}
                </select>
              </FField>
              <FField label="Wedstrijd" required>
                <input type="text" value={form.wedstrijd} onChange={e => set('wedstrijd', e.target.value)} style={{ ...iS, borderColor: fouten.wedstrijd ? '#e02424' : border }}/>
                {fouten.wedstrijd && <p style={{ fontSize: 11, color: '#e02424', marginTop: 3 }}>{fouten.wedstrijd}</p>}
              </FField>
              <FField label="Markt" required>
                <select value={form.markt} onChange={e => set('markt', e.target.value)} style={iS}>
                  {MARKTEN.map(m => <option key={m}>{m}</option>)}
                </select>
              </FField>
            </div>
          </div>

          {/* Bet details */}
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Bet Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/2' }}>
                <FField label="Selectie" required>
                  <input type="text" value={form.selectie} onChange={e => set('selectie', e.target.value)} style={{ ...iS, borderColor: fouten.selectie ? '#e02424' : border }}/>
                  {fouten.selectie && <p style={{ fontSize: 11, color: '#e02424', marginTop: 3 }}>{fouten.selectie}</p>}
                </FField>
              </div>
              <FField label="Odds" required>
                <input type="number" step="0.001" min="1" value={form.odds} onChange={e => set('odds', e.target.value)} style={{ ...iS, borderColor: fouten.odds ? '#e02424' : border }}/>
                {fouten.odds && <p style={{ fontSize: 11, color: '#e02424', marginTop: 3 }}>{fouten.odds}</p>}
              </FField>
              <FField label="Inzet (€)" required>
                <input type="number" step="0.01" min="0.01" value={form.inzet} onChange={e => set('inzet', e.target.value)} style={{ ...iS, borderColor: fouten.inzet ? '#e02424' : border }}/>
                {fouten.inzet && <p style={{ fontSize: 11, color: '#e02424', marginTop: 3 }}>{fouten.inzet}</p>}
              </FField>
            </div>
            {pot && (
              <div style={{ marginTop: 12, padding: '10px 14px', backgroundColor: dark ? 'rgba(84,105,212,0.15)' : '#eff6ff', borderRadius: 8, border: `1px solid ${dark ? 'rgba(84,105,212,0.3)' : '#bfdbfe'}`, display: 'flex', gap: 20 }}>
                <div><p style={{ fontSize: 10.5, color: text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Potentiële winst</p><p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-win)' }}>+€{pot}</p></div>
                <div><p style={{ fontSize: 10.5, color: text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Totale uitbetaling</p><p style={{ fontSize: 15, fontWeight: 700, color: text1 }}>€{(Number(form.odds) * Number(form.inzet)).toFixed(2)}</p></div>
              </div>
            )}
          </div>

          {/* Administratie */}
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Administratie</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FField label="Bookmaker" required>
                <select value={form.bookmaker} onChange={e => set('bookmaker', e.target.value)} style={iS}>
                  {BOOKMAKERS.map(b => <option key={b}>{b}</option>)}
                </select>
              </FField>
              <FField label="Uitkomst">
                <select value={form.uitkomst} onChange={e => set('uitkomst', e.target.value)} style={iS}>
                  {UITKOMSTEN.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </FField>
              <div style={{ gridColumn: '1/-1' }}>
                <FField label="Notities">
                  <textarea value={form.notities} onChange={e => set('notities', e.target.value)} rows={3} placeholder="Reden voor bet, vorm analyse, ..." style={{ ...iS, resize: 'vertical', lineHeight: 1.5 }}/>
                </FField>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', gap: 10, position: 'sticky', bottom: 0, backgroundColor: bg }}>
          <button onClick={onClose} style={{ padding: '8px 18px', border: `1px solid ${border}`, borderRadius: 7, fontSize: 13.5, fontWeight: 600, color: text2, backgroundColor: bg, cursor: 'pointer' }}>Annuleren</button>
          <button onClick={handleSave} style={{ padding: '8px 22px', background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)', borderRadius: 7, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Opslaan</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Screenshot tab ───────────────────────────────────────────────────────────

function ScreenshotImport() {
  const { addScreenshotBets } = useBets();
  const { dark } = useTheme();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | analysing | preview | done | error
  const [preview, setPreview] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [importCount, setImportCount] = useState(0);
  const [imgUrl, setImgUrl] = useState(null);
  const [editIdx, setEditIdx] = useState(null);

  const uitkomstKleur = (u) => {
    if (u === 'gewonnen' || u === 'half_gewonnen') return '#34D399';
    if (u === 'verloren' || u === 'half_verloren') return '#FB7185';
    if (u === 'lopend') return 'var(--brand)';
    return 'var(--text-3)';
  };

  // Resize image client-side to max 1568px and convert to JPEG to stay well under Anthropic's limits
  const resizeImage = (file) => new Promise((resolve, reject) => {
    const MAX = 1568;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Afbeelding kon niet worden verkleind.')); return; }
        resolve(new File([blob], 'screenshot.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Afbeelding kon niet worden geladen.')); };
    img.src = url;
  });

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Alleen afbeeldingen zijn toegestaan (PNG, JPG, WEBP).');
      setStatus('error');
      return;
    }
    // Show original as preview thumbnail, then resize for upload
    setImgUrl(URL.createObjectURL(file));
    setStatus('analysing');
    setErrorMsg('');

    try {
      const resized = await resizeImage(file);
      const fd = new FormData();
      fd.append('image', resized);

      const res = await fetch('/api/parse-screenshot', { method: 'POST', body: fd });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch {
        throw new Error(`Server fout (${res.status}) — probeer opnieuw.`);
      }
      if (!res.ok) throw new Error(json.error || `Status ${res.status}`);
      if (!json.bets.length) throw new Error('Geen bets herkend in de afbeelding. Probeer een duidelijkere screenshot.');
      setPreview(json.bets);
      setSelected(new Set(json.bets.map((_, i) => i)));
      setStatus('preview');
    } catch (err) {
      setErrorMsg(err.message || 'Er is een fout opgetreden.');
      setStatus('error');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setPreview([]);
    setSelected(new Set());
    setStatus('idle');
    setErrorMsg('');
  };

  const toggleAll = () => {
    if (selected.size === preview.length) setSelected(new Set());
    else setSelected(new Set(preview.map((_, i) => i)));
  };

  const toggle = (i) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const updatePreview = (i, field, value) => {
    setPreview(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const importeer = () => {
    const toImport = preview.filter((_, i) => selected.has(i));
    addScreenshotBets(toImport);
    setImportCount(toImport.length);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setStatus('done');
    setTimeout(() => router.push('/bets'), 1500);
  };

  const ef = {
    width: '100%', padding: '5px 7px', fontSize: 12.5, color: 'var(--text-1)',
    backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: 5,
    transition: 'border-color 0.1s, background-color 0.1s',
  };

  return (
    <div>
      {/* Instructie kaart */}
      <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'20px 24px',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:16}}>
          <div style={{width:40,height:40,borderRadius:9,backgroundColor:'var(--bg-brand)',border:'1px solid var(--brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)',marginBottom:4}}>Bets importeren via screenshot</p>
            <p style={{fontSize:13,color:'var(--text-3)',lineHeight:1.6}}>
              Upload een screenshot van je bookmaker. Claude AI analyseert de afbeelding en extraheert automatisch alle zichtbare bets.
              Controleer en bewerk de bets daarna in de preview.
            </p>
          </div>
        </div>
      </div>

      {/* Idle — drop zone */}
      {status === 'idle' && (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => document.getElementById('ss-file-input').click()}
          style={{textAlign:'center',padding:'56px 24px',backgroundColor:'var(--bg-card)',border:'2px dashed var(--border)',borderRadius:10,cursor:'pointer',transition:'border-color 0.15s'}}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--brand)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
        >
          <input id="ss-file-input" type="file" accept="image/*" style={{display:'none'}} onChange={e => handleFile(e.target.files[0])}/>
          <div style={{width:56,height:56,borderRadius:12,backgroundColor:'var(--bg-brand)',border:'1px solid var(--brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p style={{fontSize:15,fontWeight:600,color:'var(--text-1)',marginBottom:6}}>Sleep een screenshot hierheen</p>
          <p style={{fontSize:13,color:'var(--text-3)',marginBottom:20}}>of klik om een bestand te kiezen · PNG, JPG, WEBP</p>
          <span style={{padding:'9px 24px',background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',borderRadius:7,fontSize:13.5,fontWeight:600,pointerEvents:'none',boxShadow:'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',border:'1px solid rgba(255,255,255,0.12)'}}>
            Afbeelding kiezen
          </span>
        </div>
      )}

      {/* Analysing */}
      {status === 'analysing' && (
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
          {imgUrl && <img src={imgUrl} alt="screenshot" style={{width:'100%',maxHeight:280,objectFit:'cover',display:'block',borderBottom:'1px solid var(--border-subtle)',opacity:0.6}}/>}
          <div style={{textAlign:'center',padding:'32px 24px'}}>
            <div style={{width:40,height:40,border:'3px solid var(--border)',borderTopColor:'var(--brand)',borderRadius:'50%',margin:'0 auto 14px',animation:'spin 0.8s linear infinite'}}/>
            <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)',marginBottom:4}}>AI analyseert je screenshot…</p>
            <p style={{fontSize:13,color:'var(--text-3)'}}>Dit duurt een paar seconden</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <div style={{padding:'16px 20px',borderRadius:9,backgroundColor:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',marginBottom:20}}>
            <p style={{fontSize:14,fontWeight:700,color:'#FB7185',marginBottom:4}}>Analyse mislukt</p>
            <p style={{fontSize:13,color:'var(--text-3)'}}>{errorMsg}</p>
          </div>
          <button onClick={reset} style={{padding:'9px 20px',background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:'#fff',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:7,fontSize:13.5,fontWeight:600,cursor:'pointer'}}>
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Preview */}
      {status === 'preview' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Thumbnail + reset */}
          {imgUrl && (
            <div style={{position:'relative',borderRadius:10,overflow:'hidden',border:'1px solid var(--border)',maxHeight:180}}>
              <img src={imgUrl} alt="screenshot" style={{width:'100%',maxHeight:180,objectFit:'cover',display:'block'}}/>
              <button onClick={reset} title="Afbeelding verwijderen"
                style={{position:'absolute',top:10,right:10,width:30,height:30,borderRadius:6,backgroundColor:'rgba(0,0,0,0.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}

          {/* Table — matches bets overview style */}
          <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
            {/* Header bar */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)'}}>Preview — {preview.length} bets herkend</p>
                <p style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{selected.size} van {preview.length} geselecteerd · Dubbelklik op een rij om te bewerken</p>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={reset} style={{padding:'7px 14px',border:'1px solid var(--border)',borderRadius:6,fontSize:12.5,fontWeight:600,color:'var(--text-2)',backgroundColor:'var(--bg-card)',cursor:'pointer'}}>
                  Nieuwe afbeelding
                </button>
                <button onClick={importeer} disabled={selected.size===0}
                  style={{padding:'7px 20px',background:selected.size===0?'var(--bg-subtle)':'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',color:selected.size===0?'var(--text-4)':'#fff',border:selected.size===0?'1px solid var(--border)':'1px solid rgba(255,255,255,0.12)',boxShadow:selected.size===0?'none':'0 2px 16px rgba(84,105,212,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:6,fontSize:13,fontWeight:600,cursor:selected.size===0?'default':'pointer',display:'flex',alignItems:'center',gap:6,transition:'all 0.15s'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Importeer {selected.size > 0 ? `${selected.size} bets` : ''}
                </button>
              </div>
            </div>

            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{backgroundColor:'var(--bg-subtle)'}}>
                  <th style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',width:36}}>
                    <input type="checkbox" checked={selected.size===preview.length} onChange={toggleAll} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--brand)'}}/>
                  </th>
                  {['Datum','Sport','Wedstrijd','Markt','Selectie','Odds','Inzet','Uitkomst','P&L','Bookmaker'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10.5,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap',borderBottom:'1px solid var(--border)'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((bet, i) => {
                  const isSelected = selected.has(i);
                  const cfg = uitkomstConfig(bet.uitkomst);
                  const uitkomstBg     = dark ? cfg.darkBg        : cfg.bg;
                  const uitkomstBorder = dark ? cfg.darkBorder    : cfg.border;
                  const uitkomstColor  = dark ? cfg.darkTextColor : cfg.textColor;
                  const pnl = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
                  return (
                    <tr key={i}
                      className="bet-row"
                      onDoubleClick={() => setEditIdx(i)}
                      title="Dubbelklik om te bewerken"
                      style={{borderTop:'1px solid var(--border-subtle)',verticalAlign:'middle',opacity:isSelected?1:0.4,transition:'opacity 0.15s',cursor:'default'}}>
                      {/* Checkbox */}
                      <td style={{padding:'11px 14px',cursor:'pointer'}} onClick={e=>{e.stopPropagation();toggle(i);}}>
                        <input type="checkbox" checked={isSelected} onChange={()=>toggle(i)} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--brand)'}}/>
                      </td>
                      {/* Datum */}
                      <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',whiteSpace:'nowrap'}}>
                        {new Date(bet.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'2-digit'})}
                      </td>
                      {/* Sport */}
                      <td style={{padding:'11px 14px',whiteSpace:'nowrap'}}>
                        <span style={{padding:'2px 7px',borderRadius:4,fontSize:11,fontWeight:600,backgroundColor:'var(--badge-bg)',color:'var(--badge-color)',display:'inline-flex',alignItems:'center',gap:4}}>
                          {sportEmoji(bet.sport)} {bet.sport}
                        </span>
                      </td>
                      {/* Wedstrijd */}
                      <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-1)',fontWeight:500,maxWidth:160}}>
                        <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.wedstrijd}</div>
                      </td>
                      {/* Markt */}
                      <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)',maxWidth:120}}>
                        <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.markt}</div>
                      </td>
                      {/* Selectie */}
                      <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-2)',fontWeight:500,maxWidth:180}}>
                        <div style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis'}}>{bet.selectie}</div>
                      </td>
                      {/* Odds */}
                      <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-1)',fontWeight:700,whiteSpace:'nowrap'}}>{Number(bet.odds).toFixed(2)}</td>
                      {/* Inzet */}
                      <td style={{padding:'11px 14px',fontSize:13,color:'var(--text-2)',whiteSpace:'nowrap'}}>€{Number(bet.inzet).toFixed(2)}</td>
                      {/* Uitkomst badge */}
                      <td style={{padding:'11px 14px'}}>
                        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'2px 8px',borderRadius:4,fontSize:11.5,fontWeight:600,background:uitkomstBg,color:uitkomstColor,border:`1px solid ${uitkomstBorder}`,whiteSpace:'nowrap',lineHeight:'18px'}}>
                          {cfg.label}
                        </span>
                      </td>
                      {/* P&L */}
                      <td style={{padding:'11px 14px',fontSize:13,fontWeight:700,whiteSpace:'nowrap',color:bet.uitkomst==='lopend'?'var(--text-3)':pnl>=0?'var(--color-win)':'var(--color-loss)'}}>
                        {bet.uitkomst==='lopend'?'—':`${pnl>=0?'+':''}€${pnl.toFixed(2)}`}
                      </td>
                      {/* Bookmaker */}
                      <td style={{padding:'11px 14px',fontSize:12.5,color:'var(--text-3)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <BookmakerIcon naam={BOOKMAKERS.includes(bet.bookmaker)?bet.bookmaker:'Overig'} size={16}/>
                          {bet.bookmaker}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Done */}
      {status === 'done' && (
        <div style={{textAlign:'center',padding:'48px 24px',backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10}}>
          <div style={{width:56,height:56,borderRadius:'50%',backgroundColor:'rgba(17,185,129,0.15)',border:'1px solid rgba(17,185,129,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#11B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{fontSize:16,fontWeight:700,color:'var(--text-1)',marginBottom:6}}>{importCount} bets geïmporteerd!</p>
          <p style={{fontSize:13,color:'var(--text-3)'}}>Je wordt doorgestuurd naar het overzicht…</p>
        </div>
      )}

      {/* Edit modal */}
      {editIdx !== null && preview[editIdx] && (
        <EditPreviewModal
          bet={preview[editIdx]}
          onSave={updated => { setPreview(prev => prev.map((b, idx) => idx === editIdx ? { ...b, ...updated } : b)); setEditIdx(null); }}
          onClose={() => setEditIdx(null)}
        />
      )}
    </div>
  );
}

// ── Pagina ─────────────────────────────────────────────────────────────────────

export default function NieuweBetPage() {
  const [tab, setTab] = useState('handmatig');

  const tabBtn = (id, label, icon) => (
    <button
      onClick={() => setTab(id)}
      style={{
        flex: 1,
        padding: '11px 16px',
        border: 'none',
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        transition: 'all 0.15s',
        backgroundColor: tab === id ? 'var(--bg-card)' : 'transparent',
        color: tab === id ? 'var(--text-1)' : 'var(--text-3)',
        boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Bets Toevoegen</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Voeg bets handmatig in of importeer automatisch via je Chrome Extension</p>
      </div>

      {/* Tab switcher */}
      <div style={{display:'flex',gap:4,padding:4,backgroundColor:'var(--bg-subtle)',border:'1px solid var(--border)',borderRadius:10,marginBottom:24}}>
        {tabBtn('handmatig', 'Handmatig',
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        )}
        {tabBtn('automatisch', 'Automatisch importeren',
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        )}
        {tabBtn('screenshot', 'Screenshot',
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        )}
      </div>

      {tab === 'handmatig'    && <HandmatigForm />}
      {tab === 'automatisch'  && <AutomatischImport />}
      {tab === 'screenshot'   && <ScreenshotImport />}
    </div>
  );
}
