import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import JsonLd from '../../components/JsonLd';
import { FEATURES, getFeature } from '@/lib/features';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) return {};
  const url = `${SITE.url}/functies/${f.slug}`;
  return {
    title: f.metaTitle,
    description: f.description,
    alternates: { canonical: `/functies/${f.slug}` },
    openGraph: { type: 'article', url, title: f.metaTitle, description: f.description },
    twitter: { title: f.metaTitle, description: f.description },
  };
}

export default async function FeaturePage({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) notFound();

  const url = `${SITE.url}/functies/${f.slug}`;
  const related = f.related.map(getFeature).filter(Boolean);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: f.title,
      description: f.description,
      inLanguage: 'nl-NL',
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/apple-touch-icon.png` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Functies', item: `${SITE.url}/functies` },
        { '@type': 'ListItem', position: 3, name: f.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: f.faq.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    },
  ];

  return (
    <div className="seo-page">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="seo-wrap">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/functies">Functies</Link><span>/</span>
          <span>{f.name}</span>
        </nav>

        <article className="seo-prose">
          <span className="seo-badge">{f.plan === 'Gratis' ? 'Gratis beschikbaar' : `Onderdeel van ${f.plan}`}</span>
          <h1>{f.title}</h1>
          <p className="seo-intro">{f.intro}</p>

          {f.sections.map(s => (
            <section key={s.h2}>
              <h2>{s.h2}</h2>
              {s.p.map((p, i) => <p key={i}>{p}</p>)}
              {s.ul && <ul>{s.ul.map((li, i) => <li key={i}>{li}</li>)}</ul>}
            </section>
          ))}

          <section>
            <h2>Veelgestelde vragen over {f.name.toLowerCase()}</h2>
            <div className="seo-faq">
              {f.faq.map(q => (
                <details key={q.q}>
                  <summary>{q.q}</summary>
                  <p>{q.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="seo-cta">
            <h2 style={{ marginTop: 0 }}>Probeer {f.name} zelf</h2>
            <p>
              {f.plan === 'Gratis'
                ? 'Deze functie zit in het gratis plan. Maak een account aan en begin direct.'
                : `Deze functie is onderdeel van Pro (vanaf €${SITE.pricing.proMonthly.toFixed(2).replace('.', ',')} per maand). Probeer het ${SITE.pricing.trialDays} dagen gratis.`}
            </p>
            <Link href="/signup" className="seo-btn">Gratis account aanmaken</Link>
          </div>
        </article>

        {related.length > 0 && (
          <aside className="seo-prose" style={{ marginTop: 56 }}>
            <h2>Gerelateerde functies</h2>
            <div className="seo-cards">
              {related.map(r => (
                <Link key={r.slug} href={`/functies/${r.slug}`} className="seo-card">
                  <h3>{r.name}</h3>
                  <p>{r.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
