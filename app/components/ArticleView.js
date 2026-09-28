import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import JsonLd from './JsonLd';
import { SITE } from '@/lib/site';

/* Gedeelde weergave voor functie-artikelen en gidsen.
   crumbs: [{ href, label }] zonder Home; de laatste is de huidige pagina. */
export default function ArticleView({ article, path, crumbs, badge, cta, related = [], children, softwareApp }) {
  const url = `${SITE.url}${path}`;
  const allCrumbs = [{ href: '/', label: 'Home' }, ...crumbs];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      inLanguage: 'nl-NL',
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/apple-touch-icon.png` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: allCrumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${SITE.url}${c.href === '/' ? '' : c.href}` })),
    },
    ...(softwareApp ? [{
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: softwareApp.name,
      url: softwareApp.url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'nl-NL',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    }] : []),
    ...(article.faq?.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    }] : []),
  ];

  return (
    <div className="seo-page">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="seo-wrap">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          {allCrumbs.map((c, i) => (
            i < allCrumbs.length - 1
              ? <span key={c.href} style={{ display: 'contents' }}><Link href={c.href}>{c.label}</Link><span>/</span></span>
              : <span key={c.href}>{c.label}</span>
          ))}
        </nav>

        <article className="seo-prose">
          {badge && <span className="seo-badge">{badge}</span>}
          <h1>{article.title}</h1>
          <p className="seo-intro">{article.intro}</p>
          {children}

          {article.sections.map(s => (
            <section key={s.h2}>
              <h2>{s.h2}</h2>
              {s.p?.map((p, i) => <p key={i}>{p}</p>)}
              {s.ul && <ul>{s.ul.map((li, i) => <li key={i}>{li}</li>)}</ul>}
              {s.after?.map((p, i) => <p key={`a${i}`}>{p}</p>)}
            </section>
          ))}

          {article.faq?.length > 0 && (
            <section>
              <h2>Veelgestelde vragen</h2>
              <div className="seo-faq">
                {article.faq.map(q => (
                  <details key={q.q}>
                    <summary>{q.q}</summary>
                    <p>{q.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {cta && (
            <div className="seo-cta">
              <h2 style={{ marginTop: 0 }}>{cta.title}</h2>
              <p>{cta.text}</p>
              <Link href={cta.href || '/signup'} className="seo-btn">{cta.button || 'Gratis account aanmaken'}</Link>
            </div>
          )}
        </article>

        {related.length > 0 && (
          <aside className="seo-prose" style={{ marginTop: 56 }}>
            <h2>Lees ook</h2>
            <div className="seo-cards">
              {related.map(r => (
                <Link key={r.href} href={r.href} className="seo-card">
                  {r.tag && <span>{r.tag}</span>}
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
