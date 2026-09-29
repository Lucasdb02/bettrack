import { notFound } from 'next/navigation';
import SportView from '../../components/SportView';
import { SPORT_PAGES, getSportPage } from '@/lib/sport-pages';
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
  return <SportView sport={s} />;
}
