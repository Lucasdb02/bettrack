'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase';
import { useTheme } from '../context/ThemeContext';

const IDLE_MS  = 30 * 60 * 1000;        // 30 minuten inactiviteit → uitloggen
const WARN_MS  = IDLE_MS - 30 * 1000;   // popup 30 seconden voor uitloggen
const WARN_SEC = 30;

export default function SessionTimeout() {
  const router = useRouter();
  const { dark } = useTheme();

  const idleTimer    = useRef(null);
  const warnTimer    = useRef(null);
  const countdownRef = useRef(null);

  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(WARN_SEC);

  const clearAll = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(idleTimer.current);
    clearInterval(countdownRef.current);
  }, []);

  const doLogout = useCallback(async () => {
    clearAll();
    setShowWarning(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router, clearAll]);

  const resetTimers = useCallback(() => {
    clearAll();
    setShowWarning(false);
    setCountdown(WARN_SEC);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARN_SEC);
      let secs = WARN_SEC;
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) clearInterval(countdownRef.current);
      }, 1000);
    }, WARN_MS);

    idleTimer.current = setTimeout(doLogout, IDLE_MS);
  }, [clearAll, doLogout]);

  /* Activiteitslisteners */
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handler = () => resetTimers();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    resetTimers();
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      clearAll();
    };
  }, [resetTimers, clearAll]);

  /* Uitloggen wanneer tab/venster niet meer zichtbaar is */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) doLogout();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [doLogout]);

  if (!showWarning) return null;

  /* ── Thema-kleuren ── */
  const overlay  = dark ? 'rgba(0,0,0,0.65)'            : 'rgba(0,0,0,0.4)';
  const cardBg   = dark ? 'rgba(10,16,34,0.96)'         : 'rgba(255,255,255,0.97)';
  const cardBdr  = dark ? 'rgba(255,255,255,0.09)'      : 'rgba(0,0,0,0.10)';
  const shadow   = dark
    ? '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)'
    : '0 16px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.8)';
  const heading  = dark ? '#e6edf3'                     : '#111827';
  const body     = dark ? '#8b949e'                     : '#6b7280';
  const accent   = '#f59e0b';
  const btnSecBg = dark ? 'rgba(255,255,255,0.07)'      : 'rgba(0,0,0,0.06)';
  const btnSecCl = dark ? 'rgba(255,255,255,0.65)'      : '#374151';
  const btnSecBd = dark ? 'rgba(255,255,255,0.12)'      : 'rgba(0,0,0,0.12)';

  /* Cirkel-progress voor countdown */
  const radius       = 22;
  const circumference = 2 * Math.PI * radius;
  const progress     = (countdown / WARN_SEC) * circumference;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      backgroundColor: overlay,
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: cardBg,
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        border: `1px solid ${cardBdr}`,
        boxShadow: shadow,
        borderRadius: 18, padding: '32px 36px', maxWidth: 380, width: '100%', textAlign: 'center',
      }}>
        {/* Cirkel-countdown */}
        <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 20px' }}>
          <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r={radius} fill="none"
              stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}
              strokeWidth="4" />
            <circle cx="32" cy="32" r={radius} fill="none"
              stroke={accent} strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
          </svg>
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: accent,
          }}>
            {countdown}
          </span>
        </div>

        <h2 style={{ color: heading, fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Nog ingelogd blijven?
        </h2>
        <p style={{ color: body, fontSize: 14, lineHeight: 1.65, marginBottom: 26 }}>
          Je sessie verloopt over <strong style={{ color: accent }}>{countdown}</strong> seconden wegens inactiviteit.
          Klik op &ldquo;Ingelogd blijven&rdquo; om door te gaan.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={resetTimers}
            style={{
              padding: '9px 22px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 16px rgba(84,105,212,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Ingelogd blijven
          </button>
          <button
            onClick={doLogout}
            style={{
              padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: btnSecBg, color: btnSecCl, border: `1px solid ${btnSecBd}`,
            }}
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  );
}
