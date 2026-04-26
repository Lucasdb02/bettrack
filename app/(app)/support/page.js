'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';

const faqs = [
  {
    vraag: 'Hoe voeg ik een bet toe?',
    antwoord: 'Ga naar "Bet Invoeren" in het menu of gebruik de Chrome Extension om automatisch bets te importeren via een screenshot van je betslip. Je kunt ook handmatig de odds, inzet, bookmaker en uitkomst invullen.',
  },
  {
    vraag: 'Hoe werkt de Chrome Extension?',
    antwoord: 'Installeer de extensie, log in op TrackMijnBets en klik op het extensie-icoon terwijl je op een betsitepagina bent. Klik op "Selecteer betslip", teken een selectie rond je betslip en de AI herkent automatisch je bets. Je kunt ze controleren en daarna opslaan.',
  },
  {
    vraag: 'Wat is het verschil tussen P&L en ROI?',
    antwoord: 'P&L (Profit & Loss) is het absolute bedrag dat je gewonnen of verloren hebt in euro\'s. ROI (Return on Investment) is de verhouding tussen winst en totale inzet, uitgedrukt als percentage. Een ROI van +5% betekent dat je per €100 inzet gemiddeld €5 verdient.',
  },
  {
    vraag: 'Hoe stel ik een bookmaker in?',
    antwoord: 'Ga naar "Bookmakers" in het menu en klik op "Bookmaker toevoegen". Vul de naam en het huidige saldo in. Vervolgens worden je bets en transacties automatisch gekoppeld voor een nauwkeurig saldo-overzicht.',
  },
  {
    vraag: 'Worden mijn gegevens veilig opgeslagen?',
    antwoord: 'Ja. Al je gegevens worden opgeslagen in een beveiligde Supabase-database met Row Level Security. Alleen jij hebt toegang tot je eigen bets en statistieken — andere gebruikers zien nooit jouw data.',
  },
  {
    vraag: 'Kan ik mijn bets exporteren?',
    antwoord: 'Ja, via de Account-pagina kun je al je bets exporteren als CSV-bestand. Dat bestand kun je openen in Excel of Google Sheets voor verdere analyse.',
  },
  {
    vraag: 'Hoe werkt Asian Handicap in de tool?',
    antwoord: 'Bij het invoeren van een bet kun je "Asian Handicap" als type selecteren. Bekijk de Asian Lines pagina onder Tools voor een volledig overzicht van alle handicap-lijnen en hun uitkomsten.',
  },
  {
    vraag: 'Mijn bet staat op "Lopend" maar is al afgelopen, wat nu?',
    antwoord: 'Ga naar "Bets Overzicht", zoek de bet op en klik op bewerken. Pas de uitkomst aan naar "Gewonnen", "Verloren" of "Push". De statistieken worden direct bijgewerkt.',
  },
];

const quickLinks = [
  { label: 'Bet Invoeren', href: '/bets/new', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { label: 'Chrome Extension', href: '/extension', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg> },
  { label: 'Calculators', href: '/calculators', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/></svg> },
  { label: 'Asian Lines', href: '/asian-lines', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/></svg> },
  { label: 'Mijn Account', href: '/account', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Statistieken', href: '/statistieken', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> },
];

function FaqItem({ vraag, antwoord, dark }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', lineHeight: 1.4 }}>{vraag}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.7, paddingBottom: 16 }}>
          {antwoord}
        </p>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { dark } = useTheme();
  const [formData, setFormData] = useState({ naam: '', email: '', bericht: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Open mailto with prefilled data
    const subject = encodeURIComponent('TrackMijnBets Support');
    const body = encodeURIComponent(`Naam: ${formData.naam}\n\n${formData.bericht}`);
    window.open(`mailto:support@trackmijnbets.nl?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const iStyle = {
    width: '100%', padding: '10px 13px',
    border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 13.5, color: 'var(--text-1)',
    backgroundColor: 'var(--bg-input)', outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ padding: '24px' }} className="app-page">
      {/* Header */}
      <div className="mb-6 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Support</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Hulp nodig? Bekijk de veelgestelde vragen of stuur ons een bericht.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* Left: FAQ */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>Veelgestelde vragen</h2>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 20 }}>Klik op een vraag voor het antwoord.</p>
            <div>
              {faqs.map((f, i) => (
                <FaqItem key={i} vraag={f.vraag} antwoord={f.antwoord} dark={dark} />
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 16 }}>Snelkoppelingen</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickLinks.map((l) => (
                <Link
                  key={l.href} href={l.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', textDecoration: 'none',
                    fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
                    background: 'var(--bg-subtle)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = dark ? 'rgba(123,158,240,0.3)' : '#c7d2fe';
                    e.currentTarget.style.color = dark ? '#e8f0ff' : '#4f46e5';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-2)';
                  }}
                >
                  <span style={{ color: 'var(--text-4)' }}>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Contact card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>Stuur een bericht</h2>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 20 }}>Kom je er niet uit? We reageren binnen 24 uur.</p>

            {sent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 9, background: dark ? 'rgba(0,201,81,0.12)' : 'rgba(0,201,81,0.08)', border: '1px solid rgba(0,201,81,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c951" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#00c951' }}>Bericht geopend in je e-mailclient.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Naam</label>
                  <input
                    required type="text" placeholder="Je naam"
                    value={formData.naam}
                    onChange={e => setFormData(p => ({ ...p, naam: e.target.value }))}
                    style={iStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>E-mailadres</label>
                  <input
                    required type="email" placeholder="je@email.nl"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    style={iStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Bericht</label>
                  <textarea
                    required rows={5} placeholder="Beschrijf je vraag of probleem..."
                    value={formData.bericht}
                    onChange={e => setFormData(p => ({ ...p, bericht: e.target.value }))}
                    style={{ ...iStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
                    color: '#fff', fontSize: 14, fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(84,105,212,0.35)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Verstuur bericht
                </button>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Direct contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="mailto:support@trackmijnbets.nl"
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}
              >
                <span style={{ width: 32, height: 32, borderRadius: 8, background: dark ? 'rgba(84,105,212,0.15)' : '#eef2ff', border: `1px solid ${dark ? 'rgba(123,158,240,0.2)' : '#c7d2fe'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? '#7b9ef0' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 1 }}>E-mail</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: dark ? '#7b9ef0' : '#6366f1' }}>support@trackmijnbets.nl</p>
                </div>
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-3)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: dark ? 'rgba(0,201,81,0.1)' : 'rgba(0,201,81,0.08)', border: '1px solid rgba(0,201,81,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c951" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 1 }}>Reactietijd</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Binnen 24 uur op werkdagen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
