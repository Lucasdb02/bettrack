'use client';
import { useState, useMemo } from 'react';

const iStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:14, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>{label}</label>
      {children}
      {hint && <p style={{fontSize:12,color:'var(--text-4)',marginTop:4}}>{hint}</p>}
    </div>
  );
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function toFractional(decimal) {
  if (!decimal || decimal <= 1) return '—';
  const n = Math.round((decimal - 1) * 1000);
  const d = 1000;
  const g = gcd(Math.abs(n), d);
  return `${n/g}/${d/g}`;
}
function toAmerican(decimal) {
  if (!decimal || decimal <= 1) return '—';
  if (decimal >= 2) return `+${Math.round((decimal-1)*100)}`;
  return `${Math.round(-100/(decimal-1))}`;
}
function toImplied(decimal) {
  if (!decimal || decimal <= 0) return '—';
  return `${(100/decimal).toFixed(2)}%`;
}
function fromFractional(str) {
  const [a,b] = str.split('/').map(Number);
  if (!a||!b||b===0) return null;
  return 1 + a/b;
}
function fromAmerican(str) {
  const v = Number(str);
  if (!v) return null;
  if (v > 0) return 1 + v/100;
  if (v < 0) return 1 - 100/v;
  return null;
}
function fromImplied(str) {
  const v = parseFloat(str);
  if (!v||v<=0||v>=100) return null;
  return 100/v;
}

const PRESETS = [
  { label:'Evenknie', decimal:'2.00' },
  { label:'Lichte favoriet', decimal:'1.80' },
  { label:'Grote favoriet', decimal:'1.30' },
  { label:'Underdog', decimal:'3.50' },
  { label:'Grote underdog', decimal:'6.00' },
];

export default function OddsConverterPage() {
  const [active, setActive] = useState('decimal');
  const [values, setValues] = useState({ decimal:'2.10', fractional:'', american:'', implied:'' });

  const decimal = useMemo(() => {
    if (active==='decimal') return parseFloat(values.decimal)||null;
    if (active==='fractional') return fromFractional(values.fractional);
    if (active==='american') return fromAmerican(values.american);
    if (active==='implied') return fromImplied(values.implied);
    return null;
  }, [active, values]);

  const r = useMemo(() => {
    if (!decimal||decimal<=1) return null;
    return {
      decimal: decimal.toFixed(4),
      fractional: toFractional(decimal),
      american: toAmerican(decimal),
      implied: (100/decimal).toFixed(2),
      impliedNum: (100/decimal),
    };
  }, [decimal]);

  const handleChange = (id, val) => {
    setActive(id);
    setValues(p=>({...p,[id]:val}));
  };

  const loadPreset = (dec) => {
    setActive('decimal');
    setValues({ decimal:dec, fractional:'', american:'', implied:'' });
  };

  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'40px 32px'}}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Odds Converter</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Converteer odds tussen alle gangbare formaten. Typ in één veld om de andere direct te berekenen.</p>
      </div>

      {/* Presets */}
      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        {PRESETS.map(p=>(
          <button key={p.decimal} onClick={()=>loadPreset(p.decimal)}
            style={{padding:'6px 14px',border:'1px solid var(--border)',borderRadius:99,fontSize:12.5,fontWeight:500,color:'var(--text-3)',backgroundColor:'var(--bg-card)',cursor:'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand)';e.currentTarget.style.color='var(--brand)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-3)';}}>
            {p.label} ({p.decimal})
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>
        {/* Left: Inputs */}
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Invoer</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Field label="Decimale odds" hint="Standaard in Europa (b.v. 2.10)">
              <input type="text" placeholder="2.10" value={values.decimal}
                onChange={e=>handleChange('decimal',e.target.value)}
                onFocus={()=>setActive('decimal')}
                style={{...iStyle,borderColor:active==='decimal'?'var(--brand)':undefined,boxShadow:active==='decimal'?'0 0 0 3px rgba(84,105,212,0.15)':undefined}}/>
            </Field>
            <Field label="Fractionele odds" hint="Gebruik in het VK (b.v. 11/10)">
              <input type="text" placeholder="11/10" value={values.fractional}
                onChange={e=>handleChange('fractional',e.target.value)}
                onFocus={()=>setActive('fractional')}
                style={{...iStyle,borderColor:active==='fractional'?'var(--brand)':undefined,boxShadow:active==='fractional'?'0 0 0 3px rgba(84,105,212,0.15)':undefined}}/>
            </Field>
            <Field label="Amerikaanse odds" hint="Moneyline (b.v. +110 of -200)">
              <input type="text" placeholder="+110" value={values.american}
                onChange={e=>handleChange('american',e.target.value)}
                onFocus={()=>setActive('american')}
                style={{...iStyle,borderColor:active==='american'?'var(--brand)':undefined,boxShadow:active==='american'?'0 0 0 3px rgba(84,105,212,0.15)':undefined}}/>
            </Field>
            <Field label="Implied kans (%)" hint="Kans in procenten (b.v. 47.62)">
              <div style={{position:'relative'}}>
                <input type="text" placeholder="47.62" value={values.implied}
                  onChange={e=>handleChange('implied',e.target.value)}
                  onFocus={()=>setActive('implied')}
                  style={{...iStyle,paddingRight:28,borderColor:active==='implied'?'var(--brand)':undefined,boxShadow:active==='implied'?'0 0 0 3px rgba(84,105,212,0.15)':undefined}}/>
                <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',fontSize:14}}>%</span>
              </div>
            </Field>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Resultaat</h2>
          {!r ? (
            <p style={{color:'var(--text-4)',fontSize:14,textAlign:'center',padding:'32px 0'}}>Voer een geldige waarde in om te berekenen.</p>
          ) : (
            <>
              <div style={{padding:'20px',borderRadius:10,marginBottom:20,backgroundColor:'var(--bg-brand)',border:'1px solid var(--brand-soft)',textAlign:'center'}}>
                <p style={{fontSize:12,fontWeight:700,color:'var(--brand)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Implied kans</p>
                <p style={{fontSize:40,fontWeight:800,color:'var(--brand)',lineHeight:1}}>{r.implied}%</p>
                <div style={{height:6,backgroundColor:'var(--border)',borderRadius:99,overflow:'hidden',marginTop:16,marginBottom:4}}>
                  <div style={{height:'100%',width:`${Math.min(r.impliedNum,100)}%`,backgroundColor:'var(--brand)',borderRadius:99,transition:'width 0.3s ease'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  <span style={{fontSize:11,color:'var(--text-4)'}}>0%</span>
                  <span style={{fontSize:11,color:'var(--text-4)'}}>50%</span>
                  <span style={{fontSize:11,color:'var(--text-4)'}}>100%</span>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                {[
                  {l:'Decimaal',v:r.decimal,hint:'Europees formaat'},
                  {l:'Fractioneel',v:r.fractional,hint:'VK formaat'},
                  {l:'Amerikaans',v:r.american,hint:'Moneyline'},
                  {l:'Implied kans',v:`${r.implied}%`,hint:'Break-even kans'},
                ].map((row,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border-subtle)'}}>
                    <div>
                      <span style={{fontSize:13,color:'var(--text-3)'}}>{row.l}</span>
                      <p style={{fontSize:11,color:'var(--text-4)',marginTop:1}}>{row.hint}</p>
                    </div>
                    <span style={{fontSize:16,fontWeight:700,color:'var(--brand)'}}>{row.v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{backgroundColor:'var(--bg-subtle)',border:'1px solid var(--border)',borderRadius:10,padding:'20px 24px',marginTop:24}}>
        <h3 style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',marginBottom:12}}>Conversieformules</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[
            {title:'Decimaal → Amerikaans',f:'Als ≥ 2.00: (dec−1)×100\nAls < 2.00: −100/(dec−1)'},
            {title:'Decimaal → Fractioneel',f:'(dec−1) = teller/noemer\nVereenvoudigd met ggd'},
            {title:'Decimaal → Implied','f':'(1 ÷ dec) × 100 = %'},
            {title:'Amerikaans → Decimaal',f:'Positief: (am÷100)+1\nNegatief: (−100÷am)+1'},
          ].map((item,i)=>(
            <div key={i} style={{padding:'12px 14px',backgroundColor:'var(--bg-card)',borderRadius:7,border:'1px solid var(--border)'}}>
              <p style={{fontSize:12.5,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>{item.title}</p>
              <p style={{fontSize:12,color:'var(--text-3)',whiteSpace:'pre-line',lineHeight:1.6}}>{item.f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
