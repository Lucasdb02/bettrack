/* Homepage: bookmakers die van links en rechts langzaam naar het TrackMijnBets-icoon
   in het midden schuiven. Elke kant is een eigen band met een dubbele lijst logo's,
   zodat de animatie naadloos doorloopt; in het midden verdwijnen ze onder het icoon. */

const BOOKIES = [
  { name: 'Unibet',    src: 'https://www.surebetnl.com/unibet.png' },
  { name: 'bet365',    src: 'https://www.surebetnl.com/bet365.png' },
  { name: 'TOTO',      src: 'https://www.surebetnl.com/toto.png' },
  { name: 'BetCity',   src: 'https://www.surebetnl.com/betcity.png' },
  { name: "Jack's",    src: 'https://www.surebetnl.com/jacks.png' },
  { name: 'BetMGM',    src: 'https://www.surebetnl.com/betmgm.png' },
  { name: 'Circus',    src: 'https://www.surebetnl.com/circus.png' },
  { name: 'OneCasino', src: 'https://www.surebetnl.com/onecasino.png' },
  { name: '711',       src: 'https://www.surebetnl.com/711.png' },
  { name: 'Bingoal',   src: 'https://www.surebetnl.com/bingoal.png' },
  { name: '888sport',  src: 'https://www.surebetnl.com/888sport.png' },
];

/* Rechterkant begint halverwege de lijst, zodat links en rechts elkaar niet spiegelen */
const LEFT = BOOKIES;
const RIGHT = [...BOOKIES.slice(5), ...BOOKIES.slice(0, 5)];

function Track({ items, side }) {
  return (
    <div className={`bf-side bf-${side}`} aria-hidden>
      <div className="bf-track">
        {[...items, ...items].map((b, i) => (
          <span key={i} className="bf-bookie">
            <img src={b.src} alt="" draggable={false} loading="lazy" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BookmakerFlow({ dark = true }) {
  return (
    <section className={`bf ${dark ? 'ts-dark' : 'ts-light'}`}>
      <div className="bf-head">
        <h2 className="bf-title">Werkt met jouw favoriete bookmakers</h2>
        <p className="bf-text">
          Van Unibet tot bet365: al je bets van alle Nederlandse bookmakers samen op één plek.
        </p>
      </div>

      <div className="bf-stage">
        <Track items={LEFT} side="left" />
        <Track items={RIGHT} side="right" />

        <div className="bf-center">
          <div className="bf-logo">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="sr-only">TrackMijnBets</span>
          </div>
        </div>
      </div>

      <p className="sr-only">Ondersteunde bookmakers: {BOOKIES.map(b => b.name).join(', ')}</p>
    </section>
  );
}
