import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import BookmakerIcon from '../../components/BookmakerIcon';
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
      badgeAside={(
        <span className="seo-badge-note">
          <BookmakerIcon naam={b.name} size={14} />
          Onafhankelijke tracker, niet verbonden aan {b.name}
        </span>
      )}
      related={related}
    />
  );
}
