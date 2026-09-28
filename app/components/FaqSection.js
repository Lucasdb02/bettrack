'use client';
import { useState } from 'react';

/* FAQ in dezelfde stijl als de homepage (donker thema).
   Antwoorden blijven in de HTML (hidden) zodat zoekmachines ze kunnen lezen. */
export default function FaqSection({ items, title = 'Veelgestelde vragen', subtitle = 'Heb je een vraag? Wij hebben het antwoord.' }) {
  const [open, setOpen] = useState(0);
  if (!items?.length) return null;

  return (
    <section className="faq-section">
      <h2 className="faq-title">{title}</h2>
      {subtitle && <p className="faq-subtitle">{subtitle}</p>}
      <div className="faq-list">
        {items.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon" aria-hidden>{isOpen ? '×' : '+'}</span>
              </button>
              <p id={`faq-a-${i}`} className="faq-answer" hidden={!isOpen}>{faq.a}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
