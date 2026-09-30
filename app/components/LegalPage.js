import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function LegalPage({ title, updated, children }) {
  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-wrap">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span><span>{title}</span>
        </nav>
        <article className="seo-prose">
          <h1>{title}</h1>
          {updated && <p className="seo-updated">Laatst bijgewerkt: {updated}</p>}
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
