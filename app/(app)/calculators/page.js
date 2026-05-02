'use client';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import PaywallGate from '../../components/PaywallGate';

const calculators = [
  {
    label: 'Arbitrage',
    desc: 'Bereken of er risicovrije winstkansen zijn tussen twee of meer bookmakers. Voer de odds van elke uitkomst in en zie direct hoeveel je op elke kant moet inzetten voor gegarandeerde winst.',
    bullets: ['Twee- en drieweg arbitrage', 'Automatische inzetberekening', 'Winstpercentage in één oogopslag'],
    href: '/calculators/arbitrage',
    iconColor: { bg: 'rgba(84,105,212,0.15)', border: 'rgba(123,158,240,0.25)', stroke: '#7b9ef0' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4l3 3-3 3"/><path d="M3 7h18"/><path d="M6 20l-3-3 3-3"/><path d="M21 17H3"/>
      </svg>
    ),
  },
  {
    label: 'Kelly Criterion',
    desc: 'Bepaal de ideale inzetgrootte op basis van je eigen kansinschatting versus de odds van de bookmaker. De Kelly-formule maximaliseert je verwachte bankroll-groei op lange termijn.',
    bullets: ['Volledige en fractionele Kelly', 'Bankroll-percentage output', 'Vergelijk waarde vs. risico'],
    href: '/calculators/kelly',
    iconColor: { bg: 'rgba(32,168,81,0.15)', border: 'rgba(32,168,81,0.3)', stroke: '#20a851' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
      </svg>
    ),
  },
  {
    label: 'Vig Calculator',
    desc: 'Bereken hoeveel marge (vig of juice) een bookmaker inbouwt in zijn odds. Zie de werkelijke impliciete kansen en ontdek hoe ver de aangeboden odds van fair value afwijken.',
    bullets: ['Marge per markt inzichtelijk', 'Eerlijke kansen zonder vig', 'Vergelijk bookmakers op scherpte'],
    href: '/calculators/vig',
    iconColor: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', stroke: '#f59e0b' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    label: 'Expected Value',
    desc: 'Analyseer de verwachte waarde van een weddenschap op basis van jouw geschatte kans versus de bookmaker-odds. Een positieve EV duidt op een winstgevende bet op de lange termijn.',
    bullets: ['EV in euro en percentage', 'Vergelijk jouw kans vs. impliciete kans', 'Identificeer value bets snel'],
    href: '/calculators/ev',
    iconColor: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', stroke: '#8b5cf6' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: 'Odds Converter',
    desc: 'Converteer odds eenvoudig tussen decimaal, Amerikaans (moneyline) en fractioneel formaat. Bekijk ook direct de impliciete winkans bij elke odds-waarde.',
    bullets: ['Decimaal, Amerikaans & fractioneel', 'Impliciete winkans per formaat', 'Handig bij internationale bookmakers'],
    href: '/calculators/odds-converter',
    iconColor: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', stroke: '#06b6d4' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      </svg>
    ),
  },
  {
    label: 'Dutching Calculator',
    desc: 'Spreid je inzet over meerdere selecties zodat je bij elke winnende uitkomst een gelijke winst behaalt. Ideaal wanneer je meerdere kansen ziet in dezelfde wedstrijd.',
    bullets: ['Inzet per selectie automatisch berekend', 'Vaste winst ongeacht uitkomst', 'Ondersteunt 2 t/m 6 selecties'],
    href: '/calculators/dutching',
    iconColor: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', stroke: '#f97316' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>
        <path d="M9 12h6M14.5 8l-5 3M14.5 16l-5-3"/>
      </svg>
    ),
  },
];

export default function CalculatorsPage() {
  const { dark } = useTheme();

  return (
    <PaywallGate requiredPlan="pro" title="Ontgrendel alle Calculators" description="Bereken arbitrage, expected value, Kelly criterion, vig en meer met onze 6 professionele bettingcalculators.">
    <div style={{ padding: '24px' }} className="app-page">
      <div className="mb-6 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Calculators</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Handige tools voor slimmer betten</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {calculators.map((calc) => (
          <CalcCard key={calc.href} calc={calc} dark={dark} />
        ))}
      </div>
    </div>
    </PaywallGate>
  );
}

function CalcCard({ calc, dark }) {
  return (
    <Link
      href={calc.href}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '22px 24px',
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = dark ? 'rgba(123,158,240,0.3)' : '#c7d2fe';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(84,105,212,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: calc.iconColor.bg,
          border: `1px solid ${calc.iconColor.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: calc.iconColor.stroke,
        }}>
          {calc.icon}
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>{calc.label}</p>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{calc.desc}</p>
    </Link>
  );
}
