'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { createClient } from '../../lib/supabase';

const mainNav = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
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
  {
    label: 'Arbitrage',
    href: '/calculators/arbitrage',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4l3 3-3 3"/><path d="M3 7h18"/><path d="M6 20l-3-3 3-3"/><path d="M21 17H3"/></svg>,
  },
  {
    label: 'Kelly',
    href: '/calculators/kelly',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>,
  },
  {
    label: 'Vig Calculator',
    href: '/calculators/vig',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    label: 'Expected Value',
    href: '/calculators/ev',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    label: 'Odds Converter',
    href: '/calculators/odds-converter',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  },
];

function NavItem({ item, active }) {
  return (
    <li>
      <Link
        href={item.href}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 7,
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? '#e8f0ff' : '#7090b0',
          background: active
            ? 'rgba(123,158,240,0.15)'
            : 'transparent',
          backdropFilter: active ? 'blur(12px) saturate(1.5)' : 'none',
          WebkitBackdropFilter: active ? 'blur(12px) saturate(1.5)' : 'none',
          borderTop: 'none',
          borderBottom: active ? '1px solid rgba(123,158,240,0.3)' : '1px solid transparent',
          borderLeft: active ? '1px solid rgba(123,158,240,0.2)' : '1px solid transparent',
          borderRight: active ? '1px solid rgba(123,158,240,0.2)' : '1px solid transparent',
          boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          textDecoration: 'none', transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#b8d0e8';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#7090b0';
          }
        }}
      >
        <span style={{ color: active ? '#7b9ef0' : '#3d6080', flexShrink: 0 }}>{item.icon}</span>
        {item.label}
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();

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
    <aside style={{ background: 'rgba(5,12,28,0.94)', backdropFilter: 'blur(24px) saturate(1.5)', WebkitBackdropFilter: 'blur(24px) saturate(1.5)', borderRight: '1px solid rgba(255,255,255,0.06)', width: '220px', minHeight: '100vh' }} className="flex flex-col flex-shrink-0 sticky top-0 h-screen">

      {/* Logo */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '18px 16px' }} className="flex items-center gap-3">
        <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: '1px solid rgba(123,158,240,0.2)' }} className="flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>TrackMijnBets</p>
          <p style={{ color: '#4a6885', fontSize: 10.5 }}>Analyse Tool</p>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 px-3 py-4 sidebar-scroll overflow-y-auto" style={{ overflowY: 'auto' }}>

        {/* Main menu */}
        <p style={{ color: '#2d5070', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 10, marginBottom: 5 }}>Menu</p>
        <ul className="space-y-0.5" style={{ marginBottom: 20 }}>
          {mainNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} />)}
        </ul>

        {/* Bookmakers */}
        <p style={{ color: '#2d5070', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 10, marginBottom: 5, marginTop: 20 }}>Bookmakers</p>
        <ul className="space-y-0.5" style={{ marginBottom: 20 }}>
          {bookmakerNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} />)}
        </ul>

        {/* Calculators */}
        <p style={{ color: '#2d5070', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 10, marginBottom: 5 }}>Calculators</p>
        <ul className="space-y-0.5">
          {calcNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} />)}
        </ul>
      </nav>

      {/* Footer: dark toggle + account */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 14px' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Schakel naar licht' : 'Schakel naar donker'}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 7, marginBottom: 6,
            background: 'transparent', border: '1px solid transparent', cursor: 'pointer',
            color: '#7090b0', fontSize: 13, fontWeight: 400,
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#c5d8ec';
            e.currentTarget.style.backdropFilter = 'blur(12px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#7090b0';
            e.currentTarget.style.backdropFilter = 'none';
          }}
        >
          <span style={{ color: '#3d6080', flexShrink: 0 }}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </span>
          {dark ? 'Lichte modus' : 'Donkere modus'}
        </button>

        {/* Uitloggen */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 7, marginBottom: 8,
            background: 'transparent', border: '1px solid transparent', cursor: 'pointer',
            color: '#7090b0', fontSize: 13, fontWeight: 400,
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,80,80,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,100,100,0.2)';
            e.currentTarget.style.color = '#ff9090';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#7090b0';
          }}
        >
          <span style={{ color: '#3d6080', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          Uitloggen
        </button>

        {/* Account */}
        <Link
          href="/account"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 8,
            textDecoration: 'none', transition: 'all 0.18s',
            background: pathname === '/account' ? 'rgba(123,158,240,0.15)' : 'transparent',
            border: pathname === '/account' ? '1px solid rgba(123,158,240,0.25)' : '1px solid transparent',
            boxShadow: pathname === '/account' ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
          }}
          onMouseEnter={e => {
            if (pathname !== '/account') {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
            }
          }}
          onMouseLeave={e => {
            if (pathname !== '/account') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(84,105,212,0.2)', border: '1px solid rgba(123,158,240,0.25)', flexShrink: 0 }} className="flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p style={{ color: '#c5d8ec', fontSize: 12.5, fontWeight: 500 }} className="truncate">Mijn Account</p>
            <p style={{ color: '#3d6080', fontSize: 10.5 }}>Voorkeuren & export</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
