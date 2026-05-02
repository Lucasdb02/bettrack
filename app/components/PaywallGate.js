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

  const badgeLabel  = requiredPlan === 'elite' ? 'ELITE FEATURE' : 'PRO FEATURE';
  const badgeColor  = requiredPlan === 'elite' ? '#a855f7' : '#6b82f0';
  const cardBg      = dark ? 'rgba(10,14,30,0.92)' : 'rgba(255,255,255,0.95)';
  const cardBorder  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const heading     = dark ? '#e6edf3' : '#0f172a';
  const body        = dark ? '#8b949e' : '#64748b';
  const overlayBg   = dark
    ? 'linear-gradient(to bottom, rgba(7,9,23,0) 0%, rgba(7,9,23,0.85) 40%)'
    : 'linear-gradient(to bottom, rgba(245,247,250,0) 0%, rgba(245,247,250,0.85) 40%)';

  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred page preview */}
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.45, minHeight: 400 }}>
        {children}
      </div>

      {/* Fade overlay */}
      <div style={{ position: 'absolute', inset: 0, background: overlayBg, zIndex: 1 }} />

      {/* Card */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{
          background: cardBg,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${cardBorder}`,
          borderRadius: 18,
          boxShadow: dark
            ? '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 16px 48px rgba(0,0,0,0.14)',
          width: '100%', maxWidth: 460,
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Gradient blob */}
          <div style={{
            height: 80,
            background: requiredPlan === 'elite'
              ? 'linear-gradient(135deg, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 50%, rgba(236,72,153,0.4) 100%)'
              : 'linear-gradient(135deg, rgba(107,130,240,0.6) 0%, rgba(84,105,212,0.4) 50%, rgba(99,102,241,0.3) 100%)',
            filter: 'blur(12px)',
            transform: 'scale(1.1)',
            marginBottom: -20,
          }} />

          <div style={{ padding: '20px 36px 32px' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', background: `${badgeColor}22`, border: `1px solid ${badgeColor}55`, borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: badgeColor }}>{badgeLabel}</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: heading, marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {title}
            </h2>

            <p style={{ fontSize: 14, color: body, lineHeight: 1.65, marginBottom: 24 }}>
              {description}
            </p>

            <Link
              href="/pricing"
              style={{
                display: 'block', width: '100%', padding: '13px 0',
                borderRadius: 10, textDecoration: 'none',
                background: requiredPlan === 'elite'
                  ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                boxShadow: requiredPlan === 'elite'
                  ? '0 4px 20px rgba(168,85,247,0.4)'
                  : '0 4px 20px rgba(84,105,212,0.4)',
                transition: 'opacity 0.15s',
                marginBottom: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Bekijk abonnementen
            </Link>

            <p style={{ fontSize: 12, color: body, opacity: 0.7 }}>
              Upgrade naar {requiredPlan === 'elite' ? 'Elite' : 'Pro'} om toegang te krijgen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
