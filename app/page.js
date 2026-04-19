'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ── Smooth scroll helper ── */
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Sticky header ── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: scrolled ? 'rgba(10,37,64,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      transition: 'all 0.25s ease',
      padding: '0 40px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-2.5" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(123,158,240,0.2)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
        </div>

        <nav className="flex items-center gap-1">
          {[
            { label: 'Functies', id: 'functies' },
            { label: 'Hoe het werkt', id: 'hoe-het-werkt' },
            { label: 'Analyse', id: 'analyse' },
            { label: 'Prijzen', id: 'prijzen' },
          ].map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, padding: '7px 14px', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >{item.label}</button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '7px 14px', borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
          >Inloggen</Link>
          <Link href="/signup"
            style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 7, boxShadow: '0 2px 16px rgba(84,105,212,0.45)', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', borderLeft: 'none', borderRight: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >Aanmelden — Gratis</Link>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #04111f 0%, #0a2540 45%, #0d1f38 100%)',
      paddingTop: 140, paddingBottom: 100,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(84,105,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: 'rgba(84,105,212,0.2)', border: '1px solid rgba(84,105,212,0.35)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5469d4' }} />
          <span style={{ fontSize: 13, color: '#a5b8f5', fontWeight: 500 }}>Gebouwd voor Nederlandse sportwedders</span>
        </div>

        <h1 style={{ fontSize: 58, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, maxWidth: 800, margin: '0 auto 20px' }}>
          Stop met gokken,{' '}
          <span style={{ background: 'linear-gradient(135deg, #7b9ef0, #5469d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            begin met analyseren
          </span>
        </h1>

        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto 40px' }}>
          Houd al je sportbets bij, analyseer je prestaties en ontdek precies waar je winst maakt — of verliest.
        </p>

        <div className="flex items-center justify-center gap-4" style={{ marginBottom: 64 }}>
          <Link href="/signup"
            style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 28px rgba(84,105,212,0.55)', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', borderLeft: 'none', borderRight: 'none' }}
          >
            Gratis beginnen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
          <button onClick={() => scrollTo('functies')}
            style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px) saturate(1.6)', WebkitBackdropFilter: 'blur(12px) saturate(1.6)', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.22)', borderLeft: 'none', borderRight: 'none', color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600, padding: '13px 24px', borderRadius: 9, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
          >Bekijk functies</button>
        </div>

        <div className="flex items-center justify-center gap-8">
          {[
            { value: '2.400+', label: 'Actieve gebruikers' },
            { value: '€3.2M+', label: 'Bets gevolgd' },
            { value: '94%', label: 'Tevreden bettors' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App preview mockup */}
      <div style={{ maxWidth: 1000, margin: '64px auto 0', padding: '0 40px', position: 'relative' }}>
        <div style={{ backgroundColor: '#0d1a2e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {/* Window bar */}
          <div style={{ backgroundColor: '#1a2e45', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />)}
            <div style={{ flex: 1, marginLeft: 12, height: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>trackmijnbets.nl/dashboard</span>
            </div>
          </div>

          {/* App mockup content */}
          <div style={{ display: 'flex', minHeight: 420 }}>
            {/* Sidebar — reflects real menu structure */}
            <div style={{ width: 190, backgroundColor: '#0a1e32', padding: '16px 10px', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 20, paddingLeft: 8 }}>
                <div style={{ width: 22, height: 22, background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', borderRadius: 5, border: '1px solid rgba(123,158,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>TrackMijnBets</span>
              </div>

              {/* Menu section */}
              <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4 }}>Menu</p>
              {[
                { label: 'Dashboard', active: true },
                { label: 'Bets Overzicht', active: false },
                { label: 'Bet Invoeren', active: false },
                { label: 'Maandoverzicht', active: false },
                { label: 'Statistieken', active: false },
              ].map((item, i) => (
                <div key={i} style={{ padding: '5px 8px', borderRadius: 5, marginBottom: 1, backgroundColor: item.active ? 'rgba(30,73,118,0.8)' : 'transparent', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.active ? '#5469d4' : 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                  <span style={{ color: item.active ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 10 }}>{item.label}</span>
                </div>
              ))}

              {/* Bookmakers section */}
              <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4, marginTop: 12 }}>Bookmakers</p>
              <div style={{ padding: '5px 8px', borderRadius: 5, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>Bookmakers</span>
              </div>

              {/* Calculators section */}
              <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 4, marginTop: 12 }}>Calculators</p>
              {['Arbitrage', 'Kelly', 'Vig Calculator', 'Expected Value', 'Odds Converter'].map((item, i) => (
                <div key={i} style={{ padding: '4px 8px', borderRadius: 5, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Dashboard content */}
            <div style={{ flex: 1, padding: '18px 20px', backgroundColor: '#0d1117' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>Dashboard</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Week', 'Maand', 'Jaar'].map((p, i) => (
                    <span key={p} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, backgroundColor: i === 1 ? '#5469d4' : 'rgba(255,255,255,0.06)', color: i === 1 ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Totale P&L', value: '+€847', color: '#34D399', sub: '+12.3%' },
                  { label: 'Win Rate', value: '61.3%', color: '#e6edf3', sub: 'van 147 bets' },
                  { label: 'ROI', value: '+8.7%', color: '#34D399', sub: 'rendement' },
                  { label: 'Actief', value: '3', color: '#7b9ef0', sub: 'open bets' },
                ].map((c, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 11px' }}>
                    <p style={{ fontSize: 7.5, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{c.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: c.color, letterSpacing: '-0.02em', marginBottom: 2 }}>{c.value}</p>
                    <p style={{ fontSize: 7.5, color: '#4a6885' }}>{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#8b949e' }}>Cumulatieve P&L</p>
                  <span style={{ fontSize: 8.5, color: '#34D399', fontWeight: 600 }}>+€847 dit jaar</span>
                </div>
                <svg viewBox="0 0 440 64" style={{ width: '100%', height: 48 }}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7b9ef0" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7b9ef0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 L44,56 L88,50 L132,54 L176,38 L220,30 L264,34 L308,20 L352,12 L396,6 L440,3" fill="none" stroke="#7b9ef0" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M0,60 L44,56 L88,50 L132,54 L176,38 L220,30 L264,34 L308,20 L352,12 L396,6 L440,3 L440,64 L0,64 Z" fill="url(#heroGrad)" />
                  <circle cx="352" cy="12" r="2.5" fill="#7b9ef0" />
                  <circle cx="396" cy="6" r="2.5" fill="#7b9ef0" />
                  <circle cx="440" cy="3" r="3" fill="#7b9ef0" />
                </svg>
              </div>

              {/* Recent bets */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recente bets</span>
                  <span style={{ fontSize: 7.5, color: '#5469d4', fontWeight: 600 }}>Alles zien →</span>
                </div>
                {[
                  { match: 'Ajax vs PSV', market: '1X2 · Unibet', odds: '2.10', result: '+€55', win: true },
                  { match: 'Liverpool vs Chelsea', market: 'BTTS · Bet365', odds: '1.85', result: '-€25', win: false },
                  { match: 'Sinner vs Alcaraz', market: 'Winnaar · TOTO', odds: '3.20', result: '+€38', win: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <span style={{ fontSize: 9, color: '#c9d1d9', fontWeight: 500, display: 'block' }}>{r.match}</span>
                      <span style={{ fontSize: 8, color: '#6e7681' }}>{r.market}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 8.5, color: '#4a6885' }}>{r.odds}</span>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: r.win ? '#34D399' : '#FB7185' }}>{r.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 60, background: 'radial-gradient(ellipse, rgba(84,105,212,0.3) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      </div>
    </section>
  );
}

/* ── App Showcase (bento grid) ── */
function AppShowcase() {
  return (
    <section id="functies" style={{ backgroundColor: '#04111f', padding: '96px 40px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>De tool</span>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginTop: 12, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Alles in één platform
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', marginTop: 16, maxWidth: 520, margin: '16px auto 0' }}>
            Van bet invoeren tot diepgaande analyse — TrackMijnBets heeft elk onderdeel van je betting workflow gedekt.
          </p>
        </div>

        {/* Row 1: Dashboard (large) + Bet Invoeren (small) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Dashboard block */}
          <div style={{ background: 'linear-gradient(160deg, #0d1a2e 0%, #0a1628 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Realtime P&L Dashboard</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 20, maxWidth: 380 }}>
                Volg je cumulatieve winst live. Zie je ROI, win rate en yield per geselecteerde periode in één overzicht.
              </p>
            </div>
            {/* Dashboard mockup */}
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', padding: '14px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { l: 'Totale P&L', v: '+€847', c: '#34D399' },
                  { l: 'Win Rate', v: '61.3%', c: '#e6edf3' },
                  { l: 'ROI', v: '+8.7%', c: '#34D399' },
                  { l: 'Bets', v: '147', c: '#7b9ef0' },
                ].map((c, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 10px' }}>
                    <p style={{ fontSize: 7, color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.l}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: c.c }}>{c.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 8.5, fontWeight: 600, color: '#8b949e' }}>Cumulatieve P&L</span>
                  <span style={{ fontSize: 8, color: '#34D399', fontWeight: 700 }}>+€847 YTD</span>
                </div>
                <svg viewBox="0 0 380 56" style={{ width: '100%', height: 42 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7b9ef0" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#7b9ef0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,52 L38,47 L76,41 L114,45 L152,33 L190,26 L228,30 L266,18 L304,10 L342,5 L380,2" fill="none" stroke="#7b9ef0" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M0,52 L38,47 L76,41 L114,45 L152,33 L190,26 L228,30 L266,18 L304,10 L342,5 L380,2 L380,56 L0,56 Z" fill="url(#dashGrad)" />
                  <circle cx="304" cy="10" r="2.5" fill="#7b9ef0" />
                  <circle cx="342" cy="5" r="2.5" fill="#7b9ef0" />
                  <circle cx="380" cy="2" r="3" fill="#7b9ef0" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bet Invoeren block */}
          <div style={{ background: 'linear-gradient(160deg, #0f1d2e 0%, #0a1628 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bet Invoeren</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Snel bets loggen</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 20 }}>
                Vul sport, markt, odds en inzet in. Zie direct je potentiële winst.
              </p>
            </div>
            {/* Form mockup */}
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', padding: '14px 16px' }}>
              {[
                { label: 'Sport', value: 'Voetbal', icon: '⚽' },
                { label: 'Wedstrijd', value: 'Ajax vs PSV' },
                { label: 'Markt', value: '1X2' },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</p>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10.5, color: '#c9d1d9', fontWeight: 500 }}>{f.value}</span>
                    {i === 0 && <span style={{ fontSize: 11 }}>⚽</span>}
                  </div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[{ label: 'Odds', value: '2.10' }, { label: 'Inzet', value: '€50' }].map((f, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(84,105,212,0.4)', borderRadius: 6, padding: '7px 10px' }}>
                      <span style={{ fontSize: 10.5, color: '#7b9ef0', fontWeight: 600 }}>{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 7, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: '#34D399', fontWeight: 600 }}>Potentiële winst</span>
                <span style={{ fontSize: 13, color: '#34D399', fontWeight: 800 }}>+€55.00</span>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #6b82f0, #5469d4)', borderRadius: 7, padding: '9px', textAlign: 'center' }}>
                <span style={{ fontSize: 10.5, color: '#fff', fontWeight: 700 }}>Bet opslaan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Bets Overzicht + Statistieken */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
          {/* Bets Overzicht block */}
          <div style={{ background: 'linear-gradient(160deg, #0d1a2e 0%, #0b1524 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bets Overzicht</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Filter & doorzoek alles</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 18 }}>
                Filter op sport, bookmaker, markt of periode.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', padding: '12px 14px' }}>
              {/* Search */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 10, color: '#4a6885' }}>Zoek in bets...</span>
              </div>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                {['Voetbal', 'Unibet', 'Gewonnen'].map((f, i) => (
                  <span key={f} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, backgroundColor: i === 0 ? 'rgba(84,105,212,0.3)' : 'rgba(255,255,255,0.06)', border: `1px solid ${i === 0 ? 'rgba(84,105,212,0.5)' : 'rgba(255,255,255,0.08)'}`, color: i === 0 ? '#a5b8f5' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
              {/* Bet rows */}
              {[
                { match: 'Ajax vs PSV', market: '1X2 · Unibet', result: '+€55', win: true, odds: '2.10' },
                { match: 'Man City vs Arsenal', market: 'Asian Handicap · Bet365', result: '+€44', win: true, odds: '1.95' },
                { match: 'Barcelona vs Real Madrid', market: 'BTTS · Betway', result: '-€30', win: false, odds: '1.75' },
                { match: 'Sinner vs Djokovic', market: 'Set Betting · TOTO', result: '+€82', win: true, odds: '3.50' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: r.win ? '#34D399' : '#FB7185', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 9.5, color: '#c9d1d9', fontWeight: 500, display: 'block' }}>{r.match}</span>
                      <span style={{ fontSize: 8, color: '#4a6885' }}>{r.market}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 8.5, color: '#4a6885' }}>{r.odds}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: r.win ? '#34D399' : '#FB7185' }}>{r.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistieken block */}
          <div style={{ background: 'linear-gradient(160deg, #0d1a2e 0%, #0a1628 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Statistieken</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Diepgaande analyse</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 18 }}>
                ROI per sport, markt en bookmaker. Ontdek waar je geld verdient.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', padding: '14px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* ROI per sport bar chart */}
                <div>
                  <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>ROI per sport</p>
                  {[
                    { sport: 'Voetbal', roi: 9.2, pct: 75 },
                    { sport: 'Tennis', roi: 14.5, pct: 95 },
                    { sport: 'Basketball', roi: 5.1, pct: 42 },
                    { sport: 'Hockey', roi: -2.3, pct: 20, neg: true },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: '#8b949e' }}>{s.sport}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: s.neg ? '#FB7185' : '#34D399' }}>{s.neg ? '' : '+'}{s.roi}%</span>
                      </div>
                      <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${s.pct}%`, borderRadius: 99, backgroundColor: s.neg ? '#FB7185' : '#5469d4' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bookmaker breakdown */}
                <div>
                  <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Per bookmaker</p>
                  {[
                    { name: 'Unibet', bets: 58, roi: '+11.2%', color: '#7b9ef0' },
                    { name: 'Bet365', bets: 44, roi: '+7.8%', color: '#34D399' },
                    { name: 'TOTO', bets: 28, roi: '+5.4%', color: '#f59e0b' },
                    { name: 'Betway', bets: 17, roi: '-1.2%', color: '#FB7185' },
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: b.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 9.5, color: '#c9d1d9', fontWeight: 500 }}>{b.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: b.color }}>{b.roi}</span>
                        </div>
                        <span style={{ fontSize: 8, color: '#4a6885' }}>{b.bets} bets</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Maandoverzicht + Calculators */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          {/* Maandoverzicht block */}
          <div style={{ background: 'linear-gradient(160deg, #0d1a2e 0%, #0b1524 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maandoverzicht</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Elke dag in één oogopslag</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 18 }}>
                Groen = winst, rood = verlies. Klik op een dag voor je betdetails.
              </p>
            </div>
            {/* Calendar mockup — dark */}
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9' }}>April 2026</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#34D399' }}>+€363</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Ma','Di','Wo','Do','Vr','Za','Zo'].map(d => (
                  <div key={d} style={{ padding: '5px 0', textAlign: 'center', fontSize: 8, fontWeight: 700, color: '#3d5570', textTransform: 'uppercase' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                {[
                  null, null,
                  { d:1, pnl:null }, { d:2, pnl:45.5 }, { d:3, pnl:-22 }, { d:4, pnl:78 }, { d:5, pnl:-15 },
                  { d:6, pnl:0 }, { d:7, pnl:33 }, { d:8, pnl:12 }, { d:9, pnl:-40 }, { d:10, pnl:55 }, { d:11, pnl:null }, { d:12, pnl:28 },
                  { d:13, pnl:-8 }, { d:14, pnl:90 }, { d:15, pnl:15 }, { d:16, pnl:-30 }, { d:17, pnl:44 }, { d:18, pnl:null }, { d:19, pnl:-18 },
                  { d:20, pnl:62 }, { d:21, pnl:null }, { d:22, pnl:35 }, { d:23, pnl:-25 }, { d:24, pnl:80 }, { d:25, pnl:null }, { d:26, pnl:20 },
                  { d:27, pnl:-12 }, { d:28, pnl:48 }, { d:29, pnl:18 }, { d:30, pnl:null }, null, null,
                ].map((cell, i) => {
                  if (!cell) return <div key={i} style={{ minHeight: 36, borderRight: i%7!==6?'1px solid rgba(255,255,255,0.04)':'none', borderBottom:'1px solid rgba(255,255,255,0.04)', backgroundColor:'rgba(0,0,0,0.1)' }} />;
                  const hasPnl = cell.pnl !== null && cell.pnl !== 0;
                  const bg = !hasPnl ? 'transparent' : cell.pnl > 0 ? `rgba(52,211,153,${0.06 + Math.abs(cell.pnl)/90*0.16})` : `rgba(251,113,133,${0.06 + Math.abs(cell.pnl)/90*0.14})`;
                  return (
                    <div key={i} style={{ minHeight: 36, padding: '4px 5px', backgroundColor: bg, borderRight: i%7!==6?'1px solid rgba(255,255,255,0.04)':'none', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <p style={{ fontSize: 8, fontWeight: hasPnl?600:400, color: hasPnl?'#8b949e':'#3d5570' }}>{cell.d}</p>
                      {hasPnl && <p style={{ fontSize: 7.5, fontWeight:700, color: cell.pnl>0?'#34D399':'#FB7185', marginTop:1 }}>{cell.pnl>0?'+':''}€{Math.abs(cell.pnl)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calculators block */}
          <div style={{ background: 'linear-gradient(160deg, #0f1d2e 0%, #0a1628 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4"/><path d="M9 21H5a2 2 0 01-2-2v-4"/><path d="M15 3h4a2 2 0 012 2v4"/><path d="M15 21h4a2 2 0 002-2v-4"/><rect x="7" y="8" width="10" height="8" rx="1"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calculators</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Professionele tools</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 18 }}>
                Arbitrage, Kelly, EV, Vig en Odds Converter — altijd bij de hand.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: 'rgba(0,0,0,0.3)', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', padding: '14px 16px' }}>
              {/* Arbitrage calculator mockup */}
              <p style={{ fontSize: 8, color: '#7b9ef0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Arbitrage Calculator</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Bookmaker A odds', value: '2.10' },
                  { label: 'Bookmaker B odds', value: '2.05' },
                ].map((f, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '7px 10px' }}>
                      <span style={{ fontSize: 11, color: '#c9d1d9', fontWeight: 600 }}>{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 8.5, color: '#34D399', fontWeight: 600 }}>Arbitrage gevonden!</span>
                  <span style={{ fontSize: 9, color: '#34D399', fontWeight: 800 }}>+2.37% profit</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 8, color: '#4a8875' }}>Inzet A: €52.50</span>
                  <span style={{ fontSize: 8, color: '#4a8875' }}>Inzet B: €47.50</span>
                </div>
              </div>
              {/* Calculator links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Kelly Criterion', 'Expected Value (EV)', 'Vig Calculator', 'Odds Converter'].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7 }}>
                    <span style={{ fontSize: 10, color: '#8b949e', fontWeight: 500 }}>{c}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3d5570" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
function HoeHetWerkt() {
  const steps = [
    { num: '01', title: 'Voer je bet in', desc: 'Vul sport, wedstrijd, markt, selectie, odds en inzet in. Zie direct je potentiële winst voordat je de bet opslaat.' },
    { num: '02', title: 'Bijhouden & updaten', desc: 'Zodra de uitkomst bekend is, update je de bet met één klik. TrackMijnBets berekent automatisch je winst of verlies.' },
    { num: '03', title: 'Analyseer je data', desc: 'Bekijk per sport, markt en bookmaker waar je goed en slecht presteert. Verbeter je strategie op basis van echte data.' },
  ];

  return (
    <section id="hoe-het-werkt" style={{ backgroundColor: '#060e1a', padding: '96px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hoe het werkt</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginTop: 12, letterSpacing: '-0.02em' }}>
            In drie stappen naar inzicht
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {i < 2 && (
                <div style={{ position: 'absolute', top: 28, left: 'calc(50% + 36px)', right: 'calc(-50% + 36px)', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
              )}
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#5469d4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 1, boxShadow: '0 0 24px rgba(84,105,212,0.4)' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{step.num}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Calendar preview ── */
function AnalysePreview() {
  const days = [
    { d: null }, { d: null },
    { d: 1, pnl: null }, { d: 2, pnl: 45.5 }, { d: 3, pnl: -22 }, { d: 4, pnl: 78 }, { d: 5, pnl: -15 },
    { d: 6, pnl: 0 }, { d: 7, pnl: 33 }, { d: 8, pnl: 12 }, { d: 9, pnl: -40 }, { d: 10, pnl: 55 }, { d: 11, pnl: null }, { d: 12, pnl: 28 },
    { d: 13, pnl: -8 }, { d: 14, pnl: 90 }, { d: 15, pnl: 15 }, { d: 16, pnl: -30 }, { d: 17, pnl: 44 }, { d: 18, pnl: null }, { d: 19, pnl: -18 },
    { d: 20, pnl: 62 }, { d: 21, pnl: null }, { d: 22, pnl: 35 }, { d: 23, pnl: -25 }, { d: 24, pnl: 80 }, { d: 25, pnl: null }, { d: 26, pnl: 20 },
    { d: 27, pnl: -12 }, { d: 28, pnl: 48 }, { d: 29, pnl: 18 }, { d: 30, pnl: null }, { d: null }, { d: null },
  ];

  return (
    <section id="analyse" style={{ backgroundColor: '#04111f', padding: '96px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maandoverzicht</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff', marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
            Elke dag in één oogopslag
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
            Het Pikkit-stijl kalenderoverzicht toont elke dag van de maand als een gekleurd vakje.
            Groen betekent winst, rood verlies. Klik op een dag om precies te zien welke bets je die dag had geplaatst.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Dagelijkse P&L in één oogopslag',
              'Kleurcodering op basis van winstgrootte',
              'Klik op dag voor gedetailleerde betlijst',
              'Navigeer door maanden met één klik',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar mock — dark */}
        <div style={{ backgroundColor: '#0d1a2e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between" style={{ padding: '14px 18px', backgroundColor: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>April 2026</span>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16, fontWeight: 800, color: '#34D399' }}>+€363</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d) => (
              <div key={d} style={{ padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#3d5570', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((cell, i) => {
              if (!cell.d) return <div key={i} style={{ minHeight: 52, backgroundColor: 'rgba(0,0,0,0.15)', borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />;
              const hasPnl = cell.pnl !== null && cell.pnl !== 0;
              const bg = cell.pnl === null ? 'transparent' : cell.pnl > 0 ? `rgba(52,211,153,${0.06 + Math.abs(cell.pnl)/90*0.16})` : cell.pnl < 0 ? `rgba(251,113,133,${0.06 + Math.abs(cell.pnl)/90*0.14})` : 'transparent';
              return (
                <div key={i} style={{ minHeight: 52, padding: '6px 7px', backgroundColor: bg, borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: hasPnl ? 'pointer' : 'default' }}>
                  <p style={{ fontSize: 10.5, fontWeight: hasPnl ? 600 : 400, color: hasPnl ? '#8b949e' : '#3d5570' }}>{cell.d}</p>
                  {hasPnl && (
                    <p style={{ fontSize: 9.5, fontWeight: 700, color: cell.pnl > 0 ? '#34D399' : '#FB7185', marginTop: 2 }}>
                      {cell.pnl > 0 ? '+' : ''}€{cell.pnl}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
function Prijzen() {
  return (
    <section id="prijzen" style={{ backgroundColor: '#060e1a', padding: '96px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prijzen</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginTop: 12, letterSpacing: '-0.02em' }}>Eenvoudige, transparante prijzen</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginTop: 14 }}>Begin gratis. Upgrade wanneer jij er klaar voor bent.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Free */}
          <div style={{ backgroundColor: '#0d1a2e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '36px 36px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gratis</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}>€0</span>
              <span style={{ fontSize: 15, color: '#4a6885', marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: 28, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              Gratis beginnen
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Tot 100 bets per maand', 'Dashboard & statistieken', 'Maandoverzicht kalender', 'Alle sporten & markten'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: 'rgba(255,255,255,0.6)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{ backgroundColor: '#0a2540', border: '1px solid #1e4976', borderRadius: 16, padding: '36px 36px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(84,105,212,0.15)' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(84,105,212,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#5469d4', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.04em' }}>
              POPULAIRSTE
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#7b9ef0', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}>€9</span>
              <span style={{ fontSize: 15, color: '#4a6885', marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '11px', backgroundColor: '#5469d4', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', marginBottom: 28, boxShadow: '0 4px 20px rgba(84,105,212,0.4)' }}>
              Pro starten
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Onbeperkte bets', 'Alles uit Gratis', 'CSV export', 'Geavanceerde filters', 'Prioriteitsondersteuning', 'Vroeg toegang tot nieuwe functies'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: '#c5d8ec' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0d1f38 100%)', padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18 }}>
          Klaar om slimmer te wedden?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.6 }}>
          Doe mee met 2.400+ bettors die TrackMijnBets gebruiken om hun resultaten te verbeteren. Begin vandaag, gratis.
        </p>
        <Link href="/signup"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15.5, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, boxShadow: '0 4px 32px rgba(84,105,212,0.6)', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.22)', borderLeft: 'none', borderRight: 'none' }}
        >
          Gratis aanmelden
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>Geen creditcard nodig. Direct aan de slag.</p>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ backgroundColor: '#04111f', padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: '#5469d4', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>TrackMijnBets</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 TrackMijnBets. Alle rechten voorbehouden.</p>
        <div className="flex items-center gap-4">
          {['Privacy', 'Voorwaarden', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── Main export ── */
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#04111f' }}>
      <Header />
      <Hero />
      <AppShowcase />
      <HoeHetWerkt />
      <AnalysePreview />
      <Prijzen />
      <FinalCTA />
      <Footer />
    </div>
  );
}
