'use client';
import { useState } from 'react';

/* Openbare, interactieve calculators voor /tools/[slug]. Puur rekenen in de browser. */

const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
const eur = (n) => Number.isFinite(n) ? `€${n.toFixed(2).replace('.', ',')}` : '–';
const pct = (n, d = 2) => Number.isFinite(n) ? `${(n * 100).toFixed(d).replace('.', ',')}%` : '–';
const fix = (n, d = 2) => Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '–';

function Field({ label, value, onChange, suffix, step = 'any', min, placeholder }) {
  return (
    <label className="calc-field">
      <span>{label}</span>
      <div className="calc-input-wrap">
        <input type="text" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} step={step} min={min} placeholder={placeholder} />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function Result({ label, value, strong, tone }) {
  return (
    <div className={`calc-result${strong ? ' is-strong' : ''}${tone ? ` is-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Shell({ title, children, results, note }) {
  return (
    <div className="calc-box" role="region" aria-label={title}>
      <p className="calc-title">{title}</p>
      <div className="calc-grid">{children}</div>
      <div className="calc-results">{results}</div>
      {note && <p className="calc-note">{note}</p>}
    </div>
  );
}

function OddsList({ odds, setOdds, min = 2, max = 5, label = 'Uitkomst' }) {
  return (
    <>
      {odds.map((o, i) => (
        <Field key={i} label={`${label} ${i + 1} (odds)`} value={o} onChange={v => setOdds(odds.map((x, j) => j === i ? v : x))} />
      ))}
      <div className="calc-actions">
        {odds.length < max && <button type="button" onClick={() => setOdds([...odds, ''])}>+ {label.toLowerCase()} toevoegen</button>}
        {odds.length > min && <button type="button" onClick={() => setOdds(odds.slice(0, -1))}>− verwijderen</button>}
      </div>
    </>
  );
}

/* ── Arbitrage ── */
function Arbitrage() {
  const [odds, setOdds] = useState(['2.10', '2.05']);
  const [stake, setStake] = useState('100');
  const o = odds.map(num);
  const s = num(stake);
  const valid = o.every(x => x > 1) && s > 0;
  const sum = valid ? o.reduce((a, x) => a + 1 / x, 0) : NaN;
  const stakes = valid ? o.map(x => s * (1 / x) / sum) : [];
  const ret = valid ? s / sum : NaN;
  const profit = ret - s;
  const isArb = valid && sum < 1;

  return (
    <Shell
      title="Arbitrage calculator"
      results={<>
        <Result label="Som impliciete kansen" value={pct(sum)} />
        <Result label={isArb ? 'Surebet: gegarandeerde winst' : 'Geen surebet: verlies'} value={valid ? `${eur(profit)} (${pct(profit / s)})` : '–'} strong tone={valid ? (isArb ? 'win' : 'loss') : undefined} />
        {stakes.map((st, i) => <Result key={i} label={`Inzet uitkomst ${i + 1}`} value={`${eur(st)} → ${eur(st * o[i])}`} />)}
      </>}
      note="Controleer altijd of de odds nog kloppen voordat je beide bets plaatst."
    >
      <OddsList odds={odds} setOdds={setOdds} max={3} />
      <Field label="Totale inzet" value={stake} onChange={setStake} suffix="€" />
    </Shell>
  );
}

/* ── Kelly ── */
function Kelly() {
  const [odds, setOdds] = useState('2.20');
  const [prob, setProb] = useState('50');
  const [bank, setBank] = useState('1000');
  const [frac, setFrac] = useState(0.5);
  const d = num(odds), p = num(prob) / 100, B = num(bank);
  const b = d - 1;
  const f = b > 0 && p > 0 && p < 1 ? (b * p - (1 - p)) / b : NaN;
  const fAdj = Number.isFinite(f) ? Math.max(0, f) * frac : NaN;

  return (
    <Shell
      title="Kelly criterion calculator"
      results={<>
        <Result label="Volledige Kelly" value={Number.isFinite(f) ? pct(Math.max(0, f)) : '–'} />
        <Result label={`Advies (${frac === 1 ? 'volledige' : frac === 0.5 ? 'halve' : 'kwart'} Kelly)`} value={Number.isFinite(fAdj) ? `${pct(fAdj)} = ${eur(fAdj * B)}` : '–'} strong tone={Number.isFinite(f) ? (f > 0 ? 'win' : 'loss') : undefined} />
        {Number.isFinite(f) && f <= 0 && <Result label="Conclusie" value="Geen value: niet inzetten" tone="loss" />}
      </>}
    >
      <Field label="Odds (decimaal)" value={odds} onChange={setOdds} />
      <Field label="Jouw winkans" value={prob} onChange={setProb} suffix="%" />
      <Field label="Bankroll" value={bank} onChange={setBank} suffix="€" />
      <div className="calc-field">
        <span>Kelly-fractie</span>
        <div className="calc-seg">
          {[[1, 'Volledig'], [0.5, 'Half'], [0.25, 'Kwart']].map(([v, l]) => (
            <button key={v} type="button" className={frac === v ? 'is-on' : ''} onClick={() => setFrac(v)}>{l}</button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ── Expected value ── */
function ExpectedValue() {
  const [odds, setOdds] = useState('2.20');
  const [prob, setProb] = useState('50');
  const [stake, setStake] = useState('10');
  const d = num(odds), p = num(prob) / 100, s = num(stake);
  const ok = d > 1 && p > 0 && p <= 1 && s > 0;
  const ev = ok ? p * (d - 1) * s - (1 - p) * s : NaN;
  const evPct = ok ? p * d - 1 : NaN;

  return (
    <Shell
      title="Expected value calculator"
      results={<>
        <Result label="Expected value" value={ok ? `${ev >= 0 ? '+' : ''}${eur(ev)}` : '–'} strong tone={ok ? (ev >= 0 ? 'win' : 'loss') : undefined} />
        <Result label="EV per euro inzet" value={ok ? `${evPct >= 0 ? '+' : ''}${pct(evPct)}` : '–'} />
        <Result label="Impliciete kans van de odds" value={d > 1 ? pct(1 / d) : '–'} />
        <Result label="Eerlijke odds bij jouw kans" value={p > 0 ? fix(1 / p) : '–'} />
      </>}
    >
      <Field label="Odds (decimaal)" value={odds} onChange={setOdds} />
      <Field label="Jouw winkans" value={prob} onChange={setProb} suffix="%" />
      <Field label="Inzet" value={stake} onChange={setStake} suffix="€" />
    </Shell>
  );
}

/* ── Vig / bookmakermarge ── */
function Vig() {
  const [odds, setOdds] = useState(['2.40', '3.30', '3.00']);
  const o = odds.map(num);
  const valid = o.every(x => x > 1);
  const sum = valid ? o.reduce((a, x) => a + 1 / x, 0) : NaN;

  return (
    <Shell
      title="Bookmakermarge (vig) calculator"
      results={<>
        <Result label="Overround" value={valid ? pct(sum - 1) : '–'} />
        <Result label="Marge van de bookmaker" value={valid ? pct(1 - 1 / sum) : '–'} strong />
        {valid && o.map((x, i) => (
          <Result key={i} label={`Uitkomst ${i + 1}: eerlijke kans / odds`} value={`${pct((1 / x) / sum, 1)} · ${fix(sum * x)}`} />
        ))}
      </>}
    >
      <OddsList odds={odds} setOdds={setOdds} max={4} />
    </Shell>
  );
}

/* ── Odds omrekenen ── */
function toDecimal(type, v) {
  if (type === 'dec') return num(v);
  if (type === 'frac') {
    const [a, b] = String(v).split('/').map(num);
    return b > 0 && a >= 0 ? a / b + 1 : NaN;
  }
  if (type === 'us') {
    const n = num(v);
    if (!Number.isFinite(n) || Math.abs(n) < 100) return NaN;
    return n > 0 ? n / 100 + 1 : 100 / Math.abs(n) + 1;
  }
  if (type === 'prob') {
    const p = num(v) / 100;
    return p > 0 && p < 1 ? 1 / p : NaN;
  }
  return NaN;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function toFraction(dec) {
  if (!(dec > 1)) return '–';
  const x = dec - 1;
  const den = 100;
  const n = Math.round(x * den);
  const g = gcd(n, den);
  return `${n / g}/${den / g}`;
}
function OddsConverter() {
  const [type, setType] = useState('dec');
  const [value, setValue] = useState('2.50');
  const d = toDecimal(type, value);
  const ok = d > 1;
  const us = ok ? (d >= 2 ? `+${Math.round((d - 1) * 100)}` : `${Math.round(-100 / (d - 1))}`) : '–';

  return (
    <Shell
      title="Odds converter"
      results={<>
        <Result label="Decimaal" value={ok ? fix(d, 3).replace(/0$/, '') : '–'} strong />
        <Result label="Fractioneel" value={toFraction(d)} />
        <Result label="Amerikaans" value={us} />
        <Result label="Impliciete kans" value={ok ? pct(1 / d, 1) : '–'} />
      </>}
    >
      <div className="calc-field">
        <span>Invoer</span>
        <div className="calc-seg">
          {[['dec', 'Decimaal'], ['frac', 'Fractioneel'], ['us', 'Amerikaans'], ['prob', 'Kans %']].map(([v, l]) => (
            <button key={v} type="button" className={type === v ? 'is-on' : ''} onClick={() => { setType(v); setValue(v === 'dec' ? '2.50' : v === 'frac' ? '3/2' : v === 'us' ? '+150' : '40'); }}>{l}</button>
          ))}
        </div>
      </div>
      <Field label="Odds" value={value} onChange={setValue} placeholder={type === 'frac' ? '3/2' : ''} />
    </Shell>
  );
}

/* ── Dutching ── */
function Dutching() {
  const [odds, setOdds] = useState(['4.00', '5.00', '8.00']);
  const [stake, setStake] = useState('50');
  const o = odds.map(num);
  const s = num(stake);
  const valid = o.every(x => x > 1) && s > 0;
  const sum = valid ? o.reduce((a, x) => a + 1 / x, 0) : NaN;
  const ret = valid ? s / sum : NaN;

  return (
    <Shell
      title="Dutching calculator"
      results={<>
        <Result label="Uitbetaling bij winst (elke selectie)" value={eur(ret)} />
        <Result label="Winst als een selectie wint" value={valid ? eur(ret - s) : '–'} strong tone={valid ? (ret > s ? 'win' : 'loss') : undefined} />
        {valid && o.map((x, i) => <Result key={i} label={`Inzet selectie ${i + 1}`} value={eur(s * (1 / x) / sum)} />)}
      </>}
      note="Wint geen van je selecties, dan verlies je je volledige inzet."
    >
      <OddsList odds={odds} setOdds={setOdds} max={6} label="Selectie" />
      <Field label="Totale inzet" value={stake} onChange={setStake} suffix="€" />
    </Shell>
  );
}

export const CALCULATORS = {
  arbitrage: Arbitrage,
  kelly: Kelly,
  ev: ExpectedValue,
  vig: Vig,
  odds: OddsConverter,
  dutching: Dutching,
};

export default function Calculator({ tool }) {
  const C = CALCULATORS[tool];
  return C ? <C /> : null;
}
