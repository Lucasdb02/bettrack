import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import JsonLd from './JsonLd';
import { SITE } from '@/lib/site';

/* Overzichtspagina met kaarten (hubs zoals /bet-tracker en /bookmaker) */
export default function HubPage({ path, crumb, title, intro, items, tag }) {
  return (
    <div className="seo-page">
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
            { '@type': 'ListItem', position: 2, name: crumb, item: `${SITE.url}${path}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: `${SITE.url}${it.href}` })),
        },
      ]} />
      <SiteHeader />
      <main className="seo-wrap seo-prose">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>{crumb}</span>
        </nav>
        <h1>{title}</h1>
        <p className="seo-intro" style={{ maxWidth: 720 }}>{intro}</p>
        <div className="seo-cards">
          {items.map(it => (
            <Link key={it.href} href={it.href} className="seo-card">
              {tag && <span>{tag}</span>}
              <h2>{it.name}</h2>
              <p>{it.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
