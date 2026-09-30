'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, MotionConfig } from 'framer-motion';

/* Geanimeerde FAQ voor de hele publieke site (homepage, prijzen, gidsen, tools, sporten, bookmakers).
   Titel en contactregel links, vragen als losse kaarten rechts (onder elkaar op smalle plekken).
   Kaarten komen gestaffeld in beeld, antwoorden klappen soepel open en het pijltje draait mee.
   Antwoorden blijven altijd in de HTML zodat zoekmachines ze lezen. Kleuren via CSS (.faq-*). */
const EASE = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE } },
};

/* Iconen met trefwoorden. Per sectie krijgt elke vraag het eerste passende icoon dat nog
   niet gebruikt is; past er niets (meer), dan het eerste vrije icoon uit de hele lijst.
   Zo komt binnen één FAQ-sectie elk icoon maar één keer voor. */
const ICONS = [
  { re: /screenshot|herken|importe|upload|scan/, d: <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></> },
  { re: /\bai\b|ai-|advies|slim/, d: <><path d="M12 3l1.9 5.8L20 10.5l-6.1 1.7L12 18l-1.9-5.8L4 10.5l6.1-1.7z" /><path d="M19 3v4" /><path d="M21 5h-4" /></> },
  { re: /veilig|data|privacy|legaal|risico|verwijder|inlog/, d: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { re: /gratis|prijs|betal|abonnement|\bpro\b|kost|opzeg|proef/, d: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></> },
  { re: /bookmaker|transactie|saldo/, d: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></> },
  { re: /export|csv|json|download/, d: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></> },
  { re: /maand|kalender|kleuren|hoe lang|periode|seizoen/, d: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { re: /roi|statistiek|dashboard|p&l|drawdown|presteer|resultaat|analyse/, d: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
  { re: /winst|rendement|groei|verbeter/, d: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></> },
  { re: /bereken|reken|kelly|marge|odds|unit|dutching|handicap|calculator|winkans|evens|-0\./, d: <><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="14" x2="8" y2="14.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="16" y1="14" x2="16" y2="14.01" /><line x1="8" y1="18" x2="8" y2="18.01" /><line x1="12" y1="18" x2="12" y2="18.01" /><line x1="16" y1="18" x2="16" y2="18.01" /></> },
  { re: /bankroll|inzet|budget|geld/, d: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></> },
  { re: /value|\bev\b|surebet|lijn|line|conclusie|strategie|doel/, d: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></> },
  { re: /bijhoud|bij te houden|houd .* bij|noteren|excel|invoer|handmatig/, d: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></> },
  { re: /apart|bekijk|ondergrond|ligt|type|tags|filter|markt/, d: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /> },
  { re: /niet start|terugtrek|opgave|verlenging|overtime|void|gebeurt|wat als/, d: <><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
  { re: /live|snel|direct|automatisch/, d: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
  { re: /wat is|wat zijn|betekent|uitleg/, d: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></> },
  { re: /tijd|wanneer|uur|minuut/, d: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
  { re: /tip|beginner|begin|leren/, d: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></> },
  { re: /combi|parlay|meerdere|accumulator/, d: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
  { re: /\bnba\b|voetbal|tennis|sport|wedstrijd|team/, d: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.7V17c0 .6-.5 1-1 1.2C7.8 18.8 7 20.2 7 22" /><path d="M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></> },
  { re: /account|profiel|gebruiker|delen/, d: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  { re: /gids|lees|artikel/, d: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
  { re: /\?/, d: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
];

/* Kies per vraag een uniek icoon binnen de sectie */
function pickIcons(items) {
  const used = new Set();
  return items.map(({ q }) => {
    const text = q.toLowerCase();
    let i = ICONS.findIndex((ic, n) => !used.has(n) && ic.re.test(text));
    if (i === -1) i = ICONS.findIndex((_, n) => !used.has(n));
    if (i === -1) i = ICONS.length - 1;
    used.add(i);
    return ICONS[i].d;
  });
}

function QuestionIcon({ icon }) {
  return (
    <svg className="faq-qicon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {icon}
    </svg>
  );
}

export default function FaqSection({ items, title = 'Veelgestelde vragen' }) {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;
  const icons = pickIcons(items);

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        className="faq-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
        transition={{ staggerChildren: 0.06 }}
      >
        <div className="faq-layout">
          <motion.div className="faq-intro" variants={reveal}>
            <h2 className="faq-title">{title}</h2>
            <p className="faq-subtitle">
              Staat je vraag er niet bij? Neem contact op met ons <Link href="/contact">supportteam</Link>.
            </p>
          </motion.div>

          <motion.div className="faq-list" variants={{ hidden: {}, show: {} }} transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}>
            {items.map((faq, i) => {
              const isOpen = open === i;
              return (
                <motion.div key={faq.q} className={`faq-item${isOpen ? ' is-open' : ''}`} variants={reveal}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <QuestionIcon icon={icons[i]} />
                    <span className="faq-qtext">{faq.q}</span>
                    <motion.svg
                      className="faq-chevron"
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
                      initial={false}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  </button>
                  <motion.div
                    id={`faq-a-${i}`}
                    className="faq-answer-wrap"
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    inert={!isOpen}
                  >
                    <motion.p
                      className="faq-answer"
                      initial={false}
                      animate={isOpen ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: -6, filter: 'blur(3px)' }}
                      transition={{ duration: isOpen ? 0.35 : 0.2, delay: isOpen ? 0.08 : 0, ease: EASE }}
                    >
                      {faq.a}
                    </motion.p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>
    </MotionConfig>
  );
}
