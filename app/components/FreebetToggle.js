'use client';

export default function FreebetToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 11px', border: `1px solid ${checked ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 8, backgroundColor: 'var(--bg-card)',
        color: checked ? 'var(--brand)' : 'var(--text-2)',
        fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        {checked && <polyline points="7.5 12 10.5 15 16.5 8.5"/>}
      </svg>
      Freebet
    </button>
  );
}
