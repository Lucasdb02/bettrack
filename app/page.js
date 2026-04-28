'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

/* ── Landing page theme context ── */
const LpTheme = createContext({ dark: true, setDark: () => {} });
const useLp = () => useContext(LpTheme);

/* ── Smooth scroll helper ── */
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Catmull-Rom → cubic Bezier SVG path ── */
function mkSmoothPath(pts) {
  const t = 0.3;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = (p1[0] + (p2[0] - p0[0]) * t).toFixed(1);
    const cp1y = (p1[1] + (p2[1] - p0[1]) * t).toFixed(1);
    const cp2x = (p2[0] - (p3[0] - p1[0]) * t).toFixed(1);
    const cp2y = (p2[1] - (p3[1] - p1[1]) * t).toFixed(1);
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ── Sticky header ── */
function Header() {
  const { dark, setDark } = useLp();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  // Colours that depend on dark mode + scroll state
  const textPrimary    = dark ? '#fff' : '#0f172a';
  const textNav        = dark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.58)';
  const navHoverColor  = dark ? '#fff' : '#0f172a';
  const navHoverBg     = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconBg         = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const iconBgHover    = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const iconBorder     = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
  const iconColor      = dark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.6)';
  const iconColorHover = dark ? '#fff' : '#0f172a';
  const loginColor     = dark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.65)';
  const loginHoverColor= dark ? '#fff' : '#0f172a';
  const loginHoverBg   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      /* Top padding only appears when scrolled so the pill floats */
      padding: scrolled ? '12px 20px' : '0 32px',
      pointerEvents: 'none',
      transition: 'padding 0.3s ease',
    }}>
      <div style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'center',
        width: '100%',
        maxWidth: scrolled ? 920 : 1400,
        height: scrolled ? 54 : 64,
        /* Background: transparent at top, frosted glass when scrolled */
        background: scrolled
          ? (dark ? 'rgba(6,10,22,0.88)' : 'rgba(255,255,255,0.78)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(28px) saturate(2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(2)' : 'none',
        border: scrolled
          ? (dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)')
          : 'none',
        borderRadius: scrolled ? 14 : 0,
        padding: scrolled ? '0 8px 0 20px' : '0',
        boxShadow: scrolled
          ? (dark
            ? '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)')
          : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: textPrimary, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>TrackMijnBets</span>
        </div>

        {/* Nav — centered */}
        <nav className="lp-nav-links" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {[
            { label: 'Functies', id: 'functies' },
            { label: 'Hoe het werkt', id: 'hoe-het-werkt' },
            { label: 'Analyse', id: 'analyse' },
            { label: 'Prijzen', id: 'prijzen' },
          ].map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: textNav, fontSize: 13.5, fontWeight: 500, padding: '6px 12px', borderRadius: 7, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = navHoverColor; e.currentTarget.style.background = navHoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = textNav; e.currentTarget.style.background = 'none'; }}
            >{item.label}</button>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title={dark ? 'Lichte modus' : 'Donkere modus'}
            style={{ width: 34, height: 34, borderRadius: 8, border: iconBorder, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: iconColor, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = iconBgHover; e.currentTarget.style.color = iconColorHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = iconBg; e.currentTarget.style.color = iconColor; }}
          >
            {dark
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {user ? (
            <>
              <Link href="/dashboard"
                style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '7px 16px', borderRadius: 8, boxShadow: '0 2px 12px rgba(84,105,212,0.4)', border: '1px solid rgba(255,255,255,0.2)', transition: 'opacity 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Dashboard
              </Link>
              <button onClick={handleLogout} title="Uitloggen"
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(251,43,55,0.2)', background: 'rgba(251,43,55,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(251,80,90,0.8)', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,43,55,0.14)'; e.currentTarget.style.color = '#fb2b37'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,43,55,0.07)'; e.currentTarget.style.color = 'rgba(251,80,90,0.8)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                style={{ color: loginColor, fontSize: 13.5, fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 7, transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = loginHoverColor; e.currentTarget.style.background = loginHoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = loginColor; e.currentTarget.style.background = 'transparent'; }}
              >Inloggen</Link>
              <Link href="/signup"
                style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, boxShadow: '0 2px 12px rgba(84,105,212,0.4)', border: '1px solid rgba(255,255,255,0.2)', transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >Aanmelden</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Hero ── */
function Hero() {
  const { dark } = useLp();
  const cBg   = 'rgba(255,255,255,0.04)';
  const cBrd  = 'rgba(255,255,255,0.07)';

  return (
    <section className="lp-hero-section" style={{
      background: dark
        ? 'linear-gradient(160deg, #04111f 0%, #0a2540 45%, #0d1f38 100%)'
        : '#ffffff',
      paddingBottom: 0, paddingTop: 0,
      position: 'relative', overflow: 'hidden',
      minHeight: 600,
      transition: 'background 0.3s ease',
    }}>

      {/* Dotted grid — fades outward from where the dashboard lives */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle, ${dark ? 'rgba(107,130,240,0.22)' : 'rgba(84,105,212,0.2)'} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
        maskImage:        'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
      }} />

      {/* Subtle glow behind mockup */}
      <div style={{ position: 'absolute', top: '10%', left: '42%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(84,105,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Full-width flex — left text | right mockup */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

        {/* Left text — aligned to 1400px grid */}
        <div style={{ flexShrink: 0, width: '44%', minWidth: 320, padding: '128px 48px 80px max(32px, calc((100vw - 1400px) / 2 + 32px))' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: dark ? 'rgba(84,105,212,0.15)' : 'rgba(84,105,212,0.1)', border: '1px solid rgba(84,105,212,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5469d4' }} />
            <span style={{ fontSize: 13, color: dark ? '#a5b8f5' : '#5469d4', fontWeight: 500 }}>Gebouwd voor Nederlandse sportwedders</span>
          </div>

          <h1 className="lp-hero-title" style={{ fontSize: 52, fontWeight: 800, color: dark ? '#fff' : '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 22 }}>
            Stop met gokken,{' '}
            <span style={{ background: 'linear-gradient(135deg, #7b9ef0, #5469d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              begin met analyseren
            </span>
          </h1>

          <p className="lp-hero-sub" style={{ fontSize: 17, color: dark ? 'rgba(255,255,255,0.58)' : '#475569', lineHeight: 1.65, marginBottom: 40, maxWidth: 440 }}>
            Houd al je sportbets bij, analyseer je prestaties en ontdek precies waar je winst maakt — of verliest.
          </p>

          <div className="lp-cta-row" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <Link href="/signup"
              style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 28px rgba(84,105,212,0.55)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Gratis beginnen
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <button onClick={() => scrollTo('functies')}
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)', backdropFilter: 'blur(12px) saturate(1.6)', WebkitBackdropFilter: 'blur(12px) saturate(1.6)', border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(99,102,241,0.25)', color: dark ? 'rgba(255,255,255,0.9)' : '#4f46e5', fontSize: 15, fontWeight: 600, padding: '13px 24px', borderRadius: 9, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
            >Bekijk functies</button>
          </div>

          <div className="lp-stats-row" style={{ display: 'flex', alignItems: 'center' }}>
            {[
              { value: '2.400+', label: 'Actieve gebruikers' },
              { value: '€3.2M+', label: 'Bets gevolgd' },
              { value: '94%', label: 'Tevreden bettors' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', margin: '0 24px' }} />}
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: dark ? '#fff' : '#0f172a', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginTop: 4 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — faithful dashboard mockup, extends past right edge (clipped by section overflow:hidden) */}
        <div className="lp-mockup-wrap" style={{ flex: 1, paddingTop: 48, paddingLeft: 8, minWidth: 0 }}>
          {/* Browser chrome frame */}
          <div style={{
            background: '#0d1825',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            width: '115%',
          }}>
            {/* Traffic lights + URL bar */}
            <div style={{ background: '#111d2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />)}
              <div style={{ flex: 1, marginLeft: 10, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.01em' }}>trackmijnbets.nl/dashboard</span>
              </div>
            </div>

            {/* App shell: sidebar + main */}
            <div style={{ display: 'flex', height: 460 }}>

              {/* ─ Sidebar (exact copy of real sidebar, scaled down) ─ */}
              <div style={{ width: 185, background: '#070917', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '14px 14px 13px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', borderRadius: 6, border: '1px solid rgba(123,158,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}>TrackMijnBets</p>
                    <p style={{ color: '#4a6885', fontSize: 9 }}>Analyse Tool</p>
                  </div>
                </div>

                {/* Nav */}
                <div style={{ flex: 1, padding: '10px 10px', overflowY: 'hidden' }}>
                  <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 700, letterSpacing: '0.09em', paddingLeft: 8, marginBottom: 4, textTransform: 'uppercase' }}>Menu</p>
                  {[
                    { label: 'Dashboard', active: true },
                    { label: 'Bets Overzicht', active: false },
                    { label: 'Bet Invoeren', active: false },
                    { label: 'Maandoverzicht', active: false },
                    { label: 'Statistieken', active: false },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '5px 8px', borderRadius: 6, marginBottom: 1, background: item.active ? 'rgba(123,158,240,0.15)' : 'transparent', border: `1px solid ${item.active ? 'rgba(123,158,240,0.25)' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 13, height: 13, borderRadius: 3, background: item.active ? 'rgba(123,158,240,0.25)' : 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                      <span style={{ color: item.active ? '#e8f0ff' : 'rgba(255,255,255,0.28)', fontSize: 9.5, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                    </div>
                  ))}

                  <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 700, letterSpacing: '0.09em', paddingLeft: 8, marginBottom: 4, marginTop: 12, textTransform: 'uppercase' }}>Bookmakers</p>
                  <div style={{ padding: '5px 8px', borderRadius: 6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9.5 }}>Bookmakers</span>
                  </div>

                  <p style={{ color: '#2d5070', fontSize: 8, fontWeight: 700, letterSpacing: '0.09em', paddingLeft: 8, marginBottom: 4, textTransform: 'uppercase' }}>Tools</p>
                  {['Odds Vergelijker','Calculators','Chrome Extension','Asian Lines'].map((item, i) => (
                    <div key={i} style={{ padding: '4px 8px', borderRadius: 6, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9.5 }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 10px', background: '#060713' }}>
                  {['Support','Lichte modus','Abonnement'].map((item, i) => (
                    <div key={i} style={{ padding: '4px 8px', borderRadius: 6, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9.5 }}>{item}</span>
                    </div>
                  ))}
                  <div style={{ padding: '6px 8px', borderRadius: 7, marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(84,105,212,0.2)', border: '1px solid rgba(123,158,240,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <p style={{ color: '#c5d8ec', fontSize: 10, fontWeight: 500 }}>Mijn Account</p>
                      <p style={{ color: '#3d6080', fontSize: 8.5 }}>Voorkeuren & export</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ Dashboard main content ─ */}
              <div style={{ flex: 1, background: '#080f1e', padding: '16px 18px', overflowY: 'hidden', minWidth: 0 }}>
                {/* Page header — matches real dashboard: title + period dropdown */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>Dashboard</p>
                    <p style={{ fontSize: 9, color: '#4a6885' }}>Overzicht van al je bets en prestaties</p>
                  </div>
                  {/* Period dropdown button — matches real PeriodDropdown */}
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 9px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', fontSize:8.5, fontWeight:500, gap:5 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Alle tijd
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                {/* Stat cards — match real dashboard: Totale P&L, Win Rate, ROI, Record */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 10 }}>
                  {[
                    { label: 'Totale P&L', value: '+€847', color: '#00c951', sub: '147 afger. bets',
                      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(123,158,240,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg> },
                    { label: 'Win Rate',   value: '61.3%',  color: '#e6edf3', sub: '90W — 57L — 0P',
                      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(123,158,240,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                    { label: 'ROI',        value: '+8.7%',  color: '#00c951', sub: 'Totale inzet: €9.728',
                      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(123,158,240,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><polyline points="18 9 13 14 8 9 3 14"/></svg> },
                    { label: 'Record',     value: '90-57-0',color: '#e6edf3', sub: 'W — L — P  •  147 bets',
                      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(123,158,240,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
                  ].map((c, i) => (
                    <div key={i} style={{ background: cBg, border: `1px solid ${cBrd}`, borderRadius: 9, padding: '9px 10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <p style={{ fontSize: 7.5, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                        <div style={{ width:22, height:22, borderRadius:6, background:'rgba(84,105,212,0.18)', border:'1px solid rgba(123,158,240,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.icon}</div>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: c.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 2 }}>{c.value}</p>
                      <p style={{ fontSize: 7.5, color: '#4a6885' }}>{c.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Cumulative P&L Chart — blue line, matches real dashboard */}
                <div style={{ background: cBg, border: `1px solid ${cBrd}`, borderRadius: 9, padding: '9px 11px', marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#8b949e' }}>Cumulatieve P&L</p>
                      <span style={{ fontSize:8, color:'#00c951', fontWeight:600 }}>+8.7% ROI</span>
                    </div>
                    <span style={{ fontSize: 8.5, color: '#00c951', fontWeight: 600, background: 'rgba(0,201,81,0.1)', padding: '2px 7px', borderRadius: 4 }}>+€847</span>
                  </div>
                  {(() => {
                    const pts = [[0,58],[44,52],[88,44],[132,47],[176,32],[220,22],[264,26],[308,13],[352,7],[396,4],[440,1]];
                    const line = mkSmoothPath(pts);
                    const area = line + ' L440,60 L0,60 Z';
                    return (
                      <svg viewBox="0 0 440 60" preserveAspectRatio="none" style={{ width:'100%', height:44 }}>
                        <defs>
                          <linearGradient id="hg3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#5469d4" stopOpacity="0.18"/>
                            <stop offset="95%" stopColor="#5469d4" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d={area} fill="url(#hg3)"/>
                        <path d={line} fill="none" stroke="#5469d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    );
                  })()}
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
                    {['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov'].map(m => (
                      <span key={m} style={{ fontSize:6.5, color:'#2d4560' }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Recent bets — matches real dashboard columns: Datum, Wedstrijd, Odds, Inzet, Uitkomst, P&L */}
                <div style={{ background: cBg, border: `1px solid ${cBrd}`, borderRadius: 9, overflow: 'hidden' }}>
                  <div style={{ padding:'5px 11px', borderBottom:`1px solid ${cBrd}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:8.5, fontWeight:600, color:'#6e7681', textTransform:'uppercase', letterSpacing:'0.05em' }}>Recente bets</span>
                    <span style={{ fontSize:8, color:'#5469d4', fontWeight:600 }}>Alles zien →</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'0.7fr 1.4fr 0.5fr 0.5fr 0.8fr 0.55fr', padding:'4px 11px', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                    {['Datum','Wedstrijd','Odds','Inzet','Uitkomst','P&L'].map(h => (
                      <span key={h} style={{ fontSize:7, color:'#3d5570', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</span>
                    ))}
                  </div>
                  {[
                    { date:'28 apr', match:'Ajax vs PSV',          odds:'2.10', stake:'€25', uitkomst:'gewonnen', pnl:'+€27,50', win:true  },
                    { date:'27 apr', match:'Liverpool vs Chelsea',  odds:'1.85', stake:'€25', uitkomst:'verloren', pnl:'-€25',    win:false },
                    { date:'26 apr', match:'Sinner vs Alcaraz',     odds:'3.20', stake:'€15', uitkomst:'gewonnen', pnl:'+€33',    win:true  },
                    { date:'25 apr', match:'Real Madrid vs Bayern', odds:'1.65', stake:'€30', uitkomst:'lopend',   pnl:'—',       win:null  },
                  ].map((r, i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'0.7fr 1.4fr 0.5fr 0.5fr 0.8fr 0.55fr', padding:'5px 11px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems:'center' }}>
                      <span style={{ fontSize:8, color:'#4a6885' }}>{r.date}</span>
                      <span style={{ fontSize:8.5, color:'#c9d1d9', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.match}</span>
                      <span style={{ fontSize:8.5, color:'#6e7681' }}>{r.odds}</span>
                      <span style={{ fontSize:8.5, color:'#6e7681' }}>{r.stake}</span>
                      <span style={{ fontSize:7.5, fontWeight:600, color: r.win === true ? '#00c951' : r.win === false ? '#fb2b37' : '#7b9ef0', background: r.win === true ? 'rgba(0,201,81,0.1)' : r.win === false ? 'rgba(251,43,55,0.1)' : 'rgba(123,158,240,0.1)', padding:'1px 5px', borderRadius:3, display:'inline-block' }}>{r.uitkomst}</span>
                      <span style={{ fontSize:8.5, fontWeight:700, color: r.win === true ? '#00c951' : r.win === false ? '#fb2b37' : '#6e7681' }}>{r.pnl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── App Showcase (bento grid) ── */
function AppShowcase() {
  const { dark } = useLp();
  const bg1 = dark ? '#04111f' : '#ffffff';
  const cardBg = dark ? 'linear-gradient(160deg, #0d1a2e 0%, #0a1628 100%)' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const mockupBg = dark ? 'rgba(0,0,0,0.3)' : '#0e1420';
  const mockupBorderTop = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(15,23,42,0.15)';

  return (
    <section id="functies" className="lp-section-pad" style={{ backgroundColor: bg1, padding: '96px 32px', transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>De tool</span>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Alles in één platform
          </h2>
          <p style={{ fontSize: 17, color: text2, marginTop: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.6 }}>
            Van bet invoeren tot diepgaande analyse — TrackMijnBets heeft elk onderdeel van je betting workflow gedekt.
          </p>
        </div>

        {/* Row 1 */}
        <div className="lp-bento-row" style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Realtime P&L Dashboard</h3>
              <p style={{ fontSize: 13.5, color: text2, lineHeight: 1.6, marginBottom: 20, maxWidth: 380 }}>
                Volg je cumulatieve winst live. Zie je ROI, win rate en yield per geselecteerde periode in één overzicht.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', padding: '14px 16px' }}>
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
                {(() => {
                  const pts = [[0,52],[38,47],[76,41],[114,45],[152,33],[190,26],[228,30],[266,18],[304,10],[342,5],[380,2]];
                  const line = mkSmoothPath(pts);
                  const area = line + ' L380,56 L0,56 Z';
                  return (
                    <svg viewBox="0 0 380 56" preserveAspectRatio="none" style={{ width: '100%', height: 42 }}>
                      <defs>
                        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5469d4" stopOpacity="0.18" />
                          <stop offset="95%" stopColor="#5469d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={area} fill="url(#dashGrad)" stroke="none" />
                      <path d={line} fill="none" stroke="#5469d4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bet Invoeren</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Snel bets loggen</h3>
              <p style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 20 }}>
                Vul sport, markt, odds en inzet in. Zie direct je potentiële winst.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', padding: '14px 16px' }}>
              {[
                { label: 'Sport', value: 'Voetbal' },
                { label: 'Wedstrijd', value: 'Ajax vs PSV' },
                { label: 'Markt', value: '1X2' },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 8, color: '#6e7681', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</p>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '7px 10px' }}>
                    <span style={{ fontSize: 10.5, color: '#c9d1d9', fontWeight: 500 }}>{f.value}</span>
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

        {/* Row 2 */}
        <div className="lp-bento-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bets Overzicht</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Filter & doorzoek alles</h3>
              <p style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 18 }}>
                Filter op sport, bookmaker, markt of periode.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', padding: '12px 14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 10, color: '#4a6885' }}>Zoek in bets...</span>
              </div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                {['Voetbal', 'Unibet', 'Gewonnen'].map((f, i) => (
                  <span key={f} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, backgroundColor: i === 0 ? 'rgba(84,105,212,0.3)' : 'rgba(255,255,255,0.06)', border: `1px solid ${i === 0 ? 'rgba(84,105,212,0.5)' : 'rgba(255,255,255,0.08)'}`, color: i === 0 ? '#a5b8f5' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
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

          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Statistieken</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Diepgaande analyse</h3>
              <p style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 18 }}>
                ROI per sport, markt en bookmaker. Ontdek waar je geld verdient.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', padding: '14px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

        {/* Row 3 */}
        <div className="lp-bento-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maandoverzicht</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Elke dag in één oogopslag</h3>
              <p style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 18 }}>
                Groen = winst, rood = verlies. Klik op een dag voor je betdetails.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', overflow: 'hidden' }}>
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

          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0' }}>
              <div className="flex items-center gap-2.5" style={{ marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(84,105,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4"/><path d="M9 21H5a2 2 0 01-2-2v-4"/><path d="M15 3h4a2 2 0 012 2v4"/><path d="M15 21h4a2 2 0 002-2v-4"/><rect x="7" y="8" width="10" height="8" rx="1"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7b9ef0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calculators</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Professionele tools</h3>
              <p style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 18 }}>
                Arbitrage, Kelly, EV, Vig en Odds Converter — altijd bij de hand.
              </p>
            </div>
            <div style={{ margin: '0 16px 0', background: mockupBg, borderRadius: '12px 12px 0 0', border: mockupBorderTop, borderBottom: 'none', padding: '14px 16px' }}>
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
  const { dark } = useLp();
  const bg       = dark ? '#060e1a' : '#ffffff';
  const sectionBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1    = dark ? '#fff' : '#0f172a';
  const text2    = dark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const cardBg   = dark
    ? 'linear-gradient(135deg, rgba(107,130,240,0.07) 0%, rgba(84,105,212,0.04) 100%)'
    : 'linear-gradient(135deg, #eef2ff 0%, #e8eeff 55%, #f3f0ff 100%)';
  const cardBorder = dark ? 'rgba(107,130,240,0.14)' : 'rgba(99,102,241,0.18)';
  const pillBg   = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const pillBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const stepLine = dark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.22)';

  const steps = [
    { num: '1', title: 'Voer je bet in',      desc: 'Vul sport, wedstrijd, markt, selectie, odds en inzet in. Zie direct je potentiële winst voordat je de bet opslaat.' },
    { num: '2', title: 'Bijhouden & updaten', desc: 'Zodra de uitkomst bekend is, update je de bet met één klik. TrackMijnBets berekent automatisch je winst of verlies.' },
    { num: '3', title: 'Analyseer je data',   desc: 'Bekijk per sport, markt en bookmaker waar je goed en slecht presteert. Verbeter je strategie op basis van echte data.' },
  ];

  return (
    <section id="hoe-het-werkt" className="lp-section-pad" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${sectionBorder}`, transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: '64px 56px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 99, padding: '5px 18px', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: text1 }}>Hoe het werkt</span>
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: text1, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              In drie stappen naar inzicht
            </h2>
          </div>

          {/* Steps */}
          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', padding: '0 40px' }}>
                {i < 2 && (
                  <div className="lp-step-line" style={{ position: 'absolute', top: 22, left: 'calc(50% + 32px)', right: 'calc(-50% + 32px)', height: 1, backgroundColor: stepLine, zIndex: 0 }} />
                )}
                {/* Badge — same style as Dashboard button in header */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
                  color: '#fff', fontWeight: 800, fontSize: 17,
                  width: 44, height: 44, borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(84,105,212,0.45)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  margin: '0 auto 24px', position: 'relative', zIndex: 1,
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: text1, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: text2, lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Calendar preview ── */
function AnalysePreview() {
  const { dark } = useLp();
  const bg = dark ? '#04111f' : '#f8fafc';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const bulletText = dark ? 'rgba(255,255,255,0.7)' : '#334155';

  const days = [
    { d: null }, { d: null },
    { d: 1, pnl: null }, { d: 2, pnl: 45.5 }, { d: 3, pnl: -22 }, { d: 4, pnl: 78 }, { d: 5, pnl: -15 },
    { d: 6, pnl: 0 }, { d: 7, pnl: 33 }, { d: 8, pnl: 12 }, { d: 9, pnl: -40 }, { d: 10, pnl: 55 }, { d: 11, pnl: null }, { d: 12, pnl: 28 },
    { d: 13, pnl: -8 }, { d: 14, pnl: 90 }, { d: 15, pnl: 15 }, { d: 16, pnl: -30 }, { d: 17, pnl: 44 }, { d: 18, pnl: null }, { d: 19, pnl: -18 },
    { d: 20, pnl: 62 }, { d: 21, pnl: null }, { d: 22, pnl: 35 }, { d: 23, pnl: -25 }, { d: 24, pnl: 80 }, { d: 25, pnl: null }, { d: 26, pnl: 20 },
    { d: 27, pnl: -12 }, { d: 28, pnl: 48 }, { d: 29, pnl: 18 }, { d: 30, pnl: null }, { d: null }, { d: null },
  ];

  return (
    <section id="analyse" className="lp-section-pad" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      <div className="lp-analyse-grid" style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maandoverzicht</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
            Elke dag in één oogopslag
          </h2>
          <p style={{ fontSize: 16, color: text2, lineHeight: 1.7, marginBottom: 24 }}>
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
                <span style={{ fontSize: 15, color: bulletText }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar mock — always dark (shows app UI) */}
        <div style={{ backgroundColor: '#0d1a2e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between" style={{ padding: '14px 18px', backgroundColor: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>April 2026</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#34D399' }}>+€363</span>
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
              const bg2 = cell.pnl === null ? 'transparent' : cell.pnl > 0 ? `rgba(52,211,153,${0.06 + Math.abs(cell.pnl)/90*0.16})` : cell.pnl < 0 ? `rgba(251,113,133,${0.06 + Math.abs(cell.pnl)/90*0.14})` : 'transparent';
              return (
                <div key={i} style={{ minHeight: 52, padding: '6px 7px', backgroundColor: bg2, borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: hasPnl ? 'pointer' : 'default' }}>
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
const LP_PLANS = [
  {
    id: 'gratis', naam: 'Gratis', sub: 'Voor casual bettors', maand: 0, jaar: 0,
    cta: 'Huidig plan', ctaDisabled: true, populair: false,
    features: [
      { label: 'Dashboard overzicht', ok: true },
      { label: 'Tot 30 bets per maand', ok: true },
      { label: 'Basis statistieken (P&L, win rate)', ok: true },
      { label: '1 bookmaker koppelen', ok: true },
      { label: 'Handmatig bets invoeren', ok: true },
      { label: 'Donkere & lichte modus', ok: true },
      { label: 'AI betslip herkenning', ok: false },
      { label: 'Chrome Extension', ok: false },
      { label: 'Onbeperkte bets', ok: false },
      { label: 'Alle calculators', ok: false },
      { label: 'Maandoverzicht & kalender', ok: false },
      { label: 'CSV / JSON export', ok: false },
    ],
  },
  {
    id: 'pro', naam: 'Pro', sub: 'Voor serieuze bettors', maand: 6.99, jaar: 5.59,
    cta: 'Start 7 dagen gratis', ctaDisabled: false, populair: true,
    features: [
      { label: 'Alles van Gratis', ok: true },
      { label: 'Onbeperkte bets', ok: true },
      { label: 'Onbeperkte bookmakers', ok: true },
      { label: 'Volledig statistieken dashboard', ok: true },
      { label: 'AI betslip herkenning', ok: true },
      { label: 'Chrome Extension', ok: true },
      { label: 'Maandoverzicht & kalender', ok: true },
      { label: 'Alle calculators (6 tools)', ok: true },
      { label: 'Asian Lines overzicht', ok: true },
      { label: 'Odds Vergelijker', ok: true },
      { label: 'CSV & JSON export', ok: true },
      { label: 'E-mail support', ok: true },
    ],
  },
  {
    id: 'elite', naam: 'Elite', sub: 'Voor professionele bettors', maand: 12.99, jaar: 10.39,
    cta: 'Start 7 dagen gratis', ctaDisabled: false, populair: false,
    features: [
      { label: 'Alles van Pro', ok: true },
      { label: 'Priority support (< 4 uur)', ok: true },
      { label: 'Vroege toegang tot nieuwe functies', ok: true },
      { label: 'Geavanceerde analytische rapporten', ok: true },
      { label: 'Meerdere gebruikersprofielen', ok: true },
      { label: 'API-toegang (bèta)', ok: true },
      { label: 'Persoonlijk onboarding gesprek', ok: true },
      { label: 'Dedicated accountmanager', ok: true },
    ],
  },
];

function LpCheck({ ok, dark }) {
  if (ok) return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,201,81,0.12)', border: '1px solid rgba(0,201,81,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00c951" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  );
  return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </span>
  );
}

const LP_TRUST = [
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, label: 'Altijd opzegbaar' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: '7 dagen gratis proberen' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Veilige betaling' },
];

function Prijzen() {
  const { dark } = useLp();
  const [jaarlijks, setJaarlijks] = useState(false);
  const bg     = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1  = dark ? '#fff' : '#0f172a';
  const text2  = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  return (
    <section id="prijzen" className="lp-section-pad" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prijzen</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.02em' }}>Eenvoudige, transparante prijzen</h2>
          <p style={{ fontSize: 17, color: text2, marginTop: 14 }}>Begin gratis. Upgrade wanneer jij er klaar voor bent.</p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 10, padding: 4, gap: 2 }}>
            {['Maandelijks', 'Jaarlijks'].map((label, i) => {
              const active = jaarlijks === (i === 1);
              return (
                <button key={label} onClick={() => setJaarlijks(i === 1)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 600 : 400, background: active ? (dark ? '#1e2d4a' : '#ffffff') : 'transparent', color: active ? text1 : text2, boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  {i === 1 && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(0,201,81,0.15)', color: '#00a843', border: '1px solid rgba(0,201,81,0.3)', borderRadius: 4, padding: '1px 5px' }}>-20%</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plans — outer wrapper adds paddingTop:13 on all cards so badge space is consistent */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28, alignItems: 'start' }}>
          {LP_PLANS.map((plan) => {
            const prijs = jaarlijks ? plan.jaar : plan.maand;
            const isPopulair = plan.populair;
            return (
              <div key={plan.id} style={{ paddingTop: 13 }}>
              <div style={{ borderRadius: 14, padding: '24px 22px', border: isPopulair ? '2px solid #6366f1' : `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: isPopulair ? (dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)') : (dark ? '#0d1a2e' : '#ffffff'), position: 'relative', boxShadow: isPopulair ? (dark ? '0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(99,102,241,0.15)') : 'none', display: 'flex', flexDirection: 'column' }}>

                {/* Popular badge */}
                {isPopulair && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>✦ Meest gekozen</span>
                  </div>
                )}

                {/* Plan name — fixed height so button aligns */}
                <div style={{ minHeight: 52, marginBottom: 16 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 3 }}>{plan.naam}</p>
                  <p style={{ fontSize: 13, color: text2 }}>{plan.sub}</p>
                </div>

                {/* Price — fixed height so button aligns */}
                <div style={{ minHeight: 88, marginBottom: 20 }}>
                  {prijs === 0 ? (
                    <p style={{ fontSize: 32, fontWeight: 800, color: text1, lineHeight: 1 }}>Gratis</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: text1, lineHeight: 1 }}>€{prijs.toFixed(2).replace('.', ',')}</span>
                        <span style={{ fontSize: 13, color: text2, fontWeight: 500 }}>/maand</span>
                      </div>
                      {jaarlijks && (
                        <p style={{ fontSize: 12, color: text2, marginTop: 4 }}>
                          €{(prijs * 12).toFixed(2).replace('.', ',')} per jaar — bespaar €{((plan.maand - plan.jaar) * 12).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA button */}
                <button disabled={plan.ctaDisabled} style={{ width: '100%', padding: '11px 0', borderRadius: 9, border: isPopulair ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, fontSize: 14, fontWeight: 600, cursor: plan.ctaDisabled ? 'default' : 'pointer', background: plan.ctaDisabled ? (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : isPopulair ? 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: plan.ctaDisabled ? text2 : isPopulair ? '#fff' : text1, boxShadow: isPopulair && !plan.ctaDisabled ? '0 3px 12px rgba(84,105,212,0.4)' : 'none', transition: 'opacity 0.15s', marginBottom: 24 }}
                  onMouseEnter={e => { if (!plan.ctaDisabled) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  {plan.cta}
                </button>

                {/* Features */}
                <div>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Inclusief:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LpCheck ok={f.ok} dark={dark} />
                        <span style={{ fontSize: 13, color: f.ok ? (dark ? 'rgba(255,255,255,0.75)' : '#334155') : text2 }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          {LP_TRUST.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: text2 }}>
              <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  return (
    <section className="lp-final-cta-section" style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0d1f38 100%)', padding: '100px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h2 className="lp-final-cta-title" style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18 }}>
          Klaar om slimmer te wedden?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.6 }}>
          Doe mee met 2.400+ bettors die TrackMijnBets gebruiken om hun resultaten te verbeteren. Begin vandaag, gratis.
        </p>
        <Link href="/signup" className="lp-final-cta-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15.5, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, boxShadow: '0 4px 32px rgba(84,105,212,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
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
  const { dark } = useLp();
  return (
    <footer className="lp-footer-section" style={{ backgroundColor: dark ? '#04111f' : '#0f172a', padding: '40px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="lp-footer-inner" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setDark(saved !== 'light');
  }, []);

  return (
    <LpTheme.Provider value={{ dark, setDark }}>
      <div style={{ backgroundColor: dark ? '#04111f' : '#ffffff', transition: 'background-color 0.3s ease' }}>
        <Header />
        <Hero />
        <AppShowcase />
        <HoeHetWerkt />
        <AnalysePreview />
        <Prijzen />
        <FinalCTA />
        <Footer />
      </div>
    </LpTheme.Provider>
  );
}
