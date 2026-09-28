/** @type {import('next').NextConfig} */
const CALCULATOR_SLUGS = [
  'arbitrage-calculator', 'kelly-criterion-calculator', 'expected-value-berekenen',
  'bookmaker-marge-berekenen', 'odds-omrekenen', 'dutching-calculator',
];

const nextConfig = {
  async redirects() {
    return [
      /* Calculators zijn verhuisd van /gidsen naar /tools (met werkende calculator) */
      ...CALCULATOR_SLUGS.map(slug => ({ source: `/gidsen/${slug}`, destination: `/tools/${slug}`, permanent: true })),
    ];
  },
};

export default nextConfig;
