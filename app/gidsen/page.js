import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import JsonLd from '../components/JsonLd';
import TileIcon from '../components/TileIcon';
import { ARTICLES, TOOLS } from '@/lib/guides';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Gidsen over sportwedden',
  description: 'Praktische gidsen over sportwedden: bets bijhouden, value betting en bankroll management, plus uitleg van de arbitrage, Kelly, EV, vig, odds en dutching calculators.',
  alternates: { canonical: '/gidsen' },
  openGraph: { url: `${SITE.url}/gidsen`, title: 'Gidsen en calculators voor sportwedden' },
};

const GROUPS = [
  { title: 'Gidsen', items: ARTICLES, base: '/gidsen' },
  { title: 'Gratis calculators', items: TOOLS, base: '/tools' },
];

export default function GidsenPage() {
  return (
    <div className="seo-page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Gidsen', item: `${SITE.url}/gidsen` },
        ],
      }} />
      <SiteHeader />
      <main className="seo-wrap seo-prose" style={{ maxWidth: 1100 }}>
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>Gidsen</span>
        </nav>
        <h1>Gidsen en calculators voor sportwedders</h1>
        <p className="seo-intro" style={{ maxWidth: 720 }}>
          Beter wedden begint met begrijpen wat je doet. In deze gidsen leggen we uit hoe je je bets bijhoudt, hoe je value vindt en hoe je je inzet bepaalt, met formules en rekenvoorbeelden.
        </p>

        {GROUPS.map(group => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <div className="seo-cards" style={{ marginTop: 12 }}>
              {group.items.map(g => (
                <Link key={g.slug} href={`${group.base}/${g.slug}`} className="seo-card">
                  <TileIcon href={`${group.base}/${g.slug}`} />
                  <h3>{g.name}</h3>
                  <p>{g.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
