export const SPORT_EMOJIS = {
  'Voetbal':           '⚽',
  'Tennis':            '🎾',
  'Basketball':        '🏀',
  'Hockey':            '🏒',
  'Formule 1':         '🏎️',
  'Wielrennen':        '🚴',
  'Darts':             '🎯',
  'Snooker':           '🎱',
  'American Football': '🏈',
  'Overig':            '🎰',
};

export const SPORTEN = Object.keys(SPORT_EMOJIS);

export function sportEmoji(sport) {
  return SPORT_EMOJIS[sport] || '🎰';
}

// ── Outcome config ──────────────────────────────────────────────────────────

export const UITKOMSTEN = [
  { value: 'lopend',        label: 'Lopend',         color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', textColor: '#1d4ed8', darkBg: 'rgba(59,130,246,0.22)',  darkBorder: 'rgba(59,130,246,0.45)',  darkTextColor: '#93c5fd' },
  { value: 'gewonnen',      label: 'Gewonnen',        color: '#11B981', bg: '#f0fdf4', border: '#bbf7d0', textColor: '#34D399', darkBg: 'rgba(17,185,129,0.22)',  darkBorder: 'rgba(17,185,129,0.45)',  darkTextColor: '#34D399' },
  { value: 'half_gewonnen', label: 'Half Gewonnen',   color: '#11B981', bg: '#f0fdf4', border: '#34D399', textColor: '#34D399', darkBg: 'rgba(17,185,129,0.22)',  darkBorder: 'rgba(17,185,129,0.45)',  darkTextColor: '#34D399' },
  { value: 'push',          label: 'Push',            color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', textColor: '#92400e', darkBg: 'rgba(245,158,11,0.22)',  darkBorder: 'rgba(245,158,11,0.45)',  darkTextColor: '#fcd34d' },
  { value: 'verloren',      label: 'Verloren',        color: '#F43F5E', bg: '#fef2f2', border: '#fecaca', textColor: '#FB7185', darkBg: 'rgba(244,63,94,0.22)',   darkBorder: 'rgba(244,63,94,0.45)',   darkTextColor: '#FB7185' },
  { value: 'half_verloren', label: 'Half Verloren',   color: '#F43F5E', bg: '#fff7ed', border: '#fed7aa', textColor: '#c2410c', darkBg: 'rgba(244,63,94,0.22)',  darkBorder: 'rgba(244,63,94,0.45)',  darkTextColor: '#fdba74' },
  { value: 'void',          label: 'Void',            color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff', textColor: '#7c3aed', darkBg: 'rgba(168,85,247,0.22)', darkBorder: 'rgba(168,85,247,0.45)',  darkTextColor: '#d8b4fe' },
  { value: 'onbeslist',     label: 'Onbeslist',       color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', textColor: '#92400e', darkBg: 'rgba(245,158,11,0.22)',  darkBorder: 'rgba(245,158,11,0.45)',  darkTextColor: '#fcd34d' },
];

export function uitkomstConfig(value) {
  return UITKOMSTEN.find(u => u.value === value) || UITKOMSTEN[0];
}
