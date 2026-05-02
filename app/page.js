'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from 'recharts';
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

/* ── Lighten a hex color towards white ── */
function lightenColor(hex, factor = 0.22) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const lc = c => Math.min(255, Math.round(c + (255 - c) * factor));
  return `#${lc(r).toString(16).padStart(2,'0')}${lc(g).toString(16).padStart(2,'0')}${lc(b).toString(16).padStart(2,'0')}`;
}

/* ── Sticky header ── */
function Header() {
  const { dark, setDark } = useLp();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = '/dashboard';
        return;
      }
      setUser(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        window.location.href = '/dashboard';
        return;
      }
      setUser(null);
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
    setMenuOpen(false);
  }

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
  const menuBg         = dark ? 'rgba(6,10,22,0.97)' : 'rgba(255,255,255,0.97)';
  const menuBorder     = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)';
  const menuDivider    = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const menuTop        = scrolled ? 80 : 72;

  const NAV_ITEMS = [
    { label: 'Functies',       id: 'functies' },
    { label: 'Hoe het werkt',  id: 'hoe-het-werkt' },
    { label: 'Analyse',        id: 'analyse' },
    { label: 'Prijzen',        id: 'prijzen' },
  ];

  const SunIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
  const MoonIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
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

          {/* Nav — desktop only */}
          <nav className="lp-nav-links" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: textNav, fontSize: 13.5, fontWeight: 500, padding: '6px 12px', borderRadius: 7, transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = navHoverColor; e.currentTarget.style.background = navHoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = textNav; e.currentTarget.style.background = 'none'; }}
              >{item.label}</button>
            ))}
          </nav>

          {/* Right actions — desktop only */}
          <div className="lp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={toggleTheme} title={dark ? 'Lichte modus' : 'Donkere modus'}
              style={{ width: 34, height: 34, borderRadius: 8, border: iconBorder, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: iconColor, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconBgHover; e.currentTarget.style.color = iconColorHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = iconBg; e.currentTarget.style.color = iconColor; }}
            >{dark ? <SunIcon/> : <MoonIcon/>}</button>

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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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

          {/* Hamburger — mobile only */}
          <button
            className="lp-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', width: 36, height: 36, borderRadius: 9, border: menuOpen ? (dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)') : iconBorder, background: menuOpen ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : iconBg, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: iconColor, transition: 'all 0.2s', marginLeft: 'auto', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.2s, opacity 0.2s', position: 'absolute', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(90deg) scale(0.7)' : 'none' }}>
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.2s, opacity 0.2s', position: 'absolute', opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'none' : 'rotate(-90deg) scale(0.7)' }}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      <div style={{
        position: 'fixed', top: menuTop, left: 12, right: 12, zIndex: 49,
        background: menuBg,
        backdropFilter: 'blur(32px) saturate(2)',
        WebkitBackdropFilter: 'blur(32px) saturate(2)',
        border: menuBorder,
        borderRadius: 16,
        padding: '6px 8px 10px',
        boxShadow: dark ? '0 12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 8px 32px rgba(0,0,0,0.12)',
        opacity: menuOpen ? 1 : 0,
        transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        transformOrigin: 'top center',
      }}>
        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <button key={item.id}
            onClick={() => { scrollTo(item.id); setMenuOpen(false); }}
            style={{ display: 'flex', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: textPrimary, fontSize: 15, fontWeight: 500, padding: '11px 12px', borderRadius: 10, transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = navHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >{item.label}</button>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: menuDivider, margin: '4px 12px 6px' }}/>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Theme toggle */}
          <button onClick={() => { toggleTheme(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textNav, fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 10, transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = navHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            {dark ? <SunIcon/> : <MoonIcon/>}
            {dark ? 'Lichte modus' : 'Donkere modus'}
          </button>

          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 12px', textDecoration: 'none', marginTop: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Dashboard
              </Link>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'rgba(251,43,55,0.07)', border: '1px solid rgba(251,43,55,0.18)', borderRadius: 10, cursor: 'pointer', color: 'rgba(251,80,90,0.9)', fontSize: 14, fontWeight: 500, padding: '10px 12px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: menuBorder, borderRadius: 10, cursor: 'pointer', color: textPrimary, fontSize: 14, fontWeight: 500, padding: '10px 12px', textDecoration: 'none' }}
              >Inloggen</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 12px', textDecoration: 'none', marginTop: 2 }}
              >Aanmelden</Link>
            </>
          )}
        </div>
      </div>

      {/* Backdrop — closes menu on outside tap */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 48 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
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
      transition: 'background 0.3s ease',
    }}>

      {/* Dotted grid — fades outward from where the dashboard lives */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle, ${dark ? 'rgba(107,130,240,0.38)' : 'rgba(84,105,212,0.34)'} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
        maskImage:        'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
      }} />

      {/* Subtle glow behind mockup */}
      <div style={{ position: 'absolute', top: '10%', left: '42%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(84,105,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Full-width flex — left text | right mockup */}
      <div className="lp-hero-row" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

        {/* Left text — aligned to 1400px grid */}
        <div className="lp-hero-text" style={{ flexShrink: 0, width: '50%', minWidth: 320, padding: '128px 48px 80px max(32px, calc((100vw - 1400px) / 2 + 32px))' }}>
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

          {/* Bookmaker logo scroll */}
          {(() => {
            // brightness(0) collapses all colours to black; opacity softens to gray.
            // Works for any logo colour (green, white, coloured).
            const imgFilter = dark
              ? 'brightness(0) invert(1) opacity(0.4)'
              : 'brightness(0) opacity(0.32)';
            const BOOKIES = [
              { name: 'Unibet',   src: '/logos/unibet.svg' },
              { name: 'bet365',   src: '/logos/bet365.svg' },
              { name: 'TOTO',     src: '/logos/toto.svg' },
              { name: 'BetCity',  src: '/logos/betcity.svg' },
              { name: 'Betway',   src: '/logos/betway.svg' },
              { name: "Jack's",   src: '/logos/jacks.png' },
              { name: 'Bingoal',  src: '/logos/bingoal.jpg' },
              { name: 'Circus',   src: '/logos/circus.png' },
              { name: 'LeoVegas', src: '/logos/leovegas.jpg' },
              { name: '888sport', src: '/logos/888sport.png' },
            ];
            return (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.25)' : '#c0cad6', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Ondersteunde bookmakers
                </p>
                <div style={{
                  overflow: 'hidden',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 48, width: 'max-content', animation: 'bookie-scroll 26s linear infinite' }}>
                    {[...BOOKIES, ...BOOKIES].map((b, i) => (
                      <div key={i} style={{ height: 22, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <img
                          src={b.src} alt={b.name}
                          style={{ height: 22, width: 'auto', objectFit: 'contain', filter: imgFilter, display: 'block' }}
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

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

        {/* Right — screenshot in browser chrome, top/bottom aligned to left column content */}
        <div className="lp-mockup-wrap" style={{ flex: 1, paddingTop: 128, paddingBottom: 80, paddingLeft: 40, minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
          {/* Browser chrome — light theme, fills exact height */}
          <div style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #d1d9e0',
            boxShadow: '0 8px 24px -6px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            width: '115%',
            marginLeft: '8%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Title bar: stoplight + URL bar */}
            <div style={{ background: '#f0f2f5', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid #d1d9e0', flexShrink: 0 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, flexShrink: 0, border: '0.5px solid rgba(0,0,0,0.12)' }} />
              ))}
              <div style={{ flex: 1, marginLeft: 10, height: 22, background: '#e2e6ec', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                <span style={{ fontSize: 10.5, color: '#9ca3af', letterSpacing: '0.01em', fontWeight: 500 }}>trackmijnbets.nl/dashboard</span>
              </div>
            </div>

            {/* Dashboard screenshot — fills browser, top-anchored */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <img
                src="https://www.image2url.com/r2/default/images/1777465020019-6a5651e8-1e10-4943-9495-b1d19c821d54.png"
                alt="TrackMijnBets dashboard"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
                draggable={false}
              />
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

  const sectionBg  = dark ? '#060c1a' : '#f1f5f9';
  const text1      = dark ? '#e8edf6'  : '#0f172a';
  const text2      = dark ? 'rgba(200,210,230,0.6)' : '#64748b';
  const cardBg     = dark ? '#0c1829'  : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const imgBg      = dark ? '#111f38'  : '#dde3ed';
  const fadeStop   = dark ? '#0c1829'  : '#ffffff';

  const FEATURES = [
    {
      tag: 'P&L Tracking', tagColor: '#5469d4', tagBg: 'rgba(84,105,212,0.12)',
      title: 'Volg je winst & verlies in realtime',
      desc: 'Zie precies hoe je portfolio groeit met cumulatieve P&L grafieken, dagelijkse resultaten en een trendlijn over elke gewenste periode.',
      imgH: 220,
      img: 'https://www.image2url.com/r2/default/images/1777716107941-0019cfe8-496d-4b58-9d12-f0ab8a1ab6cd.png',
    },
    {
      tag: 'AI Analyse', tagColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.12)',
      title: 'Scan een betslip en TrackMijnBets vult de rest in',
      desc: 'Maak een foto van je betslip en onze AI herkent automatisch de wedstrijd, markt, odds en inzet. Invoeren was nog nooit zo snel.',
      imgH: 220,
    },
    {
      tag: 'Statistieken', tagColor: '#20a851', tagBg: 'rgba(32,168,81,0.12)',
      title: 'Diepgaande statistieken per bookmaker en sport',
      desc: 'Win rate, ROI, gemiddelde odds, CLV en meer — uitgesplitst per bookmaker, sport, markt en tijdsperiode.',
      imgH: 180,
    },
    {
      tag: 'Calculators', tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.12)',
      title: '6 professionele betting calculators',
      desc: 'Van dutching tot Kelly Criterion — alle tools die een serieuze bettor nodig heeft, direct beschikbaar in de app.',
      imgH: 180,
    },
    {
      tag: 'Bookmakers', tagColor: '#06b6d4', tagBg: 'rgba(6,182,212,0.12)',
      title: 'Alle bookmakers in één overzicht',
      desc: 'Koppel onbeperkt bookmakers en zie je saldo, ROI en prestaties per platform naast elkaar.',
      imgH: 180,
    },
  ];

  function FeatureCard({ f, large }) {
    return (
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        {/* Image area */}
        <div style={{ position: 'relative', height: f.imgH, background: imgBg, flexShrink: 0, overflow: 'hidden' }}>
          {f.img ? (
            <img
              src={f.img}
              alt={f.title}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',
                objectFit: 'cover', objectPosition: 'top',
              }}
            />
          ) : (
            /* Grid lines for visual texture */
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              {[20,40,60,80].map(p => (
                <line key={`h${p}`} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} strokeWidth="1"/>
              ))}
              {[20,40,60,80].map(p => (
                <line key={`v${p}`} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} strokeWidth="1"/>
              ))}
            </svg>
          )}
          {/* Fade at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: `linear-gradient(to bottom, transparent, ${fadeStop})`,
            pointerEvents: 'none',
          }}/>
        </div>
        {/* Text */}
        <div style={{ padding: large ? '20px 24px 24px' : '16px 20px 20px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 700,
            color: f.tagColor,
            background: f.tagBg,
            border: `1px solid ${f.tagColor}33`,
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 10,
            letterSpacing: '0.03em',
          }}>{f.tag}</span>
          <p style={{ fontSize: large ? 17 : 15, fontWeight: 700, color: text1, marginBottom: 8, lineHeight: 1.35 }}>{f.title}</p>
          <p style={{ fontSize: 13.5, color: text2, lineHeight: 1.6 }}>{f.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="functies" style={{ backgroundColor: sectionBg, padding: '96px 32px', transition: 'background-color 0.3s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Functies</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: text1, marginTop: 10, letterSpacing: '-0.025em', lineHeight: 1.2, maxWidth: 580 }}>
            Alles wat je nodig hebt om beter te betten
          </h2>
          <p style={{ fontSize: 16, color: text2, marginTop: 12, maxWidth: 480, lineHeight: 1.65 }}>
            Van bet invoeren tot diepgaande analyse — TrackMijnBets heeft elk onderdeel van je betting workflow gedekt.
          </p>
        </div>

        {/* Top row: 2 large cards */}
        <div className="lp-bento-top" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <FeatureCard f={FEATURES[0]} large />
          <FeatureCard f={FEATURES[1]} large />
        </div>

        {/* Bottom row: 3 smaller cards */}
        <div className="lp-bento-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <FeatureCard f={FEATURES[2]} />
          <FeatureCard f={FEATURES[3]} />
          <FeatureCard f={FEATURES[4]} />
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
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 99, padding: '5px 18px', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: text1 }}>Hoe het werkt</span>
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: text1, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              In drie stappen naar inzicht
            </h2>
          </div>
          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', padding: '0 40px' }}>
                {i < 2 && (
                  <div className="lp-step-line" style={{ position: 'absolute', top: 22, left: 'calc(50% + 32px)', right: 'calc(-50% + 32px)', height: 1, backgroundColor: stepLine, zIndex: 0 }} />
                )}
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

/* ── Testimonials ── */
const TMB_REVIEWS = {
  col1: [
    { text: 'Eindelijk een tool die echt snapt hoe sportwedden werkt. Mijn win rate is al met 8% gestegen na twee maanden alles bijhouden.', name: 'Lars Kramer', role: 'Recreatief bettor', color: '#3b82f6' },
    { text: 'TrackMijnBets liet me zien dat ik consistent verlies op voetbal onder 2.5, maar winst pak op tennis. Had dit nooit zelf uitgerekend.', name: 'Roos Visser', role: 'Part-time bettor', color: '#8b5cf6' },
    { text: 'De AI-extensie werkt echt magisch. Screenshot maken en alles staat al ingevuld. Scheelt me elke dag veel tijd.', name: 'Daan Mulder', role: 'Casual bettor', color: '#06b6d4' },
    { text: 'Ik gebruik het nu al 3 maanden en kan echt niet meer zonder. De grafieken geven me precies het overzicht dat ik nodig heb.', name: 'Stefan Bakker', role: 'Serieuze bettor', color: '#10b981' },
    { text: 'Beste investering als bettor. Tientje per maand en je weet eindelijk waar je geld naartoe gaat. Onmisbaar.', name: 'Joris Hendriks', role: 'Sportwedder', color: '#f59e0b' },
  ],
  col2: [
    { text: 'Al jaren wedden en nooit precies geweten hoe ik er voor stond. TrackMijnBets geeft me nu eindelijk echt inzicht in mijn resultaten.', name: 'Emma de Vries', role: 'Recreatief bettor', color: '#ec4899' },
    { text: 'De bookmaker-vergelijking is goud waard. Bleek dat ik bij één bookie structureel slechter presteer. Nu weet ik dat tenminste.', name: 'Tim Roos', role: 'Value bettor', color: '#6366f1' },
    { text: 'Geweldig product. Simpel, overzichtelijk en het doet precies wat het belooft. Aanrader voor elke serieuze bettor.', name: 'Kevin Smit', role: 'Hobbyist bettor', color: '#14b8a6' },
    { text: 'Mijn vrienden gebruiken het inmiddels allemaal. We delen onze stats en proberen elkaar bij te houden — gezellig én nuttig.', name: 'Mark Jansen', role: 'Groepsbettor', color: '#f97316' },
    { text: 'Van chaos naar overzicht in één week. Ik wist niet eens dat ik 6 maanden netto verlies maakte. Nu weet ik het en kan ik bijsturen.', name: 'Bas Otten', role: 'Beginnend bettor', color: '#84cc16' },
  ],
  col3: [
    { text: 'De P&L grafiek per dag geeft me precies het gevoel van controle dat ik zocht. Echt een top tool!', name: 'Niels Willems', role: 'Dagelijks bettor', color: '#0ea5e9' },
    { text: 'Had zelf Excel-sheets. Dit is tien keer beter. En de AI die bets herkent is geen gimmick — het werkt écht.', name: 'Thomas Aarts', role: 'Ex-Excel gebruiker', color: '#a855f7' },
    { text: 'Ik raad het aan aan iedereen in mijn Telegram-groep. Zet je ego opzij en kijk gewoon naar de data.', name: 'Wouter Kok', role: 'Community bettor', color: '#22c55e' },
    { text: 'Gewoon een heel solide product. Niks gaat mis, alles laadt snel. Precies wat je nodig hebt als bettor.', name: 'Rick Fontein', role: 'Pro bettor', color: '#ef4444' },
    { text: 'De statistieken per sport hebben me verrast. Dacht dat voetbal mijn sterkste was, maar tennis is mijn cashcow.', name: 'Sanne Peters', role: 'Multi-sport bettor', color: '#d946ef' },
  ],
};

function TmbCard({ r, dark }) {
  const bg  = dark ? '#0d1a2e' : '#ffffff';
  const bdr = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const t1  = dark ? '#fff' : '#0f172a';
  const t2  = dark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const initials = r.name.split(' ').map(w => w[0]).slice(0,2).join('');
  return (
    // Fixed height ensures every card in every column is identical height → columns stay in sync
    <div style={{ backgroundColor: bg, border: `1px solid ${bdr}`, borderRadius: 16, padding: '20px 22px', marginBottom: 14, boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)', height: 190, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <svg width="24" height="18" viewBox="0 0 24 18" fill="#6b82f0" style={{ marginBottom: 10, flexShrink: 0 }}>
        <path d="M0 18V10.8C0 4.932 3.468 1.332 10.404 0L11.52 2.016C8.748 2.772 6.948 4.068 5.88 6.192 5.4 7.164 5.184 8.148 5.244 9H9.6V18H0zm14.4 0V10.8C14.4 4.932 17.868 1.332 24.804 0L25.92 2.016C23.148 2.772 21.348 4.068 20.28 6.192 19.8 7.164 19.584 8.148 19.644 9H24V18H14.4z" transform="scale(0.9)"/>
      </svg>
      <p style={{ fontSize: 15, color: t1, lineHeight: 1.6, fontWeight: 450, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{r.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{initials}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t1 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: t2 }}>{r.role}</div>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const { dark } = useLp();
  const bg    = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  const mkCol = (reviews, doubled) => doubled ? [...reviews, ...reviews] : reviews;

  return (
    <section style={{ backgroundColor: bg, padding: '96px 0', borderTop: `1px solid ${border}`, overflow: 'hidden', transition: 'background-color 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 60, padding: '0 32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5469d4' }}/>
          <span style={{ fontSize: 13, color: text2, fontWeight: 500 }}>Wat bettors zeggen</span>
        </div>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: text1, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Geliefd bij bettors door heel Nederland
        </h2>
      </div>

      {/* 3-column scroll grid — wrapped so the fade overlay stays inside */}
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div className="tmb-track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxHeight: 640, overflow: 'hidden' }}>
          {/* Left — scroll down */}
          <div className="tmb-col-down">
            {mkCol(TMB_REVIEWS.col1, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
          {/* Middle — scroll up */}
          <div className="tmb-col-up" style={{ marginTop: -80 }}>
            {mkCol(TMB_REVIEWS.col2, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
          {/* Right — scroll down (different speed) */}
          <div className="tmb-col-down2">
            {mkCol(TMB_REVIEWS.col3, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
        </div>
        {/* Fade overlay — absolute so it never bleeds outside the track */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(to bottom, ${bg} 0%, transparent 20%, transparent 80%, ${bg} 100%)` }}/>
      </div>
    </section>
  );
}

/* ── Extension flow ── */
function ExtensieFlow() {
  const { dark } = useLp();
  const bg       = dark ? '#04111f' : '#f8fafc';
  const border   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1    = dark ? '#fff' : '#0f172a';
  const text2    = dark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const cardBg   = dark ? '#0d1a2e' : '#ffffff';
  const cardBdr  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const arrowClr = dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1';

  const steps = [
    { num: '1', title: 'Open je betslip', desc: 'Ga naar de bookmaker van je keuze en navigeer naar je openstaande betslip of bet history. Werkt met alle grote Nederlandse bookmakers.' },
    { num: '2', title: 'Klik de extensie', desc: 'Klik op het TrackMijnBets icoontje rechtsbovenin Chrome. De extensie maakt in één klik automatisch een screenshot van je betslip.' },
    { num: '3', title: 'Controleer & sla op', desc: 'Bekijk de herkende bets, pas eventueel de odds of inzet aan en klik op Opslaan. Je bet staat direct in je dashboard — klaar.' },
  ];

  const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
  const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  );
  const CpuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="6" height="6" rx="1"/><path d="M15 2v3M9 2v3M2 9h3M2 15h3M9 22v-3M15 22v-3M22 9h-3M22 15h-3"/><rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  );
  const SaveIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );

  const flow = [
    { label: 'bet365.com',  sub: 'Ga naar je openstaande betslip of bet history bij de bookmaker van jouw keuze.',  dot: '#20a851', iconBg: '#dcfce7', iconClr: '#16a34a', Icon: GlobeIcon  },
    { label: 'Screenshot',  sub: 'Klik op het TrackMijnBets extensie-icoontje in Chrome. De extensie pakt automatisch een screenshot van je scherm.',                                       dot: '#6b82f0', iconBg: '#eef2ff', iconClr: '#5469d4', Icon: CameraIcon },
    { label: 'AI Analyse',  sub: 'Claude analyseert het screenshot en herkent automatisch sport, wedstrijd, odds, inzet en markt — zonder dat jij iets hoeft in te vullen.',              dot: '#f59e0b', iconBg: '#fef3c7', iconClr: '#d97706', Icon: CpuIcon    },
    { label: 'Opgeslagen',  sub: 'Controleer de herkende gegevens, pas eventueel iets aan en sla op. De bet verschijnt direct in je dashboard en statistieken.',                          dot: '#3b82f6', iconBg: '#dbeafe', iconClr: '#2563eb', Icon: SaveIcon   },
  ];

  return (
    <section id="extensie" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      <div className="lp-ext-row" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 80 }}>

        {/* Left — title + steps */}
        <div className="lp-ext-left" style={{ flex: '0 0 auto', width: '46%' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b82f0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>
            Hoe het werkt
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: text1, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
            Drie stappen,<br />minder dan 10 seconden
          </h2>
          <p style={{ fontSize: 16, color: text2, lineHeight: 1.7, marginBottom: 40 }}>
            Met de TrackMijnBets Chrome-extensie registreer je een bet in minder dan 10 seconden. Open je betslip, klik de extensie, en de AI doet de rest.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: 8,
                  background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
                  color: '#fff', fontWeight: 800, fontSize: 17,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(84,105,212,0.4)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 14.5, color: text2, lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — flow cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {flow.map((item, i) => (
            <div key={i}>
              <div style={{
                backgroundColor: cardBg, border: `1px solid ${cardBdr}`,
                borderRadius: 14, padding: '18px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  backgroundColor: dark ? 'rgba(255,255,255,0.07)' : item.iconBg,
                  color: dark ? 'rgba(255,255,255,0.7)' : item.iconClr,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.Icon />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: text1, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: text2, lineHeight: 1.55 }}>{item.sub}</div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0, marginTop: 5 }} />
              </div>
              {i < flow.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <path d="M8 0v16M2 10l6 8 6-8" stroke={arrowClr} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
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
const LP_PRICE_IDS = {
  pro_monthly:   'price_1TRyiRAFCw5K2LNNmDJsHjbu',
  pro_yearly:    'price_1TRyiRAFCw5K2LNNfu7fpdRu',
  elite_monthly: 'price_1TRyiRAFCw5K2LNNJJN8yN72',
  elite_yearly:  'price_1TRyiSAFCw5K2LNNDsbFc4h1',
};

const LP_PLANS = [
  {
    id: 'gratis', naam: 'Gratis', sub: 'Voor casual bettors', maand: 0, jaar: 0,
    cta: 'Gratis starten', ctaDisabled: false, populair: false,
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
  const [loadingPlan, setLoadingPlan] = useState(null);
  const bg     = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1  = dark ? '#fff' : '#0f172a';
  const text2  = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  async function handleCta(plan) {
    if (plan.id === 'gratis') { window.location.href = '/signup'; return; }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/signup'; return; }
    const key = jaarlijks ? `${plan.id}_yearly` : `${plan.id}_monthly`;
    const priceId = LP_PRICE_IDS[key];
    if (!priceId) return;
    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  }

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

        {/* Plans */}
        <div className="lp-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28, alignItems: 'stretch' }}>
          {LP_PLANS.map((plan) => {
            const prijs = jaarlijks ? plan.jaar : plan.maand;
            const isPopulair = plan.populair;
            return (
              <div key={plan.id} style={{ paddingTop: 13, display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderRadius: 14, padding: '24px 22px', border: isPopulair ? '2px solid #6366f1' : `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: isPopulair ? (dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)') : (dark ? '#0d1a2e' : '#ffffff'), position: 'relative', boxShadow: isPopulair ? (dark ? '0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(99,102,241,0.15)') : 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Popular badge */}
                {isPopulair && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>✦ Meest gekozen</span>
                  </div>
                )}

                {/* Plan name */}
                <div style={{ minHeight: 52, marginBottom: 16 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 3 }}>{plan.naam}</p>
                  <p style={{ fontSize: 13, color: text2 }}>{plan.sub}</p>
                </div>

                {/* Price */}
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

                {/* CTA */}
                {(() => {
                  const isLoading = loadingPlan === plan.id;
                  return (
                    <button
                      disabled={isLoading}
                      onClick={() => handleCta(plan)}
                      style={{ width: '100%', padding: '11px 0', borderRadius: 9, border: isPopulair ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, fontSize: 14, fontWeight: 600, cursor: isLoading ? 'default' : 'pointer', background: isPopulair ? 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: isPopulair ? '#fff' : text1, boxShadow: isPopulair && !isLoading ? '0 3px 12px rgba(84,105,212,0.4)' : 'none', transition: 'opacity 0.15s', marginBottom: 24, opacity: isLoading ? 0.6 : 1 }}
                      onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
                    >
                      {isLoading ? 'Laden...' : plan.cta}
                    </button>
                  );
                })()}

                {/* Features */}
                <div style={{ flex: 1 }}>
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

/* ── FAQ ── */
const FAQS = [
  {
    v: 'Wat is TrackMijnBets?',
    a: 'TrackMijnBets is een professionele weddenschap-tracker voor Nederlandse sportwedders. Je houdt al je bets bij op één plek, ziet direct je winst/verlies per bookmaker, per sport en per periode — en krijgt inzicht in je strategie via heldere grafieken.',
  },
  {
    v: 'Is TrackMijnBets gratis te gebruiken?',
    a: 'Ja, er is een gratis Starter-plan waarmee je direct kunt beginnen. Wil je onbeperkte bets bijhouden, AI-analyses en volledige rapportage? Dan is het Pro-plan beschikbaar voor €9,99/maand of €7,99/maand bij jaarabonnement.',
  },
  {
    v: 'Welke bookmakers worden ondersteund?',
    a: 'Je kunt elke bookmaker handmatig toevoegen — Unibet, Bet365, TOTO, BetCity, Betway en alle andere. Je voert zelf in welke bookmaker je per bet hebt gebruikt, zodat je een volledig overzicht per platform hebt.',
  },
  {
    v: 'Kan ik mijn bestaande bets importeren?',
    a: 'Op dit moment voer je bets handmatig in via het dashboard. CSV-import en directe bookmaker-koppelingen zijn gepland voor een toekomstige update.',
  },
  {
    v: 'Hoe werkt de AI-analyse?',
    a: 'De ingebouwde AI analyseert al je historische bets en geeft persoonlijk advies: welke sporten of markten leveren je de meeste winst op, waar verlies je onnodig geld, en welke patronen zitten er in je weddenschappen. Beschikbaar op het Pro-plan.',
  },
  {
    v: 'Is mijn data veilig?',
    a: 'Ja. Al je gegevens zijn versleuteld opgeslagen en worden nooit gedeeld met derden of bookmakers. Je behoudt te allen tijde volledige controle over je eigen data en kunt je account en gegevens op elk moment verwijderen.',
  },
];

function FAQ() {
  const { dark } = useLp();
  const [open, setOpen] = useState(0);
  const bg = dark ? '#060e1a' : '#f8fafc';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const cardBg = dark ? '#0d1a2e' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const dashedBorder = dark ? '1px dashed rgba(255,255,255,0.18)' : '1px dashed #d1d5db';

  return (
    <section style={{ backgroundColor: bg, padding: '88px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 38, fontWeight: 800, color: text1, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 12 }}>
          Veelgestelde vragen
        </h2>
        <p style={{ fontSize: 15, color: text2, textAlign: 'center', marginBottom: 48 }}>
          Heb je een vraag? Wij hebben het antwoord.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  backgroundColor: isOpen ? cardBg : 'transparent',
                  border: isOpen ? `1px solid ${cardBorder}` : dashedBorder,
                  borderRadius: isOpen ? 16 : 12,
                  padding: '20px 24px',
                  cursor: 'pointer',
                  boxShadow: isOpen ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
                  transition: 'border-radius 0.15s, background-color 0.15s',
                }}
                onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: text1 }}>{faq.v}</span>
                  <span style={{ fontSize: isOpen ? 20 : 22, color: text2, flexShrink: 0, lineHeight: 1, userSelect: 'none' }}>
                    {isOpen ? '×' : '+'}
                  </span>
                </div>
                {isOpen && (
                  <p style={{ fontSize: 15, color: text2, marginTop: 12, lineHeight: 1.65, marginBottom: 0 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
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
        <Testimonials />
        <HoeHetWerkt />
        <ExtensieFlow />
        <Prijzen />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </LpTheme.Provider>
  );
}
