'use client';
import { useState } from 'react';
import { useSiteDark } from './useSiteTheme';
import { createClient } from '@/lib/supabase';
import { LP_PLANS } from '@/lib/plans';

const LP_PRICE_IDS = {
  pro_monthly:   'price_1TRyiRAFCw5K2LNNmDJsHjbu',
  pro_yearly:    'price_1TRyiRAFCw5K2LNNfu7fpdRu',
  elite_monthly: 'price_1TRyiRAFCw5K2LNNJJN8yN72',
  elite_yearly:  'price_1TRyiSAFCw5K2LNNDsbFc4h1',
};



function LpCheck({ ok, dark }) {
  if (ok) return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,201,81,0.12)', border: '1px solid rgba(0,201,81,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00c951" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  );
  return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </span>
  );
}

const LP_TRUST = [
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, label: 'Altijd opzegbaar' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: '7 dagen gratis proberen' },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Veilige betaling' },
];

/* Prijzensectie van de homepage, ook gebruikt op /prijzen.
   headingAs: 'h2' op de homepage, 'h1' op de prijzenpagina.
   bare: zonder eigen achtergrond en bovenrand (voor gebruik binnen een pagina). */
export default function PricingSection({ dark: darkProp, headingAs: Heading = 'h2', bare = false }) {
  const siteDark = useSiteDark();
  const dark = darkProp ?? siteDark;
  const [jaarlijks, setJaarlijks] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const bg     = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1  = dark ? '#fff' : '#0f172a';
  const text2  = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  async function handleCta(plan) {
    if (plan.id === 'gratis') { window.location.href = '/signup'; return; }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/signup'; return; }
    const key = jaarlijks ? `${plan.id}_yearly` : `${plan.id}_monthly`;
    const priceId = LP_PRICE_IDS[key];
    if (!priceId) return;
    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section id="prijzen" className={bare ? undefined : 'lp-section-pad'} style={bare ? { padding: '8px 0 0' } : { backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      {/* 1060 = contentbreedte van .seo-wrap op /prijzen, zodat beide pagina's gelijk zijn */}
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prijzen</span>
          <Heading style={{ fontSize: 40, fontWeight: 800, color: text1, marginTop: 12, marginBottom: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Eenvoudige, transparante prijzen</Heading>
          <p style={{ fontSize: 17, color: text2, marginTop: 14 }}>Begin gratis. Upgrade wanneer jij er klaar voor bent.</p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 10, padding: 4, gap: 2 }}>
            {['Maandelijks', 'Jaarlijks'].map((label, i) => {
              const active = jaarlijks === (i === 1);
              return (
                <button key={label} onClick={() => setJaarlijks(i === 1)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 600 : 400, background: active ? (dark ? '#1e2d4a' : '#ffffff') : 'transparent', color: active ? text1 : text2, boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  {i === 1 && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(0,201,81,0.15)', color: '#00a843', border: '1px solid rgba(0,201,81,0.3)', borderRadius: 4, padding: '1px 5px' }}>-20%</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plans */}
        <div className="lp-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28, alignItems: 'stretch' }}>
          {LP_PLANS.map((plan) => {
            const prijs = jaarlijks ? plan.jaar : plan.maand;
            const isPopulair = plan.populair;
            return (
              <div key={plan.id} style={{ paddingTop: 13, display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderRadius: 14, padding: '24px 22px', border: isPopulair ? '2px solid #6366f1' : `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: isPopulair ? (dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)') : (dark ? '#0d1a2e' : '#ffffff'), position: 'relative', boxShadow: isPopulair ? (dark ? '0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(99,102,241,0.15)') : 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Lichtboog die langs de rand van het aanbevolen plan draait */}
                {isPopulair && <span className="border-beam" aria-hidden />}
                {/* Popular badge */}
                {isPopulair && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>✦ Meest gekozen</span>
                  </div>
                )}

                {/* Plan name */}
                <div style={{ minHeight: 52, marginBottom: 16 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 3 }}>{plan.naam}</p>
                  <p style={{ fontSize: 13, color: text2 }}>{plan.sub}</p>
                </div>

                {/* Price */}
                <div style={{ minHeight: 88, marginBottom: 20 }}>
                  {prijs === 0 ? (
                    <p style={{ fontSize: 32, fontWeight: 800, color: text1, lineHeight: 1 }}>Gratis</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: text1, lineHeight: 1 }}>€{prijs.toFixed(2).replace('.', ',')}</span>
                        <span style={{ fontSize: 13, color: text2, fontWeight: 500 }}>/maand</span>
                      </div>
                      {jaarlijks && (
                        <p style={{ fontSize: 12, color: text2, marginTop: 4 }}>
                          €{(prijs * 12).toFixed(2).replace('.', ',')} per jaar — bespaar €{((plan.maand - plan.jaar) * 12).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                {(() => {
                  const isLoading = loadingPlan === plan.id;
                  return (
                    <button
                      disabled={isLoading}
                      onClick={() => handleCta(plan)}
                      style={{ width: '100%', padding: '11px 0', borderRadius: 9, border: isPopulair ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, fontSize: 14, fontWeight: 600, cursor: isLoading ? 'default' : 'pointer', background: isPopulair ? 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: isPopulair ? '#fff' : text1, boxShadow: isPopulair && !isLoading ? '0 3px 12px rgba(84,105,212,0.4)' : 'none', transition: 'opacity 0.15s', marginBottom: 24, opacity: isLoading ? 0.6 : 1 }}
                      onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
                    >
                      {isLoading ? 'Laden...' : plan.cta}
                    </button>
                  );
                })()}

                {/* Features */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Inclusief:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LpCheck ok={f.ok} dark={dark} />
                        <span style={{ fontSize: 13, color: f.ok ? (dark ? 'rgba(255,255,255,0.75)' : '#334155') : text2 }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          {LP_TRUST.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: text2 }}>
              <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
