'use client';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const PALETTE = [
  { bg:'#eff6ff', border:'#bfdbfe', text:'#1d4ed8', darkBg:'rgba(59,130,246,0.15)', darkBorder:'rgba(59,130,246,0.3)', darkText:'#93c5fd' },
  { bg:'#f0fdf4', border:'#bbf7d0', text:'#34D399', darkBg:'rgba(34,197,94,0.15)',  darkBorder:'rgba(34,197,94,0.3)',  darkText:'#34D399' },
  { bg:'#fdf4ff', border:'#e9d5ff', text:'#7e22ce', darkBg:'rgba(168,85,247,0.15)', darkBorder:'rgba(168,85,247,0.3)', darkText:'#d8b4fe' },
  { bg:'#fff7ed', border:'#fed7aa', text:'#c2410c', darkBg:'rgba(249,115,22,0.15)', darkBorder:'rgba(249,115,22,0.3)', darkText:'#fdba74' },
  { bg:'#f0fdfa', border:'#99f6e4', text:'#0f766e', darkBg:'rgba(20,184,166,0.15)', darkBorder:'rgba(20,184,166,0.3)', darkText:'#5eead4' },
  { bg:'#fdf2f8', border:'#fbcfe8', text:'#9d174d', darkBg:'rgba(236,72,153,0.15)', darkBorder:'rgba(236,72,153,0.3)', darkText:'#f9a8d4' },
  { bg:'#fffbeb', border:'#fde68a', text:'#92400e', darkBg:'rgba(245,158,11,0.15)', darkBorder:'rgba(245,158,11,0.3)', darkText:'#fcd34d' },
];

export function tagPalette(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function TagChip({ tag, onRemove, size = 'md' }) {
  const { dark } = useTheme();
  const p = tagPalette(tag);
  const bg     = dark ? p.darkBg     : p.bg;
  const border = dark ? p.darkBorder : p.border;
  const color  = dark ? p.darkText   : p.text;
  const fs = size === 'sm' ? 10.5 : 12;
  const px = size === 'sm' ? 6    : 8;
  const py = size === 'sm' ? 1    : 2;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: `${py}px ${px}px`, borderRadius: 4,
      fontSize: fs, fontWeight: 600,
      backgroundColor: bg, border: `1px solid ${border}`, color,
      whiteSpace: 'nowrap',
    }}>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 0, lineHeight: 1, fontSize: fs + 1, opacity: 0.7 }}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default function TagInput({ tags = [], onChange, inputStyle = {} }) {
  const { dark } = useTheme();
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim();
    if (t && !tags.map(x => x.toLowerCase()).includes(t.toLowerCase())) {
      onChange([...tags, t]);
    }
    setInput('');
  };

  const remove = (t) => onChange(tags.filter(x => x !== t));

  const border = dark ? '#2a3347' : '#e5e7eb';
  const bg     = dark ? '#0d1117' : '#f9fafb';
  const text1  = dark ? '#e6edf3' : '#1a1f36';
  const text4  = dark ? '#6e7681' : '#9ca3af';

  return (
    <div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {tags.map(t => <TagChip key={t} tag={t} onRemove={remove} />)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Tag toevoegen en Enter drukken..."
          style={{
            flex: 1, padding: '8px 12px',
            border: `1px solid ${border}`, borderRadius: 7,
            fontSize: 13.5, color: text1, backgroundColor: bg,
            ...inputStyle,
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          style={{
            padding: '8px 12px', borderRadius: 7, border: `1px solid ${border}`,
            backgroundColor: input.trim() ? '#5469d4' : bg,
            color: input.trim() ? '#fff' : text4,
            fontSize: 18, lineHeight: 1, cursor: input.trim() ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >+</button>
      </div>
    </div>
  );
}
