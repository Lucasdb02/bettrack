'use client';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';

const PRICE_IDS = {
  pro_monthly:   'price_1TRoVaAEpVwWC6xG32WTf7rt',
  pro_yearly:    'price_1TRoWLAEpVwWC6xGFCsX7oap',
  elite_monthly: 'price_1TRoVnAEpVwWC6xGbHee4xyz',
  elite_yearly:  'price_1TRoWdAEpVwWC6xGLdI4meyi',
};

const PLANS = [
  {
    id: 'gratis',
    naam: 'Gratis',
    sub: 'Voor casual bettors',
    maand: 0,
    jaar: 0,
    populair: false,
    features: [
      { label: 'Dashboard overzicht', ok: true },
      { label: 'Tot 30 bets per maand', ok: true },
      { label: 'Basis statistieken (P&L, win rate)', ok: true },
      { label: '1 bookmaker koppelen', ok: true },
      { label: 'Handmatig bets invoeren', ok: true },
      { label: 'Donkere & lichte modus', ok: true },
      { label: 'AI betslip herkenning', ok: false },
      { label: 'Chrome Extension', ok: false },
      { label: 'Onbeperkte bets', ok: false },
      { label: 'Alle calculators', ok: false },
      { label: 'Maandoverzicht & kalender', ok: false },
      { label: 'CSV / JSON export', ok: false },
    ],
  },
  {
    id: 'pro',
    naam: 'Pro',
    sub: 'Voor serieuze bettors',
    maand: 6.99,
    jaar: 5.59,
    populair: true,
    features: [
      { label: 'Alles van Gratis', ok: true },
      { label: 'Onbeperkte bets', ok: true },
      { label: 'Onbeperkte bookmakers', ok: true },
      { label: 'Volledig statistieken dashboard', ok: true },
      { label: 'AI betslip herkenning', ok: true },
      { label: 'Chrome Extension', ok: true },
      { label: 'Maandoverzicht & kalender', ok: true },
      { label: 'Alle calculators (6 tools)', ok: true },
      { label: 'Asian Lines overzicht', ok: true },
      { label: 'Odds Vergelijker', ok: true },
      { label: 'CSV & JSON export', ok: true },
      { label: 'E-mail support', ok: true },
    ],
  },
  {
    id: 'elite',
    naam: 'Elite',
    sub: 'Voor professionele bettors',
    maand: 12.99,
    jaar: 10.39,
    populair: false,
    features: [
      { label: 'Alles van Pro', ok: true },
      { label: 'Priority support (< 4 uur)', ok: true },
      { label: 'Vroege toegang tot nieuwe functies', ok: true },
      { label: 'Geavanceerde analytische rapporten', ok: true },
      { label: 'Meerdere gebruikersprofielen', ok: true },
      { label: 'API-toegang (bèta)', ok: true },
      { label: 'Persoonlijk onboarding gesprek', ok: true },
      { label: 'Dedicated accountmanager', ok: true },
    ],
  },
];

const TRUST = [
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, label: 'Altijd opzegbaar' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: '7 dagen gratis proberen' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Veilige betaling' },
];

function Check({ ok, dark }) {
  if (ok) {
    return (
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,201,81,0.12)', border: '1px solid rgba(0,201,81,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00c951" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    );
  }
  return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </span>
  );
}

export default function PricingPage() {
  const { dark } = useTheme();
  const [jaarlijks, setJaarlijks] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { plan: currentPlan, status, loading: subLoading, startCheckout, openPortal } = useSubscription();

  async function handleCta(planId) {
    if (planId === 'gratis') return;

    /* Beheer abonnement als al betaald plan */
    if (currentPlan === planId && status !== 'canceled') {
      await openPortal();
      return;
    }

    const key = jaarlijks ? `${planId}_yearly` : `${planId}_monthly`;
    const priceId = PRICE_IDS[key];
    if (!priceId) return;

    setLoadingPlan(planId);
    try {
      await startCheckout(priceId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  }

  function ctaLabel(plan) {
    if (plan.id === 'gratis') return currentPlan === 'gratis' ? 'Huidig plan' : 'Downgraden';
    if (currentPlan === plan.id && status !== 'canceled') return 'Abonnement beheren';
    return 'Start 7 dagen gratis';
  }

  function ctaDisabled(plan) {
    return plan.id === 'gratis' && currentPlan === 'gratis';
  }

  return (
    <div style={{ padding: '32px 28px' }} className="app-page">

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Prijzen & Abonnementen</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.15 }}>Kies je abonnement</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 360, lineHeight: 1.6, textAlign: 'right' }}>
            Volg en analyseer je bets professioneel. Begin gratis, upgrade wanneer je er klaar voor bent.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 2, position: 'relative' }}>
          {['Maandelijks', 'Jaarlijks'].map((label, i) => {
            const active = jaarlijks === (i === 1);
            return (
              <button
                key={label}
                onClick={() => setJaarlijks(i === 1)}
                style={{
                  padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--text-1)' : 'var(--text-3)',
                  boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {label}
                {i === 1 && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(0,201,81,0.15)', color: '#00a843', border: '1px solid rgba(0,201,81,0.3)', borderRadius: 4, padding: '1px 5px' }}>-20%</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {PLANS.map((plan) => {
          const prijs = jaarlijks ? plan.jaar : plan.maand;
          const isPopulair = plan.populair;
          return (
            <div
              key={plan.id}
              style={{
                borderRadius: 14,
                padding: isPopulair ? '28px 26px' : '24px 22px',
                border: isPopulair
                  ? `2px solid var(--brand)`
                  : '1px solid var(--border)',
                background: isPopulair
                  ? (dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)')
                  : 'var(--bg-card)',
                position: 'relative',
                boxShadow: isPopulair ? (dark ? '0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(99,102,241,0.15)') : 'none',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Populair badge */}
              {isPopulair && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                    ✦ Meest gekozen
                  </span>
                </div>
              )}

              {/* Plan naam */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{plan.naam}</p>
                <p style={{ fontSize: 13, color: 'var(--text-4)' }}>{plan.sub}</p>
              </div>

              {/* Prijs */}
              <div style={{ marginBottom: 22 }}>
                {prijs === 0 ? (
                  <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>Gratis</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>€{prijs.toFixed(2).replace('.', ',')}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-4)', fontWeight: 500 }}>/maand</span>
                  </div>
                )}
                {jaarlijks && prijs > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>
                    €{(prijs * 12).toFixed(2).replace('.', ',')} per jaar — bespaar €{((plan.maand - plan.jaar) * 12).toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* CTA */}
              {(() => {
                const disabled = ctaDisabled(plan) || loadingPlan === plan.id;
                const label    = loadingPlan === plan.id ? 'Laden...' : ctaLabel(plan);
                return (
                  <button
                    disabled={disabled}
                    onClick={() => handleCta(plan.id)}
                    style={{
                      width: '100%', padding: '11px 0', borderRadius: 9, border: isPopulair ? 'none' : '1px solid var(--border)',
                      fontSize: 14, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
                      background: disabled
                        ? 'var(--bg-subtle)'
                        : isPopulair
                          ? 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)'
                          : 'var(--bg-card)',
                      color: disabled ? 'var(--text-4)' : isPopulair ? '#fff' : 'var(--text-2)',
                      boxShadow: isPopulair && !disabled ? '0 3px 12px rgba(84,105,212,0.4)' : 'none',
                      transition: 'opacity 0.15s',
                      marginBottom: 24,
                      opacity: loadingPlan === plan.id ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { if (loadingPlan !== plan.id) e.currentTarget.style.opacity = '1'; }}
                  >
                    {currentPlan === plan.id && status !== 'canceled' && plan.id !== 'gratis' && (
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#00c951', marginRight: 7, verticalAlign: 'middle' }}/>
                    )}
                    {label}
                  </button>
                );
              })()}

              {/* Features */}
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Inclusief:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check ok={f.ok} dark={dark} />
                      <span style={{ fontSize: 13, color: f.ok ? 'var(--text-2)' : 'var(--text-4)' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
        {TRUST.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-4)' }}>
            <span style={{ color: 'var(--text-3)' }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}
