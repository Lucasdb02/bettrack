'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const iStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
  borderRadius: 7, fontSize: 14, color: 'var(--text-1)',
  backgroundColor: 'var(--bg-input)', transition: 'border-color 0.15s', outline: 'none',
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value, sub, highlight, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{label}</span>
        {sub && <p style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 15, fontWeight: bold ? 700 : 600, color: highlight || 'var(--text-1)' }}>{value}</span>
    </div>
  );
}

const DEFAULT_SELECTIONS = [
  { label: 'Selectie 1', odds: '2.50' },
  { label: 'Selectie 2', odds: '3.00' },
  { label: 'Selectie 3', odds: '' },
  { label: 'Selectie 4', odds: '' },
  { label: 'Selectie 5', odds: '' },
  { label: 'Selectie 6', odds: '' },
];

export default function DutchingPage() {
  const { dark } = useTheme();
  const [totalInzet, setTotalInzet] = useState('100');
  const [selections, setSelections] = useState(DEFAULT_SELECTIONS);

  const result = useMemo(() => {
    const active = selections
      .map((s, i) => ({ ...s, idx: i, oddsNum: parseFloat(s.odds) }))
      .filter(s => s.oddsNum > 1);

    if (active.length < 2) return null;

    const S = parseFloat(totalInzet) || 100;
    // Each selection's implied prob
    const impliedProbs = active.map(s => 1 / s.oddsNum);
    const totalImpl = impliedProbs.reduce((a, b) => a + b, 0);

    // Stakes proportional to implied prob so payout is equal
    const stakes = active.map(s => (S * (1 / s.oddsNum)) / totalImpl);
    const targetPayout = stakes[0] * active[0].oddsNum;
    const profit = targetPayout - S;
    const roi = (profit / S) * 100;

    return { active, stakes, totalImpl, targetPayout, profit, roi };
  }, [selections, totalInzet]);

  function updateOdds(idx, val) {
    setSelections(prev => prev.map((s, i) => i === idx ? { ...s, odds: val } : s));
  }

  function updateLabel(idx, val) {
    setSelections(prev => prev.map((s, i) => i === idx ? { ...s, label: val } : s));
  }

  function reset() {
    setSelections(DEFAULT_SELECTIONS);
    setTotalInzet('100');
  }

  return (
    <div className="app-page" style={{ padding: '24px' }}>
      <div className="mb-7">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Dutching Calculator</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Spreid je inzet over meerdere selecties voor een gelijke winst bij elke uitkomst.</p>
      </div>

      <div className="calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Inputs */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoer</h2>
            <button onClick={reset} style={{ fontSize: 12, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>Reset</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Totale inzet (€)" hint="Bedrag te verdelen over alle selecties">
              <input
                type="number" step="1" min="1" placeholder="100"
                value={totalInzet} onChange={e => setTotalInzet(e.target.value)}
                style={iStyle}
              />
            </Field>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Selecties (min. 2, max. 6)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selections.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8, alignItems: 'end' }}>
                    <Field label={i === 0 ? 'Omschrijving' : undefined}>
                      <input
                        type="text"
                        placeholder={`Selectie ${i + 1}`}
                        value={s.label}
                        onChange={e => updateLabel(i, e.target.value)}
                        style={iStyle}
                      />
                    </Field>
                    <Field label={i === 0 ? 'Odds' : undefined}>
                      <input
                        type="number" step="0.01" min="1.01"
                        placeholder="—"
                        value={s.odds}
                        onChange={e => updateOdds(i, e.target.value)}
                        style={iStyle}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultaat</h2>

          {!result ? (
            <p style={{ color: 'var(--text-4)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>Voer minimaal 2 odds in om te berekenen.</p>
          ) : (
            <>
              {/* Per-selection stakes */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Inzet per selectie</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {result.active.map((s, i) => (
                    <div key={s.idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 12px',
                      background: i % 2 === 0 ? 'var(--bg-subtle)' : 'transparent',
                      borderRadius: 7,
                    }}>
                      <div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-2)' }}>{s.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 8 }}>@ {parseFloat(s.odds).toFixed(2)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>€{result.stakes[i].toFixed(2)}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-4)', marginLeft: 6 }}>
                          ({((result.stakes[i] / parseFloat(totalInzet || 100)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
                <ResultRow
                  label="Uitbetaling bij winst"
                  sub="Gelijk voor elke winnende selectie"
                  value={`€${result.targetPayout.toFixed(2)}`}
                />
                <ResultRow
                  label="Winst"
                  value={`${result.profit >= 0 ? '+' : ''}€${result.profit.toFixed(2)}`}
                  highlight={result.profit >= 0 ? 'var(--color-win)' : 'var(--color-loss)'}
                  bold
                />
                <ResultRow
                  label="ROI"
                  value={`${result.roi >= 0 ? '+' : ''}${result.roi.toFixed(2)}%`}
                  highlight={result.roi >= 0 ? 'var(--color-win)' : 'var(--color-loss)'}
                  bold
                />
                <ResultRow
                  label="Gecombineerde implied probability"
                  sub={result.totalImpl > 1 ? 'Markt heeft overround — negatieve EV' : 'Markt heeft underround — positieve EV'}
                  value={`${(result.totalImpl * 100).toFixed(2)}%`}
                  highlight={result.totalImpl <= 1 ? 'var(--color-win)' : 'var(--text-3)'}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginTop: 24 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Hoe werkt dutching?</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Bij dutching verdeel je je totale inzet over meerdere selecties in een wedstrijd, zodat je bij elke winnende uitkomst hetzelfde bedrag terugkrijgt. De inzet per selectie wordt omgekeerd evenredig verdeeld op basis van de odds: een hogere odds betekent een kleinere inzet. Dit is nuttig als je meerdere uitkomsten waarschijnlijk acht maar de gecombineerde implied probability onder de 100% valt.
        </p>
      </div>
    </div>
  );
}
