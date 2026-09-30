import Link from 'next/link';

/* Homepage: cijferblok met vertrouwens-pill, drie kleine en twee grote kaarten,
   verbonden met stippellijnen. Op mobiel onder elkaar zonder lijnen.

   CIJFERS: de bovenste rij gebruikt de cijfers uit de hero. De waarden met [..] in
   de grote kaarten zijn placeholders: vervang ze door echte, onderbouwde cijfers. */

const TOP = [
  { value: '2.400+', label: 'Actieve gebruikers', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { value: '€3.2M+', label: 'Aan bets bijgehouden', icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></> },
  { value: '94%', label: 'Tevreden bettors', icon: <><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></> },
];

const BIG = [
  {
    label: 'ROI-verbetering',
    icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
    value: <>+[x]% tot +[y]%</>,
    title: 'Hogere ROI na drie maanden bijhouden',
    text: 'Wie bijhoudt, ziet welke markten structureel verlies opleveren en stopt daarmee. De snelste weg naar een betere ROI.',
    badge: { text: 'Interne data', verified: true },
  },
  {
    label: 'Benchmark',
    icon: <><line x1="4" y1="20" x2="20" y2="20" /><line x1="7" y1="16" x2="7" y2="11" /><line x1="11" y1="16" x2="11" y2="6" /><line x1="15" y1="16" x2="15" y2="9" /><line x1="19" y1="16" x2="19" y2="13" /></>,
    value: <>[x]% <span className="ts-vs">vs</span> [y]%</>,
    title: 'Bettors die bijhouden vs. bettors die dat niet doen',
    text: 'Bettors die elke bet vastleggen, weten precies waar hun winst vandaan komt. Lees in onze gids hoe je daar zelf mee begint.',
    badge: { text: 'Lees de gids', href: '/gidsen/hoe-houd-je-je-bets-bij' },
  },
];

/* Layout voor de lijnen (desktop): horizontaal in %, verticaal in px */
const G = { pillH: 34, row1Top: 82, row1H: 84, row2Top: 224, row2H: 290 };
const X1 = [15.667, 50, 84.333];   // midden van de drie kleine kaarten (gap 3%)
const X2 = [24.25, 75.75];         // midden van de twee grote kaarten
const H = G.row2Top + G.row2H;

function Ico({ children }) {
  return (
    <span className="ts-ico" aria-hidden>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  );
}

export default function TrustStats({ dark = true }) {
  const dots = [
    ...X1.map(x => [x, G.row1Top]),
    [X2[0], G.row2Top], [X2[1], G.row2Top],
  ];
  const r1Bottom = G.row1Top + G.row1H;

  return (
    <section className={`ts ${dark ? 'ts-dark' : 'ts-light'}`}>
      <div className="ts-wrap" style={{ '--ts-h': `${H}px` }}>
        {/* Stippellijnen en bolletjes (alleen desktop) */}
        <svg className="ts-lines" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden>
          {X1.map(x => <line key={x} x1="50" y1={G.pillH} x2={x} y2={G.row1Top} />)}
          <line x1={X1[0]} y1={r1Bottom} x2={X2[0]} y2={G.row2Top} />
          <line x1={X1[2]} y1={r1Bottom} x2={X2[1]} y2={G.row2Top} />
          <line className="ts-dash" x1="48.5" y1={G.row2Top + G.row2H / 2} x2="51.5" y2={G.row2Top + G.row2H / 2} />
        </svg>
        {dots.map(([x, y]) => <span key={`${x}-${y}`} className="ts-dot" style={{ left: `${x}%`, top: y }} aria-hidden />)}

        <div className="ts-pill-row">
          <p className="ts-pill">
            <span className="ts-check" aria-hidden>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Vertrouwd door <b>2.400+</b> bettors in Nederland
          </p>
        </div>

        <div className="ts-row1">
          {TOP.map(t => (
            <div key={t.label} className="ts-card ts-small">
              <Ico>{t.icon}</Ico>
              <div>
                <p className="ts-num">{t.value}</p>
                <p className="ts-sub">{t.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ts-row2">
          {BIG.map(b => (
            <div key={b.label} className="ts-card ts-big">
              <div className="ts-big-head"><Ico>{b.icon}</Ico><span>{b.label}</span></div>
              <p className="ts-big-num">{b.value}</p>
              <h3 className="ts-big-title">{b.title}</h3>
              <p className="ts-big-text">{b.text}</p>
              {b.badge.href ? (
                <Link href={b.badge.href} className="ts-badge is-link">{b.badge.text}<span aria-hidden>↗</span></Link>
              ) : (
                <span className="ts-badge">
                  {b.badge.text}
                  {b.badge.verified && (
                    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path fill="#3b82f6" d="M12 1l2.6 2.2 3.4-.4.9 3.3 3 1.7-1.2 3.2 1.2 3.2-3 1.7-.9 3.3-3.4-.4L12 23l-2.6-2.2-3.4.4-.9-3.3-3-1.7L3.3 13 2.1 9.8l3-1.7.9-3.3 3.4.4z" /><polyline points="8 12.5 11 15.5 16.5 9.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
