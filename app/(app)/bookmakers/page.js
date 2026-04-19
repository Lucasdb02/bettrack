'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFmt, ALL_BOOKMAKERS } from '../../context/PreferencesContext';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { useTheme } from '../../context/ThemeContext';
import BookmakerIcon, { BOOKIE_BRAND_COLORS } from '../../components/BookmakerIcon';
import { getDateRange, fmtBucketLabel } from '../../lib/dateUtils';
import PeriodDropdown from '../../components/PeriodDropdown';
import { createClient } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const FALLBACK_COLORS = [
  '#5469d4','#0e9f6e','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#ec4899','#14b8a6','#84cc16',
];

function bookieColor(naam, activeList) {
  if (BOOKIE_BRAND_COLORS[naam]) return BOOKIE_BRAND_COLORS[naam];
  const idx = activeList.indexOf(naam);
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

/* ── Build stacked chart data ── */
function buildChartData(bets, activeBookies, bookmakersConfig, period, customRange, transactions, dbBookmakers) {
  let from, to;
  if (period === 'all') {
    const settled = bets.filter(b => b.uitkomst !== 'lopend');
    if (settled.length === 0) return [];
    const dates = settled.map(b => new Date(b.datum).getTime());
    from = new Date(Math.min(...dates));
    to   = new Date();
  } else if (period === 'custom') {
    if (!customRange?.from || !customRange?.to) return [];
    from = customRange.from;
    const t = new Date(customRange.to); t.setDate(t.getDate() + 1);
    to = t;
  } else {
    const range = getDateRange(period);
    if (!range) return [];
    from = range.from;
    to   = range.to;
  }

  const diffDays = Math.ceil((to - from) / 86400000);
  const bucketType = diffDays <= 35 ? 'day' : diffDays <= 180 ? 'week' : 'month';

  const buckets = [];
  const cur = new Date(from);
  while (cur < to) {
    buckets.push(new Date(cur));
    if (bucketType === 'day')        cur.setDate(cur.getDate() + 1);
    else if (bucketType === 'week')  cur.setDate(cur.getDate() + 7);
    else                             cur.setMonth(cur.getMonth() + 1);
  }
  if (buckets.length === 0) return [];

  const settledBets = bets.filter(b => b.uitkomst !== 'lopend');

  return buckets.map(date => {
    const cutoff = date.getTime() + 86400000;
    const point  = { label: fmtBucketLabel(date, bucketType) };
    activeBookies.forEach(naam => {
      const cfg          = bookmakersConfig[naam] || {};
      const startBalance = cfg.startBalance || 0;
      const startDate    = cfg.startDate ? (() => { const [y,m,d] = cfg.startDate.split('-').map(Number); return new Date(y, m-1, d).getTime(); })() : 0;

      if (startDate && date.getTime() < startDate) {
        point[naam] = 0;
        return;
      }

      const pnl = settledBets
        .filter(b => {
          const t = new Date(b.datum).getTime();
          return b.bookmaker === naam && t < cutoff && t >= startDate;
        })
        .reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);

      const bm = dbBookmakers?.find(b => b.naam === naam);
      const netTx = bm && transactions ? transactions
        .filter(tx => tx.bookmaker_id === bm.id && new Date(tx.datum).getTime() < cutoff)
        .reduce((s, tx) => s + (tx.type === 'deposit' ? Number(tx.amount) : -Number(tx.amount)), 0)
        : 0;

      const bal = parseFloat((startBalance + pnl + netTx).toFixed(2));
      point[naam] = bal > 0 ? bal : 0;
    });
    return point;
  });
}

/* ── Custom stacked tooltip ── */
function StackedTip({ active, payload, label, activeBookies }) {
  const { dark } = useTheme();
  if (!active || !payload?.length) return null;
  const bg     = dark ? '#1c2335' : '#ffffff';
  const border = dark ? '#2a3347' : '#e5e7eb';
  const text3  = dark ? '#8b949e' : '#6b7280';
  const text2  = dark ? '#c9d1d9' : '#374151';
  const total  = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div style={{ backgroundColor:bg, border:`1px solid ${border}`, borderRadius:8, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', fontSize:12, minWidth:160 }}>
      <p style={{ color:text3, fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{label}</p>
      {[...payload].reverse().map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:2, backgroundColor:p.fill, flexShrink:0 }}/>
          <span style={{ color:text2, flex:1 }}>{p.dataKey}</span>
          <span style={{ fontWeight:700, color:text2 }}>€{p.value?.toFixed(2)}</span>
        </div>
      ))}
      <div style={{ borderTop:`1px solid ${border}`, marginTop:6, paddingTop:6, display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:text3, fontWeight:700 }}>Totaal</span>
        <span style={{ fontWeight:800, color:text2 }}>€{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */
function Chevron({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, transition:'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
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

/* ── Bookmaker multi-select filter dropdown ── */
function BookmakerFilterDropdown({ bookmakers, selected, onChange }) {
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const count     = selected.length;
  const toggleOpt = (naam) => onChange(selected.includes(naam) ? selected.filter(n => n !== naam) : [...selected, naam]);
  const clear     = (e) => { e.stopPropagation(); onChange([]); };

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{
        display:'flex', alignItems:'center', gap:7,
        padding:'7px 11px', border:`1px solid ${count > 0 ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius:8, backgroundColor:'var(--bg-card)',
        color: count > 0 ? 'var(--brand)' : 'var(--text-2)',
        fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', width:'fit-content',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        Bookmaker{count > 0 ? ` (${count})` : ''}
        {count > 0 && (
          <span onClick={clear} style={{ width:14, height:14, borderRadius:'50%', backgroundColor:'var(--brand)', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</span>
        )}
        <Chevron open={open}/>
      </button>

      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{ position:'fixed', inset:0, zIndex:9998 }}/>
          <div style={{
            position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex:9999,
            backgroundColor:'#fff', border:'1px solid #e5e7eb',
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            minWidth:180, maxHeight:240, overflowY:'auto',
          }}>
            <div style={{ padding:'6px 8px', borderBottom:'1px solid #f3f4f6' }}>
              <button onClick={() => onChange([])} style={{ width:'100%', textAlign:'left', padding:'5px 8px', fontSize:12, color:'#6b7280', backgroundColor:'transparent', border:'none', cursor:'pointer', borderRadius:4 }}>
                Alles deselecteren
              </button>
            </div>
            {bookmakers.map(naam => {
              const checked = selected.includes(naam);
              return (
                <button key={naam} onClick={() => toggleOpt(naam)} style={{
                  display:'flex', alignItems:'center', gap:9, width:'100%',
                  textAlign:'left', padding:'9px 16px', fontSize:13,
                  color: checked ? '#3b5bdb' : '#1a1f36',
                  backgroundColor: checked ? '#eef2ff' : 'transparent',
                  border:'none', cursor:'pointer', transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={e => { if (!checked) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div style={{ width:15, height:15, borderRadius:4, border:`2px solid ${checked ? '#3b5bdb' : '#d1d5db'}`, backgroundColor: checked ? '#3b5bdb' : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                  </div>
                  {naam}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function BookmakersPage() {
  const { fmtPnl } = useFmt();
  const { bets } = useBets();

  // Supabase state
  const [dbBookmakers, setDbBookmakers] = useState([]); // [{id, naam, saldo, start_datum}]
  const [loadedBm, setLoadedBm]         = useState(false);
  const [transactions, setTransactions] = useState([]); // [{id, bookmaker_id, type, amount, datum, notitie}]

  const [editBalance, setEditBalance]     = useState({});
  const [editDate,    setEditDate]        = useState({});
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [period, setPeriod]               = useState('last28');
  const [customRange, setCustomRange]     = useState(null);
  const [filterBookies, setFilterBookies] = useState([]);

  // Transaction form state
  const [txBookie,  setTxBookie]  = useState('');
  const [txType,    setTxType]    = useState('deposit');
  const [txAmount,  setTxAmount]  = useState('');
  const [txDate,    setTxDate]    = useState(() => new Date().toISOString().split('T')[0]);
  const [txLoading, setTxLoading] = useState(false);

  const supabase = createClient();

  // Fetch bookmakers + transactions from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadedBm(true); return; }

      const [bmRes, txRes] = await Promise.all([
        supabase.from('bookmakers').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('datum', { ascending: true }),
      ]);

      if (!bmRes.error && bmRes.data) setDbBookmakers(bmRes.data);
      if (!txRes.error && txRes.data) setTransactions(txRes.data);
      setLoadedBm(true);
    }
    fetchData();
  }, []);

  // Derived lists
  const activeBookies   = dbBookmakers.map(b => b.naam);
  const inactiveBookies = ALL_BOOKMAKERS.filter(n => !dbBookmakers.some(b => b.naam === n));
  const visibleBookies  = filterBookies.length === 0 ? activeBookies : activeBookies.filter(n => filterBookies.includes(n));

  const getConfig = useCallback((naam) => {
    const bm = dbBookmakers.find(b => b.naam === naam);
    return { startBalance: bm?.saldo || 0, startDate: bm?.start_datum || null };
  }, [dbBookmakers]);

  // bookmakersConfig shape for chart
  const bookmakersConfig = useMemo(() => {
    const cfg = {};
    dbBookmakers.forEach(b => {
      cfg[b.naam] = { startBalance: b.saldo || 0, startDate: b.start_datum || null };
    });
    return cfg;
  }, [dbBookmakers]);

  const pnlPerBookie = useMemo(() => {
    const map = {};
    bets.filter(b => b.uitkomst !== 'lopend').forEach(b => {
      if (!map[b.bookmaker]) map[b.bookmaker] = { pnl:0, bets:0, gewonnen:0, verloren:0 };
      map[b.bookmaker].pnl += berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet));
      map[b.bookmaker].bets++;
      if (b.uitkomst === 'gewonnen') map[b.bookmaker].gewonnen++;
      if (b.uitkomst === 'verloren') map[b.bookmaker].verloren++;
    });
    return map;
  }, [bets]);

  const lopendPerBookie = useMemo(() => {
    const map = {};
    bets.filter(b => b.uitkomst === 'lopend').forEach(b => {
      map[b.bookmaker] = (map[b.bookmaker] || 0) + Number(b.inzet);
    });
    return map;
  }, [bets]);

  const chartData = useMemo(
    () => buildChartData(bets, visibleBookies, bookmakersConfig, period, customRange, transactions, dbBookmakers),
    [bets, visibleBookies, bookmakersConfig, period, customRange, transactions, dbBookmakers]
  );

  const netTxPerBookie = useMemo(() => {
    const map = {};
    dbBookmakers.forEach(bm => {
      map[bm.naam] = transactions
        .filter(tx => tx.bookmaker_id === bm.id)
        .reduce((s, tx) => s + (tx.type === 'deposit' ? Number(tx.amount) : -Number(tx.amount)), 0);
    });
    return map;
  }, [transactions, dbBookmakers]);

  const totalBalance = useMemo(
    () => activeBookies.reduce((s, n) => {
      const cfg   = getConfig(n);
      const stats = pnlPerBookie[n] || { pnl:0 };
      const netTx = netTxPerBookie[n] || 0;
      return s + cfg.startBalance + stats.pnl + netTx;
    }, 0),
    [activeBookies, bookmakersConfig, pnlPerBookie, netTxPerBookie]
  );

  const displayStats = useMemo(() => {
    const sumBucket = (b) => visibleBookies.reduce((s, n) => s + (b[n] || 0), 0);
    if (chartData.length === 0) return { balance: totalBalance, pct: null };
    const endBal = sumBucket(chartData[chartData.length - 1]);
    if (chartData.length === 1) return { balance: endBal, pct: null };
    const firstWithData = chartData.find(b => sumBucket(b) > 0);
    if (!firstWithData || firstWithData === chartData[chartData.length - 1])
      return { balance: endBal, pct: null };
    const startBal = sumBucket(firstWithData);
    const pct = ((endBal - startBal) / startBal) * 100;
    return { balance: endBal, pct };
  }, [chartData, activeBookies, totalBalance]);

  const addBookmaker = async () => {
    if (!selectedToAdd) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('bookmakers')
      .insert({ user_id: user.id, naam: selectedToAdd, saldo: 0 })
      .select()
      .single();
    if (!error && data) setDbBookmakers(prev => [...prev, data]);
    setSelectedToAdd('');
  };

  const removeBookmaker = async (naam) => {
    const bm = dbBookmakers.find(b => b.naam === naam);
    if (!bm) return;
    const { error } = await supabase.from('bookmakers').delete().eq('id', bm.id);
    if (!error) setDbBookmakers(prev => prev.filter(b => b.naam !== naam));
  };

  const commitBalance = async (naam) => {
    const val = parseFloat(editBalance[naam]);
    if (!isNaN(val)) {
      const bm = dbBookmakers.find(b => b.naam === naam);
      if (bm) {
        await supabase.from('bookmakers').update({ saldo: val }).eq('id', bm.id);
        setDbBookmakers(prev => prev.map(b => b.naam === naam ? { ...b, saldo: val } : b));
      }
    }
    setEditBalance(p => { const n={...p}; delete n[naam]; return n; });
  };

  const commitDate = async (naam) => {
    const val = editDate[naam] || null;
    const bm = dbBookmakers.find(b => b.naam === naam);
    if (bm) {
      await supabase.from('bookmakers').update({ start_datum: val }).eq('id', bm.id);
      setDbBookmakers(prev => prev.map(b => b.naam === naam ? { ...b, start_datum: val } : b));
    }
    setEditDate(p => { const n={...p}; delete n[naam]; return n; });
  };

  const addTransaction = async () => {
    const amt = parseFloat(txAmount);
    if (!txBookie || !txAmount || isNaN(amt) || amt <= 0) return;
    setTxLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTxLoading(false); return; }
    const bm = dbBookmakers.find(b => b.naam === txBookie);
    if (!bm) { setTxLoading(false); return; }
    const { data, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, bookmaker_id: bm.id, type: txType, amount: amt, datum: txDate })
      .select()
      .single();
    if (!error && data) {
      setTransactions(prev => [...prev, data].sort((a, b) => new Date(a.datum) - new Date(b.datum)));
    }
    setTxAmount('');
    setTxLoading(false);
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  if (!loadedBm) return <div className="flex items-center justify-center h-full" style={{ color:'var(--text-4)' }}>Laden...</div>;

  return (
    <div style={{ maxWidth:1060, margin:'0 auto', padding:'40px 32px' }}>
      <div className="mb-8">
        <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>Bookmakers</h1>
        <p style={{ fontSize:14, color:'var(--text-3)' }}>Selecteer je bookmakers en houd je balances bij</p>
      </div>

      {/* ── Balance chart ── */}
      {activeBookies.length > 0 && (
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'22px 24px', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:11.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Totale Balance</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                <p style={{ fontSize:26, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>€{totalBalance.toFixed(2)}</p>
                {displayStats.pct !== null && (
                  <span style={{ fontSize:14, fontWeight:700, color: displayStats.pct >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                    {displayStats.pct >= 0 ? '+' : ''}{displayStats.pct.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <BookmakerFilterDropdown
                bookmakers={activeBookies}
                selected={filterBookies}
                onChange={setFilterBookies}
              />
              <PeriodDropdown
                filter={period}
                onSelect={setPeriod}
                customRange={customRange}
                onCustomRange={setCustomRange}
              />
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top:0, right:8, left:0, bottom:0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false}/>
                <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}`} width={56}/>
                <Tooltip
                  content={<StackedTip activeBookies={activeBookies}/>}
                  cursor={false}
                  wrapperStyle={{ zIndex:9999 }}
                />
                {visibleBookies.map(naam => (
                  <Bar key={naam} dataKey={naam} stackId="balance" fill={bookieColor(naam, activeBookies)} radius={[0,0,0,0]}/>
                ))}
                {visibleBookies.length > 0 && (
                  <Bar key={`${visibleBookies[visibleBookies.length-1]}_top`} dataKey={visibleBookies[visibleBookies.length-1]} stackId="balance" fill={bookieColor(visibleBookies[visibleBookies.length-1], activeBookies)} radius={[4,4,0,0]} hide/>
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-4)', fontSize:13.5 }}>
              Voeg bets toe om de balancehistorie te zien
            </div>
          )}

          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:16 }}>
            {visibleBookies.map(naam => (
              <div key={naam} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, backgroundColor:bookieColor(naam, activeBookies), flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>{naam}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add bookmaker + Deposits/Withdrawals ── */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'20px 24px', marginBottom:24 }}>

        {/* — Bookmaker toevoegen — */}
        <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Bookmaker toevoegen</h2>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, maxWidth:320 }}>
            <select
              value={selectedToAdd}
              onChange={e => setSelectedToAdd(e.target.value)}
              style={{ width:'100%', padding:'9px 36px 9px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:13.5, color: selectedToAdd ? 'var(--text-1)' : 'var(--text-4)', backgroundColor:'var(--bg-input)', appearance:'none', cursor:'pointer' }}
            >
              <option value="">Selecteer een bookmaker...</option>
              {inactiveBookies.map(naam => (
                <option key={naam} value={naam}>{naam}{pnlPerBookie[naam] ? ' ●' : ''}</option>
              ))}
            </select>
            <svg style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text-3)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button
            onClick={addBookmaker}
            disabled={!selectedToAdd}
            style={{
              padding:'9px 20px',
              background: selectedToAdd ? 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)' : 'var(--bg-subtle)',
              color: selectedToAdd ? '#fff' : 'var(--text-4)',
              border: selectedToAdd ? 'none' : '1px solid var(--border)',
              borderBottom: selectedToAdd ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border)',
              boxShadow: selectedToAdd ? '0 2px 16px rgba(84,105,212,0.45)' : 'none',
              borderRadius:7, fontSize:13.5, fontWeight:600,
              cursor: selectedToAdd ? 'pointer' : 'default',
              display:'flex', alignItems:'center', gap:7,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Toevoegen
          </button>
        </div>
        {inactiveBookies.length === 0 && (
          <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:10 }}>Alle bookmakers zijn al toegevoegd.</p>
        )}

        {/* — Divider — */}
        <div style={{ margin:'20px -24px', borderTop:'1px solid var(--border)' }} />

        {/* — Deposits + Withdrawals — */}
        <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Deposits + Withdrawals</h2>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          {/* Bookmaker select */}
          <div style={{ position:'relative', flex:'0 0 160px' }}>
            <select
              value={txBookie}
              onChange={e => setTxBookie(e.target.value)}
              style={{ width:'100%', padding:'9px 30px 9px 10px', border:'1px solid var(--border)', borderRadius:7, fontSize:13, color: txBookie ? 'var(--text-1)' : 'var(--text-4)', backgroundColor:'var(--bg-input)', appearance:'none', cursor:'pointer' }}
            >
              <option value="">Bookmaker...</option>
              {activeBookies.map(naam => <option key={naam} value={naam}>{naam}</option>)}
            </select>
            <svg style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text-3)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {/* Type toggle */}
          <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:7, overflow:'hidden', flexShrink:0 }}>
            {[
              { val:'deposit',    label:'Storting' },
              { val:'withdrawal', label:'Opname'   },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setTxType(opt.val)}
                style={{
                  padding:'8px 14px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                  background: txType === opt.val
                    ? (opt.val === 'deposit' ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)')
                    : 'var(--bg-input)',
                  color: txType === opt.val
                    ? (opt.val === 'deposit' ? 'var(--color-win)' : 'var(--color-loss)')
                    : 'var(--text-3)',
                  transition:'all 0.12s',
                }}
              >{opt.label}</button>
            ))}
          </div>

          {/* Amount */}
          <div style={{ position:'relative', flex:'0 0 130px' }}>
            <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13, pointerEvents:'none' }}>€</span>
            <input
              type="number" min="0.01" step="0.01"
              placeholder="0.00"
              value={txAmount}
              onChange={e => setTxAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTransaction()}
              style={{ width:'100%', padding:'9px 10px 9px 24px', border:'1px solid var(--border)', borderRadius:7, fontSize:13, color:'var(--text-1)', backgroundColor:'var(--bg-input)' }}
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={txDate}
            onChange={e => setTxDate(e.target.value)}
            style={{ padding:'9px 10px', border:'1px solid var(--border)', borderRadius:7, fontSize:13, color:'var(--text-1)', backgroundColor:'var(--bg-input)', flex:'0 0 150px' }}
          />

          {/* Submit */}
          <button
            onClick={addTransaction}
            disabled={txLoading || !txBookie || !txAmount}
            style={{
              padding:'9px 18px', fontSize:13, fontWeight:600,
              background: (!txBookie || !txAmount) ? 'var(--bg-subtle)' : txType === 'deposit'
                ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
                : 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
              color: (!txBookie || !txAmount) ? 'var(--text-4)' : '#fff',
              border: 'none',
              borderBottom: (!txBookie || !txAmount) ? '1px solid var(--border)' : txType === 'deposit'
                ? '1px solid rgba(255,255,255,0.2)'
                : '1px solid rgba(255,255,255,0.2)',
              boxShadow: (!txBookie || !txAmount) ? 'none' : '0 2px 12px rgba(0,0,0,0.2)',
              borderRadius:7, cursor: (!txBookie || !txAmount) ? 'default' : 'pointer',
              display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registreren
          </button>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:2 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Recente transacties</p>
            {[...transactions].reverse().slice(0, 8).map(tx => {
              const bmNaam = dbBookmakers.find(b => b.id === tx.bookmaker_id)?.naam || '—';
              const isDeposit = tx.type === 'deposit';
              return (
                <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', borderRadius:7, backgroundColor:'var(--bg-subtle)' }}>
                  <span style={{ fontSize:12, fontWeight:700, color: isDeposit ? 'var(--color-win)' : 'var(--color-loss)', width:76, flexShrink:0 }}>
                    {isDeposit ? '+' : '-'}€{Number(tx.amount).toFixed(2)}
                  </span>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', flex:1 }}>{bmNaam}</span>
                  <span style={{ fontSize:11.5, color:'var(--text-4)', flexShrink:0 }}>
                    {new Date(tx.datum).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                  <span style={{ fontSize:11, color:'var(--text-4)', flexShrink:0, fontWeight:500 }}>
                    {isDeposit ? 'Storting' : 'Opname'}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    title="Verwijder"
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--border)', padding:'2px 4px', flexShrink:0, lineHeight:1 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-loss)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeBookies.length === 0 && (
          <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:8 }}>Voeg eerst een bookmaker toe om deposits/withdrawals te registreren.</p>
        )}
      </div>

      {/* ── Active bookmaker cards ── */}
      {activeBookies.length === 0 ? (
        <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'48px 24px', textAlign:'center', color:'var(--text-4)', fontSize:14 }}>
          Nog geen bookmakers toegevoegd. Selecteer hierboven een bookmaker om te beginnen.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Actieve Bookmakers</h2>
          {activeBookies.map(naam => {
            const cfg            = getConfig(naam);
            const stats          = pnlPerBookie[naam] || { pnl:0, bets:0, gewonnen:0, verloren:0 };
            const lopend         = lopendPerBookie[naam] || 0;
            const netTx          = netTxPerBookie[naam] || 0;
            const currentBalance = cfg.startBalance + stats.pnl + netTx;
            const isEditing      = naam in editBalance;
            const color          = bookieColor(naam, activeBookies);

            const isEditingDate = naam in editDate;
            const fmtStartDate  = cfg.startDate
              ? new Date(cfg.startDate).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'numeric' })
              : null;

            return (
              <div key={naam} style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'nowrap', minWidth:0 }}>

                  {/* Color dot + icon + name */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:'0 0 150px', minWidth:0 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', backgroundColor:color, flexShrink:0 }}/>
                    <BookmakerIcon naam={naam} size={20}/>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{naam}</span>
                  </div>

                  {/* Startdatum */}
                  <div style={{ flex:'0 0 148px' }}>
                    <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Startdatum</p>
                    {isEditingDate ? (
                      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        <input
                          type="date" autoFocus
                          value={editDate[naam]}
                          onChange={e => setEditDate(p => ({ ...p, [naam]: e.target.value }))}
                          onKeyDown={e => { if(e.key==='Enter') commitDate(naam); if(e.key==='Escape') setEditDate(p => { const n={...p}; delete n[naam]; return n; }); }}
                          style={{ padding:'4px 6px', border:'1px solid #5469d4', borderRadius:6, fontSize:12, color:'var(--text-1)', backgroundColor:'var(--bg-input)', width:120 }}
                        />
                        <button onClick={() => commitDate(naam)} style={{ padding:'4px 7px', background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color:'#fff', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, fontSize:12, cursor:'pointer' }}>✓</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditDate(p => ({ ...p, [naam]: cfg.startDate || '' }))} style={{ background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'baseline', gap:5 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{fmtStartDate || '—'}</span>
                        <span style={{ fontSize:11, color:'var(--text-4)' }}>aanpassen</span>
                      </button>
                    )}
                  </div>

                  {/* Start balance */}
                  <div style={{ flex:'0 0 155px' }}>
                    <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Startbalance</p>
                    {isEditing ? (
                      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        <div style={{ position:'relative', flex:1 }}>
                          <span style={{ position:'absolute', left:7, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13 }}>€</span>
                          <input
                            type="number" step="0.01" autoFocus
                            value={editBalance[naam]}
                            onChange={e => setEditBalance(p => ({ ...p, [naam]: e.target.value }))}
                            onKeyDown={e => { if(e.key==='Enter') commitBalance(naam); if(e.key==='Escape') setEditBalance(p => { const n={...p}; delete n[naam]; return n; }); }}
                            style={{ width:'100%', padding:'4px 7px 4px 20px', border:'1px solid #5469d4', borderRadius:6, fontSize:13, color:'var(--text-1)', backgroundColor:'var(--bg-input)' }}
                          />
                        </div>
                        <button onClick={() => commitBalance(naam)} style={{ padding:'4px 7px', background:'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color:'#fff', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, fontSize:12, cursor:'pointer' }}>✓</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditBalance(p => ({ ...p, [naam]: String(cfg.startBalance) }))} style={{ background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'baseline', gap:5 }}>
                        <span style={{ fontSize:15, fontWeight:700, color:'var(--text-1)' }}>€{cfg.startBalance.toFixed(2)}</span>
                        <span style={{ fontSize:11, color:'var(--text-4)' }}>aanpassen</span>
                      </button>
                    )}
                  </div>

                  {/* P&L */}
                  <div style={{ flex:'0 0 100px' }}>
                    <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>P&L bets</p>
                    <span style={{ fontSize:15, fontWeight:700, color: stats.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>{fmtPnl(stats.pnl)}</span>
                  </div>

                  {/* Current balance */}
                  <div style={{ flex:'0 0 130px' }}>
                    <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Huidige Balance</p>
                    <span style={{ fontSize:15, fontWeight:800, color: currentBalance >= 0 ? 'var(--text-1)' : 'var(--color-loss)' }}>€{currentBalance.toFixed(2)}</span>
                  </div>

                  {/* Bet stats */}
                  <div style={{ flex:'0 0 100px' }}>
                    <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Bets</p>
                    <div style={{ fontSize:13, color:'var(--text-2)', whiteSpace:'nowrap' }}>{stats.bets} settled</div>
                    {stats.bets > 0 && <div style={{ display:'flex', gap:5, marginTop:2 }}><span style={{ fontSize:11.5, color:'var(--color-win)', fontWeight:600 }}>{stats.gewonnen}W</span><span style={{ fontSize:11.5, color:'var(--color-loss)', fontWeight:600 }}>{stats.verloren}V</span></div>}
                    {lopend > 0 && <div style={{ fontSize:11, color:'#1d4ed8', fontWeight:600, marginTop:2, whiteSpace:'nowrap' }}>€{lopend.toFixed(0)} lopend</div>}
                  </div>

                  {/* Balance progress bar */}
                  <div style={{ flex:1, minWidth:40 }}>
                    <div style={{ height:6, backgroundColor:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:99, backgroundColor: stats.pnl >= 0 ? color : '#F43F5E', width:`${Math.min(cfg.startBalance > 0 ? Math.abs(stats.pnl/cfg.startBalance)*100 : 0, 100)}%`, transition:'width 0.4s ease' }}/>
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeBookmaker(naam)} title="Verwijder" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--border)', padding:4, flexShrink:0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
