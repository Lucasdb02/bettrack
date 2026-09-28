import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import { BOOKMAKER_PAGES, getBookmakerPage } from '@/lib/bookmaker-pages';
import { getFeature } from '@/lib/features';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKMAKER_PAGES.map(b => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = getBookmakerPage(slug);
  if (!b) return {};
  return {
    title: b.metaTitle,
    description: b.description,
    alternates: { canonical: `/bookmaker/${b.slug}` },
    openGraph: { url: `${SITE.url}/bookmaker/${b.slug}`, title: b.metaTitle, description: b.description },
    twitter: { title: b.metaTitle, description: b.description },
  };
}

export default async function BookmakerPage({ params }) {
  const { slug } = await params;
  const b = getBookmakerPage(slug);
  if (!b) notFound();

  const related = [
    ...b.related.map(getFeature).filter(Boolean).map(r => ({ href: `/functies/${r.slug}`, name: r.name, description: r.description, tag: 'Functie' })),
    ...BOOKMAKER_PAGES.filter(x => x.slug !== b.slug).slice(0, 3).map(r => ({ href: `/bookmaker/${r.slug}`, name: `${r.name} bets bijhouden`, description: r.description, tag: 'Bookmaker' })),
  ];

  return (
    <ArticleView
      article={b}
      path={`/bookmaker/${b.slug}`}
      crumbs={[{ href: '/bookmaker', label: 'Bookmakers' }, { href: `/bookmaker/${b.slug}`, label: b.name }]}
      badge={`${b.name} bet tracker`}
      cta={{ title: `Houd je ${b.name} bets bij`, text: 'Gratis te starten. Importeer je bethistorie met een screenshot en zie direct je resultaat.' }}
      related={related}
    >
      {b.logo && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.logo} alt={`${b.name} logo`} width={28} height={28} style={{ borderRadius: 6, objectFit: 'contain', background: '#fff' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Onafhankelijke tracker, niet verbonden aan {b.name}</span>
        </div>
      )}
    </ArticleView>
  );
}
