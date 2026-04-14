'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'expired'

  useEffect(() => {
    const supabase = createClient();

    // If we already set the flag on a previous render/event, show form immediately
    if (sessionStorage.getItem('reset_mode') === 'true') {
      setStatus('ready');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Store flag so SIGNED_IN (which Supabase also fires) doesn't redirect us away
        sessionStorage.setItem('reset_mode', 'true');
        setStatus('ready');
      } else if (event === 'SIGNED_IN') {
        // Only redirect if this is a normal login, not a password-reset flow
        if (sessionStorage.getItem('reset_mode') !== 'true') {
          router.replace('/dashboard');
        }
        // If reset_mode is set, status is already 'ready' — do nothing
      }
    });

    const timer = setTimeout(() => {
      if (sessionStorage.getItem('reset_mode') !== 'true') {
        setStatus('expired');
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.');
      return;
    }
    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    sessionStorage.removeItem('reset_mode');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: '#0d1117' }}>
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 16 }}>TrackMijnBets</span>
        </div>

        {/* Icon */}
        <div className="mb-6 flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'rgba(84,105,212,0.12)', border: '1px solid rgba(84,105,212,0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="mb-7">
          <h1 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Nieuw wachtwoord instellen
          </h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>
            Kies een sterk wachtwoord van minimaal 8 tekens.
          </p>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24" style={{ color: '#5469d4' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p style={{ color: '#6e7681', fontSize: 13 }}>Sessie wordt geladen…</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#f43f5e" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p style={{ color: '#e6edf3', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Link verlopen</p>
              <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.6 }}>
                Deze resetlink is verlopen of al gebruikt. Vraag een nieuwe aan.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: '#7b9ef0' }}
            >
              Nieuwe resetlink aanvragen
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>
                Nieuw wachtwoord
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>
                Bevestig wachtwoord
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                  outline: 'none',
                }}
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
              {loading ? 'Opslaan...' : 'Wachtwoord opslaan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
