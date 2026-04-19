'use client';
import { useState } from 'react';
import { usePreferences, useFmt } from '../../context/PreferencesContext';
import { useBets, berekenWinst } from '../../context/BetsContext';

const TABS = [
  { id: 'overzicht', label: 'Overzicht' },
  { id: 'voorkeuren', label: 'Voorkeuren' },
  { id: 'gegevens', label: 'Gegevens' },
];

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding:'8px 18px', border:'none', borderBottom: active ? '2px solid #5469d4' : '2px solid transparent', backgroundColor:'transparent', fontSize:13.5, fontWeight: active ? 600 : 400, color: active ? '#5469d4' : 'var(--text-3)', cursor:'pointer', transition:'all 0.15s', marginBottom:-1 }}>
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', marginBottom:20 }}>
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
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 22px' }}>
          <p style={{ fontSize:11.5, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{s.label}</p>
          <p style={{ fontSize:22, fontWeight:700, color: s.color || 'var(--text-1)', lineHeight:1 }}>{s.value}</p>
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
              <button key={opt.v} onClick={() => set('weergaveEenheden', opt.v)} style={{ flex:1, padding:'8px 12px', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid', backgroundColor: local.weergaveEenheden === opt.v ? '#5469d4' : 'var(--bg-card)', color: local.weergaveEenheden === opt.v ? '#fff' : 'var(--text-2)', borderColor: local.weergaveEenheden === opt.v ? '#5469d4' : 'var(--border)' }}>
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
        <button onClick={save} style={{ padding:'9px 24px', borderRadius:7, fontSize:13.5, fontWeight:600, border: saved ? 'none' : '1px solid rgba(255,255,255,0.2)', cursor:'pointer', background: saved ? '#11B981' : 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color:'#fff', boxShadow: saved ? 'none' : '0 2px 16px rgba(84,105,212,0.45), inset 0 0 0 1px rgba(255,255,255,0.1)', transition:'all 0.2s', display:'flex', alignItems:'center', gap:8 }}>
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

export default function AccountPage() {
  const { prefs, setPrefs, updatePref, loaded } = usePreferences();
  const { bets } = useBets();
  const [tab, setTab] = useState('overzicht');

  if (!loaded) return <div className="flex items-center justify-center h-full" style={{ color:'var(--text-4)' }}>Laden...</div>;

  return (
    <div style={{ maxWidth:820, margin:'0 auto', padding:'40px 32px' }}>
      <div className="mb-6">
        <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>
          {prefs.gebruikersnaam ? `Hallo, ${prefs.gebruikersnaam}` : 'Mijn Account'}
        </h1>
        <p style={{ fontSize:14, color:'var(--text-3)' }}>Beheer je voorkeuren en accountinstellingen</p>
      </div>
      <div style={{ borderBottom:'1px solid var(--border)', marginBottom:28, display:'flex', gap:4 }}>
        {TABS.map(t => <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</TabBtn>)}
      </div>
      {tab === 'overzicht'   && <OverzichtTab prefs={prefs} bets={bets} />}
      {tab === 'voorkeuren'  && <VoorkeurenTab prefs={prefs} setPrefs={setPrefs} />}
      {tab === 'gegevens'    && <GegevensTab bets={bets} />}
    </div>
  );
}
