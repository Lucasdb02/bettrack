'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

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

/* ── Mini bar chart for left panel ── */
function MiniBarChart() {
  const bars = [38, 52, 45, 68, 72, 58, 80, 65, 88, 74, 92, 85];
  return (
    <svg width="100%" height="48" viewBox="0 0 120 48" preserveAspectRatio="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10 + 1}
          y={48 - h * 0.48}
          width="8"
          height={h * 0.48}
          fill={i === bars.length - 1 ? '#7b9ef0' : 'rgba(123,158,240,0.35)'}
        />
      ))}
    </svg>
  );
}

/* ── Catmull-Rom → cubic Bezier SVG path ── */
function mkSmoothPath(pts) {
  const t = 0.3;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = (p1[0] + (p2[0] - p0[0]) * t).toFixed(1);
    const cp1y = (p1[1] + (p2[1] - p0[1]) * t).toFixed(1);
    const cp2x = (p2[0] - (p3[0] - p1[0]) * t).toFixed(1);
    const cp2y = (p2[1] - (p3[1] - p1[1]) * t).toFixed(1);
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ── Mini line chart ── */
function MiniLineChart() {
  const values = [20, 28, 22, 35, 30, 42, 38, 50, 45, 58, 52, 65, 70];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 200, h = 40, pad = 3;
  const pts = values.map((p, i) => [
    (i / (values.length - 1)) * w,
    pad + (h - pad) - ((p - min) / (max - min)) * (h - pad),
  ]);
  const line = mkSmoothPath(pts);
  const area = line + ` L${w},${h + pad} L0,${h + pad} Z`;
  return (
    <svg width="100%" height="44" viewBox={`0 0 ${w} ${h + pad}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="loginLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#5469d4" stopOpacity="0.18"/>
          <stop offset="95%" stopColor="#5469d4" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#loginLineGrad)" stroke="none"/>
      <path d={line} fill="none" stroke="#5469d4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Left panel: dashboard mockup ── */
function DashboardPreview() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full px-10 py-10" style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)' }}>
      {/* Logo top */}
      <a href="https://www.trackmijnbets.nl" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div style={{ background: 'linear-gradient(155deg, #060e1a 0%, #0a1628 60%, #0d1f38 100%)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123,158,240,0.2)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>TrackMijnBets</span>
      </a>

      {/* Headline */}
      <div className="flex-1 flex flex-col justify-center gap-8 mt-8">
        <div>
          <h2 style={{ color: '#e6edf3', fontSize: 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 10 }}>
            Beheer al je weddenschappen<br/>op één plek.
          </h2>
          <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, maxWidth: 340 }}>
            Traceer je profit, analyseer per bookmaker en ontdek waar je winst maakt.
          </p>
        </div>

        {/* Balance card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ color: '#8b949e', fontSize: 11, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Totaal saldo</div>
          <div className="flex items-end gap-2.5 mb-3">
            <span style={{ color: '#e6edf3', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>€2.847,50</span>
            <span style={{ color: '#34D399', fontSize: 13, fontWeight: 600, paddingBottom: 2 }}>+12.4%</span>
          </div>
          <MiniLineChart />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Win Rate', value: '58.3%', color: '#34D399' },
            { label: 'ROI', value: '+8.7%', color: '#7b9ef0' },
            { label: 'Record', value: '47-34-2', color: '#e6edf3' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ color: '#6e7681', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 16, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Bar chart card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: '#8b949e', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Winst per maand</span>
            <span style={{ color: '#34D399', fontSize: 12, fontWeight: 600 }}>+€347 apr</span>
          </div>
          <MiniBarChart />
        </div>

        {/* Recent bets mini */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ color: '#8b949e', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Recente weddenschappen</div>
          {[
            { match: 'Ajax – PSV', bookmaker: 'Unibet', result: '+€42.00', win: true },
            { match: 'Feyenoord – AZ', bookmaker: 'Bet365', result: '-€15.00', win: false },
            { match: 'NEC – FC Utrecht', bookmaker: 'TOTO', result: '+€28.50', win: true },
          ].map((bet, i) => (
            <div key={i} className="flex items-center justify-between" style={{ paddingBottom: i < 2 ? 8 : 0, marginBottom: i < 2 ? 8 : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div>
                <div style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 500 }}>{bet.match}</div>
                <div style={{ color: '#6e7681', fontSize: 11 }}>{bet.bookmaker}</div>
              </div>
              <span style={{ color: bet.win ? '#34D399' : '#FB7185', fontSize: 13, fontWeight: 600 }}>{bet.result}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <p style={{ color: '#3d4f63', fontSize: 12, marginTop: 16 }}>
        Gebruikt door meer dan 1.200 Nederlandse bettors.
      </p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0d1117' }}>
      {/* Left: dashboard preview */}
      <div className="lg:w-[55%] xl:w-[58%]">
        <DashboardPreview />
      </div>

      {/* Right: login form */}
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
              Welkom terug
            </h1>
            <p style={{ color: '#8b949e', fontSize: 14 }}>Log in op je TrackMijnBets account</p>
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

          {/* Email/password form */}
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
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium" style={{ color: '#8b949e' }}>
                  Wachtwoord
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: '#7b9ef0' }}
                >
                  Vergeten?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
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
              className="btn-primary-glass w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6e7681' }}>
            Nog geen account?{' '}
            <Link href="/signup" className="font-medium transition-opacity hover:opacity-70" style={{ color: '#7b9ef0' }}>
              Gratis registreren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
