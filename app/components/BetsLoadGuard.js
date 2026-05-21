'use client';
import { useBets } from '../context/BetsContext';

// Gebruik als early-return guard: if (!loaded || fetchError) return <BetsLoadGuard />;
export default function BetsLoadGuard() {
  const { loaded, fetchError, reloadBets } = useBets();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-4)', flexDirection: 'column', gap: 12 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style={{ fontSize: 13 }}>Laden...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-full" style={{ flexDirection: 'column', gap: 14, color: 'var(--text-3)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ fontSize: 14, margin: 0 }}>Kon bets niet laden. Controleer je verbinding.</p>
        <button
          onClick={reloadBets}
          style={{ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-1)', cursor: 'pointer' }}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return null;
}
