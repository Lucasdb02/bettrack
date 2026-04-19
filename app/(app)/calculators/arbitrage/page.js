'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const iStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:14, color:'var(--text-1)', backgroundColor:'var(--bg-input)', transition:'border-color 0.15s' };

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:6}}>{label}</label>
      {children}
      {hint&&<p style={{fontSize:12,color:'var(--text-4)',marginTop:4}}>{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value, highlight }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border-subtle)'}}>
      <span style={{fontSize:14,color:'var(--text-3)'}}>{label}</span>
      <span style={{fontSize:15,fontWeight:700,color:highlight||'var(--text-1)'}}>{value}</span>
    </div>
  );
}

export default function ArbitragePage() {
  const { dark } = useTheme();
  const [odds, setOdds] = useState(['2.10','2.00','']);
  const [inzet, setInzet] = useState('100');

  const result = useMemo(() => {
    const o = odds.map(Number).filter(v=>v>1);
    if (o.length < 2) return null;
    const impl = o.map(v=>1/v);
    const sum = impl.reduce((a,b)=>a+b,0);
    const S = Number(inzet)||100;
    const arb = (1 - sum) * 100;
    const stakes = impl.map(i=>(S*i/sum));
    const profit = S*(1/sum - 1);
    return { sum, arb, stakes, profit, isArb: sum < 1 };
  }, [odds, inzet]);

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px'}}>
      <div className="mb-7">
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Arbitrage Calculator</h1>
        <p style={{fontSize:14,color:'var(--text-3)'}}>Bereken of er een risicoloze winstmogelijkheid bestaat tussen bookmakers.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>
        {/* Inputs */}
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Invoer</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[0,1,2].map(i=>(
              <Field key={i} label={i<2?`Kansen uitkomst ${i+1} (verplicht)`:`Kansen uitkomst 3 (optioneel)`} hint={`Decimale odds van bookmaker ${i+1}`}>
                <input type="number" step="0.01" min="1.01" placeholder={i===0?'2.10':i===1?'2.00':'optioneel'} value={odds[i]} onChange={e=>{const n=[...odds];n[i]=e.target.value;setOdds(n);}} style={iStyle}/>
              </Field>
            ))}
            <Field label="Totale inzet (€)" hint="Bedrag te verdelen over de uitkomsten">
              <input type="number" step="1" min="1" placeholder="100" value={inzet} onChange={e=>setInzet(e.target.value)} style={iStyle}/>
            </Field>
          </div>
        </div>

        {/* Results */}
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'24px'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Resultaat</h2>

          {!result ? (
            <p style={{color:'var(--text-4)',fontSize:14,textAlign:'center',padding:'32px 0'}}>Voer minimaal 2 odds in om te berekenen.</p>
          ) : (
            <>
              {/* Status banner */}
              <div style={{padding:'14px 18px',borderRadius:9,marginBottom:20,backgroundColor:result.isArb?(dark?'rgba(17,185,129,0.22)':'#f0fdf4'):(dark?'rgba(244,63,94,0.22)':'#fef2f2'),border:`1px solid ${result.isArb?(dark?'rgba(17,185,129,0.45)':'#bbf7d0'):(dark?'rgba(244,63,94,0.45)':'#fecaca')}`}}>
                <div className="flex items-center gap-2">
                  <div style={{width:8,height:8,borderRadius:'50%',backgroundColor:result.isArb?'#11B981':'#F43F5E',flexShrink:0}}/>
                  <p style={{fontSize:14,fontWeight:700,color:result.isArb?(dark?'#34D399':'#34D399'):(dark?'#FB7185':'#FB7185')}}>
                    {result.isArb ? 'Arbitrage gevonden!' : 'Geen arbitrage'}
                  </p>
                </div>
                <p style={{fontSize:13,color:result.isArb?(dark?'#34D399':'#34D399'):(dark?'#FB7185':'#FB7185'),marginTop:4}}>
                  {result.isArb
                    ? `Gegarandeerde winst van ${result.arb.toFixed(2)}% op totale inzet`
                    : `Overround: ${(result.sum*100).toFixed(2)}% — bookmaker heeft een marge van ${((result.sum-1)*100).toFixed(2)}%`}
                </p>
              </div>

              <ResultRow label="Implied probability totaal" value={`${(result.sum*100).toFixed(3)}%`} highlight={result.isArb?'var(--color-win)':'var(--color-loss)'}/>
              <ResultRow label="Arbitrage marge" value={`${result.arb.toFixed(3)}%`} highlight={result.isArb?'var(--color-win)':'var(--color-loss)'}/>
              {result.stakes.map((s,i)=>odds[i]&&Number(odds[i])>1&&<ResultRow key={i} label={`Inzet uitkomst ${i+1} (@ ${Number(odds[i]).toFixed(2)})`} value={`€${s.toFixed(2)}`}/>)}
              {result.isArb&&<ResultRow label="Gegarandeerde winst" value={`+€${result.profit.toFixed(2)}`} highlight="var(--color-win)"/>}
              {result.isArb&&<ResultRow label="ROI" value={`+${result.arb.toFixed(3)}%`} highlight="var(--color-win)"/>}
            </>
          )}
        </div>
      </div>

      {/* Info box */}
      <div style={{backgroundColor:'var(--bg-subtle)',border:'1px solid var(--border)',borderRadius:10,padding:'20px 24px',marginTop:24}}>
        <h3 style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',marginBottom:8}}>Hoe werkt arbitrage?</h3>
        <p style={{fontSize:13.5,color:'var(--text-3)',lineHeight:1.7}}>
          Arbitrage (ook wel "surebet") is mogelijk wanneer verschillende bookmakers zodanig verschillende odds bieden dat de totale implied probability onder de 100% valt. Door op alle uitkomsten te wedden in de juiste verhouding, is een gegarandeerde winst mogelijk — ongeacht de uitkomst.
        </p>
      </div>
    </div>
  );
}
