'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import { uitkomstConfig, sportEmoji } from '../../lib/sports';
import BookmakerIcon from '../../components/BookmakerIcon';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MAANDEN=['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
const DAGEN=['Ma','Di','Wo','Do','Vr','Za','Zo'];
const dagVanWeek = d => (d.getDay()+6)%7;

function BarTip({active,payload,label}) {
  const {dark} = useTheme();
  const {fmtPnl} = useFmt();
  if(!active||!payload?.length) return null;
  const v=payload[0].value;
  const bg = dark ? '#1c2335' : '#ffffff';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const textMuted = dark ? '#8b949e' : '#6b7280';
  return <div style={{backgroundColor:bg,border:`1px solid ${border}`,borderRadius:8,padding:'8px 12px',fontSize:12,boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}><p style={{color:textMuted,marginBottom:3,fontWeight:600}}>{label}</p><p style={{fontWeight:700,color:v>=0?'var(--color-win)':'var(--color-loss)'}}>{fmtPnl(v)}</p></div>;
}

function DagModal({ datum, bets, pnl, onClose }) {
  const { dark } = useTheme();
  const { fmtPnl } = useFmt();

  const bg     = dark ? '#161c2a' : '#ffffff';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const text1  = dark ? '#e6edf3' : '#1a1f36';
  const text2  = dark ? '#c9d1d9' : '#374151';
  const text3  = dark ? '#8b949e' : '#6b7280';
  const subtle = dark ? '#1c2335' : '#f9fafb';

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const datumLabel = new Date(datum).toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return createPortal(
    <div
      onClick={onClose}
      style={{position:'fixed',inset:0,zIndex:10000,backgroundColor:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{backgroundColor:bg,border:`1px solid ${border}`,borderRadius:12,width:'100%',maxWidth:960,maxHeight:'80vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}}
      >
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:700,color:text1,marginBottom:3,textTransform:'capitalize'}}>{datumLabel}</h2>
            <p style={{fontSize:12.5,color:text3}}>
              {bets.length} bet{bets.length !== 1 ? 's' : ''} &nbsp;•&nbsp;
              <span style={{fontWeight:700,color:pnl>=0?'var(--color-win)':'var(--color-loss)'}}>{fmtPnl(pnl)}</span>
            </p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:text3,padding:6,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Table */}
        <div style={{overflowY:'auto',flexShrink:1}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{backgroundColor:subtle}}>
                {['Wedstrijd','Selectie','Bookmaker','Odds','Inzet','Uitkomst','P&L'].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:text3,textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bets.map(bet => {
                const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
                const cfg = uitkomstConfig(bet.uitkomst);
                const badgeBg = dark ? cfg.darkBg : cfg.bg;
                const badgeBorder = dark ? cfg.darkBorder : cfg.border;
                const badgeColor = dark ? cfg.darkTextColor : cfg.textColor;
                return (
                  <tr key={bet.id} className="bet-row" style={{borderTop:`1px solid ${border}`,verticalAlign:'middle'}}>
                    <td style={{padding:'12px 16px',fontSize:13,color:text1,fontWeight:500,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.wedstrijd}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:text2}}>{bet.selectie}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:text2}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <BookmakerIcon naam={bet.bookmaker} size={15}/>
                        {bet.bookmaker}
                      </div>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,color:text1,fontWeight:600}}>{Number(bet.odds).toFixed(2)}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:text2}}>€{Number(bet.inzet).toFixed(2)}</td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{display:'inline-flex',alignItems:'center',verticalAlign:'middle',background:badgeBg,color:badgeColor,border:`1px solid ${badgeBorder}`,padding:'2px 8px',borderRadius:4,fontSize:11.5,fontWeight:600,lineHeight:'18px',whiteSpace:'nowrap'}}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:bet.uitkomst==='lopend'?text3:w>=0?'var(--color-win)':'var(--color-loss)'}}>
                      {bet.uitkomst==='lopend'?'—':fmtPnl(w)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MaandoverzichtPage() {
  const {bets,loaded}=useBets();
  const {fmtPnl} = useFmt();
  const now=new Date();
  const [jaar,setJaar]=useState(now.getFullYear());
  const [maand,setMaand]=useState(now.getMonth());
  const [geselecteerd,setGeselecteerd]=useState(null);
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);

  const dagData=useMemo(()=>{
    const map={};
    bets.forEach(b=>{
      const d=new Date(b.datum);
      if(d.getFullYear()!==jaar||d.getMonth()!==maand) return;
      if(!map[b.datum]) map[b.datum]={bets:[],pnl:0,gewonnen:0,verloren:0};
      map[b.datum].bets.push(b);
      if(b.uitkomst!=='lopend'){
        map[b.datum].pnl+=berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet));
        if(b.uitkomst==='gewonnen') map[b.datum].gewonnen++;
        if(b.uitkomst==='verloren') map[b.datum].verloren++;
      }
    });
    return map;
  },[bets,jaar,maand]);

  const maandStats=useMemo(()=>{
    const entries=Object.values(dagData);
    const all=entries.flatMap(d=>d.bets);
    const settled=all.filter(b=>b.uitkomst!=='lopend');
    const won=settled.filter(b=>b.uitkomst==='gewonnen'),lost=settled.filter(b=>b.uitkomst==='verloren');
    const totalPnl=entries.reduce((s,d)=>s+d.pnl,0);
    return {totalPnl,all,settled,won,lost,winstDagen:entries.filter(d=>d.pnl>0).length,verliesdagen:entries.filter(d=>d.pnl<0).length};
  },[dagData]);

  const barData=useMemo(()=>Object.keys(dagData).sort().map(d=>({dag:new Date(d).getDate(),pnl:parseFloat(dagData[d].pnl.toFixed(2))})),[dagData]);

  const calendarDays=useMemo(()=>{
    const first=new Date(jaar,maand,1),last=new Date(jaar,maand+1,0);
    const offset=dagVanWeek(first);
    const cells=Array(offset).fill(null);
    for(let d=1;d<=last.getDate();d++){
      const key=`${jaar}-${String(maand+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({dag:d,key,data:dagData[key]||null});
    }
    while(cells.length%7!==0) cells.push(null);
    return cells;
  },[jaar,maand,dagData]);

  const maxAbs=useMemo(()=>Math.max(...Object.values(dagData).map(d=>Math.abs(d.pnl)),1),[dagData]);

  const prev=()=>{if(maand===0){setMaand(11);setJaar(j=>j-1);}else setMaand(m=>m-1);setGeselecteerd(null);};
  const next=()=>{if(maand===11){setMaand(0);setJaar(j=>j+1);}else setMaand(m=>m+1);setGeselecteerd(null);};

  if(!loaded) return <div className="flex items-center justify-center h-full" style={{color:'var(--text-4)'}}>Laden...</div>;

  const todayKey = now.toISOString().split('T')[0];

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px'}}>
      <div className="flex items-center justify-between mb-7">
        <div><h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Maandoverzicht</h1><p style={{fontSize:14,color:'var(--text-3)'}}>Dagelijkse analyse van je bettingresultaten</p></div>
        <div className="flex items-center gap-3">
          <button onClick={prev} style={{width:34,height:34,border:'1px solid var(--border)',borderRadius:7,backgroundColor:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{fontSize:15,fontWeight:700,color:'var(--text-1)',minWidth:140,textAlign:'center'}}>{MAANDEN[maand]} {jaar}</span>
          <button onClick={next} style={{width:34,height:34,border:'1px solid var(--border)',borderRadius:7,backgroundColor:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="grid gap-4 mb-7" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          {l:'Maand P&L',v:fmtPnl(maandStats.totalPnl),c:maandStats.totalPnl>=0?'var(--color-win)':'var(--color-loss)'},
          {l:'Bets',v:maandStats.all.length,c:'var(--text-1)'},
          {l:'Win Rate',v:`${(maandStats.won.length+maandStats.lost.length)>0?((maandStats.won.length/(maandStats.won.length+maandStats.lost.length))*100).toFixed(0):0}%`,c:'var(--text-1)'},
          {l:'Winstdagen',v:maandStats.winstDagen,c:'var(--color-win)'},
          {l:'Verliesdagen',v:maandStats.verliesdagen,c:'var(--color-loss)'},
        ].map(s=>(
          <div key={s.l} style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 20px'}}>
            <p style={{fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{s.l}</p>
            <p style={{fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',marginBottom:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid var(--border-subtle)'}}>
          {DAGEN.map(d=><div key={d} style={{padding:'12px 0',textAlign:'center',fontSize:11.5,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.05em',backgroundColor:'var(--bg-subtle)'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {calendarDays.map((cell,i)=>{
            if(!cell) return <div key={`e${i}`} style={{borderRight:i%7!==6?'1px solid var(--border-subtle)':'none',borderBottom:'1px solid var(--border-subtle)',minHeight:80,backgroundColor:'var(--bg-subtle)',opacity:0.4}}/>;
            const {dag,key,data}=cell;
            const isToday = todayKey === key;
            const hasBets = data && data.bets.length > 0;
            const pnl = data?.pnl ?? 0;
            const int = hasBets ? Math.min(Math.abs(pnl)/maxAbs,1) : 0;
            let bg = 'var(--bg-card)';
            if(hasBets&&pnl>0) bg=`rgba(17,185,129,${0.05+int*0.2})`;
            else if(hasBets&&pnl<0) bg=`rgba(244,63,94,${0.05+int*0.18})`;
            else if(hasBets) bg='var(--bg-subtle)';
            return (
              <div
                key={key}
                onClick={()=>hasBets&&setGeselecteerd(key)}
                style={{borderRight:i%7!==6?'1px solid var(--border-subtle)':'none',borderBottom:'1px solid var(--border-subtle)',minHeight:84,padding:'10px 12px',backgroundColor:bg,cursor:hasBets?'pointer':'default',transition:'background-color 0.1s'}}
              >
                {/* Day number */}
                <div style={{
                  width:26,height:26,borderRadius:'50%',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  backgroundColor:isToday?'#5469d4':'transparent',
                  fontSize:12.5,fontWeight:isToday?700:hasBets?600:400,
                  color:isToday?'#fff':hasBets?'var(--text-1)':'var(--text-4)',
                  lineHeight:1,
                  marginBottom:4,
                  flexShrink:0,
                }}>
                  {dag}
                </div>
                {hasBets&&(
                  <>
                    <div style={{fontSize:12.5,fontWeight:700,color:pnl>0?'var(--color-win)':pnl<0?'var(--color-loss)':'var(--text-3)',lineHeight:1.2}}>{pnl===0?'—':fmtPnl(pnl)}</div>
                    <div style={{fontSize:10.5,color:'var(--text-4)',marginTop:2}}>{data.bets.length} bet{data.bets.length!==1?'s':''}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border-subtle)',backgroundColor:'var(--bg-subtle)',display:'flex',gap:20,alignItems:'center'}}>
          {[{c:'rgba(17,185,129,0.2)',l:'Winstdag'},{c:'rgba(244,63,94,0.15)',l:'Verliesdag'}].map(l=>(
            <div key={l.l} className="flex items-center gap-2"><div style={{width:12,height:12,borderRadius:3,backgroundColor:l.c}}/><span style={{fontSize:11.5,color:'var(--text-3)'}}>{l.l}</span></div>
          ))}
          <span style={{fontSize:11.5,color:'var(--text-4)',marginLeft:'auto'}}>Klik op een dag om bets te zien</span>
        </div>
      </div>

      {barData.length>0&&(
        <div style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'22px 24px',marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'var(--text-1)',marginBottom:16}}>Dagelijkse P&L — {MAANDEN[maand]} {jaar}</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{top:0,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false}/>
              <XAxis dataKey="dag" tick={{fontSize:10.5,fill:'var(--text-4)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10.5,fill:'var(--text-4)'}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={50}/>
              <Tooltip content={<BarTip/>} cursor={false} wrapperStyle={{zIndex:9999,background:'none',border:'none',padding:0,boxShadow:'none'}}/>
              <Bar dataKey="pnl" maxBarSize={28}>{barData.map((e,i)=><Cell key={i} fill={e.pnl>=0?'#11B981':'#F43F5E'} fillOpacity={0.85}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Day detail modal */}
      {mounted && geselecteerd && dagData[geselecteerd]?.bets.length > 0 && (
        <DagModal
          datum={geselecteerd}
          bets={dagData[geselecteerd].bets.slice().sort((a,b)=>a.bookmaker.localeCompare(b.bookmaker))}
          pnl={dagData[geselecteerd].pnl}
          onClose={()=>setGeselecteerd(null)}
        />
      )}
    </div>
  );
}
