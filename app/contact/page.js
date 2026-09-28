import LegalPage from '../components/LegalPage';
import ContactForm from './ContactForm';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Contact',
  description: 'Vragen over TrackMijnBets, je abonnement of een idee voor een nieuwe functie? Neem contact met ons op via het formulier.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p className="seo-intro">Vragen over TrackMijnBets, je abonnement of een idee voor een nieuwe functie? Stuur ons een bericht, we reageren meestal binnen één werkdag.</p>
      <ContactForm />
      <h2>Bedrijfsgegevens</h2>
      <p>
        {SITE.company.name}<br />
        {SITE.company.street}<br />
        {SITE.company.postalCode} {SITE.company.city}<br />
        KvK {SITE.company.kvk} · Btw {SITE.company.vat}
      </p>
    </LegalPage>
  );
}
