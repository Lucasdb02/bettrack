import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import JsonLd from './JsonLd';
import FaqSection from './FaqSection';
import BookmakerIcon from './BookmakerIcon';
import { SPORT_PAGES } from '@/lib/sport-pages';
import { BOOKMAKER_PAGES } from '@/lib/bookmaker-pages';
import { SITE } from '@/lib/site';

/* Pagina per sport (/bet-tracker/[slug]): hoofdkolom met markten, statistieken,
   stappenplan, tips en FAQ; zijbalk met CTA, andere sporten en bookmakers. */

const STEPS = [
  { emoji: '📸', title: 'Leg elke bet vast', text: 'Voer je bets in een paar seconden in, of upload een screenshot van je betslip en laat de AI alles invullen.' },
  { emoji: '📊', title: 'Zie je echte ROI', text: 'Je dashboard toont je winst en ROI per markt, bookmaker, tag en periode. Geen spreadsheet nodig.' },
  { emoji: '🔍', title: 'Vind je voorsprong', text: 'Zie op welke markten je winst maakt en waar je verliest, zodat je meer doet van wat werkt.' },
];


export default function SportView({ sport: s }) {
  const path = `/bet-tracker/${s.slug}`;
  const url = `${SITE.url}${path}`;
  const lower = s.sport.toLowerCase();

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: s.metaTitle,
      description: s.description,
      inLanguage: 'nl-NL',
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/apple-touch-icon.png` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Bet tracker per sport', item: `${SITE.url}/bet-tracker` },
        { '@type': 'ListItem', position: 3, name: s.sport, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: s.faq.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    },
  ];

  return (
    <div className="seo-page">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="seo-wrap">
        <nav className="seo-crumbs" aria-label="Kruimelpad">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/bet-tracker">Bet tracker per sport</Link><span>/</span>
          <span>{s.sport}</span>
        </nav>

        <div className="sport-layout">
          <article className="seo-prose sport-main">
            <header>
              <h1 className="sport-title"><span aria-hidden>{s.emoji}</span>{s.title}</h1>
              <p className="seo-intro">{s.intro}</p>
              <div className="sport-actions">
                <Link href="/signup" className="seo-btn">Gratis beginnen</Link>
                <Link href="/functies/bets-importeren-met-ai" className="sport-btn-ghost">📸 Importeren met een screenshot</Link>
              </div>
            </header>

            <section>
              <h2>{s.sport}markten om bij te houden</h2>
              <p className="sport-lead">Elke markt heeft zijn eigen dynamiek. Houd ze allemaal op één plek bij en zie welke markten jou echt winst opleveren.</p>
              <div className="sport-grid">
                {s.betTypes.map(b => (
                  <div key={b.name} className="sport-tile">
                    <h3><span aria-hidden>{b.emoji}</span>{b.name}</h3>
                    <p>{b.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>Belangrijke statistieken voor {lower}</h2>
              <p className="sport-lead">Deze cijfers gaan verder dan gewonnen of verloren en laten zien waar je voorsprong echt zit.</p>
              <div className="sport-grid">
                {s.metrics.map(m => (
                  <div key={m.name} className="sport-tile is-metric">
                    <h3><span aria-hidden>{m.emoji}</span>{m.name}</h3>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="sport-steps">
              <h2>Zo houd je je {lower}bets bij met TrackMijnBets</h2>
              <ol>
                {STEPS.map((st, i) => (
                  <li key={st.title}>
                    <div className="sport-step-head"><span className="sport-step-num">{i + 1}</span><span aria-hidden>{st.emoji}</span></div>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </li>
                ))}
              </ol>
              <Link href="/signup" className="seo-btn">Houd je {lower}bets gratis bij</Link>
            </section>

            <section>
              <h2>Strategietips voor {lower}</h2>
              <p className="sport-lead">Je bets bijhouden verandert hoe je wedt. Dit is wat de cijfers laten zien.</p>
              <div className="sport-tips">
                {s.tips.map(t => (
                  <div key={t.title} className="sport-tip">
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <FaqSection items={s.faq} title={`Veelgestelde vragen over ${lower}bets`} />

            <div className="seo-cta sport-cta">
              <span className="sport-hero-emoji" aria-hidden>{s.emoji}</span>
              <h2 style={{ marginTop: 0 }}>Klaar om je {lower}bets bij te houden?</h2>
              <p>Maak gratis een account aan, importeer je eerste bets met een screenshot en zie direct waar je winst maakt.</p>
              <div className="sport-actions" style={{ justifyContent: 'center' }}>
                <Link href="/signup" className="seo-btn">Gratis account aanmaken</Link>
                <Link href="/tools" className="sport-btn-ghost">🧮 Gratis tools bekijken</Link>
              </div>
            </div>
          </article>

          <aside className="sport-side" aria-label="Meer">
            <p className="sport-side-title" style={{ marginTop: 0 }}>Andere sporten</p>
            <nav className="sport-links">
              {SPORT_PAGES.filter(x => x.slug !== s.slug).map(x => (
                <Link key={x.slug} href={`/bet-tracker/${x.slug}`}><span aria-hidden>{x.emoji}</span>{x.name}<i aria-hidden>›</i></Link>
              ))}
              <Link href="/bet-tracker" className="is-all">Alle sporten<i aria-hidden>→</i></Link>
            </nav>

            <p className="sport-side-title">Populaire bookmakers</p>
            <nav className="sport-links">
              {BOOKMAKER_PAGES.slice(0, 8).map(b => (
                <Link key={b.slug} href={`/bookmaker/${b.slug}`}><BookmakerIcon naam={b.name} size={16} />{b.name}<i aria-hidden>›</i></Link>
              ))}
              <Link href="/bookmaker" className="is-all">Alle bookmakers<i aria-hidden>→</i></Link>
            </nav>

            <Link href="/tools" className="sport-box sport-box-link">
              <p className="sport-box-title">🧮 Gratis wedtools</p>
              <p className="sport-box-text">Odds omrekenen, Kelly-calculator, expected value en meer.</p>
              <span>Alle tools →</span>
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
