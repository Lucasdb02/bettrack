'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import UserDrawer from './UserDrawer';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const ADMIN_EMAILS = ['lucas@mybuqo.com', 'matthijs@mybuqo.com'];

const PLAN_COLORS = {
  gratis: { bg:'rgba(156,163,175,0.12)', color:'#9ca3af', border:'rgba(156,163,175,0.3)' },
  pro:    { bg:'rgba(84,105,212,0.12)',  color:'var(--brand)', border:'rgba(84,105,212,0.3)' },
  elite:  { bg:'rgba(251,191,36,0.12)', color:'#f59e0b', border:'rgba(251,191,36,0.3)' },
};

function PlanBadge({ plan }) {
  const c = PLAN_COLORS[plan] || PLAN_COLORS.gratis;
  return (
    <span style={{ padding:'2px 8px', borderRadius:5, fontSize:11, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.border}`, textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {plan}
    </span>
  );
}

function usePortalDropdown() {
  const btnRef = useRef(null);
  const [open, setOpen]       = useState(false);
  const [rect, setRect]       = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const toggle = useCallback(() => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  }, [open]);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.target?.closest?.('.dropdown-panel')) return; setOpen(false); };
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [open]);
  return { btnRef, open, rect, mounted, toggle, close };
}

function PlanDropdown({ userId, plan, onChange, disabled }) {
  const { dark } = useTheme();
  const { btnRef, open, rect, mounted, toggle, close } = usePortalDropdown();
  const PLANS = ['gratis', 'pro', 'elite'];
  const dropBg  = dark ? 'var(--bg-card)' : '#fff';
  const dropBdr = dark ? 'var(--border)'  : '#e5e7eb';
  const hoverBg = dark ? 'var(--bg-subtle)' : '#f9fafb';
  return (
    <>
      <button ref={btnRef} onClick={toggle} disabled={disabled} style={{
        display:'flex', alignItems:'center', gap:5, padding:'3px 8px 3px 5px',
        border:'1px solid var(--border)', borderRadius:7, backgroundColor:'var(--bg-card)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
      }}>
        <PlanBadge plan={plan}/>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink:0, transition:'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', color:'var(--text-3)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {mounted && open && rect && createPortal(
        <>
          <div onClick={close} style={{ position:'fixed', inset:0, zIndex:9998 }}/>
          <div className="dropdown-panel" style={{
            position:'fixed', top: rect.bottom+4, left: rect.left, zIndex:9999,
            backgroundColor: dropBg, border:`1px solid ${dropBdr}`,
            borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)', minWidth:120, overflow:'hidden',
          }}>
            {PLANS.map((p, i) => {
              const c = PLAN_COLORS[p];
              const sel = plan === p;
              return (
                <button key={p} onClick={() => { onChange(userId, p); close(); }} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  width:'100%', textAlign:'left', padding:'9px 14px',
                  fontSize:13, fontWeight: sel ? 700 : 400,
                  color: sel ? c.color : 'var(--text-1)',
                  backgroundColor: sel ? c.bg : 'transparent',
                  border:'none', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none', cursor:'pointer',
                }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.backgroundColor = hoverBg; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ textTransform:'capitalize' }}>{p}</span>
                  {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
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

/* ─── KPI Card ─── */
function KpiCard({ label, value, sub, color, trend, trendLabel, small }) {
  const isPos = trend > 0;
  const isNeg = trend < 0;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', boxShadow:'var(--shadow-sm)' }}>
      <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{label}</p>
      <p style={{ fontSize: small ? 20 : 24, fontWeight:800, color: color || 'var(--text-1)', lineHeight:1 }}>{value}</p>
      {(sub || trend != null) && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
          {trend != null && (
            <span style={{ fontSize:11, fontWeight:700, color: isPos ? 'var(--color-win)' : isNeg ? 'var(--color-loss)' : 'var(--text-4)', display:'flex', alignItems:'center', gap:2 }}>
              {isPos ? '▲' : isNeg ? '▼' : ''}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {(trendLabel || sub) && (
            <span style={{ fontSize:11, color:'var(--text-4)' }}>{trendLabel || sub}</span>
          )}
        </div>
      )}
      {sub && trend == null && <p style={{ fontSize:11, color:'var(--text-4)', marginTop:5 }}>{sub}</p>}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:14, marginTop:28, borderBottom:'1px solid var(--border-subtle)', paddingBottom:10 }}>
      <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-1)', marginBottom:2 }}>{title}</h2>
      {sub && <p style={{ fontSize:12, color:'var(--text-4)' }}>{sub}</p>}
    </div>
  );
}

/* ─── Custom tooltip for charts ─── */
function ChartTooltip({ active, payload, label, prefix = '€', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12, boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
      <p style={{ color:'var(--text-3)', marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-1)', fontWeight:700 }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toFixed(prefix === '€' ? 2 : 0) : p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

function fmtMonth(m) {
  const d = new Date(m + '-02');
  return d.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
}

/* ─── Main page ─── */
export default function AdminPage() {
  const { dark } = useTheme();
  const supabase = createClient();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState(null);
  const [search, setSearch]         = useState('');
  const [planFilter, setPlanFilter] = useState('alle');
  const [changing, setChanging]     = useState({});
  const [confirm, setConfirm]       = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErr('Niet ingelogd'); setLoading(false); return; }
    if (!ADMIN_EMAILS.includes(session.user.email)) { window.location.href = '/dashboard'; return; }
    const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${session.access_token}` } });
    const json = await res.json();
    if (!res.ok) { setErr(json.error || 'Fout'); setLoading(false); return; }
    setData(json);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const changePlan = async (userId, plan) => {
    setChanging(p => ({ ...p, [userId]: true }));
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/admin/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId, plan }),
    });
    setChanging(p => ({ ...p, [userId]: false }));
    setData(prev => ({ ...prev, users: prev.users.map(u => u.id === userId ? { ...u, plan } : u) }));
  };

  const deleteUser = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/admin/user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId }),
    });
    setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
    setConfirm(null);
  };

  if (loading) return <div style={{ padding:'24px' }} className="app-page"><div style={{ padding:'80px 0', textAlign:'center', color:'var(--text-4)', fontSize:14 }}>Laden...</div></div>;
  if (err)     return <div style={{ padding:'24px' }} className="app-page"><div style={{ padding:'60px 0', textAlign:'center', color:'#fb7185', fontSize:14 }}>{err}</div></div>;
  if (!data)   return null;

  const { stats, revenue_trend } = data;

  const filtered = data.users
    .filter(u => planFilter === 'alle' || u.plan === planFilter)
    .filter(u => !search || (u.email || '').toLowerCase().includes(search.toLowerCase()));

  const fmt    = d => d ? new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'2-digit' }) : '—';
  const fmtEur = n => `€${Number(n).toLocaleString('nl-NL', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  const fmtPct = n => n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(1)}%` : '—';

  // Chart colors
  const chartColor  = dark ? '#6b82f0' : '#5469d4';
  const chartColor2 = dark ? '#34d399' : '#10b981';
  const planBarColors = { gratis:'#6b7280', pro: dark ? '#6b82f0' : '#5469d4', elite:'#f59e0b' };

  // Plan breakdown for bar chart
  const planBreakdown = [
    { plan:'Gratis', count: stats.total_users - stats.paying_users, color: planBarColors.gratis },
    { plan:'Pro',    count: stats.pro_users,                         color: planBarColors.pro },
    { plan:'Elite',  count: stats.elite_users,                       color: planBarColors.elite },
  ];

  return (
    <div style={{ padding:'24px' }} className="app-page">

      {/* Header */}
      <div className="flex items-center justify-between mb-2 page-header">
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-1)', marginBottom:3 }}>Admin Dashboard</h1>
          <p style={{ fontSize:13, color:'var(--text-4)' }}>SaaS KPI's, klantoverzicht & beheer</p>
        </div>
        <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, height:34, padding:'0 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', color:'var(--text-2)', backgroundColor:'var(--bg-card)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Vernieuwen
        </button>
      </div>

      {/* ─── 1. Revenue & Groei ─── */}
      <SectionHeader title="Revenue & Groei" sub="MRR, ARR en maand-op-maand groei uit actieve Stripe abonnementen"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard label="MRR"       value={fmtEur(stats.mrr)}           sub="maandelijkse recurring omzet"     color="var(--color-win)" />
        <KpiCard label="ARR"       value={fmtEur(stats.arr)}           sub="jaarlijkse recurring omzet"       color="var(--color-win)" />
        <KpiCard label="MoM Groei" value={fmtPct(stats.mrr_growth)}    trend={stats.mrr_growth}               trendLabel="vs vorige maand" color={stats.mrr_growth >= 0 ? 'var(--color-win)' : 'var(--color-loss)'} />
        <KpiCard label="ARPU"      value={fmtEur(stats.arpu)}          sub="per betalende gebruiker"          />
      </div>

      {/* ─── 2. Klanten ─── */}
      <SectionHeader title="Klanten & Conversie" sub="Gebruikersgroei, conversie van gratis naar betaald en activiteit"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard label="Totale Gebruikers" value={stats.total_users}       sub={`+${stats.new_this_week} deze week`} />
        <KpiCard label="Betalend"          value={stats.paying_users}      sub={`${stats.pro_users} pro · ${stats.elite_users} elite`} color="var(--brand)" />
        <KpiCard label="Trial Conversie"   value={`${stats.trial_conversion.toFixed(1)}%`} sub="gratis → betaald" color={stats.trial_conversion >= 5 ? 'var(--color-win)' : 'var(--text-1)'} />
        <KpiCard label="MAU"               value={stats.mau}              sub={`${stats.wau} WAU · ${stats.dau} DAU`} />
      </div>

      {/* ─── 3. Churn & Health ─── */}
      <SectionHeader title="Churn & Gezondheid" sub="Opzeggingen, mislukte betalingen en retentie"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard label="Churn Rate"       value={`${stats.churn_rate.toFixed(1)}%`}  sub="cumulatief opgezegd"    color={stats.churn_rate > 10 ? 'var(--color-loss)' : 'var(--text-1)'} />
        <KpiCard label="Opzeggingen"      value={Math.round(stats.churn_rate / 100 * (stats.paying_users + Math.round(stats.churn_rate / 100 * stats.paying_users)))}  sub="totaal gecanceld" color="var(--color-loss)" />
        <KpiCard label="Failed Payments"  value={stats.failed_payments}               sub="openstaande facturen"   color={stats.failed_payments > 0 ? '#f59e0b' : 'var(--text-4)'} />
        <KpiCard label="Totale Omzet"     value={fmtEur(stats.total_revenue)}        sub="alle Stripe betalingen"  color="var(--color-win)" />
      </div>

      {/* ─── 4. Charts ─── */}
      <SectionHeader title="Trends" sub="Revenue en gebruikersgroei per maand (laatste 12 maanden)"/>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:28 }}>

        {/* Revenue + New Users area chart */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>Revenue per maand (€)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue_trend} margin={{ top:4, right:4, left:-10, bottom:0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={chartColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fontSize:10.5, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10.5, fill:'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`}/>
              <Tooltip content={<ChartTooltip prefix="€"/>}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartColor} strokeWidth={2} fill="url(#revGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan breakdown + new users */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Plan bar chart */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)', flex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>Plan verdeling</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={planBreakdown} margin={{ top:0, right:4, left:-20, bottom:0 }} barSize={28}>
                <XAxis dataKey="plan" tick={{ fontSize:11, fill:'var(--text-3)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip prefix="" suffix=" users"/>}/>
                <Bar dataKey="count" name="Gebruikers" radius={[4,4,0,0]}>
                  {planBreakdown.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New users bar chart */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)', flex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>Nieuwe gebruikers/maand</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={revenue_trend} margin={{ top:0, right:4, left:-20, bottom:0 }} barSize={10}>
                <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fontSize:9.5, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'var(--text-4)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<ChartTooltip prefix="" suffix=" users"/>}/>
                <Bar dataKey="new_users" name="Nieuw" fill={chartColor2} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── 5. Klantentabel ─── */}
      <SectionHeader title="Klantenoverzicht" sub={`${data.users.length} geregistreerde gebruikers`}/>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek op e-mail..." style={{ width:'100%', height:34, padding:'0 12px 0 30px', border:'1px solid var(--border)', borderRadius:7, fontSize:13, color:'var(--text-1)', backgroundColor:'var(--bg-card)', boxSizing:'border-box' }}/>
        </div>
        {['alle','gratis','pro','elite'].map(p => (
          <button key={p} onClick={() => setPlanFilter(p)} style={{ height:34, padding:'0 14px', border:`1px solid ${planFilter===p?'var(--brand)':'var(--border)'}`, borderRadius:7, fontSize:12.5, fontWeight:600, cursor:'pointer', color: planFilter===p?'var(--brand)':'var(--text-3)', backgroundColor:'var(--bg-card)', textTransform:'capitalize' }}>
            {p}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-4)' }}>{filtered.length} gebruikers</span>
      </div>

      {/* Table */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
          <thead>
            <tr>
              {['E-mail','Aangemeld','Laatst actief','Plan','Bets','Stortingen','Opnames','Stripe omzet','Betalingen','Acties'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', backgroundColor:'var(--bg-subtle)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ padding:'40px', textAlign:'center', color:'var(--text-4)', fontSize:13 }}>Geen gebruikers gevonden.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ borderTop:'1px solid var(--border-subtle)', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', backgroundColor:'var(--bg-brand)', border:'1px solid var(--brand-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--brand)', flexShrink:0 }}>
                      {(u.email || u.id)[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13, color:'var(--text-1)', fontWeight:500 }}>{u.email || <span style={{ color:'var(--text-4)', fontStyle:'italic' }}>geen e-mail</span>}</p>
                      <p style={{ fontSize:10.5, color:'var(--text-4)', fontFamily:'monospace' }}>{u.id.slice(0,8)}…</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'11px 14px', fontSize:12.5, color:'var(--text-3)', whiteSpace:'nowrap' }}>{fmt(u.created_at)}</td>
                <td style={{ padding:'11px 14px', fontSize:12.5, color:'var(--text-3)', whiteSpace:'nowrap' }}>{fmt(u.last_sign_in_at)}</td>
                <td style={{ padding:'11px 14px' }} onClick={e => e.stopPropagation()}>
                  <PlanDropdown userId={u.id} plan={u.plan} onChange={changePlan} disabled={!!changing[u.id]}/>
                </td>
                <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:'var(--text-1)' }}>{u.bet_count}</td>
                <td style={{ padding:'11px 14px', fontSize:13, color:'var(--color-win)', fontWeight:700 }}>{u.deposit_count}</td>
                <td style={{ padding:'11px 14px', fontSize:13, color:'var(--color-loss)', fontWeight:700 }}>{u.withdrawal_count}</td>
                <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color: u.stripe_revenue > 0 ? 'var(--color-win)' : 'var(--text-4)' }}>
                  {u.stripe_revenue > 0 ? fmtEur(u.stripe_revenue) : '—'}
                </td>
                <td style={{ padding:'11px 14px', fontSize:12.5, color:'var(--text-3)' }}>
                  {u.stripe_invoice_count > 0 ? `${u.stripe_invoice_count}×` : '—'}
                </td>
                <td style={{ padding:'11px 14px' }} onClick={e => e.stopPropagation()}>
                  {confirm === u.id ? (
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={() => deleteUser(u.id)} style={{ padding:'3px 10px', background:'#fb7185', color:'#fff', border:'none', borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer' }}>Verwijder</button>
                      <button onClick={() => setConfirm(null)} style={{ padding:'3px 8px', background:'var(--bg-subtle)', color:'var(--text-3)', border:'none', borderRadius:5, fontSize:11, cursor:'pointer' }}>Annuleer</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirm(u.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--border)', padding:4 }} title="Verwijder gebruiker">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)}/>
      )}
    </div>
  );
}
