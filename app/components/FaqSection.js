'use client';
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';

/* Geanimeerde FAQ voor de hele publieke site (homepage, prijzen, gidsen, sporten):
   kop en vragen komen gestaffeld in beeld, antwoorden klappen soepel open en het plusje
   morpht naar een min. Antwoorden blijven altijd in de HTML zodat zoekmachines ze lezen.
   Kleuren via CSS (.faq-*) zodat licht/donker vanzelf meegaat. */
const EASE = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE } },
};

function PlusMinus({ open }) {
  return (
    <span className="faq-icon" aria-hidden>
      <span className="faq-icon-bar is-h" />
      <motion.span
        className="faq-icon-bar is-v"
        initial={false}
        animate={{ rotate: open ? 180 : 90 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </span>
  );
}

export default function FaqSection({ items, title = 'Veelgestelde vragen', subtitle = 'Heb je een vraag? Wij hebben het antwoord.' }) {
  const [open, setOpen] = useState(0);
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
        <motion.h2 className="faq-title" variants={reveal}>{title}</motion.h2>
        {subtitle && <motion.p className="faq-subtitle" variants={reveal}>{subtitle}</motion.p>}
        <motion.div className="faq-list" variants={reveal} transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}>
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
                  <span>{faq.q}</span>
                  <PlusMinus open={isOpen} />
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
      </motion.section>
    </MotionConfig>
  );
}
