'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-[360px] text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(123,158,240,0.1)', border: '1px solid rgba(123,158,240,0.25)' }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#7b9ef0" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#e6edf3' }}>
            Check je inbox
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#8b949e' }}>
            Als er een account bestaat voor{' '}
            <span className="font-medium" style={{ color: '#c9d1d9' }}>{email}</span>,
            sturen we een link waarmee je je wachtwoord kunt resetten.
          </p>
          <p className="text-xs mt-3" style={{ color: '#4e5a6a' }}>
            Geen e-mail ontvangen? Controleer je spam folder.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#7b9ef0' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d1117' }}>
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            style={{
              backgroundColor: '#5469d4', width: 40, height: 40, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              boxShadow: '0 2px 8px rgba(84,105,212,0.35)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>BetTrack</span>
        </div>

        <div className="mb-7">
          <h1 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Wachtwoord vergeten?
          </h1>
          <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6 }}>
            Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>
              E-mailadres
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#e6edf3',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#5469d4'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(251,113,133,0.08)', color: '#f43f5e' }}
            >
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
            style={{ background: '#5469d4' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#4356b8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#5469d4')}
          >
            {loading ? 'Versturen...' : 'Stuur resetlink'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#6e7681' }}>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
            style={{ color: '#7b9ef0' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
