import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import { SPORT_PAGES, getSportPage } from '@/lib/sport-pages';
import { getFeature } from '@/lib/features';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return SPORT_PAGES.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = getSportPage(slug);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.description,
    alternates: { canonical: `/bet-tracker/${s.slug}` },
    openGraph: { url: `${SITE.url}/bet-tracker/${s.slug}`, title: s.metaTitle, description: s.description },
    twitter: { title: s.metaTitle, description: s.description },
  };
}

export default async function SportPage({ params }) {
  const { slug } = await params;
  const s = getSportPage(slug);
  if (!s) notFound();

  const related = [
    ...s.related.map(getFeature).filter(Boolean).map(r => ({ href: `/functies/${r.slug}`, name: r.name, description: r.description, tag: 'Functie' })),
    ...SPORT_PAGES.filter(x => x.slug !== s.slug).slice(0, 3).map(r => ({ href: `/bet-tracker/${r.slug}`, name: r.name, description: r.description, tag: 'Sport' })),
  ];

  return (
    <ArticleView
      article={s}
      path={`/bet-tracker/${s.slug}`}
      crumbs={[{ href: '/bet-tracker', label: 'Bet tracker per sport' }, { href: `/bet-tracker/${s.slug}`, label: s.sport }]}
      badge={`${s.sport} bet tracker`}
      cta={{ title: `Begin met het bijhouden van je ${s.sport.toLowerCase()}bets`, text: 'Maak gratis een account aan en importeer je eerste bets met een screenshot.' }}
      related={related}
    />
  );
}
