import { SITE } from '@/lib/site';
import { FEATURES } from '@/lib/features';
import { GUIDES } from '@/lib/guides';

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/functies`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...FEATURES.map(f => ({ url: `${SITE.url}/functies/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })),
    { url: `${SITE.url}/prijzen`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/gidsen`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...GUIDES.map(g => ({ url: `${SITE.url}/gidsen/${g.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })),
    { url: `${SITE.url}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/voorwaarden`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
