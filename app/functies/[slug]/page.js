import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import { FEATURES, getFeature } from '@/lib/features';
import { GUIDES, guideHref } from '@/lib/guides';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) return {};
  return {
    title: f.metaTitle,
    description: f.description,
    alternates: { canonical: `/functies/${f.slug}` },
    openGraph: { type: 'article', url: `${SITE.url}/functies/${f.slug}`, title: f.metaTitle, description: f.description },
    twitter: { title: f.metaTitle, description: f.description },
  };
}

export default async function FeaturePage({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) notFound();

  const related = [
    ...f.related.map(getFeature).filter(Boolean).map(r => ({ href: `/functies/${r.slug}`, name: r.name, description: r.description, tag: 'Functie' })),
    ...GUIDES.filter(g => g.relatedFeatures.includes(f.slug)).slice(0, 3).map(g => ({ href: guideHref(g), name: g.name, description: g.description, tag: g.category === 'Calculator' ? 'Tool' : 'Gids' })),
  ];

  const price = SITE.pricing.proMonthly.toFixed(2).replace('.', ',');
  return (
    <ArticleView
      article={f}
      path={`/functies/${f.slug}`}
      crumbs={[{ href: '/functies', label: 'Functies' }, { href: `/functies/${f.slug}`, label: f.name }]}
      badge={f.plan === 'Gratis' ? 'Gratis beschikbaar' : `Onderdeel van ${f.plan}`}
      cta={{
        title: `Probeer ${f.name} zelf`,
        text: f.plan === 'Gratis'
          ? 'Deze functie zit in het gratis plan. Maak een account aan en begin direct.'
          : `Deze functie is onderdeel van Pro (vanaf €${price} per maand). Probeer het ${SITE.pricing.trialDays} dagen gratis.`,
      }}
      related={related}
    />
  );
}
