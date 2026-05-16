'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordPage() {
  const { dark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const bg           = dark ? '#0d1117'                  : '#f8fafc';
  const text1        = dark ? '#e6edf3'                  : '#0f172a';
  const text2        = dark ? '#c9d1d9'                  : '#1e293b';
  const text3        = dark ? '#8b949e'                  : '#64748b';
  const text4        = dark ? '#4e5a6a'                  : '#94a3b8';
  const inputBg      = dark ? 'rgba(255,255,255,0.04)'   : '#ffffff';
  const inputBorder  = dark ? 'rgba(255,255,255,0.1)'    : 'rgba(0,0,0,0.14)';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, padding: '24px 16px', transition: 'background 0.2s' }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(123,158,240,0.1)', border: '1px solid rgba(123,158,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="#7b9ef0" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 style={{ color: text1, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check je inbox</h2>
          <p style={{ color: text3, fontSize: 14, lineHeight: 1.65 }}>
            Als er een account bestaat voor{' '}
            <span style={{ fontWeight: 600, color: text2 }}>{email}</span>,
            sturen we een link waarmee je je wachtwoord kunt resetten.
          </p>
          <p style={{ color: text4, fontSize: 12, marginTop: 10 }}>
            Geen e-mail ontvangen? Controleer je spam folder.
          </p>
          <Link
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 14, fontWeight: 500, color: '#7b9ef0', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, padding: '24px 16px', transition: 'background 0.2s' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <a href="https://www.trackmijnbets.nl" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', border: '1px solid rgba(123,158,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span style={{ color: text1, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
        </a>

        {/* Heading */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 style={{ color: text1, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, lineHeight: 1.2 }}>Wachtwoord vergeten?</h1>
          <p style={{ color: text3, fontSize: 14 }}>Vul je e-mailadres in en we sturen je een resetlink.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: text3, marginBottom: 6 }}>E-mailadres</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text1, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#6b82f0'}
              onBlur={e => e.currentTarget.style.borderColor = inputBorder}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(251,113,133,0.08)', color: '#f43f5e', fontSize: 13 }}>
              <svg style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', boxShadow: '0 4px 28px rgba(84,105,212,0.45)', transition: 'opacity 0.15s', opacity: loading ? 0.6 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? 'Versturen...' : 'Stuur resetlink'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: text3, marginTop: 24 }}>
          <Link
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#7b9ef0', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
