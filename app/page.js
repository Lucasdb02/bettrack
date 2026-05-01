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
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

        {/* Left text — aligned to 1400px grid */}
        <div style={{ flexShrink: 0, width: '50%', minWidth: 320, padding: '128px 48px 80px max(32px, calc((100vw - 1400px) / 2 + 32px))' }}>
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

  /* ── Section colours ── */
  const sectionBg    = dark ? '#04111f' : '#f8fafc';
  const text1        = dark ? '#fff'    : '#0f172a';
  const text2        = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  /* ── Dashboard mockup colours (mirror real CSS vars) ── */
  const dashBg      = dark ? '#060e1a' : '#f1f5f9';
  const cardBg      = dark ? '#0d1a2e' : '#ffffff';
  const cardBorder  = dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0';
  const t1          = dark ? '#f1f5f9' : '#0f172a';
  const t2          = dark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const t3          = dark ? 'rgba(255,255,255,0.30)' : '#94a3b8';
  const t4          = dark ? 'rgba(255,255,255,0.14)' : '#cbd5e1';
  const rowDiv      = dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
  const innerBg     = dark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
  const shadowCard  = dark ? 'none' : '0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04)';

  /* ── Browser chrome colours ── */
  const chromeBorder  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)';
  const chromeBarBg   = dark ? '#0a1220' : '#dde3ec';
  const urlBarBg      = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const urlText       = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.38)';

  /* ── Static demo data ── */
  const BOOKIE_DATA = [
    { name: 'Unibet', value: 284.50, color: '#5469d4' },
    { name: 'Bet365', value: 156.20, color: '#20a851' },
    { name: 'TOTO',   value:  97.80, color: '#f59e0b' },
    { name: 'BetCity',value:  62.40, color: '#8b5cf6' },
  ];
  const STATUS_DATA = [
    { name: 'Gewonnen', value: 87, color: '#20a851', pct: 60 },
    { name: 'Verloren', value: 45, color: '#cd3b3a', pct: 31 },
    { name: 'Push',     value:  8, color: '#f59e0b', pct:  6 },
    { name: 'Lopend',   value:  7, color: '#5469d4', pct:  5 },
  ];
  const ROI_DATA = [
    { bk: 'Unibet', roi: 11.2, color: '#5469d4' },
    { bk: 'Bet365', roi:  7.8, color: '#20a851' },
    { bk: 'TOTO',   roi:  5.4, color: '#f59e0b' },
    { bk: 'BetCity',roi: -1.2, color: '#cd3b3a' },
  ];
  const RECENT = [
    { match: 'Ajax vs PSV',            market: '1X2',       book: 'Unibet', odds: 2.10, pl: +55,  w: 'gewonnen' },
    { match: 'Sinner vs Alcaraz',      market: 'Winnaar',   book: 'Bet365', odds: 1.85, pl: +34,  w: 'gewonnen' },
    { match: 'Man City vs Liverpool',  market: 'BTTS',      book: 'TOTO',   odds: 1.75, pl: -30,  w: 'verloren' },
    { match: 'Lakers vs Warriors',     market: 'Handicap',  book: 'Unibet', odds: 2.20, pl: -25,  w: 'verloren' },
    { match: 'Barça vs Atlético',      market: 'Over 2.5',  book: 'BetCity',odds: 1.90, pl:   0,  w: 'lopend'   },
  ];

  /* ── P&L SVG curve points (viewBox 0 0 440 140; y=0 top=max profit, y=140 bottom=baseline) ── */
  const PNL_PTS   = [[0,130],[44,114],[88,98],[132,82],[176,66],[220,52],[264,38],[308,25],[352,15],[396,8],[440,4]];
  const DAILY_PTS = [[0,133],[44,120],[88,105],[132,88],[176,72],[220,58],[264,44],[308,30],[352,18],[396,10],[440,6]];
  const pnlLine   = mkSmoothPath(PNL_PTS);
  const pnlArea   = pnlLine  + ' L440,140 L0,140 Z';
  const dailyLine = mkSmoothPath(DAILY_PTS);
  const dailyArea = dailyLine + ' L440,140 L0,140 Z';

  const bookTotal  = BOOKIE_DATA.reduce((s, d) => s + d.value, 0);
  const statusTop  = [...STATUS_DATA].sort((a, b) => b.value - a.value)[0];
  const maxRoiAbs  = Math.max(...ROI_DATA.map(d => Math.abs(d.roi)));

  const BADGE = {
    gewonnen: { bg: 'rgba(32,168,81,0.12)',  border: 'rgba(32,168,81,0.25)',  text: '#20a851', label: 'Gewonnen' },
    verloren:  { bg: 'rgba(205,59,58,0.12)',  border: 'rgba(205,59,58,0.25)',  text: '#cd3b3a', label: 'Verloren'  },
    lopend:    { bg: 'rgba(84,105,212,0.12)', border: 'rgba(84,105,212,0.25)', text: '#5469d4', label: 'Lopend'    },
    push:      { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b', label: 'Push'      },
  };

  const NAV_ITEMS = [
    { label: 'Dashboard',        active: true,  icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: 'Mijn Bets',       active: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
    { label: 'Statistieken',    active: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label: 'Bookmakers',      active: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20"/></svg> },
    { label: 'Maandoverzicht',  active: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: 'Calculators',     active: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4"/><path d="M9 21H5a2 2 0 01-2-2v-4"/><path d="M15 3h4a2 2 0 012 2v4"/><path d="M15 21h4a2 2 0 002-2v-4"/><rect x="7" y="8" width="10" height="8" rx="1"/></svg> },
  ];

  const STAT_CARDS = [
    { label: 'Totale P&L',  value: '+€847',   sub: '147 afgeronde bets',     color: '#20a851', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg> },
    { label: 'Win Rate',    value: '60.5%',   sub: '87W — 45L — 8P',         color: t1,        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { label: 'ROI',         value: '+8.3%',   sub: 'Totale inzet: €9.840',   color: '#20a851', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><polyline points="18 9 13 14 8 9 3 14"/></svg> },
    { label: 'Record',      value: '87-45-8', sub: 'W — L — P  •  147 bets', color: t1,        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  ];

  return (
    <section id="functies" style={{ backgroundColor: sectionBg, padding: '96px 32px', transition: 'background-color 0.3s' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>De tool</span>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Alles in één platform
          </h2>
          <p style={{ fontSize: 17, color: text2, marginTop: 14, maxWidth: 520, margin: '14px auto 0', lineHeight: 1.6 }}>
            Van bet invoeren tot diepgaande analyse — TrackMijnBets heeft elk onderdeel van je betting workflow gedekt.
          </p>
        </div>

        {/* ── Feature pills ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 44, flexWrap: 'wrap' }}>
          {[
            { dot: '#20a851', text: 'Live P&L tracking' },
            { dot: '#5469d4', text: 'AI-analyse per bet' },
            { dot: '#f59e0b', text: 'Multi-bookmaker support' },
            { dot: '#8b5cf6', text: 'Professionele calculators' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: dark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`, boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: p.dot }}/>
              <span style={{ fontSize: 12.5, color: dark ? 'rgba(255,255,255,0.65)' : '#334155', fontWeight: 500 }}>{p.text}</span>
            </div>
          ))}
        </div>

        {/* ── Browser chrome ── */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${chromeBorder}`, boxShadow: dark ? '0 40px 100px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.04)' : '0 20px 60px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.05)' }}>

          {/* Browser bar */}
          <div style={{ background: chromeBarBg, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}` }}>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c }}/>)}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: urlBarBg, borderRadius: 6, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={urlText} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize: 11, color: urlText, fontWeight: 500 }}>trackmijnbets.nl/dashboard</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: urlText, padding: '3px 10px', borderRadius: 4, background: urlBarBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, flexShrink: 0 }}>
              Afgelopen 6 maanden
            </div>
          </div>

          {/* ── Dashboard layout ── */}
          <div style={{ display: 'flex', height: 590, backgroundColor: dashBg }}>

            {/* ── Sidebar ── */}
            <div style={{ width: 192, backgroundColor: '#060a14', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {/* Logo */}
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#6b82f0,#5469d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>TrackMijnBets</span>
                </div>
              </div>
              {/* Nav items */}
              <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV_ITEMS.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 7, backgroundColor: item.active ? 'rgba(107,130,240,0.14)' : 'transparent', color: item.active ? '#7b9ef0' : 'rgba(255,255,255,0.38)' }}>
                    {item.icon}
                    <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                    {item.active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#7b9ef0' }}/>}
                  </div>
                ))}
              </div>
              {/* Bookmaker balances */}
              <div style={{ marginTop: 'auto', padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Saldi</p>
                {BOOKIE_DATA.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: b.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', flex: 1 }}>{b.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>€{b.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Main content ── */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: dashBg, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Row 1: 4 Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, flexShrink: 0 }}>
                {STAT_CARDS.map((c, i) => (
                  <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 14px', boxShadow: shadowCard, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 8.5, fontWeight: 600, color: t2, marginBottom: 7 }}>{c.label}</p>
                      <p style={{ fontSize: 17, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</p>
                      <p style={{ fontSize: 8, color: t3, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.sub}</p>
                    </div>
                    <div style={{ background: 'rgba(84,105,212,0.15)', border: '1px solid rgba(123,158,240,0.2)', width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
                  </div>
                ))}
              </div>

              {/* Row 2: Cumulatieve P&L (6fr) + Balance per Bookmaker donut (4fr) */}
              <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: 10, flexShrink: 0 }}>

                {/* P&L chart */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '14px 14px 10px', boxShadow: shadowCard }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: t2, marginBottom: 4 }}>Cumulatieve P&L</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: t1, lineHeight: 1 }}>+€847</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#20a851' }}>+8.3% ROI</span>
                      </div>
                      <p style={{ fontSize: 8, color: t3, marginTop: 2 }}>87W — 45L — 8P</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                      {[{ color:'#5469d4', label:'Cumulatief' },{ color:'#f59e0b', label:'Dagelijks' },{ color:'#94a3b8', label:'Trend', dashed:true }].map((leg,li) => (
                        <div key={li} style={{ display:'flex', alignItems:'center', gap:5 }}>
                          {leg.dashed
                            ? <svg width="12" height="2" viewBox="0 0 12 2"><line x1="0" y1="1" x2="12" y2="1" stroke={leg.color} strokeWidth="1.5" strokeDasharray="3 1.5"/></svg>
                            : <div style={{ width:12, height:2, backgroundColor:leg.color, borderRadius:1 }}/>}
                          <span style={{ fontSize:8, color:t3 }}>{leg.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg viewBox="0 0 440 140" preserveAspectRatio="none" style={{ width:'100%', height:140, display:'block' }}>
                    <defs>
                      <linearGradient id="as-plg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#5469d4" stopOpacity="0.22"/>
                        <stop offset="95%" stopColor="#5469d4" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="as-dlg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity="0.18"/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[35,70,105].map((y,i) => <line key={i} x1="0" y1={y} x2="440" y2={y} stroke={dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} strokeWidth="1"/>)}
                    <line x1="0" y1="135" x2="440" y2="135" stroke={dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'} strokeWidth="1"/>
                    <path d={pnlArea}  fill="url(#as-plg)" stroke="none"/>
                    <path d={pnlLine}  fill="none" stroke="#5469d4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    <path d={dailyArea} fill="url(#as-dlg)" stroke="none"/>
                    <path d={dailyLine} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                    <line x1="0" y1="130" x2="440" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 3"/>
                  </svg>
                </div>

                {/* Balance per Bookmaker donut */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 14, boxShadow: shadowCard, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: t2 }}>Balance per Bookmaker</p>
                      <p style={{ fontSize: 8, color: t3, marginTop: 2 }}>Verdeling over je bookmakers</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 8.5, color: t2, fontWeight: 600, marginBottom: 2 }}>Totaal</p>
                      <span style={{ fontSize: 16, fontWeight: 800, color: t1 }}>€{bookTotal.toFixed(0)}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart style={{ outline:'none' }} tabIndex={-1}>
                        <defs>
                          {BOOKIE_DATA.map((d,i) => (
                            <linearGradient key={i} id={`as-bk-g${i}`} x1="0" y1="0" x2="0.6" y2="1">
                              <stop offset="0%"   stopColor={lightenColor(d.color)}/>
                              <stop offset="100%" stopColor={d.color}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie data={BOOKIE_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={56} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0} paddingAngle={3} cornerRadius={5}>
                          {BOOKIE_DATA.map((d,i) => <Cell key={i} fill={`url(#as-bk-g${i})`}/>)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {BOOKIE_DATA.map((d,i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 9.5, color: t2, flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: t1 }}>€{d.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: ROI per Bookmaker + Status Breakdown + Recente Bets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 10, flexShrink: 0 }}>

                {/* ROI per Bookmaker */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 14px', boxShadow: shadowCard }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: t2, marginBottom: 2 }}>ROI per Bookmaker</p>
                  <p style={{ fontSize: 8, color: t3, marginBottom: 12 }}>Vergelijk prestaties per platform</p>
                  {ROI_DATA.map((d,i) => {
                    const pct = Math.abs(d.roi) / maxRoiAbs * 100;
                    const neg = d.roi < 0;
                    return (
                      <div key={i} style={{ marginBottom: 11 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 9.5, color: t2, fontWeight: 500 }}>{d.bk}</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: neg ? '#cd3b3a' : d.color }}>{neg ? '' : '+'}{d.roi}%</span>
                        </div>
                        <div style={{ height: 6, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: neg ? 'linear-gradient(90deg,#fb7185,#cd3b3a)' : `linear-gradient(90deg,${lightenColor(d.color)},${d.color})` }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Breakdown half-donut */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 14px', boxShadow: shadowCard }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: t2, marginBottom: 2 }}>Status Breakdown</p>
                  <p style={{ fontSize: 8, color: t3, marginBottom: 4 }}>Verdeling van alle bet statussen</p>
                  <ResponsiveContainer width="100%" height={92}>
                    <PieChart style={{ outline:'none' }} tabIndex={-1}>
                      <defs>
                        {STATUS_DATA.map((d,i) => (
                          <linearGradient key={i} id={`as-st-g${i}`} x1="0" y1="0" x2="0.6" y2="1">
                            <stop offset="0%"   stopColor={lightenColor(d.color)}/>
                            <stop offset="100%" stopColor={d.color}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie data={STATUS_DATA} cx="50%" cy="88%" startAngle={180} endAngle={0} innerRadius={36} outerRadius={56} dataKey="value" strokeWidth={0} paddingAngle={2} cornerRadius={4}>
                        {STATUS_DATA.map((d,i) => <Cell key={i} fill={`url(#as-st-g${i})`}/>)}
                        <Label content={({ viewBox }) => {
                          const { cx, cy } = viewBox || {};
                          if (!cx || !cy) return null;
                          return (
                            <g>
                              <text x={cx} y={cy-10} textAnchor="middle" fontSize={14} fontWeight={800} fill={statusTop.color}>{statusTop.pct}%</text>
                              <text x={cx} y={cy+4}  textAnchor="middle" fontSize={7.5} fill={t3}>{statusTop.name}</text>
                            </g>
                          );
                        }} position="center"/>
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`, paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 6px' }}>
                    {STATUS_DATA.map((d,i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 8.5, color: t2 }}>{d.name}</span>
                        <span style={{ fontSize: 8.5, fontWeight: 700, color: t1, marginLeft: 'auto' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recente Bets table */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 14px', boxShadow: shadowCard }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: t2 }}>Recente Bets</p>
                      <p style={{ fontSize: 8, color: t3 }}>Laatste activiteit</p>
                    </div>
                    <span style={{ fontSize: 8.5, color: '#5469d4', fontWeight: 600 }}>Alles bekijken →</span>
                  </div>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0 10px', padding: '4px 0', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`, marginBottom: 4 }}>
                    {['Wedstrijd','Odds','Status','P&L'].map((h,i) => (
                      <span key={i} style={{ fontSize: 7.5, fontWeight: 700, color: t4, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  {RECENT.map((r,i) => {
                    const cfg = BADGE[r.w] || BADGE.lopend;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0 10px', padding: '6px 0', alignItems: 'center', borderBottom: i < RECENT.length-1 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#f8fafc'}` : 'none' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 9.5, fontWeight: 500, color: t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.match}</p>
                          <p style={{ fontSize: 7.5, color: t3 }}>{r.market} · {r.book}</p>
                        </div>
                        <span style={{ fontSize: 9, color: t2, fontWeight: 500 }}>{r.odds}</span>
                        <span style={{ display:'inline-flex', background: cfg.bg, border:`1px solid ${cfg.border}`, color: cfg.text, borderRadius: 4, padding:'2px 6px', fontSize: 8, fontWeight: 600, whiteSpace:'nowrap' }}>{cfg.label}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: r.pl > 0 ? '#20a851' : r.pl < 0 ? '#cd3b3a' : t3, textAlign: 'right' }}>
                          {r.pl > 0 ? `+€${r.pl}` : r.pl < 0 ? `-€${Math.abs(r.pl)}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>{/* end main */}
          </div>{/* end dashboard layout */}
        </div>{/* end browser chrome */}
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

      {/* 3-column scroll grid */}
      <div className="tmb-track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 1200, margin: '0 auto', padding: '0 32px', maxHeight: 640, overflow: 'hidden' }}>
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

      {/* Fade edges top + bottom */}
      <div style={{ position: 'relative', marginTop: -640, height: 640, pointerEvents: 'none',
        backgroundImage: `linear-gradient(to bottom, ${bg} 0%, transparent 18%, transparent 82%, ${bg} 100%)` }}/>
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
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 80 }}>

        {/* Left — title + steps */}
        <div style={{ flex: '0 0 auto', width: '46%' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28, alignItems: 'stretch' }}>
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
