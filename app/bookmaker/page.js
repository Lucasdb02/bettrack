import HubPage from '../components/HubPage';
import { BOOKMAKER_PAGES } from '@/lib/bookmaker-pages';

export const metadata = {
  title: 'Bets bijhouden per bookmaker',
  description: 'Houd je bets bij per bookmaker, van TOTO, BetCity en bet365 tot Unibet, Holland Casino Online en 16 andere. Zie je winst en saldo per bookmaker.',
  alternates: { canonical: '/bookmaker' },
};

export default function BookmakerHub() {
  return (
    <HubPage
      path="/bookmaker"
      crumb="Bookmakers"
      title="Bets bijhouden per bookmaker"
      intro="Wed je bij meerdere bookmakers? Met TrackMijnBets zie je per bookmaker je winst, ROI en saldo. Kies je bookmaker en lees hoe je je bets daar bijhoudt."
      items={BOOKMAKER_PAGES.map(b => ({ href: `/bookmaker/${b.slug}`, name: b.name, description: b.description }))}
    />
  );
}
