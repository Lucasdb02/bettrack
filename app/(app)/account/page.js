'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePreferences, useFmt } from '../../context/PreferencesContext';
import { useBets, berekenWinst } from '../../context/BetsContext';
import { createClient } from '@/lib/supabase';

const ADMIN_EMAIL = 'lucas@mybuqo.com';

const BASE_TABS = [
  { id: 'overzicht', label: 'Overzicht' },
  { id: 'voorkeuren', label: 'Voorkeuren' },
  { id: 'gegevens', label: 'Gegevens' },
];

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '0 16px', fontSize: 13, fontWeight: 600,
      border: 'none', borderRadius: 6, cursor: 'pointer',
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: active ? 'var(--bg-card)' : 'transparent',
      color: active ? 'var(--brand)' : 'var(--text-3)',
      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
      transition: 'all 0.12s', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:20, boxShadow:'var(--shadow-sm)' }}>
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>{title}</h2>
      </div>
      <div style={{ padding:'20px 24px' }}>{children}</div>
    </div>
  );
}

function Row({ label, hint, last, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:40, ...(last ? {} : { paddingBottom:20, marginBottom:20, borderBottom:'1px solid var(--border-subtle)' }) }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:13.5, fontWeight:600, color:'var(--text-1)', marginBottom:3 }}>{label}</p>
        {hint && <p style={{ fontSize:12, color:'var(--text-4)' }}>{hint}</p>}
      </div>
      <div style={{ flexShrink:0, minWidth:220 }}>{children}</div>
    </div>
  );
}

const iStyle = { width:'100%', padding:'8px 12px', border:'1px solid var(--border)', borderRadius:7, fontSize:13.5, color:'var(--text-1)', backgroundColor:'var(--bg-input)', outline:'none' };

/* ─── Overzicht tab ─── */
function OverzichtTab({ prefs, bets }) {
  const { fmtPnl, fmtAmt } = useFmt();
  const settled = bets.filter(b => b.uitkomst !== 'lopend');
  const won = settled.filter(b => b.uitkomst === 'gewonnen');
  const lost = settled.filter(b => b.uitkomst === 'verloren');
  const totalPnl = settled.reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);
  const totalInzet = settled.reduce((s, b) => s + Number(b.inzet), 0);
  const roi = totalInzet > 0 ? (totalPnl / totalInzet) * 100 : 0;
  const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
  const unitsWon = prefs.unitGrootte > 0 ? totalPnl / prefs.unitGrootte : 0;

  const stats = [
    { label:'Totale bets', value: bets.length },
    { label:'Win Rate', value:`${winRate.toFixed(1)}%` },
    { label:'Totale P&L', value: fmtPnl(totalPnl), color: totalPnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' },
    { label:'ROI', value:`${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'var(--color-win)' : 'var(--color-loss)' },
    { label:'Units gewonnen', value:`${unitsWon >= 0 ? '+' : ''}${unitsWon.toFixed(2)}u`, color: unitsWon >= 0 ? 'var(--color-win)' : 'var(--color-loss)' },
    { label:'Unit grootte', value: fmtAmt(prefs.unitGrootte) },
  ];

  return (
    <div className="account-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 24px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:15, color:'var(--text-2)', fontWeight:600, marginBottom:10 }}>{s.label}</p>
          <p style={{ fontSize:22, fontWeight:800, color: s.color || 'var(--text-1)', lineHeight:1 }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Voorkeuren tab ─── */
function VoorkeurenTab({ prefs, setPrefs }) {
  const [local, setLocal] = useState({ ...prefs });
  const [saved, setSaved] = useState(false);

  const save = () => {
    // Single atomic update — loop of updatePref() causes stale-closure overwrites
    setPrefs({
      ...prefs,
      unitGrootte: local.unitGrootte,
      weergaveEenheden: local.weergaveEenheden,
      gebruikersnaam: local.gebruikersnaam,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  return (
    <>
      <Section title="Units instelling">
        <Row label="Unit grootte" hint="De waarde van 1 unit in euro's. Wordt gebruikt om P&L te berekenen in units.">
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13.5, pointerEvents:'none' }}>€</span>
            <input type="number" min="0.01" step="0.01" value={local.unitGrootte} onChange={e => set('unitGrootte', parseFloat(e.target.value) || 0)} style={{ ...iStyle, paddingLeft:26 }}/>
          </div>
          {local.unitGrootte > 0 && (
            <p style={{ fontSize:11.5, color:'var(--text-4)', marginTop:6 }}>
              1u = €{Number(local.unitGrootte).toFixed(2)}
            </p>
          )}
        </Row>

        <Row label="Weergave" hint="Kies of P&L wordt weergegeven in euro's of units door de hele app." last>
          <div style={{ display:'flex', gap:8 }}>
            {[{ v:'euro', l:"Euro's (€)" }, { v:'units', l:'Units (u)' }].map(opt => (
              <button key={opt.v} onClick={() => set('weergaveEenheden', opt.v)} style={{ flex:1, padding:'8px 12px', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid', backgroundColor: local.weergaveEenheden === opt.v ? 'var(--brand)' : 'var(--bg-card)', color: local.weergaveEenheden === opt.v ? '#fff' : 'var(--text-2)', borderColor: local.weergaveEenheden === opt.v ? 'var(--brand)' : 'var(--border)' }}>
                {opt.l}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Profiel">
        <Row label="Naam" hint="Jouw naam of gebruikersnaam (optioneel)." last>
          <input type="text" placeholder="Bijv. Jan" value={local.gebruikersnaam} onChange={e => set('gebruikersnaam', e.target.value)} style={iStyle}/>
        </Row>
      </Section>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={save} className={saved ? '' : 'btn-primary-glass'} style={{ padding:'9px 24px', fontSize:13.5, fontWeight:600, cursor:'pointer', background: saved ? 'var(--color-win)' : undefined, color:'#fff', border: saved ? 'none' : undefined, borderRadius:7, transition:'all 0.2s', display:'flex', alignItems:'center', gap:8 }}>
          {saved ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Opgeslagen!</> : 'Voorkeuren opslaan'}
        </button>
      </div>
    </>
  );
}

/* ─── Gegevens tab ─── */
function GegevensTab({ bets }) {
  const exportCSV = () => {
    const header = ['datum','sport','wedstrijd','markt','selectie','odds','inzet','uitkomst','bookmaker','notities'].join(',');
    const rows = bets.map(b => [b.datum, b.sport, `"${b.wedstrijd}"`, b.markt, `"${b.selectie}"`, b.odds, b.inzet, b.uitkomst, b.bookmaker, `"${b.notities||''}"`].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:`trackmijnbets_${new Date().toISOString().split('T')[0]}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(bets, null, 2)], { type:'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:`trackmijnbets_${new Date().toISOString().split('T')[0]}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <Section title="Gegevens exporteren">
      <p style={{ fontSize:13.5, color:'var(--text-2)', marginBottom:20 }}>Download al je bets als CSV of JSON. Je hebt momenteel <strong>{bets.length}</strong> bets opgeslagen.</p>
      <div style={{ display:'flex', gap:12 }}>
        {[{ label:'Exporteer CSV', fn: exportCSV }, { label:'Exporteer JSON', fn: exportJSON }].map(btn => (
          <button key={btn.label} onClick={btn.fn} style={{ padding:'9px 20px', border:'1px solid var(--border)', borderRadius:7, fontSize:13.5, fontWeight:600, color:'var(--text-1)', backgroundColor:'var(--bg-card)', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {btn.label}
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ─── Dev / Admin tab ─── */
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

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 22px', boxShadow:'var(--shadow-sm)' }}>
      <p style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{label}</p>
      <p style={{ fontSize:26, fontWeight:800, color: color || 'var(--text-1)', lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:'var(--text-4)', marginTop:6 }}>{sub}</p>}
    </div>
  );
}

function DevTab() {
  const supabase = createClient();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(null);
  const [search, setSearch]   = useState('');
  const [planFilter, setPlanFilter] = useState('alle');
  const [changing, setChanging] = useState({});
  const [confirm, setConfirm]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErr('Niet ingelogd'); setLoading(false); return; }
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
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, plan } : u),
      stats: { ...prev.stats, pro_users: prev.users.filter(u => (u.id === userId ? plan : u.plan) === 'pro').length },
    }));
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

  if (loading) return <div style={{ padding:'60px 0', textAlign:'center', color:'var(--text-4)', fontSize:14 }}>Laden...</div>;
  if (err)     return <div style={{ padding:'40px 0', textAlign:'center', color:'#fb7185', fontSize:14 }}>{err}</div>;
  if (!data)   return null;

  const filtered = data.users
    .filter(u => planFilter === 'alle' || u.plan === planFilter)
    .filter(u => !search || (u.email || '').toLowerCase().includes(search.toLowerCase()));

  const fmt = (d) => d ? new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'2-digit' }) : '—';
  const fmtTime = (d) => d ? new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
        <StatCard label="Gebruikers"     value={data.stats.total_users}   sub={`+${data.stats.new_this_week} deze week`} />
        <StatCard label="Nieuw (7d)"     value={data.stats.new_this_week} />
        <StatCard label="Pro gebruikers" value={data.stats.pro_users}     color="var(--brand)" />
        <StatCard label="Elite"          value={data.stats.elite_users}   color="#f59e0b" />
        <StatCard label="Totale bets"    value={data.stats.total_bets}    />
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px' }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek op e-mail..." style={{ width:'100%', height:34, padding:'0 12px 0 30px', border:'1px solid var(--border)', borderRadius:7, fontSize:13, color:'var(--text-1)', backgroundColor:'var(--bg-card)', boxSizing:'border-box' }}/>
        </div>
        {['alle','gratis','pro','elite'].map(p => (
          <button key={p} onClick={() => setPlanFilter(p)} style={{ height:34, padding:'0 14px', border:`1px solid ${planFilter===p?'var(--brand)':'var(--border)'}`, borderRadius:7, fontSize:12.5, fontWeight:600, cursor:'pointer', color: planFilter===p?'var(--brand)':'var(--text-3)', backgroundColor:'var(--bg-card)', textTransform:'capitalize' }}>
            {p}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-4)' }}>{filtered.length} gebruikers</span>
        <button onClick={load} style={{ height:34, padding:'0 14px', border:'1px solid var(--border)', borderRadius:7, fontSize:12.5, fontWeight:600, cursor:'pointer', color:'var(--text-3)', backgroundColor:'var(--bg-card)', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Vernieuwen
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['E-mail','Aangemeld','Laatst actief','Plan','Bets','Stortingen','Opnames','Acties'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', backgroundColor:'var(--bg-subtle)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'var(--text-4)', fontSize:13 }}>Geen gebruikers gevonden.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
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
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <PlanBadge plan={u.plan}/>
                    <select
                      value={u.plan}
                      disabled={changing[u.id]}
                      onChange={e => changePlan(u.id, e.target.value)}
                      style={{ fontSize:11.5, padding:'2px 6px', border:'1px solid var(--border)', borderRadius:5, backgroundColor:'var(--bg-input)', color:'var(--text-2)', cursor:'pointer' }}
                    >
                      <option value="gratis">gratis</option>
                      <option value="pro">pro</option>
                      <option value="elite">elite</option>
                    </select>
                  </div>
                </td>
                <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:'var(--text-1)' }}>{u.bet_count}</td>
                <td style={{ padding:'11px 14px', fontSize:13, color:'var(--color-win)', fontWeight:700 }}>{u.deposit_count}</td>
                <td style={{ padding:'11px 14px', fontSize:13, color:'var(--color-loss)', fontWeight:700 }}>{u.withdrawal_count}</td>
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
    </div>
  );
}

export default function AccountPage() {
  const { prefs, setPrefs, updatePref, loaded } = usePreferences();
  const { bets } = useBets();
  const [tab, setTab] = useState('overzicht');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserEmail(session.user.email);
    });
  }, []);

  const isAdmin = userEmail === ADMIN_EMAIL;
  const TABS = isAdmin ? [...BASE_TABS, { id: 'dev', label: '⚙ Dev' }] : BASE_TABS;

  function handleLogout() {
    window.location.href = '/api/logout';
  }

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{ color:'var(--text-4)' }}>Laden...</div>;

  return (
    <div style={{ padding:'24px' }} className="app-page">
      <div className="flex items-center justify-between mb-6 page-header">
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>
            {prefs.gebruikersnaam ? `Hallo, ${prefs.gebruikersnaam}` : 'Mijn Account'}
          </h1>
          <p style={{ fontSize:14, color:'var(--text-3)' }}>Beheer je voorkeuren en accountinstellingen</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8,
            border:'1px solid rgba(251,43,55,0.25)', background:'rgba(251,43,55,0.06)',
            color:'#fb2b37', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,43,55,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,43,55,0.06)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Uitloggen
        </button>
      </div>
      <div style={{ display:'flex', gap:3, padding:3, backgroundColor:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:10, marginBottom:28, width:'fit-content', height:38 }}>
        {TABS.map(t => <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</TabBtn>)}
      </div>
      {tab === 'overzicht'   && <OverzichtTab prefs={prefs} bets={bets} />}
      {tab === 'voorkeuren'  && <VoorkeurenTab prefs={prefs} setPrefs={setPrefs} />}
      {tab === 'gegevens'    && <GegevensTab bets={bets} />}
      {tab === 'dev' && isAdmin && <DevTab />}
    </div>
  );
}
