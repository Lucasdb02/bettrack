'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useLanguage, langFlag, langSwitchLabel } from '../context/LanguageContext';

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Header van de publieke site, gelijk aan die van de homepage: transparant bovenaan,
   bij scrollen een zwevende, vervaagde balk.
   home: op de homepage scrollen Functies/Hoe het werkt/Prijzen naar de sectie;
         elders zijn het gewone links en staat er een spacer onder de vaste header.
   onToggleTheme: alleen de homepage heeft een lichte modus, dus alleen daar de themaknop. */
export default function SiteHeader({ home = false, dark = true, onToggleTheme }) {
  const { lang, toggleLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 20); };
    fn(); // ook goed bij laden halverwege de pagina
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = onToggleTheme;

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
    { label: 'Functies',       id: 'functies',      page: '/functies' },
    { label: 'Hoe het werkt',  id: 'hoe-het-werkt', page: '/#hoe-het-werkt' },
    { label: 'Tools',          href: '/tools' },
    { label: 'Gidsen',         href: '/gidsen' },
    { label: 'Prijzen',        id: 'prijzen',       page: '/prijzen' },
  ].map(item => (home || !item.id) ? item : { label: item.label, href: item.page });

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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}
            onClick={(e) => { if (!home) return; e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span style={{ color: textPrimary, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>TrackMijnBets</span>
          </Link>

          {/* Nav — desktop only */}
          <nav className="lp-nav-links" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href || `#${item.id}`} onClick={(e) => { if (item.href) return; e.preventDefault(); scrollTo(item.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', color: textNav, fontSize: 13.5, fontWeight: 500, padding: '6px 12px', borderRadius: 7, transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = navHoverColor; e.currentTarget.style.background = navHoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = textNav; e.currentTarget.style.background = 'none'; }}
              >{item.label}</a>
            ))}
          </nav>

          {/* Right actions — desktop only */}
          <div className="lp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {toggleTheme && <button onClick={toggleTheme} title={dark ? 'Lichte modus' : 'Donkere modus'}
              style={{ width: 34, height: 34, borderRadius: 8, border: iconBorder, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: iconColor, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconBgHover; e.currentTarget.style.color = iconColorHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = iconBg; e.currentTarget.style.color = iconColor; }}
            >{dark ? <SunIcon/> : <MoonIcon/>}</button>}
            <button onClick={toggleLang} title={langSwitchLabel(lang)} aria-label={langSwitchLabel(lang)} data-no-translate
              style={{ width: 34, height: 34, borderRadius: 8, border: iconBorder, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 17, lineHeight: 1, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconBgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = iconBg; }}
            >{langFlag(lang)}</button>

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
          <button key={item.label}
            onClick={() => { if (item.href) { window.location.href = item.href; return; } scrollTo(item.id); setMenuOpen(false); }}
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
          {toggleTheme && <button onClick={() => { toggleTheme(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textNav, fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 10, transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = navHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            {dark ? <SunIcon/> : <MoonIcon/>}
            {dark ? 'Lichte modus' : 'Donkere modus'}
          </button>}
          <button onClick={toggleLang} data-no-translate
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textNav, fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 10, transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = navHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{langFlag(lang)}</span>
            {langSwitchLabel(lang)}
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

      {/* Ruimte onder de vaste header op pagina's zonder eigen hero */}
      {!home && <div aria-hidden style={{ height: 64 }} />}
    </>
  );
}
