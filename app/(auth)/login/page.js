'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const bg        = dark ? '#0d1117' : '#f8fafc';
  const text1     = dark ? '#e6edf3' : '#0f172a';
  const text3     = dark ? '#8b949e' : '#64748b';
  const inputBg   = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const inputBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.14)';
  const dividerBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const googleBg  = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const googleBgHover = dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, padding: '24px 16px', transition: 'background 0.2s' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <a href="https://www.trackmijnbets.nl" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span style={{ color: text1, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
        </a>

        {/* Heading */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 style={{ color: text1, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, lineHeight: 1.2 }}>Welkom terug</h1>
          <p style={{ color: text3, fontSize: 14 }}>Log in op je TrackMijnBets account</p>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 0', borderRadius: 10, border: `1px solid ${inputBorder}`, background: googleBg, color: text1, fontSize: 14, fontWeight: 500, cursor: googleLoading ? 'default' : 'pointer', transition: 'all 0.15s', opacity: googleLoading ? 0.6 : 1, marginBottom: 20 }}
          onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = googleBgHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = googleBg; }}
        >
          {googleLoading
            ? <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            : <GoogleIcon />}
          {googleLoading ? 'Doorsturen...' : 'Doorgaan met Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: dividerBg }}/>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: text3 }}>of</span>
          <div style={{ flex: 1, height: 1, background: dividerBg }}/>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: text3, marginBottom: 6 }}>E-mailadres</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text1, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#6b82f0'}
              onBlur={e => e.currentTarget.style.borderColor = inputBorder}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: text3 }}>Wachtwoord</label>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#7b9ef0', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Vergeten?
              </Link>
            </div>
            <input
              type="password" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: text3, marginTop: 24 }}>
          Nog geen account?{' '}
          <Link href="/signup" style={{ color: '#7b9ef0', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Gratis registreren
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
