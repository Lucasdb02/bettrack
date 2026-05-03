'use client';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import PaywallGate from '../../components/PaywallGate';

const negativeLines = [
  {
    line: '0',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',        type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Inzet terug',  type: 'push' },
      { uitslag: 'Verlies',    bet: 'Verlies',       type: 'loss' },
    ],
  },
  {
    line: '-0,25',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',        type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Half verlies',  type: 'halfLoss' },
      { uitslag: 'Verlies',    bet: 'Verlies',       type: 'loss' },
    ],
  },
  {
    line: '-0,50',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',   type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Verlies', type: 'loss' },
      { uitslag: 'Verlies',    bet: 'Verlies', type: 'loss' },
    ],
  },
  {
    line: '-0,75',
    rows: [
      { uitslag: 'Winst met 2+', bet: 'Winst',        type: 'win' },
      { uitslag: 'Winst met 1',  bet: 'Halve winst',  type: 'halfWin' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies',      type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies',      type: 'loss' },
    ],
  },
  {
    line: '-1,00',
    rows: [
      { uitslag: 'Winst met 2+', bet: 'Winst',       type: 'win' },
      { uitslag: 'Winst met 1',  bet: 'Inzet terug', type: 'push' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '-1,25',
    rows: [
      { uitslag: 'Winst met 2+', bet: 'Winst',       type: 'win' },
      { uitslag: 'Winst met 1',  bet: 'Half verlies', type: 'halfLoss' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '-1,50',
    rows: [
      { uitslag: 'Winst met 2+', bet: 'Winst',   type: 'win' },
      { uitslag: 'Winst met 1',  bet: 'Verlies', type: 'loss' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies', type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies', type: 'loss' },
    ],
  },
  {
    line: '-1,75',
    rows: [
      { uitslag: 'Winst met 3+', bet: 'Winst',       type: 'win' },
      { uitslag: 'Winst met 2',  bet: 'Halve winst', type: 'halfWin' },
      { uitslag: 'Winst met 1',  bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '-2,00',
    rows: [
      { uitslag: 'Winst met 3+', bet: 'Winst',       type: 'win' },
      { uitslag: 'Winst met 2',  bet: 'Inzet terug', type: 'push' },
      { uitslag: 'Winst met 1',  bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Gelijkspel',   bet: 'Verlies',     type: 'loss' },
      { uitslag: 'Verlies',      bet: 'Verlies',     type: 'loss' },
    ],
  },
];

const positiveLines = [
  {
    line: '0',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Inzet terug', type: 'push' },
      { uitslag: 'Verlies',    bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+0,25',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Halve winst', type: 'halfWin' },
      { uitslag: 'Verlies',    bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+0,50',
    rows: [
      { uitslag: 'Winst',      bet: 'Winst',   type: 'win' },
      { uitslag: 'Gelijkspel', bet: 'Winst',   type: 'win' },
      { uitslag: 'Verlies',    bet: 'Verlies', type: 'loss' },
    ],
  },
  {
    line: '+0,75',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Half verlies', type: 'halfLoss' },
      { uitslag: 'Verlies met 2+', bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+1,00',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Inzet terug', type: 'push' },
      { uitslag: 'Verlies met 2+', bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+1,25',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Halve winst', type: 'halfWin' },
      { uitslag: 'Verlies met 2+', bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+1,50',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',   type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',   type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Winst',   type: 'win' },
      { uitslag: 'Verlies met 2+', bet: 'Verlies', type: 'loss' },
    ],
  },
  {
    line: '+1,75',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 2',  bet: 'Half verlies', type: 'halfLoss' },
      { uitslag: 'Verlies met 3+', bet: 'Verlies',     type: 'loss' },
    ],
  },
  {
    line: '+2,00',
    rows: [
      { uitslag: 'Winst',          bet: 'Winst',       type: 'win' },
      { uitslag: 'Gelijkspel',     bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 1',  bet: 'Winst',       type: 'win' },
      { uitslag: 'Verlies met 2',  bet: 'Inzet terug', type: 'push' },
      { uitslag: 'Verlies met 3+', bet: 'Verlies',     type: 'loss' },
    ],
  },
];

function typeStyle(type, dark) {
  switch (type) {
    case 'win':      return { background: dark ? 'rgba(0,201,81,0.18)'   : 'rgba(0,201,81,0.13)',   color: dark ? '#00e85a' : '#008a38' };
    case 'halfWin':  return { background: dark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.15)', color: dark ? '#fbbf24' : '#92680a' };
    case 'push':     return { background: dark ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.14)', color: dark ? '#fb923c' : '#b45309' };
    case 'halfLoss': return { background: dark ? 'rgba(239,68,68,0.16)'  : 'rgba(239,68,68,0.13)',  color: dark ? '#f87171' : '#b91c1c' };
    case 'loss':     return { background: dark ? 'rgba(251,43,55,0.18)'  : 'rgba(251,43,55,0.12)',  color: dark ? '#ff4d5a' : '#c01020' };
    default:         return {};
  }
}

function AHTable({ lines, dark }) {
  const border = `1px solid var(--border)`;
  const thStyle = {
    padding: '9px 12px',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'var(--bg-subtle)',
    borderBottom: border,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '22%' }} />
        <col style={{ width: '43%' }} />
        <col style={{ width: '35%' }} />
      </colgroup>
      <thead>
        <tr>
          <th style={thStyle}>Asian</th>
          <th style={thStyle}>Uitslag</th>
          <th style={thStyle}>Bet</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((group, gi) =>
          group.rows.map((row, ri) => {
            const isFirst = ri === 0;
            const isLastInGroup = ri === group.rows.length - 1;
            const isLast = gi === lines.length - 1 && isLastInGroup;
            const rowBorder = isLastInGroup && !isLast ? `1px solid var(--border)` : `1px solid var(--border-subtle)`;
            const s = typeStyle(row.type, dark);
            return (
              <tr key={`${group.line}-${ri}`} style={{ borderBottom: rowBorder }}>
                {isFirst && (
                  <td
                    rowSpan={group.rows.length}
                    style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: 'var(--text-2)',
                      padding: '8px 10px',
                      borderBottom: `1px solid var(--border)`,
                      borderRight: `1px solid var(--border-subtle)`,
                      background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    }}
                  >
                    {group.line}
                  </td>
                )}
                <td style={{
                  padding: '6px 12px',
                  fontSize: 12.5,
                  color: 'var(--text-3)',
                  borderRight: `1px solid var(--border-subtle)`,
                }}>
                  {row.uitslag}
                </td>
                <td style={{
                  padding: '6px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  textAlign: 'center',
                  ...s,
                }}>
                  {row.bet}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export default function AsianLinesPage() {
  const { dark } = useTheme();
  const [mobileTab, setMobileTab] = useState('neg');

  const legend = [
    { type: 'win',      label: 'Winst' },
    { type: 'halfWin',  label: 'Halve winst' },
    { type: 'push',     label: 'Inzet terug' },
    { type: 'halfLoss', label: 'Half verlies' },
    { type: 'loss',     label: 'Verlies' },
  ];

  return (
    <PaywallGate requiredPlan="pro" title="Ontgrendel Asian Lines" description="Begrijp Asian Handicap en kwart-lijnen volledig met onze interactieve uitlegpagina en rekenvoorbeelden.">
    <div style={{ padding: '24px 28px' }} className="app-page">
      <style>{`
        .ah-legend   { display: flex; }
        .ah-switch   { display: none; }
        .ah-grid     { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ah-col-neg  { display: block; }
        .ah-col-pos  { display: block; }
        @media (min-width: 769px) {
          .ah-col-neg, .ah-col-pos { display: block !important; }
        }
        @media (max-width: 768px) {
          .ah-legend  { display: none; }
          .ah-switch  { display: flex; }
          .ah-grid    { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-5 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Asian Lines Overzicht</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Referentietabel voor alle Asian Handicap uitkomsten</p>
      </div>

      {/* Legend — desktop only */}
      <div className="ah-legend" style={{ alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {legend.map(({ type, label }) => {
          const s = typeStyle(type, dark);
          return (
            <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: s.background, border: `1px solid ${s.color}40`, display: 'inline-block' }}/>
              <span style={{ color: s.color }}>{label}</span>
            </span>
          );
        })}
      </div>

      {/* Switch — mobile only */}
      <div className="ah-switch" style={{ justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2 }}>
          {[
            { id: 'neg', label: '− Favoriet' },
            { id: 'pos', label: '+ Underdog' },
          ].map(opt => {
            const active = mobileTab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMobileTab(opt.id)}
                style={{
                  padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active
                    ? (opt.id === 'neg' ? '#fb2b37' : '#00c951')
                    : 'var(--text-3)',
                  boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tables */}
      <div className="ah-grid">
        {/* Negatief */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: mobileTab === 'neg' ? 'block' : 'none' }} className="ah-col-neg">
          <div style={{ padding: '11px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb2b37', display: 'inline-block' }}/>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Favoriet (negatieve handicap)</span>
          </div>
          <AHTable lines={negativeLines} dark={dark} />
        </div>

        {/* Positief */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: mobileTab === 'pos' ? 'block' : 'none' }} className="ah-col-pos">
          <div style={{ padding: '11px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c951', display: 'inline-block' }}/>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Underdog (positieve handicap)</span>
          </div>
          <AHTable lines={positiveLines} dark={dark} />
        </div>
      </div>

      {/* Tip */}
      <div style={{ marginTop: 20, background: dark ? 'rgba(84,105,212,0.08)' : '#eef2ff', border: `1px solid ${dark ? 'rgba(123,158,240,0.2)' : '#c7d2fe'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? '#7b9ef0' : '#4f46e5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
          <strong style={{ color: dark ? '#7b9ef0' : '#4f46e5' }}>Kwart-lijnen (0,25 / 0,75 …)</strong> zijn split bets: de inzet wordt 50/50 verdeeld over de twee aangrenzende hele lijnen. Dat verklaart de "Halve winst" en "Half verlies" uitkomsten.
          Gebruik de <a href="/calculators/vig" style={{ color: dark ? '#7b9ef0' : '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Vig Calculator</a> om de marge op een AH-markt te berekenen.
        </p>
      </div>
    </div>
    </PaywallGate>
  );
}
