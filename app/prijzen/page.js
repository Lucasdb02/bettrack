import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import JsonLd from '../components/JsonLd';
import FaqSection from '../components/FaqSection';
import PricingSection from '../components/PricingSection';
import { LP_PLANS } from '@/lib/plans';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Prijzen: gratis, Pro en Elite',
  description: `Bekijk de abonnementen van TrackMijnBets. Gratis starten, of Pro vanaf €${SITE.pricing.proMonthly.toFixed(2).replace('.', ',')} per maand met ${SITE.pricing.trialDays} dagen gratis proberen. Maandelijks of jaarlijks, altijd opzegbaar.`,
  alternates: { canonical: '/prijzen' },
  openGraph: { url: `${SITE.url}/prijzen`, title: 'Prijzen van TrackMijnBets' },
};

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
      <main className="seo-wrap">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>Prijzen</span>
        </nav>
        <PricingSection headingAs="h1" bare />
        <div className="seo-prose">
          <FaqSection items={PRICE_FAQ} title="Veelgestelde vragen over de prijzen" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
