import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header style={{ position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 20, background: 'rgba(4,17,31,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>TrackMijnBets</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/functies" className="site-header-link">Functies</Link>
          <Link href="/gidsen" className="site-header-link">Gidsen</Link>
          <Link href="/prijzen" className="site-header-link">Prijzen</Link>
          <Link href="/login" className="site-header-link">Inloggen</Link>
          <Link href="/signup" style={{ background: '#5469d4', color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '8px 14px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>Gratis starten</Link>
        </nav>
      </div>
    </header>
  );
}
