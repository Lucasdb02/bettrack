import LandingClient from './LandingClient';
import { FAQS } from '@/lib/faqs';
import JsonLd from './components/JsonLd';
import { SITE } from '@/lib/site';

export const metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: '/' },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/apple-touch-icon.png`,
    email: SITE.email,
    parentOrganization: {
      '@type': 'Organization',
      name: SITE.company.name,
      vatID: SITE.company.vat,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.company.street,
        postalCode: SITE.company.postalCode,
        addressLocality: SITE.company.city,
        addressCountry: 'NL',
      },
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'nl-NL',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    url: SITE.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    inLanguage: 'nl-NL',
    description: SITE.description,
    offers: [
      { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Pro (maandelijks)', price: SITE.pricing.proMonthly.toFixed(2), priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Pro (jaarlijks)', price: SITE.pricing.proYearly.toFixed(2), priceCurrency: 'EUR' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.v,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <LandingClient />
    </>
  );
}
