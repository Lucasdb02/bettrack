'use client';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFmt } from '../../context/PreferencesContext';
import { uitkomstConfig, sportEmoji } from '../../lib/sports';
import BookmakerIcon from '../../components/BookmakerIcon';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MAANDEN=['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
const DAGEN=['Ma','Di','Wo','Do','Vr','Za','Zo'];
const dagVanWeek = d => (d.getDay()+6)%7;

function BarTip({active,payload,label}) {
  const {fmtPnl} = useFmt();
  if(!active||!payload?.length) return null;
  const v=payload[0].value;
  return <div style={{backgroundColor:'var(--tooltip-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:12,boxShadow:'var(--shadow-lg)'}}><p style={{color:'var(--text-3)',marginBottom:3,fontWeight:600}}>{label}</p><p style={{fontWeight:700,color:v>=0?'var(--color-win)':'var(--color-loss)'}}>{fmtPnl(v)}</p></div>;
}

function DagModal({ datum, bets, pnl, onClose, isMobile }) {
  const { dark } = useTheme();
  const { fmtPnl } = useFmt();

  const bg     = 'var(--bg-card)';
  const border = 'var(--border)';
  const text1  = 'var(--text-1)';
  const text2  = 'var(--text-2)';
  const text3  = 'var(--text-3)';
  const subtle = 'var(--bg-subtle)';

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const datumLabel = new Date(datum).toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return createPortal(
    <div
      onClick={onClose}
      style={{position:'fixed',inset:0,zIndex:10000,backgroundColor:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?12:24}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{backgroundColor:bg,border:`1px solid ${border}`,borderRadius:12,width:'100%',maxWidth:isMobile?480:960,maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'var(--shadow-lg)'}}
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

        {/* Body */}
        <div style={{overflowY:'auto',flexShrink:1}}>
          {isMobile ? (
            /* Mobile: bet cards */
            <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
              {bets.map(bet => {
                const w = berekenWinst(bet.uitkomst, Number(bet.odds), Number(bet.inzet));
                const cfg = uitkomstConfig(bet.uitkomst);
                const badgeBg = dark ? cfg.darkBg : cfg.bg;
                const badgeBorder = dark ? cfg.darkBorder : cfg.border;
                const badgeColor = dark ? cfg.darkTextColor : cfg.textColor;
                return (
                  <div key={bet.id} style={{backgroundColor:subtle,border:`1px solid ${border}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                        <span style={{fontSize:11,fontWeight:600,color:text3}}>{new Date(bet.datum).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'})}</span>
                        <span style={{padding:'2px 7px',borderRadius:4,fontSize:10.5,fontWeight:600,backgroundColor:'var(--badge-bg,rgba(100,100,100,0.15))',color:'var(--badge-color,'+text3+')',display:'inline-flex',alignItems:'center',gap:3}}>{sportEmoji(bet.sport)} {bet.sport}</span>
                      </div>
                      <span style={{display:'inline-flex',alignItems:'center',background:badgeBg,color:badgeColor,border:`1px solid ${badgeBorder}`,padding:'2px 8px',borderRadius:4,fontSize:11.5,fontWeight:600,whiteSpace:'nowrap'}}>{cfg.label}</span>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:text1}}>{bet.wedstrijd}</div>
                      <div style={{display:'flex',gap:6,marginTop:3,flexWrap:'wrap'}}>
                        <span style={{fontSize:11.5,color:text3}}>{bet.markt}</span>
                        {bet.markt && bet.selectie && <span style={{color:border}}>·</span>}
                        <span style={{fontSize:13,color:text2}}>{bet.selectie}</span>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',border:`1px solid ${border}`,borderRadius:8,overflow:'hidden'}}>
                      {[
                        {label:'Odds',value:Number(bet.odds).toFixed(2),color:text1},
                        {label:'Inzet',value:`€${Number(bet.inzet).toFixed(2)}`,color:text2},
                        {label:'P&L',value:bet.uitkomst==='lopend'?'—':fmtPnl(w),color:bet.uitkomst==='lopend'?text3:w>=0?'var(--color-win)':'var(--color-loss)'},
                      ].map((cell,i)=>(
                        <div key={cell.label} style={{padding:'8px 10px',display:'flex',flexDirection:'column',gap:2,borderRight:i<2?`1px solid ${border}`:'none'}}>
                          <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:text3}}>{cell.label}</span>
                          <span style={{fontSize:14,fontWeight:700,color:cell.color}}>{cell.value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12.5,color:text3}}>
                      <BookmakerIcon naam={bet.bookmaker} size={15}/>
                      <span>{bet.bookmaker}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: table */
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
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MaandoverzichtPage() {
  const {bets,loaded}=useBets();
  const {fmtPnl,fmtAmt} = useFmt();
  const now=new Date();
  const [jaar,setJaar]=useState(now.getFullYear());
  const [maand,setMaand]=useState(now.getMonth());
  const [geselecteerd,setGeselecteerd]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [isMobile,setIsMobile]=useState(false);
  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<768);
    check();
    window.addEventListener('resize',check);
    return ()=>window.removeEventListener('resize',check);
  },[]);

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
    const totalInzet=all.reduce((s,b)=>s+Number(b.inzet),0);
    return {totalPnl,totalInzet,all,settled,won,lost,winstDagen:entries.filter(d=>d.pnl>0).length,verliesdagen:entries.filter(d=>d.pnl<0).length};
  },[dagData]);

  const BOOK_COLORS_ARR=['#6366f1','#22d3ee','#f59e0b','#10b981','#f43f5e','#a78bfa','#34d399','#fb923c','#60a5fa','#e879f9'];

  const bookmakersMaand=useMemo(()=>{
    const bks=new Set();
    Object.values(dagData).forEach(d=>d.bets.forEach(b=>bks.add(b.bookmaker)));
    return Array.from(bks).sort();
  },[dagData]);

  const bookColorMaand=(bk)=>BOOK_COLORS_ARR[bookmakersMaand.indexOf(bk)%BOOK_COLORS_ARR.length];

  const stackedMaandData=useMemo(()=>Object.keys(dagData).sort().map(datum=>{
    const entry={datum:String(new Date(datum).getDate())};
    bookmakersMaand.forEach(bk=>{entry[bk]=0;});
    dagData[datum].bets.forEach(b=>{
      if(b.uitkomst!=='lopend') entry[b.bookmaker]=(entry[b.bookmaker]||0)+berekenWinst(b.uitkomst,Number(b.odds),Number(b.inzet));
    });
    return entry;
  }),[dagData,bookmakersMaand]);

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
    <div className="cal-page-wrap" style={{padding:'24px'}}>
      <div className="flex items-center justify-between mb-7 page-header">
        <div><h1 style={{fontSize:24,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Maandoverzicht</h1><p style={{fontSize:14,color:'var(--text-3)'}}>Dagelijkse analyse van je bettingresultaten</p></div>
        <div className="flex items-center" style={{gap:isMobile?4:12}}>
          <button onClick={prev} style={{width:34,height:34,border:isMobile?'none':'1px solid var(--border)',borderRadius:8,backgroundColor:isMobile?'transparent':'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{fontSize:15,fontWeight:700,color:'var(--text-1)',minWidth:isMobile?'auto':140,textAlign:'center',whiteSpace:'nowrap'}}>{MAANDEN[maand]} {jaar}</span>
          <button onClick={next} style={{width:34,height:34,border:isMobile?'none':'1px solid var(--border)',borderRadius:8,backgroundColor:isMobile?'transparent':'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="cal-stats-grid grid gap-4 mb-7" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          {l:'Maand P&L',v:isMobile?fmtAmt(maandStats.totalPnl):fmtPnl(maandStats.totalPnl),c:maandStats.totalPnl>=0?'var(--color-win)':'var(--color-loss)'},
          {l:'Bets',v:maandStats.all.length,c:'var(--text-1)'},
          {l:'Win Rate',v:`${(maandStats.won.length+maandStats.lost.length)>0?((maandStats.won.length/(maandStats.won.length+maandStats.lost.length))*100).toFixed(0):0}%`,c:'var(--text-1)'},
          {l:'Totale Inzet',v:`€${maandStats.totalInzet.toFixed(0)}`,c:'var(--text-1)'},
          {l:'Winstdagen',v:maandStats.winstDagen,c:'var(--color-win)'},
          {l:'Verliesdagen',v:maandStats.verliesdagen,c:'var(--color-loss)'},
        ].map(s=>(
          <div key={s.l} style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px',boxShadow:'var(--shadow-sm)'}}>
            <p style={{fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{s.l}</p>
            <p style={{fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="cal-wrapper" style={{backgroundColor:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:24,boxShadow:'var(--shadow-sm)'}}>
        <div className="cal-header" style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid var(--border-subtle)'}}>
          {DAGEN.map(d=><div key={d} style={{padding:'12px 0',textAlign:'center',fontSize:11.5,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.05em',backgroundColor:'var(--bg-subtle)'}}>{d}</div>)}
        </div>
        <div className="cal-grid" style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {calendarDays.map((cell,i)=>{
            if(!cell) return <div key={`e${i}`} className="cal-empty-cell" style={{borderRight:i%7!==6?'1px solid var(--border-subtle)':'none',borderBottom:'1px solid var(--border-subtle)',minHeight:isMobile?54:80,backgroundColor:'var(--bg-subtle)',opacity:0.4}}/>;
            const {dag,key,data}=cell;
            const isToday = todayKey === key;
            const hasBets = data && data.bets.length > 0;
            const pnl = data?.pnl ?? 0;
            const lopendInzet = data?.bets.filter(b=>b.uitkomst==='lopend').reduce((s,b)=>s+Number(b.inzet),0) ?? 0;
            const int = hasBets ? Math.min(Math.abs(pnl)/maxAbs,1) : 0;
            let bg = 'var(--bg-card)';
            if(hasBets&&pnl>0) bg=`rgba(17,185,129,${0.05+int*0.22})`;
            else if(hasBets&&pnl<0) bg=`rgba(244,63,94,${0.05+int*0.20})`;
            else if(hasBets) bg='var(--bg-subtle)';
            const pnlColor = pnl>0?'var(--color-win)':pnl<0?'var(--color-loss)':'var(--text-3)';
            return (
              <div
                key={key}
                className="cal-day-cell"
                data-pnl={hasBets ? (pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'neutral') : 'none'}
                data-has-bets={hasBets ? 'true' : 'false'}
                data-today={isToday ? 'true' : 'false'}
                onClick={()=>hasBets&&setGeselecteerd(key)}
                style={{borderRight:i%7!==6?'1px solid var(--border-subtle)':'none',borderBottom:'1px solid var(--border-subtle)',minHeight:isMobile?54:84,padding:isMobile?'6px 4px':'10px 12px',backgroundColor:bg,cursor:hasBets?'pointer':'default',transition:'background-color 0.1s',display:isMobile?'flex':'block',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:isMobile?'center':'left'}}
              >
                {isMobile ? (
                  <>
                    <div style={{fontSize:11,fontWeight:400,color:isToday?'#fff':hasBets?'var(--text-2)':'var(--text-4)',backgroundColor:isToday?'var(--brand)':'transparent',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,marginBottom:hasBets?3:0}}>
                      {dag}
                    </div>
                    {hasBets&&(
                      <div style={{fontSize:12,fontWeight:700,color:pnl!==0?pnlColor:'var(--text-3)',lineHeight:1.1}}>
                        {pnl!==0?fmtAmt(Math.abs(pnl)):lopendInzet>0?`€${lopendInzet.toFixed(2)}`:'—'}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="cal-day-num" style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:isToday?'var(--brand)':'transparent',fontSize:12.5,fontWeight:isToday?700:hasBets?600:400,color:isToday?'#fff':hasBets?'var(--text-1)':'var(--text-4)',lineHeight:1,marginBottom:4,flexShrink:0}}>
                      {dag}
                    </div>
                    {hasBets&&(
                      <>
                        <div className="cal-day-pnl" style={{fontSize:12.5,fontWeight:700,color:pnl!==0?pnlColor:'var(--text-3)',lineHeight:1.2}}>
                          {pnl!==0?fmtPnl(pnl):lopendInzet>0?`€${lopendInzet.toFixed(2)}`:'—'}
                        </div>
                        <div className="cal-day-count" style={{fontSize:10.5,color:'var(--text-4)',marginTop:2}}>{data.bets.length} bet{data.bets.length!==1?'s':''}</div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="cal-legend" style={{padding:'12px 20px',borderTop:'1px solid var(--border-subtle)',backgroundColor:'var(--bg-subtle)',display:'flex',gap:20,alignItems:'center'}}>
          {[{c:'rgba(17,185,129,0.2)',l:'Winstdag'},{c:'rgba(244,63,94,0.15)',l:'Verliesdag'}].map(l=>(
            <div key={l.l} className="flex items-center gap-2"><div style={{width:12,height:12,borderRadius:3,backgroundColor:l.c}}/><span style={{fontSize:11.5,color:'var(--text-3)'}}>{l.l}</span></div>
          ))}
          <span style={{fontSize:11.5,color:'var(--text-4)',marginLeft:'auto'}}>Klik op een dag om bets te zien</span>
        </div>
      </div>


      {/* Day detail modal */}
      {mounted && geselecteerd && dagData[geselecteerd]?.bets.length > 0 && (
        <DagModal
          datum={geselecteerd}
          bets={dagData[geselecteerd].bets.slice().sort((a,b)=>a.bookmaker.localeCompare(b.bookmaker))}
          pnl={dagData[geselecteerd].pnl}
          onClose={()=>setGeselecteerd(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
