'use client';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';

const calculators = [
  {
    label: 'Arbitrage',
    desc: 'Vind risicovrije winstkansen',
    href: '/calculators/arbitrage',
    iconColor: { bg: 'rgba(84,105,212,0.15)', border: 'rgba(123,158,240,0.25)', stroke: '#7b9ef0' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4l3 3-3 3"/><path d="M3 7h18"/><path d="M6 20l-3-3 3-3"/><path d="M21 17H3"/>
      </svg>
    ),
  },
  {
    label: 'Kelly Criterion',
    desc: 'Bereken je optimale inzet',
    href: '/calculators/kelly',
    iconColor: { bg: 'rgba(32,168,81,0.15)', border: 'rgba(32,168,81,0.3)', stroke: '#20a851' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
      </svg>
    ),
  },
  {
    label: 'Vig Calculator',
    desc: 'Bereken de bookmaker marge',
    href: '/calculators/vig',
    iconColor: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', stroke: '#f59e0b' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    label: 'Expected Value',
    desc: 'Analyseer de verwachte waarde',
    href: '/calculators/ev',
    iconColor: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', stroke: '#8b5cf6' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: 'Odds Converter',
    desc: 'Zet odds om naar elk formaat',
    href: '/calculators/odds-converter',
    iconColor: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', stroke: '#06b6d4' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      </svg>
    ),
  },
];

export default function CalculatorsPage() {
  const { dark } = useTheme();

  return (
    <div style={{ padding: '24px' }} className="app-page">
      <div className="mb-4 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Calculators</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Handige tools voor slimmer betten</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 640 }}>
        {calculators.map((calc) => (
          <CalcCard key={calc.href} calc={calc} dark={dark} />
        ))}
      </div>
    </div>
  );
}

function CalcCard({ calc, dark }) {
  return (
    <Link
      href={calc.href}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px',
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = dark ? 'rgba(123,158,240,0.3)' : '#c7d2fe';
        e.currentTarget.style.boxShadow = dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(84,105,212,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: calc.iconColor.bg,
        border: `1px solid ${calc.iconColor.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: calc.iconColor.stroke,
      }}>
        {calc.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {calc.label}
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--text-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {calc.desc}
        </p>
      </div>
    </Link>
  );
}
