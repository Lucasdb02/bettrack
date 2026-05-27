'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const PLAN_COLORS = {
  gratis: { color:'#9ca3af', bg:'rgba(156,163,175,0.12)', border:'rgba(156,163,175,0.3)' },
  pro:    { color:'#6b82f0', bg:'rgba(107,130,240,0.12)', border:'rgba(107,130,240,0.3)' },
  elite:  { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.3)' },
};

const STATUS_COLORS = {
  active:     { color:'#34d399', bg:'rgba(52,211,153,0.12)',  label:'Actief' },
  trialing:   { color:'#6b82f0', bg:'rgba(107,130,240,0.12)', label:'Trial' },
  past_due:   { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'Betaling achterstallig' },
  canceled:   { color:'#fb7185', bg:'rgba(251,113,133,0.12)', label:'Opgezegd' },
  incomplete: { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'Onvolledig' },
  paused:     { color:'#9ca3af', bg:'rgba(156,163,175,0.12)', label:'Gepauzeerd' },
};

function Badge({ label, color, bg, border }) {
  return (
    <span style={{ padding:'2px 8px', borderRadius:5, fontSize:11, fontWeight:700, color, background: bg, border:`1px solid ${border || color}`, textTransform:'uppercase', letterSpacing:'0.05em', display:'inline-block' }}>
      {label}
    </span>
  );
}

function DataRow({ label, value, mono }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'7px 0', borderBottom:'1px solid var(--border-subtle)' }}>
      <span style={{ fontSize:12, color:'var(--text-4)', flexShrink:0, width:140 }}>{label}</span>
      <span style={{ fontSize:12.5, color:'var(--text-1)', textAlign:'right', fontFamily: mono ? 'monospace' : undefined, wordBreak:'break-all' }}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background:'var(--bg-subtle)', border:'1px solid var(--border-subtle)', borderRadius:8, padding:'12px 14px' }}>
      <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</p>
      <p style={{ fontSize:18, fontWeight:800, color: color || 'var(--text-1)', lineHeight:1 }}>{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'0 14px', fontSize:12.5, fontWeight:600, border:'none', borderRadius:6,
      cursor:'pointer', height:'100%', display:'flex', alignItems:'center', gap:4,
      backgroundColor: active ? 'var(--bg-card)' : 'transparent',
      color: active ? 'var(--brand)' : 'var(--text-3)',
      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
      transition:'all 0.12s', whiteSpace:'nowrap',
    }}>
      {children}
    </button>
  );
}

function SectionTitle({ title }) {
  return <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, marginTop:20 }}>{title}</p>;
}

const fmt     = d => d ? new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const fmtDate = d => d ? new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'numeric' }) : '—';
const fmtEur  = n => `€${Number(n).toLocaleString('nl-NL', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

export default function UserDrawer({ user: summaryUser, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('profiel');

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setDetail(null); setTab('profiel');
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const res = await fetch(`/api/admin/user-detail?userId=${summaryUser.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!cancelled) {
        const json = await res.json();
        setDetail(json);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [summaryUser.id]);

  const u   = detail?.user        || summaryUser;
  const sub = detail?.subscription || null;
  const ss  = detail?.stripe_subscription || null;
  const stats = detail?.bet_stats || null;
  const bets  = detail?.bets || [];
  const txs   = detail?.transactions || [];
  const invoices = detail?.stripe_invoices || [];
  const timeline = detail?.timeline || [];

  const planC   = PLAN_COLORS[summaryUser.plan] || PLAN_COLORS.gratis;
  const statusC = STATUS_COLORS[sub?.status] || (sub ? STATUS_COLORS.active : null);
  const initials = (u.full_name || u.email || u.id || '?')[0].toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }}/>

      {/* Drawer */}
      <div style={{
        position:'fixed', right:0, top:0, bottom:0,
        width:'min(640px, 100vw)', zIndex:501,
        background:'var(--bg-page)', borderLeft:'1px solid var(--border)',
        boxShadow:'-12px 0 40px rgba(0,0,0,0.22)',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{ padding:'18px 24px 0', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--bg-brand)', border:'1.5px solid var(--brand-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--brand)', flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14.5, fontWeight:700, color:'var(--text-1)', marginBottom:2 }}>
                {u.full_name || u.email || 'Onbekend'}
              </p>
              <p style={{ fontSize:11.5, color:'var(--text-4)', fontFamily:'monospace' }}>{u.id?.slice(0, 12)}…</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <Badge label={summaryUser.plan} color={planC.color} bg={planC.bg} border={planC.border}/>
              {statusC && <Badge label={statusC.label} color={statusC.color} bg={statusC.bg}/>}
              <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:4, display:'flex', alignItems:'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:3, padding:3, backgroundColor:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:10, marginBottom:14, width:'fit-content', height:38 }}>
            {['profiel','bets','transacties','timeline'].map(t => (
              <TabBtn key={t} active={tab===t} onClick={() => setTab(t)}>
                {t === 'profiel' ? 'Profiel' : t === 'bets' ? 'Bets' : t === 'transacties' ? 'Transacties' : 'Timeline'}
                {t === 'bets' && stats && <span style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)' }}>({stats.total_bets})</span>}
                {t === 'transacties' && invoices.length > 0 && <span style={{ fontSize:10.5, fontWeight:700, color:'var(--text-4)' }}>({invoices.length})</span>}
              </TabBtn>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {loading && <div style={{ padding:'60px 0', textAlign:'center', color:'var(--text-4)', fontSize:13 }}>Laden...</div>}
          {!loading && (
            <>
              {/* ─── PROFIEL ─── */}
              {tab === 'profiel' && (
                <div>
                  <SectionTitle title="Account"/>
                  <DataRow label="User ID"       value={u.id}           mono/>
                  <DataRow label="E-mail"         value={u.email}/>
                  <DataRow label="Naam"           value={u.full_name}/>
                  <DataRow label="Aangemeld"      value={fmt(u.created_at)}/>
                  <DataRow label="Laatste login"  value={fmt(u.last_sign_in_at)}/>
                  <DataRow label="Auth provider"  value={u.providers?.join(', ') || '—'}/>
                  <DataRow label="Anoniem"        value={u.is_anonymous ? 'Ja' : null}/>
                  {u.banned_until && <DataRow label="Geblokkeerd tot" value={fmt(u.banned_until)}/>}

                  {sub && (
                    <>
                      <SectionTitle title="Abonnement"/>
                      <DataRow label="Plan"               value={<Badge label={sub.plan} color={planC.color} bg={planC.bg} border={planC.border}/>}/>
                      <DataRow label="Status"             value={statusC ? <Badge label={statusC.label} color={statusC.color} bg={statusC.bg}/> : sub.status}/>
                      <DataRow label="Interval"           value={sub.interval === 'month' ? 'Maandelijks' : sub.interval === 'year' ? 'Jaarlijks' : sub.interval}/>
                      <DataRow label="Prijs"              value={ss?.price != null ? `${fmtEur(ss.price)} / ${ss.interval === 'year' ? 'jaar' : 'maand'}` : null}/>
                      <DataRow label="Verlenging"         value={sub.current_period_end ? fmtDate(sub.current_period_end) : (ss?.current_period_end ? fmtDate(new Date(ss.current_period_end * 1000)) : null)}/>
                      <DataRow label="Opzeggen aan einde" value={sub.cancel_at_period_end || ss?.cancel_at_period_end ? 'Ja' : null}/>
                      <DataRow label="Stripe klant ID"    value={sub.stripe_customer_id}  mono/>
                      <DataRow label="Stripe sub ID"      value={sub.stripe_subscription_id} mono/>
                      <DataRow label="Aangemeld op"       value={fmtDate(sub.created_at)}/>
                    </>
                  )}

                  {detail?.bookmakers?.length > 0 && (
                    <>
                      <SectionTitle title="Bookmakers"/>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {detail.bookmakers.map(bm => (
                          <span key={bm.id} style={{ padding:'3px 10px', borderRadius:6, fontSize:12, border:'1px solid var(--border)', color:'var(--text-2)', background:'var(--bg-subtle)' }}>
                            {bm.naam}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── BETS ─── */}
              {tab === 'bets' && stats && (
                <div>
                  <SectionTitle title="Statistieken"/>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
                    <StatBox label="Totaal"       value={stats.total_bets}/>
                    <StatBox label="Afgerond"     value={stats.settled_bets}/>
                    <StatBox label="Lopend"       value={stats.lopend}/>
                    <StatBox label="Win Rate"     value={`${stats.win_rate.toFixed(1)}%`} color={stats.win_rate >= 50 ? 'var(--color-win)' : 'var(--text-1)'}/>
                    <StatBox label="P&L"          value={fmtEur(stats.pnl)}       color={stats.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)'}/>
                    <StatBox label="ROI"          value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`} color={stats.roi >= 0 ? 'var(--color-win)' : 'var(--color-loss)'}/>
                    <StatBox label="Totale inzet" value={fmtEur(stats.total_stake)}/>
                    <StatBox label="Gem. odds"    value={stats.avg_odds.toFixed(2)}/>
                  </div>

                  {stats.top_bookmakers.length > 0 && (
                    <>
                      <SectionTitle title="Top Bookmakers"/>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                        {stats.top_bookmakers.map(bm => (
                          <span key={bm.naam} style={{ padding:'3px 10px', borderRadius:6, fontSize:12, border:'1px solid var(--border)', color:'var(--text-2)', background:'var(--bg-subtle)' }}>
                            {bm.naam} <strong>{bm.count}</strong>
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <SectionTitle title={`Recente bets (${bets.length})`}/>
                  <div style={{ overflow:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr>
                          {['Datum','Sport','Wedstrijd','BM','Odds','Inzet','Uitkomst','P&L'].map(h => (
                            <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', backgroundColor:'var(--bg-subtle)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bets.map(b => {
                          const pnl = b.uitkomst !== 'lopend' ? (b.uitkomst === 'gewonnen' ? (b.odds-1)*b.inzet : b.uitkomst === 'verloren' ? -b.inzet : b.uitkomst === 'half_gewonnen' ? (b.odds-1)*b.inzet/2 : b.uitkomst === 'half_verloren' ? -b.inzet/2 : 0) : null;
                          const uitkomstColor = b.uitkomst === 'gewonnen' || b.uitkomst === 'half_gewonnen' ? 'var(--color-win)' : b.uitkomst === 'verloren' || b.uitkomst === 'half_verloren' ? 'var(--color-loss)' : 'var(--text-4)';
                          return (
                            <tr key={b.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                              <td style={{ padding:'5px 8px', color:'var(--text-4)', whiteSpace:'nowrap' }}>{b.datum}</td>
                              <td style={{ padding:'5px 8px', color:'var(--text-3)' }}>{b.sport}</td>
                              <td style={{ padding:'5px 8px', color:'var(--text-2)', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={b.wedstrijd}>{b.wedstrijd}</td>
                              <td style={{ padding:'5px 8px', color:'var(--text-3)', whiteSpace:'nowrap' }}>{b.bookmaker}</td>
                              <td style={{ padding:'5px 8px', color:'var(--text-2)', fontWeight:600 }}>{Number(b.odds).toFixed(2)}</td>
                              <td style={{ padding:'5px 8px', color:'var(--text-2)' }}>€{Number(b.inzet).toFixed(2)}</td>
                              <td style={{ padding:'5px 8px', color: uitkomstColor, fontWeight:600, whiteSpace:'nowrap' }}>{b.uitkomst || '—'}</td>
                              <td style={{ padding:'5px 8px', color: pnl != null ? (pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)') : 'var(--text-4)', fontWeight:600 }}>
                                {pnl != null ? fmtEur(pnl) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── TRANSACTIES ─── */}
              {tab === 'transacties' && (
                <div>
                  {invoices.length > 0 && (
                    <>
                      <SectionTitle title={`Stripe betalingen (${invoices.length})`}/>
                      <div style={{ overflow:'auto', marginBottom:20 }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                          <thead>
                            <tr>
                              {['Datum','Bedrag','Periode','Status','Pogingen'].map(h => (
                                <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', backgroundColor:'var(--bg-subtle)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map(inv => {
                              const sc = inv.status === 'paid' ? '#34d399' : inv.status === 'open' ? '#f59e0b' : '#fb7185';
                              return (
                                <tr key={inv.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                                  <td style={{ padding:'5px 8px', color:'var(--text-4)', whiteSpace:'nowrap' }}>
                                    {fmtDate(new Date(inv.created * 1000))}
                                  </td>
                                  <td style={{ padding:'5px 8px', color: inv.status === 'paid' ? 'var(--color-win)' : 'var(--color-loss)', fontWeight:700 }}>
                                    {fmtEur(inv.status === 'paid' ? inv.amount_paid : inv.amount_due)}
                                  </td>
                                  <td style={{ padding:'5px 8px', color:'var(--text-4)', whiteSpace:'nowrap', fontSize:11 }}>
                                    {inv.period_start ? `${fmtDate(new Date(inv.period_start*1000))} – ${fmtDate(new Date(inv.period_end*1000))}` : '—'}
                                  </td>
                                  <td style={{ padding:'5px 8px' }}>
                                    <span style={{ color: sc, fontSize:11, fontWeight:700 }}>{inv.status}</span>
                                  </td>
                                  <td style={{ padding:'5px 8px', color:'var(--text-4)' }}>{inv.attempt_count}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {txs.length > 0 && (
                    <>
                      <SectionTitle title={`Bookmaker transacties (${txs.length})`}/>
                      <div style={{ overflow:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                          <thead>
                            <tr>
                              {['Datum','Bookmaker','Type','Bedrag'].map(h => (
                                <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', backgroundColor:'var(--bg-subtle)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {txs.map(tx => (
                              <tr key={tx.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                                <td style={{ padding:'5px 8px', color:'var(--text-4)', whiteSpace:'nowrap' }}>{fmtDate(tx.datum)}</td>
                                <td style={{ padding:'5px 8px', color:'var(--text-2)' }}>{tx.bookmakers?.naam || '—'}</td>
                                <td style={{ padding:'5px 8px', color: tx.type === 'deposit' ? 'var(--color-win)' : 'var(--color-loss)', fontWeight:600, textTransform:'capitalize' }}>{tx.type}</td>
                                <td style={{ padding:'5px 8px', color: tx.type === 'deposit' ? 'var(--color-win)' : 'var(--color-loss)', fontWeight:700 }}>
                                  {tx.type === 'deposit' ? '+' : '-'}{fmtEur(tx.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {invoices.length === 0 && txs.length === 0 && (
                    <p style={{ textAlign:'center', color:'var(--text-4)', fontSize:13, padding:'40px 0' }}>Geen transacties gevonden.</p>
                  )}
                </div>
              )}

              {/* ─── TIMELINE ─── */}
              {tab === 'timeline' && (
                <div>
                  <SectionTitle title={`Activiteit (${timeline.length} events)`}/>
                  {timeline.length === 0 && (
                    <p style={{ textAlign:'center', color:'var(--text-4)', fontSize:13, padding:'40px 0' }}>Geen activiteit gevonden.</p>
                  )}
                  <div style={{ position:'relative', paddingLeft:20 }}>
                    {/* vertical line */}
                    <div style={{ position:'absolute', left:6, top:8, bottom:0, width:1, background:'var(--border)' }}/>
                    {timeline.map((ev, i) => (
                      <div key={i} style={{ position:'relative', paddingLeft:20, paddingBottom:16 }}>
                        {/* dot */}
                        <div style={{ position:'absolute', left:0, top:4, width:12, height:12, borderRadius:'50%', background: ev.color || '#6b7280', border:'2px solid var(--bg-page)', flexShrink:0 }}/>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                          <p style={{ fontSize:12.5, color:'var(--text-1)', fontWeight:500, lineHeight:1.4 }}>{ev.label}</p>
                          <p style={{ fontSize:11, color:'var(--text-4)', whiteSpace:'nowrap', flexShrink:0 }}>
                            {new Date(ev.date).toLocaleDateString('nl-NL', { day:'numeric', month:'short', year:'2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
