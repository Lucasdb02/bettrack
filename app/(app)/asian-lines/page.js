'use client';
import { useTheme } from '../../context/ThemeContext';

const lines = [
  {
    line: '0',
    naam: 'Draw No Bet',
    uitleg: 'Je inzet wordt teruggestort bij gelijkspel. Je wint alleen als jouw selectie de wedstrijd wint.',
    winConditie: 'Jouw team wint',
    verliesConditie: 'Tegenstander wint',
    pushConditie: 'Gelijkspel → inzet terug',
    kleur: '#5469d4',
  },
  {
    line: '0 / 0.5',
    naam: 'Quarter Ball (-0.25)',
    uitleg: 'De inzet wordt gesplitst: de helft op 0 (Draw No Bet) en de helft op -0.5. Bij gelijkspel verlies je de helft en krijg je de andere helft terug.',
    winConditie: 'Jouw team wint',
    verliesConditie: 'Tegenstander wint of gelijkspel (half verlies)',
    pushConditie: 'Gelijkspel → helft terug, helft verlies',
    kleur: '#8b5cf6',
  },
  {
    line: '0.5',
    naam: 'Half Ball',
    uitleg: 'Jouw team krijgt een halve goal voorsprong. Bij gelijkspel win je alsnog, want 0 + 0.5 = 0.5 → jouw kant wint.',
    winConditie: 'Jouw team wint of gelijkspel',
    verliesConditie: 'Tegenstander wint',
    pushConditie: 'Geen push mogelijk',
    kleur: '#06b6d4',
  },
  {
    line: '0.5 / 1',
    naam: 'Three Quarter Ball (-0.75)',
    uitleg: 'Gesplitste inzet op -0.5 en -1. Als jouw team wint met exact één goal, verlies je de helft (de -1 push = terug) en win je de helft (de -0.5 wint).',
    winConditie: 'Jouw team wint met 2+ goals',
    verliesConditie: 'Tegenstander wint of gelijkspel',
    pushConditie: 'Win met 1 goal → helft terug',
    kleur: '#f59e0b',
  },
  {
    line: '1',
    naam: 'Full Ball',
    uitleg: 'Jouw team geeft één goal voor. Bij een overwinning met precies één goal is er een push en ontvang je je inzet terug. Win met 2+ goals en je wint volledig.',
    winConditie: 'Jouw team wint met 2+ goals',
    verliesConditie: 'Tegenstander wint of gelijkspel',
    pushConditie: 'Win met exact 1 goal → inzet terug',
    kleur: '#20a851',
  },
  {
    line: '1 / 1.5',
    naam: 'Five Quarter Ball (-1.25)',
    uitleg: 'Gesplitste inzet op -1 en -1.5. Win met exact één goal: de -1 leg levert een push op (inzet terug), de -1.5 leg verliest. Je verliest de helft van je inzet.',
    winConditie: 'Jouw team wint met 2+ goals',
    verliesConditie: 'Gelijkspel of tegenstander wint',
    pushConditie: 'Win met 1 goal → helft terug',
    kleur: '#f97316',
  },
  {
    line: '1.5',
    naam: 'One and Half Ball',
    uitleg: 'Jouw team geeft anderhalve goal voor. Je wint alleen als jouw team wint met 2 of meer goals. Gelijkspel of winst met één goal telt als verlies.',
    winConditie: 'Jouw team wint met 2+ goals',
    verliesConditie: 'Gelijkspel, 1-goal winst, of verlies',
    pushConditie: 'Geen push mogelijk',
    kleur: '#ec4899',
  },
  {
    line: '1.5 / 2',
    naam: 'Seven Quarter Ball (-1.75)',
    uitleg: 'Gesplitste inzet op -1.5 en -2. Win met exact twee goals: de -1.5 leg wint, de -2 leg push (inzet terug). Je wint de helft van je potentiële winst.',
    winConditie: 'Win met 3+ goals = volledig',
    verliesConditie: 'Gelijkspel, 1-goal winst of verlies',
    pushConditie: 'Win met 2 goals → helft terug',
    kleur: '#14b8a6',
  },
  {
    line: '2',
    naam: 'Two Ball',
    uitleg: 'Jouw team geeft twee goals voor. Win met precies twee goals en je inzet wordt teruggestort (push). Win met drie of meer goals en je wint volledig.',
    winConditie: 'Jouw team wint met 3+ goals',
    verliesConditie: 'Gelijkspel, 1-goal winst of verlies',
    pushConditie: 'Win met exact 2 goals → inzet terug',
    kleur: '#5469d4',
  },
];

const splitLines = [
  { label: 'Hele lijn (0, 0.5, 1 …)', omschrijving: 'Geen split. Win, verlies of push op de volledige inzet.' },
  { label: 'Kwart lijn (0.25, 0.75 …)', omschrijving: 'Inzet wordt 50/50 gesplitst over de twee dichtstbijzijnde hele lijnen.' },
];

export default function AsianLinesPage() {
  const { dark } = useTheme();

  const borderColor = 'var(--border)';
  const cardBg = 'var(--bg-card)';
  const subtleBg = 'var(--bg-subtle)';

  return (
    <div style={{ padding: '24px', maxWidth: 900 }} className="app-page">

      {/* Header */}
      <div className="mb-6 page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Asian Lines Overzicht</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Uitleg van alle veelgebruikte Asian Handicap lijnen</p>
      </div>

      {/* Intro */}
      <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Wat is Asian Handicap?</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 12 }}>
          Asian Handicap elimineert de mogelijkheid van gelijkspel door één team een voor- of achterstand in goals te geven. Dit maakt elke wedstrijd een twee-weg markt (win of verlies), waardoor de bookmaker-marge aanzienlijk lager is dan bij traditionele 1X2-markten.
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.7 }}>
          De lijn wordt altijd vanuit het perspectief van de <strong style={{ color: 'var(--text-2)' }}>favoriete team</strong> weergegeven als negatief getal (zij geven voor) en de underdog als positief (zij krijgen een voordeel). Kwart-lijnen (zoals -0.25 of -0.75) zijn split bets waarbij de inzet verdeeld wordt over twee aangrenzende lijnen.
        </p>
      </div>

      {/* Split lines uitleg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {splitLines.map((s) => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55 }}>{s.omschrijving}</p>
          </div>
        ))}
      </div>

      {/* Lines overzicht */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.map((l) => (
          <div
            key={l.line}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: '18px 22px',
              display: 'grid',
              gridTemplateColumns: '90px 1fr',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Line badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <span style={{
                display: 'inline-block',
                background: `${l.kleur}20`,
                border: `1px solid ${l.kleur}40`,
                color: l.kleur,
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}>
                -{l.line}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, lineHeight: 1.3 }}>{l.naam}</span>
            </div>

            {/* Content */}
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 12 }}>{l.uitleg}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Pill icon="✓" label={l.winConditie} color="#00c951"/>
                <Pill icon="✕" label={l.verliesConditie} color="#fb2b37"/>
                {l.pushConditie !== 'Geen push mogelijk' && (
                  <Pill icon="↩" label={l.pushConditie} color={dark ? '#7b9ef0' : '#5469d4'}/>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{ marginTop: 24, background: dark ? 'rgba(84,105,212,0.08)' : '#eef2ff', border: `1px solid ${dark ? 'rgba(123,158,240,0.2)' : '#c7d2fe'}`, borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: dark ? '#7b9ef0' : '#4f46e5', marginBottom: 6 }}>Tip: lagere marge bij Asian Handicap</p>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
          De vig op Asian Handicap markten ligt gemiddeld tussen de 2–4%, tegenover 5–8% bij standaard 1X2. Dit maakt AH-markten bijzonder aantrekkelijk voor value bettors. Gebruik de <a href="/calculators/vig" style={{ color: dark ? '#7b9ef0' : '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>Vig Calculator</a> om de exacte marge te berekenen.
        </p>
      </div>
    </div>
  );
}

function Pill({ icon, label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${color}14`,
      border: `1px solid ${color}30`,
      borderRadius: 6,
      padding: '3px 9px',
      fontSize: 11.5,
      color: color,
      fontWeight: 500,
    }}>
      <span style={{ fontSize: 10, opacity: 0.85 }}>{icon}</span>
      {label}
    </span>
  );
}
