import { notFound } from 'next/navigation';
import ArticleView from '../../components/ArticleView';
import Calculator from '../../components/tools/Calculators';
import { TOOLS, getGuide, guideHref } from '@/lib/guides';
import { getFeature } from '@/lib/features';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = TOOLS.find(x => x.slug === slug);
  if (!t) return {};
  return {
    title: t.metaTitle,
    description: t.description,
    alternates: { canonical: `/tools/${t.slug}` },
    openGraph: { type: 'website', url: `${SITE.url}/tools/${t.slug}`, title: t.metaTitle, description: t.description },
    twitter: { title: t.metaTitle, description: t.description },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const t = TOOLS.find(x => x.slug === slug);
  if (!t) notFound();

  const related = [
    ...TOOLS.filter(x => x.slug !== t.slug).slice(0, 3).map(r => ({ href: guideHref(r), name: r.name, description: r.description, tag: 'Tool' })),
    ...t.relatedGuides.map(getGuide).filter(g => g && g.category === 'Gids').map(r => ({ href: guideHref(r), name: r.name, description: r.description, tag: 'Gids' })),
    ...t.relatedFeatures.map(getFeature).filter(Boolean).slice(0, 2).map(r => ({ href: `/functies/${r.slug}`, name: r.name, description: r.description, tag: 'Functie' })),
  ];

  return (
    <ArticleView
      article={t}
      path={`/tools/${t.slug}`}
      crumbs={[{ href: '/tools', label: 'Tools' }, { href: `/tools/${t.slug}`, label: t.name }]}
      badge="Gratis tool"
      cta={{ title: 'Houd ook je resultaten bij', text: 'Met TrackMijnBets zie je automatisch je winst, ROI en statistieken per sport, markt en bookmaker. Gratis te starten.' }}
      related={related}
      softwareApp={{ name: t.name, url: `${SITE.url}/tools/${t.slug}` }}
    >
      <Calculator tool={t.tool} />
    </ArticleView>
  );
}
