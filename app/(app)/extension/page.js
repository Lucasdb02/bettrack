'use client';
import { useTheme } from '../../context/ThemeContext';

function ChromeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#4285F4"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <path d="M12 8h9.5" stroke="#EA4335" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5.25 17.5L9.75 9.5" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18.75 17.5L14.25 9.5" stroke="#FBBC05" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Step({ n, title, desc, dark }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: 'white',
        boxShadow: '0 0 16px rgba(99,102,241,0.35)',
      }}>{n}</div>
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent, dark }) {
  return (
    <div style={{
      padding: '20px 20px 22px',
      background: dark ? 'rgba(12,16,36,0.7)' : 'white',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#e8ecf2'}`,
      borderRadius: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent,
        opacity: 0.7,
      }} />
      <div style={{
        width: 38, height: 38, borderRadius: 10, marginBottom: 14,
        background: dark ? 'rgba(99,102,241,0.1)' : '#eef2ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function ExtensionMockup({ dark }) {
  const bets = [
    { match: 'Ajax - PSV', sel: 'Ajax wint', odds: '2.10', stake: '€ 25', bookie: 'bet365', status: 'lopend' },
    { match: 'CHE - MCI', sel: 'Over 2.5', odds: '1.85', stake: '€ 10', bookie: 'Unibet', status: 'lopend' },
  ];

  return (
    <div style={{
      width: 300,
      background: '#07091a',
      borderRadius: 14,
      border: '1px solid rgba(129,140,248,0.25)',
      overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(129,140,248,0.08), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.15)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 9px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e2e8f0' }}>2 bets gevonden</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Screenshot thumb */}
      <div style={{ margin: '10px 12px 0', borderRadius: 7, overflow: 'hidden', height: 52, background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(129,140,248,0.06) 100%)', border: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span style={{ fontSize: 11, color: '#64748b' }}>screenshot.jpg</span>
        <span style={{ fontSize: 10, color: '#4c3d9c', background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>AI ✓</span>
      </div>

      {/* Bet cards */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bets.map((b, i) => (
          <div key={i} style={{ background: 'rgba(12,16,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '9px 11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{b.match}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{b.sel}</div>
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(129,140,248,0.12)', color: '#a5b4fc', padding: '2px 6px', borderRadius: 4 }}>{b.odds}</span>
              <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>{b.stake}</span>
              <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: '#64748b', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' }}>{b.bookie}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div style={{ padding: '6px 12px 14px' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', borderRadius: 8, padding: '9px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
          Opslaan (2)
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    title: 'Eén klik screenshot',
    desc: 'Open de extensie op elke bookmaker pagina en maak direct een screenshot van je betslip.',
    accent: 'linear-gradient(90deg, #6366f1, #818cf8)',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    title: 'AI herkent alles',
    desc: 'Claude AI leest elk formaat — singles, accumulators, bet builders — van elke bookmaker in elke taal.',
    accent: 'linear-gradient(90deg, #10b981, #34d399)',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    title: 'Direct opgeslagen',
    desc: 'Bets verschijnen direct in je TrackMijnBets account — geen handmatig invoeren meer.',
    accent: 'linear-gradient(90deg, #d97706, #f59e0b)',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Controleer voor opslag',
    desc: 'Review en bewerk de herkende bets voordat je opslaat — je houdt altijd de controle.',
    accent: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  },
];

const STEPS = [
  { title: 'Open je betslip', desc: 'Ga naar de bookmaker van je keuze en navigeer naar je betslip of bet history.' },
  { title: 'Klik de extensie', desc: 'Klik op het TrackMijnBets icoontje rechtsbovenin Chrome. De extensie maakt automatisch een screenshot.' },
  { title: 'Controleer & sla op', desc: 'Bekijk de herkende bets, pas eventueel aan en klik Opslaan — klaar.' },
];

const BOOKMAKERS = ['bet365', 'BetCity', 'Unibet', 'LeoVegas', 'TOTO', "Jack's", 'Bingoal', 'Holland Casino', 'Circus', 'ComeOn'];

export default function ExtensionPage() {
  const { dark } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 48,
          alignItems: 'center',
          paddingTop: 52,
          paddingBottom: 56,
          borderBottom: `1px solid var(--border)`,
        }}>
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 20, border: `1px solid ${dark ? 'rgba(129,140,248,0.25)' : '#c7d2fe'}`, background: dark ? 'rgba(99,102,241,0.08)' : '#eef2ff', marginBottom: 20 }}>
              <ChromeIcon size={13} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: dark ? '#818cf8' : '#6366f1', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Chrome Extensie</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
              Sla betslips op{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 60%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                in één klik
              </span>
            </h1>

            <p style={{ fontSize: 15.5, color: 'var(--text-3)', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 420 }}>
              Screenshot een betslip op elke bookmaker. Onze AI herkent de bet automatisch en slaat hem op in jouw TrackMijnBets account.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '11px 20px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                  color: 'white', textDecoration: 'none',
                  fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ChromeIcon size={17} />
                Installeer gratis
              </a>
              <a
                href="#installeren"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '11px 18px', borderRadius: 10,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                  color: 'var(--text-2)', textDecoration: 'none',
                  fontSize: 14, fontWeight: 600,
                  border: `1px solid var(--border)`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'white'}
              >
                Handmatig installeren
              </a>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: -4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: `hsl(${230+i*20}, 60%, ${45+i*8}%)`, border: '2px solid var(--bg-page)', marginLeft: i > 0 ? -6 : 0 }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Gratis · Werkt op alle bookmakers · Geen data gedeeld</span>
            </div>
          </div>

          {/* Mockup */}
          <div style={{
            position: 'relative',
            flexShrink: 0,
            transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)',
            filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.5))',
          }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: -20, borderRadius: 28,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <ExtensionMockup dark={dark} />
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 52, paddingBottom: 52, borderBottom: `1px solid var(--border)` }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? '#818cf8' : '#6366f1', marginBottom: 10 }}>Functies</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>Alles in één extensie</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} dark={dark} />)}
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 52, paddingBottom: 52, borderBottom: `1px solid var(--border)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? '#818cf8' : '#6366f1', marginBottom: 10 }}>Hoe het werkt</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: '0 0 32px' }}>Drie stappen, <br/>minder dan 10 seconden</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {STEPS.map((s, i) => <Step key={i} n={i + 1} {...s} dark={dark} />)}
              </div>
            </div>

            {/* Flow visual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🌐', label: 'bet365.com', sub: 'Open betslip', color: '#10b981' },
                { icon: '📸', label: 'Screenshot', sub: 'Extensie klik', color: '#818cf8' },
                { icon: '🤖', label: 'AI Analyse', sub: 'Claude herkent de bet', color: '#f59e0b' },
                { icon: '✅', label: 'Opgeslagen', sub: 'Zichtbaar in je bets', color: '#60a5fa' },
              ].map((item, i, arr) => (
                <div key={i}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 16px', borderRadius: 11,
                    background: dark ? 'rgba(12,16,36,0.7)' : 'white',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#e8ecf2'}`,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{item.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 28, height: 14 }}>
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M6 0v10M2 7l4 4 4-4" stroke={dark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bookmakers ────────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 44, paddingBottom: 44, borderBottom: `1px solid var(--border)` }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-4)', fontWeight: 500 }}>Werkt op alle grote bookmakers</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {BOOKMAKERS.map(b => (
              <span key={b} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
                color: 'var(--text-3)',
                background: dark ? 'rgba(255,255,255,0.04)' : 'white',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e8ecf2'}`,
              }}>{b}</span>
            ))}
            <span style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
              color: dark ? '#818cf8' : '#6366f1',
              background: dark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
              border: `1px solid ${dark ? 'rgba(129,140,248,0.2)' : '#c7d2fe'}`,
            }}>+ alle andere</span>
          </div>
        </div>

        {/* ── Manual install ───────────────────────────────────────────────── */}
        <div id="installeren" style={{ paddingTop: 52, paddingBottom: 8 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? '#818cf8' : '#6366f1', marginBottom: 10 }}>Handmatig installeren</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Ontwikkelaarsmodus</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: 0 }}>Installeer de extensie direct vanuit de broncode zolang we nog wachten op Chrome Web Store goedkeuring.</p>
          </div>

          {[
            { n: '1', text: 'Ga naar', link: 'chrome://extensions', linkText: 'chrome://extensions' },
            { n: '2', text: 'Zet "Ontwikkelaarsmodus" aan via de schakelaar rechtsboven' },
            { n: '3', text: 'Klik "Uitgepakte extensie laden" en selecteer de ', code: 'chrome-extension/' },
            { n: '4', text: 'Het TrackMijnBets icoontje verschijnt in je werkbalk — klik erop en log in' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14,
              padding: '13px 16px', borderRadius: 10,
              background: dark ? 'rgba(12,16,36,0.6)' : 'white',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e8ecf2'}`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                background: dark ? 'rgba(129,140,248,0.12)' : '#eef2ff',
                color: dark ? '#818cf8' : '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11.5, fontWeight: 800,
              }}>{step.n}</div>
              <span style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {step.text}
                {step.link && <> <code style={{ fontSize: 12, background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', padding: '1px 6px', borderRadius: 4, color: dark ? '#94a3b8' : '#475569', fontFamily: 'monospace' }}>{step.linkText}</code></>}
                {step.code && <> <code style={{ fontSize: 12, background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', padding: '1px 6px', borderRadius: 4, color: dark ? '#94a3b8' : '#475569', fontFamily: 'monospace' }}>{step.code}</code> map in dit project</>}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 48,
          padding: '36px 32px',
          borderRadius: 18,
          background: dark
            ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(129,140,248,0.06) 100%)'
            : 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
          border: `1px solid ${dark ? 'rgba(129,140,248,0.2)' : '#c7d2fe'}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🚀</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: '0 0 8px' }}>Klaar om te beginnen?</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '0 0 24px' }}>Installeer de extensie en sla je eerste betslip op in minder dan 30 seconden.</p>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '12px 24px', borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                color: 'white', textDecoration: 'none',
                fontSize: 14.5, fontWeight: 700,
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <ChromeIcon size={18} />
              Installeer de extensie — Gratis
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
