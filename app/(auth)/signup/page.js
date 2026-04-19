'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

const BLUE = '#5469d4';
const BLUE_DARK = '#4356b8';
const BLUE_GLOW = 'rgba(84,105,212,0.4)';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Left panel: benefits list ── */
function SignupPanel() {
  const perks = [
    { icon: '📊', title: 'Alles op één plek', desc: 'Alle bets van alle bookmakers overzichtelijk bijhouden.' },
    { icon: '📈', title: 'Winst inzicht', desc: 'Zie per sport, bookmaker en markt waar je wint of verliest.' },
    { icon: '🎯', title: 'ROI & statistieken', desc: 'Automatisch berekende ROI, win rate en yield per periode.' },
    { icon: '🔒', title: 'Veilig & privé', desc: 'Jouw data is alleen van jou. Nooit gedeeld met derden.' },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between h-full px-10 py-10"
      style={{ background: 'linear-gradient(155deg, #04111f 0%, #0a1628 60%, #0d1f38 100%)' }}
    >
      {/* Logo top */}
      <a href="https://www.trackmijnbets.nl" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
      </a>

      {/* Headline + perks */}
      <div className="flex-1 flex flex-col justify-center gap-10 mt-8">
        <div>
          <h2 style={{ color: '#e6edf3', fontSize: 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 10 }}>
            Gratis starten in<br/>minder dan een minuut.
          </h2>
          <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, maxWidth: 340 }}>
            Geen creditcard nodig. Direct toegang tot alle functies.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {perks.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(84,105,212,0.12)', border: '1px solid rgba(84,105,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}
              >
                {p.icon}
              </div>
              <div>
                <div style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.title}</div>
                <div style={{ color: '#6e7681', fontSize: 13, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted by badge */}
        <div
          style={{
            background: 'rgba(84,105,212,0.08)', border: '1px solid rgba(84,105,212,0.18)',
            borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={BLUE} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: '#8b949e', fontSize: 13 }}>
            Al <span style={{ color: '#e6edf3', fontWeight: 600 }}>1.200+</span> Nederlandse bettors gingen je voor
          </span>
        </div>
      </div>

      <p style={{ color: '#1e2d4a', fontSize: 12, marginTop: 16 }}>
        TrackMijnBets · Gratis forever plan beschikbaar
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-[360px] text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(84,105,212,0.12)', border: `1px solid rgba(84,105,212,0.25)` }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={BLUE} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#e6edf3' }}>
            Bevestig je e-mail
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#8b949e' }}>
            We hebben een bevestigingslink gestuurd naar{' '}
            <span className="font-medium" style={{ color: '#c9d1d9' }}>{email}</span>.
            Klik op de link om je account te activeren.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: BLUE }}
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
    <div className="min-h-screen flex" style={{ background: '#0d1117' }}>
      {/* Left: signup benefits panel */}
      <div className="lg:w-[55%] xl:w-[58%]">
        <SignupPanel />
      </div>

      {/* Right: signup form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10"
        style={{ background: '#0d1117', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-full max-w-[360px]">
          {/* Logo (mobile only) */}
          <a href="https://www.trackmijnbets.nl" className="flex items-center gap-2.5 mb-8 lg:hidden" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 16 }}>TrackMijnBets</span>
          </a>

          <div className="mb-7">
            <h1 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Maak je gratis account aan
            </h1>
            <p style={{ color: '#8b949e', fontSize: 14 }}>Start vandaag nog met tracken. Geen creditcard nodig.</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#e6edf3',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Doorsturen...' : 'Doorgaan met Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#4e5a6a' }}>of</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
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
                onFocus={e => e.currentTarget.style.borderColor = BLUE}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>
                Wachtwoord
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimaal 6 tekens"
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                }}
                onFocus={e => e.currentTarget.style.borderColor = BLUE}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>
                Wachtwoord bevestigen
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                }}
                onFocus={e => e.currentTarget.style.borderColor = BLUE}
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
              style={{ background: BLUE, boxShadow: `0 2px 12px ${BLUE_GLOW}` }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = BLUE_DARK)}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
            >
              {loading ? 'Account aanmaken...' : 'Account aanmaken — Gratis'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6e7681' }}>
            Al een account?{' '}
            <Link href="/login" className="font-medium transition-opacity hover:opacity-70" style={{ color: BLUE }}>
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
