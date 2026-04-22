'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const iStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:14, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function Field({ label, hint, children }) {
  return <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>{label}</label>{children}{hint&&<p style={{fontSize:12,color:'var(--text-4)',marginTop:4}}>{hint}</p>}</div>;
}

export default function VigPage() {
  const { dark } = useTheme();
  const [inputs, setInputs] = useState(['1.90','1.90','','']);
  const [type, setType] = useState('2way');

  const count = type==='2way'?2:type==='3way'?3:4;

  const r = useMemo(() => {
    const o = inputs.slice(0,count).map(Number).filter(v=>v>1);
    if (o.length < count) return null;
    const impl = o.map(v=>1/v);
    const sum = impl.reduce((a,b)=>a+b,0);
    const vig = (sum - 1) * 100;
    const fairProbs = impl.map(i=>i/sum);
    const fairOdds = fairProbs.map(p=>1/p);
    return { impl, sum, vig, fairProbs, fairOdds, breakEven: impl.map(i=>(i*100)) };
  }, [inputs, count]);

  const set = (i,v) => { const n=[...inputs]; n[i]=v; setInputs(n); };

  return (
    <div className="app-page" style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px'}}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Vig Calculator</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Bereken de bookmaker-marge (vig/overround) en de eerlijke odds zonder winstmarge.</p>
      </div>

      <div className="calc-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'stretch'}}>
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em'}}>Invoer</h2>
          {/* Type selector */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:20}}>
            {[{v:'2way',l:'2-weg'},{v:'3way',l:'3-weg'},{v:'4way',l:'4-weg'}].map(opt=>(
              <button key={opt.v} onClick={()=>setType(opt.v)} style={{padding:'8px',borderRadius:6,border:`1px solid ${type===opt.v?'var(--brand)':'var(--border)'}`,backgroundColor:type===opt.v?'var(--bg-brand)':'var(--bg-card)',color:type===opt.v?'var(--brand)':'var(--text-3)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                {opt.l}
              </button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {Array.from({length:count},(_,i)=>(
              <Field key={i} label={`Odds uitkomst ${i+1}`} hint={`Decimale odds bij bookmaker`}>
                <input type="number" step="0.01" min="1.01" placeholder={i<2?'1.90':'odds'} value={inputs[i]} onChange={e=>set(i,e.target.value)} style={iStyle}/>
              </Field>
            ))}
          </div>
        </div>

        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Resultaat</h2>
          {!r ? (
            <p style={{color:'var(--text-4)',fontSize:14,textAlign:'center',padding:'32px 0'}}>Voer odds in voor alle uitkomsten.</p>
          ) : (
            <>
              {/* Vig banner */}
              <div style={{padding:'14px 18px',borderRadius:9,marginBottom:20,backgroundColor: r.vig>5?(dark?'rgba(244,63,94,0.22)':'#fef2f2'):r.vig>2?(dark?'rgba(245,158,11,0.22)':'#fffbeb'):(dark?'rgba(17,185,129,0.22)':'#f0fdf4'),border:`1px solid ${r.vig>5?(dark?'rgba(244,63,94,0.45)':'#fecaca'):r.vig>2?(dark?'rgba(245,158,11,0.45)':'#fde68a'):(dark?'rgba(17,185,129,0.45)':'#bbf7d0')}`}}>
                <p style={{fontSize:13,fontWeight:600,color:'var(--text-3)',marginBottom:2}}>Bookmaker marge (Vig)</p>
                <p style={{fontSize:32,fontWeight:800,color:r.vig>5?(dark?'#FB7185':'#FB7185'):r.vig>2?(dark?'#fcd34d':'#c27803'):(dark?'#34D399':'#11B981')}}>{r.vig.toFixed(3)}%</p>
                <p style={{fontSize:12.5,color:'var(--text-3)',marginTop:4}}>{r.vig<2?'Lage marge — gunstige bookmaker':r.vig<5?'Gemiddelde marge':'Hoge marge — overweeg andere bookmaker'}</p>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border-subtle)'}}>
                  <span style={{fontSize:13,color:'var(--text-3)'}}>Totale overround</span>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--text-1)'}}>{(r.sum*100).toFixed(3)}%</span>
                </div>
                {r.impl.map((imp,i)=>(
                  <div key={i} style={{borderBottom:'1px solid var(--border-subtle)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0 4px'}}>
                      <span style={{fontSize:13,color:'var(--text-3)'}}>Uitkomst {i+1} — implied prob</span>
                      <span style={{fontSize:14,fontWeight:600,color:'var(--text-1)'}}>{(imp*100).toFixed(2)}%</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0 9px'}}>
                      <span style={{fontSize:13,color:'var(--text-3)'}}>Uitkomst {i+1} — eerlijke odds</span>
                      <span style={{fontSize:14,fontWeight:700,color:'var(--brand)'}}>{r.fairOdds[i].toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{backgroundColor:'var(--bg-subtle)',border:'1px solid var(--border)',borderRadius:12,padding:'20px 24px',marginTop:24}}>
        <h3 style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',marginBottom:8}}>Wat is Vig?</h3>
        <p style={{fontSize:13.5,color:'var(--text-3)',lineHeight:1.7}}>
          De Vig (ook: juice, overround of marge) is de ingebouwde winstmarge van een bookmaker. Bij een "eerlijke" 50/50 wedstrijd zouden beide kanten odds van 2.00 krijgen. Als de bookmaker 1.90 biedt, is de implied probability 52.6% per kant — samen 105.2%, waardoor de vig 5.2% is. Lagere vig = meer waarde voor de wedder.
        </p>
      </div>
    </div>
  );
}
