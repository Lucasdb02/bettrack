'use client';

export default function FreebetToggle({ checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--brand)' }}
      />
      Freebet
    </label>
  );
}
