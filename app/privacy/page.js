import LegalPage from '../components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe TrackMijnBets omgaat met je persoonsgegevens: welke gegevens we verwerken, waarom, hoe lang we ze bewaren en welke rechten je hebt.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacybeleid" updated="28 september 2026">
      <p>TrackMijnBets respecteert je privacy. {SITE.company.name} is verantwoordelijk voor de verwerking van je gegevens. In dit privacybeleid lees je welke persoonsgegevens we verwerken wanneer je onze website en app gebruikt, waarom we dat doen en welke rechten je hebt. We verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).</p>

      <h2>Wie zijn wij?</h2>
      <p>TrackMijnBets is een dienst van {SITE.company.name}, statutair gevestigd aan {SITE.company.street}, {SITE.company.postalCode} {SITE.company.city}, {SITE.company.country}. KvK-nummer {SITE.company.kvk}, btw-nummer {SITE.company.vat}.</p>

      <h2>Welke gegevens verwerken we?</h2>
      <ul>
        <li><strong>Accountgegevens:</strong> je e-mailadres, (optioneel) je naam en een versleuteld wachtwoord.</li>
        <li><strong>Gegevens die je zelf invoert:</strong> je bets, bookmakers, saldo&apos;s, transacties, tags, notities en voorkeuren.</li>
        <li><strong>Screenshots:</strong> afbeeldingen die je uploadt om bets automatisch te laten herkennen. Deze worden alleen gebruikt om de bets uit te lezen.</li>
        <li><strong>Betaalgegevens:</strong> bij een betaald abonnement verwerkt onze betaalprovider je betaalgegevens. Wij ontvangen geen volledige kaart- of bankgegevens.</li>
        <li><strong>Technische gegevens:</strong> gegevens die nodig zijn om de dienst te laten werken, zoals je sessie en foutmeldingen.</li>
      </ul>

      <h2>Waarom verwerken we deze gegevens?</h2>
      <ul>
        <li>Om je account aan te maken en je toegang te geven tot de dienst (uitvoering van de overeenkomst).</li>
        <li>Om je bets, statistieken en overzichten te tonen (uitvoering van de overeenkomst).</li>
        <li>Om abonnementen en betalingen af te handelen (uitvoering van de overeenkomst en wettelijke verplichting).</li>
        <li>Om supportvragen te beantwoorden (gerechtvaardigd belang).</li>
        <li>Om de dienst veilig te houden en te verbeteren (gerechtvaardigd belang).</li>
      </ul>
      <p>We verkopen je gegevens nooit en delen ze niet met bookmakers.</p>

      <h2>Met wie delen we gegevens?</h2>
      <p>We werken met zorgvuldig gekozen dienstverleners die gegevens alleen in onze opdracht verwerken:</p>
      <ul>
        <li><strong>Supabase</strong>: database en inloggen</li>
        <li><strong>Vercel</strong>: hosting van de website en app</li>
        <li><strong>Stripe</strong>: afhandeling van betalingen en abonnementen</li>
        <li><strong>Anthropic</strong>: AI-herkenning van bets op geüploade screenshots</li>
        <li><strong>Resend</strong>: verzenden van e-mails, zoals supportberichten</li>
      </ul>
      <p>Sommige van deze partijen zijn gevestigd buiten de Europese Economische Ruimte. In dat geval zorgen we voor passende waarborgen, zoals de standaardcontractbepalingen van de Europese Commissie.</p>

      <h2>Hoe lang bewaren we gegevens?</h2>
      <p>We bewaren je gegevens zolang je een account hebt. Verwijder je je account, dan verwijderen we je persoonsgegevens, tenzij we ze langer moeten bewaren vanwege een wettelijke verplichting (bijvoorbeeld de fiscale bewaarplicht voor facturen).</p>

      <h2>Cookies</h2>
      <p>We gebruiken alleen functionele cookies en vergelijkbare technieken die nodig zijn om je ingelogd te houden en je voorkeuren (zoals lichte of donkere modus) te onthouden. We gebruiken geen tracking- of advertentiecookies.</p>

      <h2>Beveiliging</h2>
      <p>We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, zoals versleutelde verbindingen (HTTPS), versleutelde wachtwoorden en toegangsbeperking per gebruiker in onze database.</p>

      <h2>Jouw rechten</h2>
      <p>Je hebt het recht om je gegevens in te zien, te corrigeren, te laten verwijderen, over te dragen en bezwaar te maken tegen of een beperking te vragen van de verwerking. Een deel hiervan kun je zelf doen: via Mijn Account exporteer je je bets als CSV of JSON. Voor andere verzoeken mail je naar <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We reageren binnen een maand.</p>
      <p>Ben je het niet eens met hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>

      <h2>Contact</h2>
      <p>
        {SITE.company.name}<br />
        {SITE.company.street}<br />
        {SITE.company.postalCode} {SITE.company.city}<br />
        {SITE.company.country}<br />
        Telefoon: {SITE.company.phone}<br />
        KvK: {SITE.company.kvk} · Btw: {SITE.company.vat}
      </p>
      <p>Vragen over dit privacybeleid? Mail naar <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </LegalPage>
  );
}
