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

/* Icoon per vraag op basis van trefwoorden; de eerste match wint */
const ICONS = [
  [/screenshot|\bai\b|herken|importe/, <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></>],
  [/veilig|data|privacy|legaal|risico|verwijder|inlog/, <path key="shield" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />],
  [/gratis|prijs|betal|abonnement|\bpro\b|kost|opzeg|proef/, <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>],
  [/bookmaker|transactie|saldo/, <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>],
  [/export|csv|json/, <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>],
  [/maand|kalender|kleuren|hoe lang/, <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>],
  [/roi|statistiek|winst|rendement|dashboard|p&l|drawdown|tags|value|\bev\b|surebet|presteer|conclusie|resultaat/, <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>],
  [/bereken|reken|kelly|marge|odds|unit|bankroll|dutching|handicap|lijn|line|calculator|winkans|evens|-0\./, <><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="14" x2="8" y2="14.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="16" y1="14" x2="16" y2="14.01" /><line x1="8" y1="18" x2="8" y2="18.01" /><line x1="12" y1="18" x2="12" y2="18.01" /><line x1="16" y1="18" x2="16" y2="18.01" /></>],
  [/bijhoud|bij te houden|houd .* bij|noteren|excel/, <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></>],
  [/apart|bekijk|ondergrond|ligt|type/, <polygon key="filter" points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />],
  [/niet start|terugtrek|opgave|verlenging|overtime|void|gebeurt|wat als/, <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>],
];
const HELP = <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>;

function QuestionIcon({ q }) {
  const text = q.toLowerCase();
  const icon = ICONS.find(([re]) => re.test(text))?.[1] ?? HELP;
  return (
    <svg className="faq-qicon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {icon}
    </svg>
  );
}

export default function FaqSection({ items, title = 'Veelgestelde vragen' }) {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;

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
                    <QuestionIcon q={faq.q} />
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
