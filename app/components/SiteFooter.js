import Link from 'next/link';
import { FEATURES } from '@/lib/features';
import { TOOLS, ARTICLES } from '@/lib/guides';
import { SPORT_PAGES } from '@/lib/sport-pages';
import { BOOKMAKER_PAGES } from '@/lib/bookmaker-pages';
import { SITE } from '@/lib/site';

/* Kortere namen in de footer dan de volledige tool-/gidsnaam */
const SHORT_LABELS = {
  'bookmaker-marge-berekenen': 'Bookmakermarge',
  'hoe-houd-je-je-bets-bij': 'Bets bijhouden',
  'bankroll-management': 'Bankroll',
};

const COLUMNS = [
  {
    title: 'Functies',
    links: [
      ...FEATURES.slice(0, 7).map(f => ({ href: `/functies/${f.slug}`, label: f.name })),
      { href: '/functies', label: 'Alle functies' },
    ],
  },
  {
    title: 'Gratis tools',
    links: [
      ...TOOLS.map(t => ({ href: `/tools/${t.slug}`, label: SHORT_LABELS[t.slug] || t.name })),
      { href: '/tools', label: 'Alle tools' },
    ],
  },
  {
    title: 'Bet tracker',
    links: [
      ...SPORT_PAGES.slice(0, 6).map(p => ({ href: `/bet-tracker/${p.slug}`, label: p.sport })),
      { href: '/bet-tracker', label: 'Alle sporten' },
    ],
  },
  {
    title: 'Bookmakers',
    links: [
      ...BOOKMAKER_PAGES.slice(0, 7).map(b => ({ href: `/bookmaker/${b.slug}`, label: b.name })),
      { href: '/bookmaker', label: 'Alle bookmakers' },
    ],
  },
  {
    title: 'Leren',
    links: [
      ...ARTICLES.map(g => ({ href: `/gidsen/${g.slug}`, label: SHORT_LABELS[g.slug] || g.name })),
      { href: '/functies/asian-handicap-uitleg', label: 'Asian handicap' },
      { href: '/gidsen', label: 'Alle gidsen' },
    ],
  },
  {
    title: 'TrackMijnBets',
    links: [
      { href: '/prijzen', label: 'Prijzen' },
      { href: '/over-ons', label: 'Over ons' },
      { href: '/contact', label: 'Contact' },
      { href: '/signup', label: 'Gratis account' },
      { href: '/login', label: 'Inloggen' },
      { href: '/privacy', label: 'Privacybeleid' },
      { href: '/voorwaarden', label: 'Voorwaarden' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" style={{ backgroundColor: '#04111f', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 32px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="site-footer-grid">
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <span style={{ backgroundColor: '#5469d4', width: 26, height: 26, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>TrackMijnBets</span>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginTop: 14, maxWidth: 280 }}>
              De bet tracker voor Nederlandse sportwedders. Houd je bets bij, analyseer je resultaten en wed slimmer.
            </p>
          </div>

          {COLUMNS.map(col => (
            <nav key={col.title} aria-label={col.title}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="site-footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© {new Date().getFullYear()} TrackMijnBets, een dienst van {SITE.company.name} · KvK {SITE.company.kvk} · Btw {SITE.company.vat}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            18+ · Wed verantwoord. Hulp nodig? Kijk op{' '}
            <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="site-footer-link" style={{ fontSize: 12 }}>loketkansspel.nl</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
