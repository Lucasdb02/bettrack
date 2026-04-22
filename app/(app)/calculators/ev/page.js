'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const iStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:14, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function Field({ label, hint, children }) {
  return <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>{label}</label>{children}{hint&&<p style={{fontSize:12,color:'var(--text-4)',marginTop:4}}>{hint}</p>}</div>;
}

export default function EVPage() {
  const { dark } = useTheme();
  const [odds, setOdds] = useState('2.10');
  const [prob, setProb] = useState('55');
  const [inzet, setInzet] = useState('50');
  const [bets, setBets] = useState('100');

  const r = useMemo(() => {
    const o = Number(odds), p = Number(prob)/100, s = Number(inzet), n = Number(bets)||1;
    if (!o||!p||o<=1||p<=0||p>=1||s<=0) return null;
    const ev = (o*p - 1) * s;
    const evPct = ((o*p - 1)*100);
    const edge = p - (1/o);
    const impliedProb = 1/o;
    const totalEV = ev * n;
    return { ev, evPct, edge, impliedProb, totalEV, positive: ev>0 };
  }, [odds, prob, inzet, bets]);

  return (
    <div className="app-page" style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px'}}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Expected Value Calculator</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Bereken de verwachte waarde (EV) van een bet op basis van jouw geschatte kans.</p>
      </div>

      <div className="calc-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'stretch'}}>
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Invoer</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Field label="Decimale odds" hint="De odds van de bookmaker">
              <input type="number" step="0.01" min="1.01" placeholder="2.10" value={odds} onChange={e=>setOdds(e.target.value)} style={iStyle}/>
            </Field>
            <Field label="Geschatte winkans (%)" hint="Jouw eigen inschatting van de werkelijke kans">
              <div style={{position:'relative'}}>
                <input type="number" step="0.5" min="1" max="99" placeholder="55" value={prob} onChange={e=>setProb(e.target.value)} style={iStyle}/>
                <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-4)',fontSize:14}}>%</span>
              </div>
            </Field>
            <Field label="Inzet per bet (€)" hint="Hoeveel je per bet inzet">
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',fontSize:14}}>€</span>
                <input type="number" step="1" min="0.01" placeholder="50" value={inzet} onChange={e=>setInzet(e.target.value)} style={{...iStyle,paddingLeft:28}}/>
              </div>
            </Field>
            <Field label="Aantal bets (simulatie)" hint="Hoeveel keer je deze bet plaatst">
              <input type="number" step="1" min="1" placeholder="100" value={bets} onChange={e=>setBets(e.target.value)} style={iStyle}/>
            </Field>
          </div>
        </div>

        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Resultaat</h2>
          {!r ? (
            <p style={{color:'var(--text-4)',fontSize:14,textAlign:'center',padding:'32px 0'}}>Voer geldige waarden in om te berekenen.</p>
          ) : (
            <>
              {/* Main EV display */}
              <div style={{padding:'20px',borderRadius:12,marginBottom:20,backgroundColor:r.positive?(dark?'rgba(17,185,129,0.22)':'#f0fdf4'):(dark?'rgba(244,63,94,0.22)':'#fef2f2'),border:`1px solid ${r.positive?(dark?'rgba(17,185,129,0.45)':'#bbf7d0'):(dark?'rgba(244,63,94,0.45)':'#fecaca')}`,textAlign:'center'}}>
                <p style={{fontSize:12,fontWeight:700,color:r.positive?(dark?'#34D399':'#34D399'):(dark?'#FB7185':'#FB7185'),textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Expected Value per bet</p>
                <p style={{fontSize:40,fontWeight:800,color:r.positive?(dark?'#34D399':'#11B981'):(dark?'#FB7185':'#F43F5E'),lineHeight:1}}>
                  {r.ev>=0?'+€':'-€'}{Math.abs(r.ev).toFixed(2)}
                </p>
                <p style={{fontSize:15,fontWeight:600,color:r.positive?(dark?'#34D399':'#34D399'):(dark?'#FB7185':'#FB7185'),marginTop:8}}>
                  {r.evPct>=0?'+':''}{r.evPct.toFixed(2)}% van inzet
                </p>
                <p style={{fontSize:13,color:r.positive?(dark?'#34D399':'#34D399'):(dark?'#FB7185':'#FB7185'),marginTop:6}}>
                  {r.positive?'Positieve EV — dit is een waardevolle bet':'Negatieve EV — de bookmaker heeft de voordeel'}
                </p>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                {[
                  {l:'Implied odds kans',v:`${(r.impliedProb*100).toFixed(2)}%`},
                  {l:'Jouw geschatte kans',v:`${prob}%`},
                  {l:'Edge (voordeel)',v:`${(r.edge*100).toFixed(3)}%`,c:r.edge>0?'var(--color-win)':'var(--color-loss)'},
                  {l:'EV per bet',v:`${r.ev>=0?'+€':'-€'}${Math.abs(r.ev).toFixed(3)}`,c:r.positive?'var(--color-win)':'var(--color-loss)'},
                  {l:`Verwacht na ${bets} bets`,v:`${r.totalEV>=0?'+€':'-€'}${Math.abs(r.totalEV).toFixed(2)}`,c:r.positive?'var(--color-win)':'var(--color-loss)'},
                  {l:`Totale inzet (${bets}x)`,v:`€${(Number(inzet)*Number(bets)).toFixed(2)}`},
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
        <h3 style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',marginBottom:8}}>Formule: EV = (Odds × Kans) – 1</h3>
        <p style={{fontSize:13.5,color:'var(--text-3)',lineHeight:1.7}}>
          De verwachte waarde meet hoeveel je gemiddeld wint of verliest per € inzet. Een EV van +€5 op een €50 inzet betekent dat je per bet gemiddeld €5 winst maakt — over de lange termijn. Consistente positieve EV-bets zijn de basis van winstgevend wedden.
        </p>
      </div>
    </div>
  );
}
