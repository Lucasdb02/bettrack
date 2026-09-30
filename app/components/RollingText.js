/* Staggered rolling text (zoals motion.dev/ui/buttons): bij hover rolt elke letter omhoog en
   komt dezelfde letter van onderen terug, letter voor letter vertraagd.
   De hover zit op de ouder met className "roll-host". Tekst komt vertaald binnen; data-no-translate
   voorkomt dat de DOM-vertaler de losse letters probeert te vertalen. */
export default function RollingText({ text }) {
  return (
    <span className="roll-text" data-no-translate="">
      <span className="roll-sr">{text}</span>
      <span aria-hidden="true" className="roll-letters">
        {[...text].map((ch, i) => (
          <span key={i} className="roll-letter" style={{ '--i': i }}>
            <span>{ch === ' ' ? ' ' : ch}</span>
            <span>{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
