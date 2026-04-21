'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createClient } from '../../lib/supabase';

const mainNav = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    label: 'Bets Overzicht',
    href: '/bets',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    label: 'Bet Invoeren',
    href: '/bets/new',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  },
  {
    label: 'Maandoverzicht',
    href: '/maandoverzicht',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: 'Statistieken',
    href: '/statistieken',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  },
];

const bookmakerNav = [
  {
    label: 'Bookmakers',
    href: '/bookmakers',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  },
];

const calcNav = [
  { label: 'Arbitrage',      href: '/calculators/arbitrage',      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4l3 3-3 3"/><path d="M3 7h18"/><path d="M6 20l-3-3 3-3"/><path d="M21 17H3"/></svg> },
  { label: 'Kelly',          href: '/calculators/kelly',          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg> },
  { label: 'Vig Calculator', href: '/calculators/vig',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { label: 'Expected Value', href: '/calculators/ev',             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label: 'Odds Converter', href: '/calculators/odds-converter', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg> },
];

function NavItem({ item, active, compact = false }) {
  return (
    <li>
      <Link
        href={item.href}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: compact ? '5px 10px' : '6.5px 10px',
          borderRadius: 7,
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? 'var(--nav-item-active-text)' : 'var(--nav-item-text)',
          background: active ? 'var(--nav-item-active-bg)' : 'transparent',
          borderLeft: active ? '2px solid var(--nav-item-active-border)' : '2px solid transparent',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
          letterSpacing: '-0.01em',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'var(--nav-item-hover-bg)';
            e.currentTarget.style.color = 'var(--nav-item-hover-text)';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--nav-item-text)';
          }
        }}
      >
        <span style={{ color: active ? 'var(--nav-icon-active)' : 'var(--nav-icon)', flexShrink: 0, transition: 'color 0.15s' }}>
          {item.icon}
        </span>
        {item.label}
      </Link>
    </li>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      color: 'var(--nav-section)',
      fontSize: 9.5, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      paddingLeft: 12, marginBottom: 4,
    }}>
      {children}
    </p>
  );
}

const drawerNav = [
  { section: 'Acties', items: [
    { label: 'Bet Invoeren', href: '/bets/new', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { label: 'Account', href: '/account', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]},
  { section: 'Calculators', items: calcNav },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/bets') return pathname === '/bets';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="sidebar-desktop flex flex-col flex-shrink-0 sticky top-0 h-screen sidebar-scroll"
        style={{
          width: 224,
          minHeight: '100vh',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'var(--sidebar-logo-text)', fontWeight: 700, fontSize: 14, lineHeight: 1.2, letterSpacing: '-0.02em' }}>TrackMijnBets</p>
              <p style={{ color: 'var(--sidebar-logo-sub)', fontSize: 10.5, marginTop: 1 }}>Analyse Tool</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Menu</SectionLabel>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mainNav.map(item => <NavItem key={item.href} item={item} active={isActive(item.href)}/>)}
            </ul>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Bookmakers</SectionLabel>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {bookmakerNav.map(item => <NavItem key={item.href} item={item} active={isActive(item.href)}/>)}
            </ul>
          </div>

          <div>
            <SectionLabel>Calculators</SectionLabel>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {calcNav.map(item => <NavItem key={item.href} item={item} active={isActive(item.href)} compact/>)}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '10px 10px', background: 'var(--sidebar-footer-bg)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Schakel naar licht' : 'Schakel naar donker'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '6.5px 10px', borderRadius: 7, marginBottom: 2,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--nav-item-text)', fontSize: 13, fontWeight: 400,
              transition: 'all 0.15s', letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--nav-item-hover-bg)';
              e.currentTarget.style.color = 'var(--nav-item-hover-text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--nav-item-text)';
            }}
          >
            <span style={{ color: 'var(--nav-icon)', flexShrink: 0 }}>
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </span>
            {dark ? 'Lichte modus' : 'Donkere modus'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '6.5px 10px', borderRadius: 7, marginBottom: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--nav-item-text)', fontSize: 13, fontWeight: 400,
              transition: 'all 0.15s', letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(225,29,72,0.06)';
              e.currentTarget.style.color = '#e11d48';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--nav-item-text)';
            }}
          >
            <span style={{ color: 'var(--nav-icon)', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            Uitloggen
          </button>

          {/* Account */}
          <Link
            href="/account"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              textDecoration: 'none', transition: 'all 0.15s',
              background: pathname === '/account' ? 'var(--nav-item-active-bg)' : 'transparent',
              borderLeft: pathname === '/account' ? '2px solid var(--nav-item-active-border)' : '2px solid transparent',
            }}
            onMouseEnter={e => {
              if (pathname !== '/account') e.currentTarget.style.background = 'var(--nav-item-hover-bg)';
            }}
            onMouseLeave={e => {
              if (pathname !== '/account') e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'var(--bg-brand)', border: '1px solid var(--brand-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'var(--nav-item-active-text)', fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em' }} className="truncate">Mijn Account</p>
              <p style={{ color: 'var(--nav-item-text)', fontSize: 10.5, marginTop: 1 }}>Voorkeuren & export</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <header className="mobile-top-header">
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 4, flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}
        >
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-1)', borderRadius: 1 }}/>
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-1)', borderRadius: 1 }}/>
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-1)', borderRadius: 1 }}/>
        </button>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', width: 28, height: 28, borderRadius: 7, flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
        </div>

        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <Link href="/account" style={{ textDecoration: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--bg-brand)', border: '1px solid var(--brand-soft)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </Link>
          <Link href="/bets/new" style={{ textDecoration: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', boxShadow: '0 2px 10px rgba(99,102,241,0.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </Link>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setDrawerOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}/>
          <div
            style={{ position: 'relative', width: 264, height: '100%', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0px)', zIndex: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--sidebar-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', width: 28, height: 28, borderRadius: 7, boxShadow: '0 2px 8px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <span style={{ color: 'var(--sidebar-logo-text)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nav-item-text)', padding: 4, WebkitTapHighlightColor: 'transparent' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
              {drawerNav.map(({ section, items }) => (
                <div key={section} style={{ marginBottom: 20 }}>
                  <SectionLabel>{section}</SectionLabel>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {items.map(item => {
                      const active = pathname === item.href || (item.href !== '/bets/new' && pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link href={item.href} onClick={() => setDrawerOpen(false)} style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '7px 10px', borderRadius: 7,
                            fontSize: 13, fontWeight: active ? 600 : 400,
                            color: active ? 'var(--nav-item-active-text)' : 'var(--nav-item-text)',
                            background: active ? 'var(--nav-item-active-bg)' : 'transparent',
                            borderLeft: active ? '2px solid var(--nav-item-active-border)' : '2px solid transparent',
                            textDecoration: 'none',
                          }}>
                            <span style={{ color: active ? 'var(--nav-icon-active)' : 'var(--nav-icon)', flexShrink: 0 }}>{item.icon}</span>
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '10px 10px', background: 'var(--sidebar-footer-bg)' }}>
              <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, marginBottom: 2, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--nav-item-text)', fontSize: 13, WebkitTapHighlightColor: 'transparent' }}>
                <span style={{ color: 'var(--nav-icon)' }}>
                  {dark ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
                </span>
                {dark ? 'Lichte modus' : 'Donkere modus'}
              </button>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--nav-item-text)', fontSize: 13, WebkitTapHighlightColor: 'transparent' }}>
                <span style={{ color: 'var(--nav-icon)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </span>
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom navigation ── */}
      <nav className="mobile-bottom-nav">
        {[...mainNav.filter(item => item.href !== '/bets/new'), ...bookmakerNav].map(item => (
          <Link key={item.href} href={item.href} className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`}>
            {item.icon}
            <span>{item.label.replace('Bets Overzicht', 'Overzicht').replace('Maandoverzicht', 'Kalender')}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
