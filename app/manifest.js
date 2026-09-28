import { SITE } from '@/lib/site';

export default function manifest() {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#04111f',
    theme_color: '#04111f',
    lang: 'nl-NL',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
