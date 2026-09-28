import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import { GUIDES, getGuide } from '@/lib/guides';
import { getFeature } from '@/lib/features';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.metaTitle,
    description: g.description,
    alternates: { canonical: `/gidsen/${g.slug}` },
    openGraph: { type: 'article', url: `${SITE.url}/gidsen/${g.slug}`, title: g.metaTitle, description: g.description },
    twitter: { title: g.metaTitle, description: g.description },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const related = [
    ...g.relatedGuides.map(getGuide).filter(Boolean).map(r => ({ href: `/gidsen/${r.slug}`, name: r.name, description: r.description, tag: r.category })),
    ...g.relatedFeatures.map(getFeature).filter(Boolean).map(r => ({ href: `/functies/${r.slug}`, name: r.name, description: r.description, tag: 'Functie' })),
  ];

  const isCalc = g.category === 'Calculator';
  return (
    <ArticleView
      article={g}
      path={`/gidsen/${g.slug}`}
      crumbs={[{ href: '/gidsen', label: 'Gidsen' }, { href: `/gidsen/${g.slug}`, label: g.name }]}
      badge={isCalc ? 'Calculator uitgelegd' : 'Gids'}
      cta={isCalc
        ? { title: `Gebruik de ${g.name.toLowerCase()} in TrackMijnBets`, text: `Alle zes calculators zitten in Pro. Probeer het ${SITE.pricing.trialDays} dagen gratis en reken direct met je eigen odds.`, button: 'Probeer Pro gratis' }
        : { title: 'Houd je bets automatisch bij', text: 'TrackMijnBets berekent je winst, ROI en statistieken automatisch. Gratis te starten.' }}
      related={related}
    />
  );
}
