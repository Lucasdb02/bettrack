'use client';
import { Fragment, useRef } from 'react';
import BookmakerIcon from './BookmakerIcon';

/* "Hoe het werkt" op de homepage: grote kop met gemarkeerde woorden, handgeschreven hint
   en een versleepbare tijdlijn met stapkaarten (elk met een mini-mockup van de app). */

const GREEN = '#16a34a';

function Icon({ d, dark }) {
  return (
    <span style={{ width: 32, height: 32, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: dark ? 'rgba(34,197,94,0.14)' : '#e8f7ee', color: dark ? '#4ade80' : GREEN, flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
    </span>
  );
}

/* ── Mini-mockups ── */
function useMock(dark) {
  return {
    line:  dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
    field: dark ? 'rgba(255,255,255,0.04)' : '#fff',
    text:  dark ? 'rgba(255,255,255,0.8)' : '#0f172a',
    muted: dark ? 'rgba(255,255,255,0.45)' : '#64748b',
  };
}

function MockImport({ dark }) {
  const m = useMock(dark);
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>● Screenshot van je betslip</div>
      <div style={{ border: `1px dashed ${m.line}`, borderRadius: 6, padding: '10px 8px', textAlign: 'center', color: m.muted, marginBottom: 8 }}>📸 betslip_bet365.png</div>
      <div style={{ color: GREEN, fontWeight: 600, marginBottom: 6 }}>✓ 3 bets herkend</div>
      {[['Ajax – PSV', '1X2 · Ajax', '2.10'], ['Man City – Arsenal', 'Over 2.5', '1.72']].map(r => (
        <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', border: `1px solid ${m.line}`, background: m.field, borderRadius: 5, padding: '5px 7px', marginBottom: 4 }}>
          <span><b style={{ fontWeight: 600 }}>{r[0]}</b><br /><span style={{ color: m.muted }}>{r[1]}</span></span>
          <b style={{ alignSelf: 'center' }}>{r[2]}</b>
        </div>
      ))}
      <div style={{ background: dark ? '#fff' : '#0f172a', color: dark ? '#0f172a' : '#fff', textAlign: 'center', borderRadius: 5, padding: '5px 0', fontWeight: 600, marginTop: 6 }}>Opslaan</div>
    </div>
  );
}

function MockForm({ dark }) {
  const m = useMock(dark);
  return (
    <div style={{ fontSize: 9.5, color: m.text, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {[['Sport', '⚽ Voetbal'], ['Bookmaker', 'TOTO'], ['Markt', 'BTTS'], ['Selectie', 'Ja'], ['Odds', '1.85'], ['Inzet', '€ 20,00']].map(([l, v]) => (
        <div key={l}>
          <div style={{ color: m.muted, marginBottom: 2 }}>{l}</div>
          <div style={{ border: `1px solid ${m.line}`, background: m.field, borderRadius: 5, padding: '5px 7px', fontWeight: 500 }}>{v}</div>
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '6px 8px', borderRadius: 6, background: dark ? 'rgba(34,197,94,0.12)' : '#e8f7ee', color: GREEN, fontWeight: 600 }}>
        <span>Mogelijke winst</span><span>€ 17,00</span>
      </div>
    </div>
  );
}

function MockBookmakers({ dark }) {
  const m = useMock(dark);
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Mijn bookmakers</div>
      {[['TOTO', '€ 312,40'], ['BetCity', '€ 148,00'], ['bet365', '€ 96,75'], ["Jack's", '€ 55,20']].map(([n, s]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${m.line}`, background: m.field, borderRadius: 5, padding: '5px 7px', marginBottom: 4 }}>
          <BookmakerIcon naam={n} size={12} />
          <span style={{ flex: 1, fontWeight: 500 }}>{n}</span>
          <b>{s}</b>
        </div>
      ))}
      <div style={{ textAlign: 'center', color: m.muted, marginTop: 6 }}>+ Bookmaker toevoegen</div>
    </div>
  );
}

function MockUpdate({ dark }) {
  const m = useMock(dark);
  const btn = (bg, fg, t) => <span style={{ background: bg, color: fg, borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>{t}</span>;
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      {[['Feyenoord – AZ', 'Over 2.5 · 1.90', 'open'], ['Djokovic – Sinner', 'Winnaar · 2.30', 'won'], ['NBA: Lakers – Celtics', '+4.5 · 1.91', 'lost']].map(([w, s, st]) => (
        <div key={w} style={{ border: `1px solid ${m.line}`, background: m.field, borderRadius: 6, padding: '6px 8px', marginBottom: 5 }}>
          <div style={{ fontWeight: 600 }}>{w}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <span style={{ color: m.muted }}>{s}</span>
            {st === 'open' && <span style={{ display: 'flex', gap: 3 }}>{btn('rgba(34,197,94,0.15)', GREEN, '✓')}{btn('rgba(239,68,68,0.15)', '#dc2626', '✕')}</span>}
            {st === 'won' && btn('rgba(34,197,94,0.15)', GREEN, '+ € 26,00')}
            {st === 'lost' && btn('rgba(239,68,68,0.15)', '#dc2626', '− € 20,00')}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockChart({ dark }) {
  const m = useMock(dark);
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 8 }}>
        {[['Winst', '+€ 232', GREEN], ['ROI', '+8,4%', GREEN], ['Win rate', '56%', m.text]].map(([l, v, c]) => (
          <div key={l} style={{ border: `1px solid ${m.line}`, background: m.field, borderRadius: 5, padding: '5px 6px' }}>
            <div style={{ color: m.muted }}>{l}</div><b style={{ color: c, fontSize: 11 }}>{v}</b>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 200 70" width="100%" height="70" aria-hidden>
        <defs><linearGradient id="hiw-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5469d4" stopOpacity="0.35" /><stop offset="1" stopColor="#5469d4" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 60 L20 55 L40 58 L60 45 L80 48 L100 35 L120 38 L140 25 L160 28 L180 14 L200 10 L200 70 L0 70 Z" fill="url(#hiw-g)" />
        <path d="M0 60 L20 55 L40 58 L60 45 L80 48 L100 35 L120 38 L140 25 L160 28 L180 14 L200 10" fill="none" stroke="#5469d4" strokeWidth="2" />
      </svg>
    </div>
  );
}

function MockCalendar({ dark }) {
  const m = useMock(dark);
  const days = [1, 0, -1, 1, 1, 0, 0, -1, 1, 1, -1, 0, 1, 1, 1, -1, 0, 1, -1, 1, 1, 0, 1, -1, 1, 1, 0, 1];
  const col = v => v > 0 ? (dark ? 'rgba(34,197,94,0.35)' : '#bbf0cf') : v < 0 ? (dark ? 'rgba(239,68,68,0.3)' : '#fcd0d0') : m.field;
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 6 }}><span>September</span><span style={{ color: GREEN }}>+€ 84,50</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map((v, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: col(v), border: `1px solid ${m.line}`, fontSize: 7, color: m.muted, padding: 1 }}>{i + 1}</div>)}
      </div>
    </div>
  );
}

function MockEdge({ dark }) {
  const m = useMock(dark);
  return (
    <div style={{ fontSize: 9.5, color: m.text }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>ROI per markt</div>
      {[['Enkel · 1X2', 14], ['Over/Under', 9], ['Asian handicap', 6], ['Betbuilders', -11], ['Combi\'s', -18]].map(([n, v]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 30px', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ color: m.muted }}>{n}</span>
          <span style={{ height: 7, borderRadius: 4, background: m.line, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 0, bottom: 0, left: v >= 0 ? '50%' : `${50 + v * 2}%`, width: `${Math.abs(v) * 2}%`, borderRadius: 4, background: v >= 0 ? '#22c55e' : '#ef4444' }} />
          </span>
          <b style={{ color: v >= 0 ? GREEN : '#dc2626', textAlign: 'right' }}>{v > 0 ? '+' : ''}{v}%</b>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  { title: 'Importeer met AI', text: 'Upload een screenshot van je betslip. De AI herkent wedstrijd, markt, odds en inzet en vult alles voor je in.', mock: MockImport,
    icon: <><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M19 15l.8 1.9 1.9.8-1.9.8L19 20.4l-.8-1.9-1.9-.8 1.9-.8z" /></> },
  { title: 'Of voer handmatig in', text: 'Sport, markt, selectie, odds en inzet in een paar seconden. Je ziet direct je mogelijke winst.', mock: MockForm,
    icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></> },
  { title: 'Al je bookmakers', text: 'Koppel al je bookmakers en zie per account je saldo, stortingen en opnames op één plek.', mock: MockBookmakers,
    icon: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 12h2" /><path d="M3 10h18" /></> },
  { title: 'Update met één klik', text: 'Is de wedstrijd klaar? Zet je bet op gewonnen of verloren en je winst of verlies wordt automatisch berekend.', mock: MockUpdate,
    icon: <><polyline points="20 6 9 17 4 12" /></> },
  { title: 'Dashboard en statistieken', text: 'Winst, ROI en win rate in één oogopslag, met je resultaat over tijd in een grafiek.', mock: MockChart,
    icon: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></> },
  { title: 'Maandoverzicht', text: 'Een kalender met je resultaat per dag. Zie in één blik je goede en slechte weken.', mock: MockCalendar,
    icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { title: 'Vind je voorsprong', text: 'Zie per markt, sport en bookmaker waar je winst maakt en waar je verliest. Doe meer van wat werkt.', mock: MockEdge,
    icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></> },
];

export default function HowItWorks({ dark = true }) {
  const track = useRef(null);
  const drag = useRef(null);

  const bg     = dark ? '#060e1a' : '#f6f7f9';
  const dot    = dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.09)';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1  = dark ? '#fff' : '#0b0f19';
  const text2  = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const pillBg = dark ? '#fff' : '#0b0f19';
  const pillFg = dark ? '#0b0f19' : '#fff';
  const cardBg = dark ? '#0d1a2e' : '#fff';
  const cardBd = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)';
  const dash   = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.22)';
  const mockBg = dark ? 'rgba(255,255,255,0.02)' : '#fafbfc';

  const Pill = ({ children }) => (
    <span style={{ background: pillBg, color: pillFg, borderRadius: 14, padding: '0 14px', display: 'inline-block', lineHeight: 1.15, margin: '4px 0' }}>{children}</span>
  );

  /* Slepen met de muis; touch en trackpad scrollen gewoon horizontaal */
  const onDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft };
    track.current.style.cursor = 'grabbing';
  };
  const onMove = (e) => {
    if (!drag.current) return;
    track.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const onUp = () => {
    drag.current = null;
    if (track.current) track.current.style.cursor = 'grab';
  };

  return (
    <section id="hoe-het-werkt" className="hiw" style={{
      backgroundColor: bg, borderTop: `1px solid ${border}`, padding: '96px 0 104px',
      backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`, backgroundSize: '22px 22px',
      transition: 'background-color 0.3s ease', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 className="hiw-title" style={{ fontSize: 56, fontWeight: 800, color: text1, letterSpacing: '-0.035em', lineHeight: 1.12, margin: 0 }}>
          Alles wat je nodig hebt om je bets te <Pill>bijhouden</Pill>, <Pill>analyseren</Pill> en <Pill>verbeteren</Pill>
        </h2>
        <p style={{ fontSize: 17, color: text2, marginTop: 22 }}>
          AI-import, handmatig invoeren, al je bookmakers, statistieken en je maandoverzicht, allemaal in TrackMijnBets.
        </p>
        <div aria-hidden style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block', transform: 'rotate(-2deg)' }}>
            <span className="hiw-hand" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontVariationSettings: "'opsz' 96", letterSpacing: '-0.01em', fontSize: 30, lineHeight: '36px', color: dark ? '#fcfcfc' : '#050505' }}>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Sleep om
                <svg viewBox="0 0 90 12" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -7, width: '100%', height: 10 }}>
                  <path d="M2 8 C 22 3, 50 3, 88 6" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>{' '}de tijdlijn te verkennen
            </span>
            <svg viewBox="0 0 90 60" fill="none" stroke={text1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hiw-hand-arrow" style={{ position: 'absolute', right: -96, top: '50%', width: 90, height: 48, transform: 'translateY(-50%)' }}>
              <path d="M4 14 C 30 2, 62 6, 78 36" />
              <path d="M70 32 L78 38 L82 28" />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className="hiw-track"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{ marginTop: 56, overflowX: 'auto', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', scrollbarWidth: 'none', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)' }}
      >
        <ol style={{ position: 'relative', display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: '28px max(24px, calc((100vw - 1240px) / 2))', width: 'max-content' }}>
          {STEPS.map((s, i) => {
            const Mock = s.mock;
            return (
              <Fragment key={s.title}>
              {i > 0 && (
                /* Streepjeslijn alleen tussen de kaarten */
                <li aria-hidden style={{ width: 56, height: 2, flexShrink: 0, backgroundImage: `repeating-linear-gradient(90deg, ${dash} 0 6px, transparent 6px 12px)` }} />
              )}
              <li style={{ position: 'relative', width: 250, height: 364, boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0, background: cardBg, border: `1px solid ${cardBd}`, borderRadius: 16, padding: 16, boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 6px 24px rgba(15,23,42,0.06)' }}>
                <Icon d={s.icon} dark={dark} />
                <div style={{ marginTop: 12, height: 150, overflow: 'hidden', borderRadius: 10, background: mockBg, padding: '10px 10px 0', WebkitMaskImage: 'linear-gradient(180deg, #000 78%, transparent)', maskImage: 'linear-gradient(180deg, #000 78%, transparent)' }}>
                  <Mock dark={dark} />
                </div>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: text1, margin: '14px 0 6px', letterSpacing: '-0.01em' }}>{i + 1}. {s.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: text2, margin: 0 }}>{s.text}</p>
              </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
