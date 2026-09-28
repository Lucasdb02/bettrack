import { SITE } from '@/lib/site';

const PRIVATE = [
  '/api/', '/auth/', '/dashboard', '/bets', '/statistieken', '/maandoverzicht', '/calculators',
  '/bookmakers', '/account', '/extension', '/asian-lines', '/odds-v2', '/pricing', '/support',
  '/admin', '/login', '/forgot-password', '/reset-password',
];

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
