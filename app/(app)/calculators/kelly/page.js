'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const iStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:14, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function Field({ label, hint, children }) {
  return <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>{label}</label>{children}{hint&&<p style={{fontSize:12,color:'var(--text-4)',marginTop:4}}>{hint}</p>}</div>;
}

function ResultCard({ label, pct, amount, color, dim }) {
  return (
    <div style={{backgroundColor:'var(--bg-subtle)',border:`1px solid var(--border)`,borderRadius:9,padding:'16px 20px',opacity:dim?0.6:1}}>
      <p style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>{label}</p>
      <p style={{fontSize:28,fontWeight:800,color:color||'var(--text-1)',lineHeight:1}}>{pct}</p>
      {amount&&<p style={{fontSize:14,color:'var(--text-3)',marginTop:6}}>= <strong style={{color:'var(--text-1)'}}>{amount}</strong></p>}
    </div>
  );
}

export default function KellyPage() {
  const { dark } = useTheme();
  const [odds, setOdds] = useState('2.10');
  const [prob, setProb] = useState('55');
  const [bankroll, setBankroll] = useState('1000');
  const [fractie, setFractie] = useState('full');

  const r = useMemo(() => {
    const o = Number(odds), p = Number(prob)/100, B = Number(bankroll);
    if (!o||!p||o<=1||p<=0||p>=1) return null;
    const b = o - 1;
    const q = 1 - p;
    const kelly = (b*p - q) / b;
    const halfKelly = kelly / 2;
    const quarterKelly = kelly / 4;
    const ev = b*p - q;
    return { kelly, halfKelly, quarterKelly, ev, B,
      fullAmt: (kelly*B).toFixed(2), halfAmt: (halfKelly*B).toFixed(2), qAmt: (quarterKelly*B).toFixed(2) };
  }, [odds, prob, bankroll]);

  return (
    <div className="app-page" style={{padding:'24px'}}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Kelly Calculator</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Bepaal de optimale inzet op basis van je geschatte winkans en de beschikbare odds.</p>
      </div>

      <div className="calc-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'stretch'}}>
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Invoer</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Field label="Decimale odds" hint="De odds die je bookmaker aanbiedt">
              <input type="number" step="0.01" min="1.01" placeholder="2.10" value={odds} onChange={e=>setOdds(e.target.value)} style={iStyle}/>
            </Field>
            <Field label="Geschatte winkans (%)" hint="Jouw inschatting van de kans dat je wint">
              <div style={{position:'relative'}}>
                <input type="number" step="0.5" min="1" max="99" placeholder="55" value={prob} onChange={e=>setProb(e.target.value)} style={iStyle}/>
                <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',fontSize:14}}>%</span>
              </div>
            </Field>
            <Field label="Bankroll (€)" hint="Totaal beschikbaar budget">
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',fontSize:14}}>€</span>
                <input type="number" step="10" min="1" placeholder="1000" value={bankroll} onChange={e=>setBankroll(e.target.value)} style={{...iStyle,paddingLeft:28}}/>
              </div>
            </Field>

            {/* Fraction selector */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:8}}>Kelly fractie</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {[{v:'full',l:'Volledig'},{v:'half',l:'Half Kelly'},{v:'quarter',l:'¼ Kelly'}].map(opt=>(
                  <button key={opt.v} onClick={()=>setFractie(opt.v)} style={{padding:'8px',borderRadius:6,border:`1px solid ${fractie===opt.v?'var(--brand)':'var(--border)'}`,backgroundColor:fractie===opt.v?'var(--bg-brand)':'var(--bg-card)',color:fractie===opt.v?'var(--brand)':'var(--text-3)',fontSize:12.5,fontWeight:600,cursor:'pointer'}}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Resultaat</h2>
          {!r ? (
            <p style={{color:'var(--text-4)',fontSize:14,textAlign:'center',padding:'32px 0'}}>Voer geldige waarden in om te berekenen.</p>
          ) : r.kelly <= 0 ? (
            <div style={{padding:'14px 18px',borderRadius:9,backgroundColor:dark?'rgba(244,63,94,0.22)':'#fef2f2',border:`1px solid ${dark?'rgba(244,63,94,0.45)':'#fecaca'}`}}>
              <p style={{fontSize:14,fontWeight:700,color:dark?'#FB7185':'#FB7185'}}>Negatieve verwachte waarde</p>
              <p style={{fontSize:13,color:dark?'#FB7185':'#FB7185',marginTop:4}}>Kelly raadt aan deze bet NIET te plaatsen. Je geschatte kans is lager dan de implied odds ({((1/Number(odds))*100).toFixed(1)}%).</p>
            </div>
          ) : (
            <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                <ResultCard label="Volledig Kelly" pct={`${(r.kelly*100).toFixed(2)}%`} amount={`€${r.fullAmt}`} color={fractie==='full'?'var(--color-win)':'var(--text-1)'} dim={fractie!=='full'}/>
                <ResultCard label="Half Kelly" pct={`${(r.halfKelly*100).toFixed(2)}%`} amount={`€${r.halfAmt}`} color={fractie==='half'?'var(--color-win)':'var(--text-1)'} dim={fractie!=='half'}/>
              </div>

              {/* Recommended */}
              <div style={{padding:'14px 18px',borderRadius:9,backgroundColor:dark?'rgba(17,185,129,0.22)':'#f0fdf4',border:`1px solid ${dark?'rgba(17,185,129,0.45)':'#bbf7d0'}`,marginBottom:16}}>
                <p style={{fontSize:12,fontWeight:700,color:dark?'#34D399':'#34D399',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Aanbevolen inzet ({fractie==='full'?'Volledig':fractie==='half'?'Half':'¼'} Kelly)</p>
                <p style={{fontSize:26,fontWeight:800,color:dark?'#34D399':'#11B981'}}>€{fractie==='full'?r.fullAmt:fractie==='half'?r.halfAmt:r.qAmt}</p>
                <p style={{fontSize:13,color:dark?'#34D399':'#34D399',marginTop:4}}>{fractie==='full'?r.kelly.toFixed(4)*100:fractie==='half'?(r.halfKelly*100).toFixed(4):(r.quarterKelly*100).toFixed(4)}% van bankroll</p>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                {[
                  {l:'Expected value per eenheid',v:`${r.ev>=0?'+':''}${(r.ev*100).toFixed(2)}%`,c:r.ev>=0?'var(--color-win)':'var(--color-loss)'},
                  {l:'Implied odds kans',v:`${((1/Number(odds))*100).toFixed(2)}%`},
                  {l:'Jouw geschatte kans',v:`${prob}%`},
                  {l:'Edge',v:`${(r.ev*100).toFixed(2)}%`,c:r.ev>=0?'var(--color-win)':'var(--color-loss)'},
                ].map((row,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--border-subtle)'}}>
                    <span style={{fontSize:13,color:'var(--text-3)'}}>{row.l}</span>
                    <span style={{fontSize:14,fontWeight:700,color:row.c||'var(--text-1)'}}>{row.v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{backgroundColor:'var(--bg-subtle)',border:'1px solid var(--border)',borderRadius:12,padding:'20px 24px',marginTop:24}}>
        <h3 style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',marginBottom:8}}>Kelly Criterium formule</h3>
        <p style={{fontSize:13.5,color:'var(--text-3)',lineHeight:1.7}}>
          <strong style={{color:'var(--text-1)'}}>f = (b·p – q) / b</strong> — waarbij <em>b</em> de netto winstquote is (odds – 1), <em>p</em> de geschatte winkans en <em>q = 1 – p</em>. Het resultaat <em>f</em> is het optimale percentage van je bankroll om in te zetten. Veel professionele wedders gebruiken half Kelly om risico te beperken.
        </p>
      </div>
    </div>
  );
}
