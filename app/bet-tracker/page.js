import HubPage from '../components/HubPage';
import { SPORT_PAGES } from '@/lib/sport-pages';

export const metadata = {
  title: 'Bet tracker per sport',
  description: 'Houd je bets bij per sport: voetbal, tennis, basketbal, hockey, darts, Formule 1, wielrennen, snooker, American football en baseball.',
  alternates: { canonical: '/bet-tracker' },
};

export default function BetTrackerHub() {
  return (
    <HubPage
      path="/bet-tracker"
      crumb="Bet tracker per sport"
      title="Bet tracker per sport"
      intro="Elke sport heeft zijn eigen markten en valkuilen. Kies je sport en lees hoe je je bets bijhoudt en wat je statistieken je vertellen."
      tag="Bet tracker"
      items={SPORT_PAGES.map(s => ({ href: `/bet-tracker/${s.slug}`, name: s.name, description: s.description }))}
    />
  );
}
