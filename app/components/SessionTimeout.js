'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase';

const IDLE_MS = 20 * 60 * 1000;      // 20 minutes inactivity → auto-logout
const WARN_MS = IDLE_MS - 60 * 1000; // show warning 1 minute before

export default function SessionTimeout() {
  const router = useRouter();
  const idleTimer = useRef(null);
  const warnTimer = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef(null);

  const doLogout = useCallback(async () => {
    setShowWarning(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router]);

  const resetTimers = useCallback(() => {
    setShowWarning(false);
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      let secs = 60;
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);
    }, WARN_MS);

    idleTimer.current = setTimeout(doLogout, IDLE_MS);
  }, [doLogout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handler = () => resetTimers();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    resetTimers();

    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimers]);

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'rgba(10,16,34,0.92)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '32px 36px', maxWidth: 380, width: '100%', textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(251,182,52,0.12)', border: '1px solid rgba(251,182,52,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbb634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Sessie verloopt bijna
        </h2>
        <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Je wordt automatisch uitgelogd wegens inactiviteit over{' '}
          <strong style={{ color: '#fbb634' }}>{countdown}</strong> seconden.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={resetTimers}
            style={{
              padding: '9px 22px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 16px rgba(84,105,212,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Sessie verlengen
          </button>
          <button
            onClick={doLogout}
            style={{
              padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  );
}
