import LegalPage from '../components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Algemene voorwaarden',
  description: 'De algemene voorwaarden van TrackMijnBets: over je account, abonnementen, proefperiode, opzeggen, aansprakelijkheid en verantwoord wedden.',
  alternates: { canonical: '/voorwaarden' },
};

export default function VoorwaardenPage() {
  return (
    <LegalPage title="Algemene voorwaarden" updated="28 september 2026">
      <p>Deze algemene voorwaarden gelden voor het gebruik van de website en app van TrackMijnBets ({SITE.url}). Door een account aan te maken, ga je akkoord met deze voorwaarden.</p>

      <h2>Wie zijn wij?</h2>
      <p>TrackMijnBets is een dienst van {SITE.company.name}, statutair gevestigd aan {SITE.company.street}, {SITE.company.postalCode} {SITE.company.city}, {SITE.company.country}. KvK-nummer {SITE.company.kvk}, btw-nummer {SITE.company.vat}.</p>

      <h2>1. De dienst</h2>
      <p>TrackMijnBets is een online tool waarmee je je sportweddenschappen kunt bijhouden en analyseren. TrackMijnBets is <strong>geen</strong> bookmaker of kansspelaanbieder: je kunt via TrackMijnBets geen weddenschappen plaatsen en we beheren geen geld van gebruikers.</p>

      <h2>2. Account</h2>
      <ul>
        <li>Je moet 18 jaar of ouder zijn om TrackMijnBets te gebruiken.</li>
        <li>Je bent verantwoordelijk voor het geheimhouden van je inloggegevens.</li>
        <li>Je voert zelf je gegevens in en bent verantwoordelijk voor de juistheid daarvan.</li>
      </ul>

      <h2>3. Abonnementen en proefperiode</h2>
      <ul>
        <li>Naast het gratis plan bieden we betaalde abonnementen aan (Pro en Elite), maandelijks of jaarlijks. De actuele prijzen staan op de website.</li>
        <li>Een betaald abonnement start met een gratis proefperiode van {SITE.pricing.trialDays} dagen. Zeg je niet op tijdens de proefperiode, dan wordt het abonnement daarna automatisch betaald.</li>
        <li>Abonnementen worden automatisch verlengd voor dezelfde periode, tenzij je opzegt.</li>
        <li>Betalingen verlopen via onze betaalprovider Stripe.</li>
      </ul>

      <h2>4. Opzeggen</h2>
      <p>Je kunt je abonnement op elk moment opzeggen via Abonnement beheren in de app. Na opzegging houd je toegang tot het einde van de lopende periode. Reeds betaalde periodes worden niet terugbetaald, tenzij de wet anders bepaalt.</p>

      <h2>5. Geen financieel of gokadvies</h2>
      <p>De statistieken, calculators, odds en uitleg op TrackMijnBets zijn uitsluitend informatief. Ze vormen geen financieel advies en geen garantie op winst. Beslissingen over je weddenschappen neem je zelf en op eigen risico.</p>

      <h2>6. Verantwoord wedden</h2>
      <p>Wedden brengt risico&apos;s met zich mee. Zet nooit meer in dan je kunt missen. Merk je dat je grip verliest op je gokgedrag? Kijk dan op <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer">loketkansspel.nl</a> voor hulp en informatie.</p>

      <h2>7. Beschikbaarheid</h2>
      <p>We doen ons best om TrackMijnBets altijd beschikbaar te houden, maar kunnen niet garanderen dat de dienst foutloos of zonder onderbrekingen werkt. Gegevens van derden, zoals odds, kunnen afwijken van de actuele gegevens bij een bookmaker.</p>

      <h2>8. Aansprakelijkheid</h2>
      <p>TrackMijnBets is niet aansprakelijk voor verliezen die voortvloeien uit weddenschappen of uit beslissingen op basis van informatie uit de dienst. Onze aansprakelijkheid is in alle gevallen beperkt tot het bedrag dat je in de twaalf maanden voorafgaand aan de schade aan ons hebt betaald.</p>

      <h2>9. Beëindiging</h2>
      <p>We kunnen een account opschorten of beëindigen bij misbruik van de dienst of overtreding van deze voorwaarden.</p>

      <h2>10. Wijzigingen</h2>
      <p>We kunnen deze voorwaarden wijzigen. Bij belangrijke wijzigingen informeren we je vooraf per e-mail of in de app.</p>

      <h2>11. Toepasselijk recht</h2>
      <p>Op deze voorwaarden is Nederlands recht van toepassing.</p>

      <h2>Contact</h2>
      <p>
        {SITE.company.name}<br />
        {SITE.company.street}<br />
        {SITE.company.postalCode} {SITE.company.city}<br />
        {SITE.company.country}<br />
        Telefoon: {SITE.company.phone}<br />
        KvK: {SITE.company.kvk} · Btw: {SITE.company.vat}
      </p>
      <p>Vragen? Mail naar <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </LegalPage>
  );
}
