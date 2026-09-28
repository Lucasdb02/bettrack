import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import JsonLd from '../components/JsonLd';
import FaqSection from '../components/FaqSection';
import { LP_PLANS } from '@/lib/plans';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Prijzen: gratis, Pro en Elite',
  description: `Bekijk de abonnementen van TrackMijnBets. Gratis starten, of Pro vanaf €${SITE.pricing.proMonthly.toFixed(2).replace('.', ',')} per maand met ${SITE.pricing.trialDays} dagen gratis proberen. Maandelijks of jaarlijks, altijd opzegbaar.`,
  alternates: { canonical: '/prijzen' },
  openGraph: { url: `${SITE.url}/prijzen`, title: 'Prijzen van TrackMijnBets' },
};

const euro = (n) => `€${n.toFixed(2).replace('.', ',')}`;

const PRICE_FAQ = [
  { q: 'Kan ik TrackMijnBets gratis gebruiken?', a: 'Ja. Met het gratis plan houd je tot 30 bets per maand bij, met één bookmaker en de basisstatistieken.' },
  { q: 'Hoe werkt de proefperiode?', a: `Pro en Elite starten met ${SITE.pricing.trialDays} dagen gratis. Zeg je binnen die periode op, dan betaal je niets.` },
  { q: 'Kan ik op elk moment opzeggen?', a: 'Ja. Je zegt op via Abonnement beheren in de app en houdt toegang tot het einde van je lopende periode.' },
  { q: 'Hoe kan ik betalen?', a: 'Betalen gaat veilig via Stripe, onder andere met creditcard en Klarna.' },
];

export default function PrijzenPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: SITE.name,
      description: SITE.description,
      brand: { '@type': 'Brand', name: SITE.name },
      offers: LP_PLANS.flatMap(p => p.maand === 0
        ? [{ '@type': 'Offer', name: p.naam, price: '0', priceCurrency: 'EUR', url: `${SITE.url}/prijzen` }]
        : [
            { '@type': 'Offer', name: `${p.naam} maandelijks`, price: p.maand.toFixed(2), priceCurrency: 'EUR', url: `${SITE.url}/prijzen` },
            { '@type': 'Offer', name: `${p.naam} jaarlijks`, price: (p.jaar * 12).toFixed(2), priceCurrency: 'EUR', url: `${SITE.url}/prijzen` },
          ]),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PRICE_FAQ.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    },
  ];

  return (
    <div className="seo-page">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="seo-wrap seo-prose" style={{ maxWidth: 1100 }}>
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>Prijzen</span>
        </nav>
        <h1>Eenvoudige, transparante prijzen</h1>
        <p className="seo-intro" style={{ maxWidth: 720 }}>
          Begin gratis en upgrade wanneer je meer wilt. Betaalde plannen probeer je {SITE.pricing.trialDays} dagen gratis en zijn altijd opzegbaar.
        </p>

        <div className="prijzen-grid">
          {LP_PLANS.map(p => (
            <section key={p.id} className={`prijzen-card${p.populair ? ' is-populair' : ''}`}>
              {p.populair && <span className="seo-badge" style={{ marginBottom: 10 }}>Meest gekozen</span>}
              <h2 style={{ margin: '0 0 4px' }}>{p.naam}</h2>
              <p style={{ fontSize: 14, marginBottom: 16 }}>{p.sub}</p>
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: '#fff' }}>{euro(p.maand)}</span>
                <span style={{ fontSize: 14 }}> / maand</span>
              </p>
              <p style={{ fontSize: 13, minHeight: 20 }}>
                {p.jaar > 0 ? `of ${euro(p.jaar)} per maand bij een jaarabonnement (${euro(p.jaar * 12)} per jaar)` : 'Voor altijd gratis'}
              </p>
              <Link href="/signup" className="seo-btn" style={{ display: 'block', textAlign: 'center', margin: '8px 0 20px' }}>{p.cta}</Link>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {p.features.map(f => (
                  <li key={f.label} style={{ fontSize: 14, display: 'flex', gap: 8, opacity: f.ok ? 1 : 0.45 }}>
                    <span aria-hidden style={{ color: f.ok ? '#34D399' : 'rgba(255,255,255,0.5)' }}>{f.ok ? '✓' : '–'}</span>
                    <span>{f.ok ? f.label : <><span className="sr-only">Niet inbegrepen: </span>{f.label}</>}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <FaqSection items={PRICE_FAQ} title="Veelgestelde vragen over de prijzen" />
      </main>
      <SiteFooter />
    </div>
  );
}
