'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createClient } from '../../lib/supabase';
import { useBets, berekenWinst } from '../context/BetsContext';

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

const toolsNav = [
  {
    label: 'Odds Vergelijker',
    href: '/odds-v2',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  },
  {
    label: 'Calculators',
    href: '/calculators',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="16" y2="19"/></svg>,
  },
  {
    label: 'Chrome Extension',
    href: '/extension',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>,
  },
];

function NavItem({ item, active, dark }) {
  return (
    <li>
      <Link
        href={item.href}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 7,
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active
            ? (dark ? '#e8f0ff' : '#4f46e5')
            : 'var(--text-2)',
          background: active
            ? (dark ? 'rgba(123,158,240,0.15)' : '#eef2ff')
            : 'transparent',
          backdropFilter: active && dark ? 'blur(12px) saturate(1.5)' : 'none',
          WebkitBackdropFilter: active && dark ? 'blur(12px) saturate(1.5)' : 'none',
          border: active
            ? `1px solid ${dark ? 'rgba(123,158,240,0.25)' : '#c7d2fe'}`
            : '1px solid transparent',
          boxShadow: active && dark ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          textDecoration: 'none', transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : '#edf0f4';
            e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
            e.currentTarget.style.color = dark ? '#b8d0e8' : '#334155';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = dark ? '#7090b0' : '#334155';
          }
        }}
      >
        <span style={{ color: active ? (dark ? '#7b9ef0' : '#6366f1') : 'var(--text-2)', flexShrink: 0 }}>{item.icon}</span>
        {item.label}
      </Link>
    </li>
  );
}

const drawerNav = [
  {
    section: 'Acties',
    items: [
      {
        label: 'Bet Invoeren',
        href: '/bets/new',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      },
      {
        label: 'Account',
        href: '/account',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      },
    ],
  },
  {
    section: 'Tools',
    items: [
      {
        label: 'Odds Vergelijker',
        href: '/odds-v2',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
      },
      {
        label: 'Calculators',
        href: '/calculators',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="16" y2="19"/></svg>,
      },
      {
        label: 'Chrome Extension',
        href: '/extension',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { bets } = useBets();
  const [dbBookmakers, setDbBookmakers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchBalanceData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: bms }, { data: txs }] = await Promise.all([
        supabase.from('bookmakers').select('id,naam,saldo').eq('user_id', user.id),
        supabase.from('transactions').select('bookmaker_id,type,amount').eq('user_id', user.id),
      ]);
      if (bms) setDbBookmakers(bms);
      if (txs) setTransactions(txs);
    }
    fetchBalanceData();
  }, []);

  const totalBalance = useMemo(() => {
    const settledBets = bets.filter(b => b.uitkomst !== 'lopend');
    return dbBookmakers.reduce((sum, bm) => {
      const pnl = settledBets
        .filter(b => b.bookmaker === bm.naam)
        .reduce((s, b) => s + berekenWinst(b.uitkomst, Number(b.odds), Number(b.inzet)), 0);
      const netTx = transactions
        .filter(tx => tx.bookmaker_id === bm.id)
        .reduce((s, tx) => s + (tx.type === 'deposit' ? Number(tx.amount) : -Number(tx.amount)), 0);
      return sum + (bm.saldo || 0) + pnl + netTx;
    }, 0);
  }, [dbBookmakers, transactions, bets]);

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
    <aside style={{ background: dark ? '#070917' : '#f0f2f6', borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, width: '220px', minHeight: '100vh' }} className="sidebar-desktop flex flex-col flex-shrink-0 sticky top-0 h-screen">

      {/* Logo */}
      <div style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`, padding: '18px 16px' }} className="flex items-center gap-3">
        <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: '1px solid rgba(123,158,240,0.2)' }} className="flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p style={{ color: dark ? '#fff' : '#334155', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>TrackMijnBets</p>
          <p style={{ color: dark ? '#4a6885' : '#94a3b8', fontSize: 10.5 }}>Analyse Tool</p>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 px-3 py-4 sidebar-scroll overflow-y-auto" style={{ overflowY: 'auto' }}>

        {/* Main menu */}
        <p style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 600, paddingLeft: 10, marginBottom: 5 }}>Menu</p>
        <ul className="space-y-0.5" style={{ marginBottom: 20 }}>
          {mainNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} dark={dark} />)}
        </ul>

        {/* Bookmakers */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, marginBottom: 5, marginTop: 20 }}>
          <p style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 600 }}>Bookmakers</p>
          {dbBookmakers.length > 0 && (
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: totalBalance >= 0 ? (dark ? '#4a8fa8' : '#6366f1') : (dark ? '#a05070' : '#fb2b37') }}>
              €{totalBalance.toFixed(2)}
            </span>
          )}
        </div>
        <ul className="space-y-0.5" style={{ marginBottom: 20 }}>
          {bookmakerNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} dark={dark} />)}
        </ul>

        {/* Tools */}
        <p style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 600, paddingLeft: 10, marginBottom: 5, marginTop: 20 }}>Tools</p>
        <ul className="space-y-0.5">
          {toolsNav.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} dark={dark} />)}
        </ul>
      </nav>

      {/* Footer: dark toggle + account */}
      <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`, padding: '12px 14px', background: dark ? '#060713' : '#edf0f4' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Schakel naar licht' : 'Schakel naar donker'}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 7, marginBottom: 6,
            background: 'transparent', border: '1px solid transparent', cursor: 'pointer',
            color: 'var(--text-2)', fontSize: 13, fontWeight: 400,
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0';
            e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.12)' : '#cbd5e1';
            e.currentTarget.style.color = dark ? '#c5d8ec' : '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = dark ? '#7090b0' : '#334155';
          }}
        >
          <span style={{ color: 'var(--text-2)', flexShrink: 0 }}>
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
            color: 'var(--text-2)', fontSize: 13, fontWeight: 400,
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(251,43,55,0.08)';
            e.currentTarget.style.borderColor = 'rgba(251,43,55,0.2)';
            e.currentTarget.style.color = '#fb2b37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = dark ? '#7090b0' : '#334155';
          }}
        >
          <span style={{ color: 'var(--text-2)', flexShrink: 0 }}>
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
            background: pathname === '/account' ? (dark ? 'rgba(123,158,240,0.15)' : '#eef2ff') : 'transparent',
            border: pathname === '/account' ? `1px solid ${dark ? 'rgba(123,158,240,0.25)' : '#c7d2fe'}` : '1px solid transparent',
          }}
          onMouseEnter={e => {
            if (pathname !== '/account') {
              e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : '#edf0f4';
              e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.09)' : '#e2e8f0';
            }
          }}
          onMouseLeave={e => {
            if (pathname !== '/account') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(84,105,212,0.2)', border: '1px solid rgba(123,158,240,0.25)', flexShrink: 0 }} className="flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p style={{ color: dark ? '#c5d8ec' : '#334155', fontSize: 12.5, fontWeight: 500 }} className="truncate">Mijn Account</p>
            <p style={{ color: dark ? '#3d6080' : '#94a3b8', fontSize: 10.5 }}>Voorkeuren & export</p>
          </div>
        </Link>
      </div>
    </aside>

    {/* Mobile top header — all pages */}
    <header className="mobile-top-header" style={{ position: 'fixed' }}>
      {/* Left: hamburger */}
      <button
        onClick={() => setDrawerOpen(true)}
        style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 4, flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}
      >
        <span style={{ display: 'block', width: 20, height: 2, background: '#e6edf3', borderRadius: 1 }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#e6edf3', borderRadius: 1 }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#e6edf3', borderRadius: 1 }} />
      </button>

      {/* Center: logo */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: 'rgba(10,20,44,0.9)', width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: '1px solid rgba(123,158,240,0.2)' }} className="flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
      </div>

      {/* Right: account + plus */}
      <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
        <Link href="/account" style={{ textDecoration: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(84,105,212,0.2)', border: '1px solid rgba(123,158,240,0.25)', flexShrink: 0 }} className="flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </Link>
        <Link href="/bets/new" style={{ textDecoration: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, boxShadow: '0 2px 10px rgba(84,105,212,0.4)' }} className="flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </Link>
      </div>
    </header>

    {/* Mobile drawer overlay */}
    {drawerOpen && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setDrawerOpen(false)}>
        {/* Backdrop */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
        {/* Drawer panel */}
        <div
          style={{ position: 'relative', width: 260, height: '100%', background: '#070917', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0px)', zIndex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(10,20,44,0.9)', width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(123,158,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 14 }}>TrackMijnBets</span>
            </div>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7090b0', padding: 4, WebkitTapHighlightColor: 'transparent' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Drawer nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
            {drawerNav.map(({ section, items }) => (
              <div key={section} style={{ marginBottom: 20 }}>
                <p style={{ color: '#2d5070', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 10, marginBottom: 6 }}>{section}</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/bets/new' && pathname.startsWith(item.href));
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '8px 10px', borderRadius: 7, marginBottom: 2,
                            fontSize: 13, fontWeight: active ? 600 : 400,
                            color: active ? '#e8f0ff' : '#7090b0',
                            background: active ? 'rgba(123,158,240,0.15)' : 'transparent',
                            border: active ? '1px solid rgba(123,158,240,0.2)' : '1px solid transparent',
                            textDecoration: 'none',
                          }}
                        >
                          <span style={{ color: active ? '#7b9ef0' : '#3d6080', flexShrink: 0 }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Drawer footer: dark toggle + logout */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px', background: '#060713' }}>
            <button
              onClick={toggle}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, marginBottom: 4, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: '#7090b0', fontSize: 13, WebkitTapHighlightColor: 'transparent' }}
            >
              <span style={{ color: '#3d6080' }}>
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
            <button
              onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: '#7090b0', fontSize: 13, WebkitTapHighlightColor: 'transparent' }}
            >
              <span style={{ color: '#3d6080' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </span>
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Mobile bottom navigation */}
    <nav className="mobile-bottom-nav">
      {[...mainNav.filter(item => item.href !== '/bets/new'), ...bookmakerNav].map((item) => (
        <Link key={item.href} href={item.href} className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`}>
          {item.icon}
          <span>{item.label.replace('Bets Overzicht', 'Overzicht').replace('Maandoverzicht', 'Kalender').replace('Odds Vergelijker', 'Odds')}</span>
        </Link>
      ))}
    </nav>
    </>
  );
}
