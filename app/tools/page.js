import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import JsonLd from '../components/JsonLd';
import TileIcon from '../components/TileIcon';
import { TOOLS } from '@/lib/guides';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Gratis betting calculators en tools',
  description: 'Gratis betting tools: arbitrage calculator, Kelly criterion, expected value, bookmakermarge, odds converter en dutching calculator. Direct te gebruiken, zonder account.',
  alternates: { canonical: '/tools' },
  openGraph: { url: `${SITE.url}/tools`, title: 'Gratis betting calculators en tools' },
};

export default function ToolsPage() {
  return (
    <div className="seo-page">
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
            { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE.url}/tools` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SITE.url}/tools/${t.slug}` })),
        },
      ]} />
      <SiteHeader />
      <main className="seo-wrap seo-prose">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>Tools</span>
        </nav>
        <h1>Gratis betting calculators</h1>
        <p className="seo-intro" style={{ maxWidth: 720 }}>
          Reken surebets uit, bepaal je inzet met Kelly, check de expected value van een bet of reken odds om. Alle tools zijn gratis en direct te gebruiken, zonder account.
        </p>
        <div className="seo-cards">
          {TOOLS.map(t => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="seo-card">
              <TileIcon href={`/tools/${t.slug}`} />
              <span>Gratis tool</span>
              <h2>{t.name}</h2>
              <p>{t.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
