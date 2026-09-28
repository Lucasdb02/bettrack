import { SITE } from '@/lib/site';
import { FEATURES } from '@/lib/features';
import { TOOLS, ARTICLES } from '@/lib/guides';
import { SPORT_PAGES } from '@/lib/sport-pages';
import { BOOKMAKER_PAGES } from '@/lib/bookmaker-pages';

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/functies`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...FEATURES.map(f => ({ url: `${SITE.url}/functies/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })),
    { url: `${SITE.url}/prijzen`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/gidsen`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...ARTICLES.map(g => ({ url: `${SITE.url}/gidsen/${g.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })),
    { url: `${SITE.url}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...TOOLS.map(t => ({ url: `${SITE.url}/tools/${t.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })),
    { url: `${SITE.url}/bet-tracker`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...SPORT_PAGES.map(p => ({ url: `${SITE.url}/bet-tracker/${p.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })),
    { url: `${SITE.url}/bookmaker`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...BOOKMAKER_PAGES.map(b => ({ url: `${SITE.url}/bookmaker/${b.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 })),
    { url: `${SITE.url}/over-ons`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE.url}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/voorwaarden`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
