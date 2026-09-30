import Link from 'next/link';
import { FEATURES } from '@/lib/features';
import { TOOLS, ARTICLES } from '@/lib/guides';
import { SITE } from '@/lib/site';

/* Kortere namen in de footer dan de volledige tool-/gidsnaam */
const SHORT_LABELS = {
  'bookmaker-marge-berekenen': 'Bookmakermarge',
  'hoe-houd-je-je-bets-bij': 'Bets bijhouden',
  'bankroll-management': 'Bankroll',
};

/* Max. 4 kolommen naast het merk: wat het product doet, gratis tools, leren
   (gidsen, sporten, bookmakers) en het bedrijf. Privacy en voorwaarden staan onderaan. */
const COLUMNS = [
  {
    title: 'Product',
    links: [
      ...['bets-importeren-met-ai', 'bets-bijhouden', 'dashboard', 'statistieken', 'odds-vergelijker']
        .map(slug => FEATURES.find(f => f.slug === slug))
        .filter(Boolean)
        .map(f => ({ href: `/functies/${f.slug}`, label: f.name })),
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
    title: 'Leren',
    links: [
      ...ARTICLES.map(g => ({ href: `/gidsen/${g.slug}`, label: SHORT_LABELS[g.slug] || g.name })),
      { href: '/functies/asian-handicap-uitleg', label: 'Asian handicap' },
      { href: '/bet-tracker', label: 'Bet tracker per sport' },
      { href: '/bookmaker', label: 'Bookmakers' },
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
    ],
  },
];

/* Licht/donker via html[data-site-theme] in globals.css, zodat dit een servercomponent blijft */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div className="site-footer-grid">
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ backgroundColor: '#5469d4', width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </span>
              <span className="sf-name">TrackMijnBets</span>
            </Link>
            <p className="sf-muted" style={{ fontSize: 14, lineHeight: 1.65, marginTop: 18, maxWidth: 280 }}>
              De bet tracker voor Nederlandse sportwedders. Houd je bets bij, analyseer je resultaten en wed slimmer.
            </p>
            <p className="sf-faint" style={{ fontSize: 12.5, lineHeight: 1.6, marginTop: 14, maxWidth: 280 }}>
              18+ · Wed verantwoord. Hulp nodig? Kijk op{' '}
              <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="site-footer-link" style={{ fontSize: 12.5 }}>loketkansspel.nl</a>
            </p>
          </div>

          {COLUMNS.map(col => (
            <nav key={col.title} aria-label={col.title}>
              <p className="sf-title">{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="site-footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="sf-bottom">
          <p className="sf-faint" style={{ fontSize: 13 }}>© {new Date().getFullYear()} TrackMijnBets, een dienst van {SITE.company.name} · KvK {SITE.company.kvk} · Btw {SITE.company.vat}</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy" className="site-footer-link sf-small">Privacy</Link>
            <Link href="/voorwaarden" className="site-footer-link sf-small">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
