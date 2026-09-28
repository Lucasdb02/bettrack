import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import JsonLd from '../components/JsonLd';
import TileIcon from '../components/TileIcon';
import { FEATURES } from '@/lib/features';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Alle functies van de bet tracker',
  description: 'Ontdek alle functies van TrackMijnBets: AI screenshot import, bets bijhouden, dashboard, statistieken, maandoverzicht, bookmakers, odds vergelijker, calculators en meer.',
  alternates: { canonical: '/functies' },
  openGraph: { url: `${SITE.url}/functies`, title: 'Alle functies van TrackMijnBets' },
};

export default function FunctiesPage() {
  return (
    <div className="seo-page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Functies', item: `${SITE.url}/functies` },
        ],
      }} />
      <SiteHeader />
      <main className="seo-wrap seo-prose">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>Functies</span>
        </nav>
        <h1>Alle functies van TrackMijnBets</h1>
        <p className="seo-intro" style={{ maxWidth: 720 }}>
          Van automatisch bets importeren met AI tot diepgaande statistieken en handige calculators: dit is alles wat je met TrackMijnBets kunt doen om je sportweddenschappen bij te houden en slimmer te wedden.
        </p>

        <div className="seo-cards">
          {FEATURES.map(f => (
            <Link key={f.slug} href={`/functies/${f.slug}`} className="seo-card">
              <TileIcon href={`/functies/${f.slug}`} />
              <span>{f.plan === 'Gratis' ? 'Gratis' : 'Pro'}</span>
              <h2>{f.name}</h2>
              <p>{f.description}</p>
            </Link>
          ))}
        </div>

        <div className="seo-cta">
          <h2 style={{ marginTop: 0 }}>Begin gratis met het bijhouden van je bets</h2>
          <p>Maak in een minuut een account aan. Pro probeer je {SITE.pricing.trialDays} dagen gratis.</p>
          <Link href="/signup" className="seo-btn">Gratis account aanmaken</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
