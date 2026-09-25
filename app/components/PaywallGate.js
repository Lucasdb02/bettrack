'use client';
import Link from 'next/link';
import { useSubscription } from '../context/SubscriptionContext';
import { useTheme } from '../context/ThemeContext';

export default function PaywallGate({ requiredPlan = 'pro', title, description, children }) {
  const { plan, status, loading } = useSubscription();
  const { dark } = useTheme();

  if (loading) return children;

  const hasAccess = requiredPlan === 'elite'
    ? plan === 'elite' && status !== 'canceled'
    : (plan === 'pro' || plan === 'elite') && status !== 'canceled';

  if (hasAccess) return children;

  const planLabel = requiredPlan === 'elite' ? 'Elite' : 'Pro';
  const accent    = requiredPlan === 'elite' ? '#a855f7' : '#5469d4';
  const accentRgb = requiredPlan === 'elite' ? '168,85,247' : '84,105,212';
  const text1     = dark ? '#f0f0f0' : '#0f172a';
  const text3     = dark ? '#8b8b8b' : '#64748b';
  const overlayBg = dark ? 'rgba(10,12,20,0.55)' : 'rgba(245,247,250,0.6)';

  return (
    <div style={{ position: 'relative' }}>
      {/* Geblurde preview van de pagina */}
      <div aria-hidden style={{ filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5, minHeight: 480 }}>
        {children}
      </div>

      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, background: overlayBg,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: 'min(22vh, 200px) 16px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2}>
              <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
              <path strokeLinecap="round" d="M8 10.5V7.5a4 4 0 018 0v3" />
            </svg>
          </div>

          <h2 style={{ color: text1, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
          <p style={{ color: text3, fontSize: 14, lineHeight: 1.6 }}>{description}</p>

          <Link
            href="/pricing"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, padding: '10px 20px', borderRadius: 8, background: accent, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Upgrade naar {planLabel}
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p style={{ color: text3, fontSize: 12, marginTop: 12, opacity: 0.8 }}>7 dagen gratis proberen · altijd opzegbaar</p>
        </div>
      </div>
    </div>
  );
}
