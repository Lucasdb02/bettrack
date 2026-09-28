import Link from 'next/link';
import LegalPage from '../components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Over ons',
  description: 'TrackMijnBets is een onafhankelijke bet tracker voor Nederlandse sportwedders. Lees waarom we het hebben gebouwd en waar we voor staan.',
  alternates: { canonical: '/over-ons' },
};

export default function OverOnsPage() {
  return (
    <LegalPage title="Over TrackMijnBets">
      <p className="seo-intro">TrackMijnBets is gebouwd voor Nederlandse sportwedders die willen weten hoe ze er écht voor staan. Geen losse notities of spreadsheets meer, maar één overzicht van al je bets, bij al je bookmakers.</p>

      <h2>Waarom we TrackMijnBets hebben gebouwd</h2>
      <p>Bijna elke wedder denkt ongeveer quitte te spelen, tot hij zijn bets gaat bijhouden. Bestaande tools waren vaak Engelstalig, gericht op Amerikaanse bookmakers of kostten veel tijd om bij te houden. Daarom bouwden we een tracker in het Nederlands, met de bookmakers en markten die Nederlandse wedders gebruiken, en met AI die je bets uit een screenshot haalt.</p>

      <h2>Waar we voor staan</h2>
      <ul>
        <li><strong>Onafhankelijk:</strong> we zijn niet verbonden aan een bookmaker en verdienen niets aan jouw inzet.</li>
        <li><strong>Jouw data is van jou:</strong> we verkopen je gegevens niet en je exporteert je bets wanneer je wilt.</li>
        <li><strong>Geen toegang tot je bookmaker:</strong> we vragen nooit om je inloggegevens van een bookmaker.</li>
        <li><strong>Verantwoord wedden:</strong> inzicht in je resultaten helpt je om binnen je grenzen te blijven.</li>
      </ul>

      <h2>Wat je met TrackMijnBets kunt</h2>
      <p>Bekijk <Link href="/functies">alle functies</Link>, probeer onze <Link href="/tools">gratis betting calculators</Link> of lees de <Link href="/gidsen">gidsen</Link> over bets bijhouden, value betting en bankroll management.</p>

      <h2>Het bedrijf</h2>
      <p>TrackMijnBets is een dienst van {SITE.company.name}, {SITE.company.street}, {SITE.company.postalCode} {SITE.company.city}. KvK {SITE.company.kvk}. Vragen of ideeën? <Link href="/contact">Neem contact met ons op</Link>.</p>
    </LegalPage>
  );
}
