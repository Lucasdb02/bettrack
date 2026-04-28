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
  return (
    <section className="lp-hero-section" style={{
      background: dark
        ? 'linear-gradient(160deg, #04111f 0%, #0a2540 45%, #0d1f38 100%)'
        : '#ffffff',
      paddingTop: 120, paddingBottom: 80,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ position: 'absolute', top: -80, left: '35%', transform: 'translateX(-50%)', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(84,105,212,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="lp-hero-inner" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'center', position: 'relative' }}>

        {/* Left — text */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: dark ? 'rgba(84,105,212,0.15)' : 'rgba(84,105,212,0.1)', border: '1px solid rgba(84,105,212,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5469d4' }} />
            <span style={{ fontSize: 13, color: dark ? '#a5b8f5' : '#5469d4', fontWeight: 500 }}>Gebouwd voor Nederlandse sportwedders</span>
          </div>

          <h1 className="lp-hero-title" style={{ fontSize: 54, fontWeight: 800, color: dark ? '#fff' : '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 22 }}>
            Stop met gokken,{' '}
            <span style={{ background: 'linear-gradient(135deg, #7b9ef0, #5469d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              begin met analyseren
            </span>
          </h1>

          <p className="lp-hero-sub" style={{ fontSize: 18, color: dark ? 'rgba(255,255,255,0.58)' : '#475569', lineHeight: 1.65, marginBottom: 40, maxWidth: 460 }}>
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

        {/* Right — app mockup (always dark — shows the actual app UI) */}
        <div className="lp-mockup-wrap" style={{ position: 'relative' }}>
          <div style={{ backgroundColor: '#0d1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            {/* Window bar */}
            <div style={{ backgroundColor: '#1a2e45', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
              <div style={{ flex: 1, marginLeft: 8, height: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>trackmijnbets.nl/dashboard</span>
              </div>
            </div>

            {/* App content */}
            <div style={{ display: 'flex', minHeight: 400 }}>
              {/* Sidebar */}
              <div className="lp-mockup-sidebar" style={{ width: 168, backgroundColor: '#0a1e32', padding: '14px 8px', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, paddingLeft: 8 }}>
                  <div style={{ width: 20, height: 20, background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', borderRadius: 5, border: '1px solid rgba(123,158,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>TrackMijnBets</span>
                </div>
                <p style={{ color: '#2d5070', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', paddingLeft: 8, marginBottom: 4 }}>Menu</p>
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Bets Overzicht', active: false },
                  { label: 'Bet Invoeren', active: false },
                  { label: 'Maandoverzicht', active: false },
                  { label: 'Statistieken', active: false },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '4px 8px', borderRadius: 5, marginBottom: 1, backgroundColor: item.active ? 'rgba(30,73,118,0.8)' : 'transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: item.active ? '#5469d4' : 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                    <span style={{ color: item.active ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 9.5 }}>{item.label}</span>
                  </div>
                ))}
                <p style={{ color: '#2d5070', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', paddingLeft: 8, marginBottom: 4, marginTop: 10 }}>Tools</p>
                {['Arbitrage', 'Kelly', 'Asian Lines', 'Odds Converter'].map((item, i) => (
                  <div key={i} style={{ padding: '3px 8px', borderRadius: 5, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Dashboard content */}
              <div style={{ flex: 1, padding: '14px 16px', backgroundColor: '#0d1117' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>Dashboard</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['Week', 'Maand', 'Jaar'].map((p, i) => (
                      <span key={p} style={{ fontSize: 8.5, padding: '2px 7px', borderRadius: 4, backgroundColor: i === 1 ? '#5469d4' : 'rgba(255,255,255,0.06)', color: i === 1 ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 10 }}>
                  {[
                    { label: 'Totale P&L', value: '+€847', color: '#34D399', sub: '+12.3%' },
                    { label: 'Win Rate', value: '61.3%', color: '#e6edf3', sub: '147 bets' },
                    { label: 'ROI', value: '+8.7%', color: '#34D399', sub: 'rendement' },
                    { label: 'Actief', value: '3', color: '#7b9ef0', sub: 'open bets' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 9px' }}>
                      <p style={{ fontSize: 7, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{c.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: c.color, letterSpacing: '-0.02em', marginBottom: 1 }}>{c.value}</p>
                      <p style={{ fontSize: 7, color: '#4a6885' }}>{c.sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <p style={{ fontSize: 8.5, fontWeight: 600, color: '#8b949e' }}>Cumulatieve P&L</p>
                    <span style={{ fontSize: 8, color: '#34D399', fontWeight: 600 }}>+€847 dit jaar</span>
                  </div>
                  {(() => {
                    const pts = [[0,55],[44,50],[88,44],[132,48],[176,34],[220,26],[264,30],[308,18],[352,10],[396,5],[440,2]];
                    const line = mkSmoothPath(pts);
                    const area = line + ' L440,58 L0,58 Z';
                    return (
                      <svg viewBox="0 0 440 58" preserveAspectRatio="none" style={{ width: '100%', height: 42 }}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5469d4" stopOpacity="0.18" />
                            <stop offset="95%" stopColor="#5469d4" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={area} fill="url(#heroGrad)" stroke="none" />
                        <path d={line} fill="none" stroke="#5469d4" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                    );
                  })()}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, overflow: 'hidden' }}>
                  <div style={{ padding: '5px 9px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 7.5, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recente bets</span>
                    <span style={{ fontSize: 7, color: '#5469d4', fontWeight: 600 }}>Alles zien →</span>
                  </div>
                  {[
                    { match: 'Ajax vs PSV', market: '1X2 · Unibet', odds: '2.10', result: '+€55', win: true },
                    { match: 'Liverpool vs Chelsea', market: 'BTTS · Bet365', odds: '1.85', result: '-€25', win: false },
                    { match: 'Sinner vs Alcaraz', market: 'Winnaar · TOTO', odds: '3.20', result: '+€38', win: true },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 8.5, color: '#c9d1d9', fontWeight: 500, display: 'block' }}>{r.match}</span>
                        <span style={{ fontSize: 7.5, color: '#6e7681' }}>{r.market}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 8, color: '#4a6885' }}>{r.odds}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: r.win ? '#34D399' : '#FB7185' }}>{r.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 40, background: 'radial-gradient(ellipse, rgba(84,105,212,0.3) 0%, transparent 70%)', filter: 'blur(16px)', pointerEvents: 'none' }} />
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
function Prijzen() {
  const { dark } = useLp();
  const bg = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const cardFree = dark ? '#0d1a2e' : '#f8fafc';
  const cardFreeBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const cardFreePriceText = dark ? '#fff' : '#0f172a';
  const cardFreeSubText = dark ? '#4a6885' : '#94a3b8';
  const cardFreeCtaBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const cardFreeCtaBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const cardFreeCtaColor = dark ? 'rgba(255,255,255,0.8)' : '#334155';
  const featureText = dark ? 'rgba(255,255,255,0.6)' : '#475569';

  return (
    <section id="prijzen" className="lp-section-pad" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prijzen</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.02em' }}>Eenvoudige, transparante prijzen</h2>
          <p style={{ fontSize: 17, color: text2, marginTop: 14 }}>Begin gratis. Upgrade wanneer jij er klaar voor bent.</p>
        </div>

        <div className="lp-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Free */}
          <div style={{ backgroundColor: cardFree, border: `1px solid ${cardFreeBorder}`, borderRadius: 16, padding: '36px 36px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: text2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gratis</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: cardFreePriceText, lineHeight: 1 }}>€0</span>
              <span style={{ fontSize: 15, color: cardFreeSubText, marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '11px', border: `1px solid ${cardFreeCtaBorder}`, borderRadius: 8, fontSize: 14, fontWeight: 600, color: cardFreeCtaColor, textDecoration: 'none', marginBottom: 28, backgroundColor: cardFreeCtaBg }}>
              Gratis beginnen
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Tot 100 bets per maand', 'Dashboard & statistieken', 'Maandoverzicht kalender', 'Alle sporten & markten'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: featureText }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{ backgroundColor: dark ? '#0a2540' : 'rgba(99,102,241,0.04)', border: dark ? '1px solid #1e4976' : '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '36px 36px', position: 'relative', overflow: 'hidden', boxShadow: dark ? '0 0 40px rgba(84,105,212,0.15)' : '0 0 32px rgba(84,105,212,0.1)' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(84,105,212,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#5469d4', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.04em' }}>
              POPULAIRSTE
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#7b9ef0', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: dark ? '#fff' : '#0f172a', lineHeight: 1 }}>€9</span>
              <span style={{ fontSize: 15, color: dark ? '#4a6885' : '#94a3b8', marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '11px', background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', marginBottom: 28, boxShadow: '0 4px 20px rgba(84,105,212,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Pro starten
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Onbeperkte bets', 'Alles uit Gratis', 'CSV export', 'Geavanceerde filters', 'Prioriteitsondersteuning', 'Vroeg toegang tot nieuwe functies'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: dark ? '#c5d8ec' : '#334155' }}>
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
