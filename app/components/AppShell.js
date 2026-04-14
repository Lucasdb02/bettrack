'use client';
import { useTheme } from '../context/ThemeContext';

const DARK = {
  '--bg-page':       '#0d1117',
  '--bg-card':       '#161c2a',
  '--bg-subtle':     '#1c2335',
  '--bg-input':      '#0d1117',
  '--bg-brand':      'rgba(84,105,212,0.12)',
  '--border':        '#2a3347',
  '--border-subtle': '#1e293b',
  '--text-1':        '#e6edf3',
  '--text-2':        '#c9d1d9',
  '--text-3':        '#8b949e',
  '--text-4':        '#6e7681',
  '--badge-bg':      '#1c2335',
  '--badge-color':   '#94a3b8',
  '--brand':         '#5469d4',
  '--brand-soft':    '#3d5099',
  '--tooltip-bg':    '#1c2335',
  '--row-hover':     '#1a2535',
};

const LIGHT = {
  '--bg-page':       '#f6f9fc',
  '--bg-card':       '#ffffff',
  '--bg-subtle':     '#f9fafb',
  '--bg-input':      '#f9fafb',
  '--bg-brand':      '#f0f4ff',
  '--border':        '#e5e7eb',
  '--border-subtle': '#f3f4f6',
  '--text-1':        '#1a1f36',
  '--text-2':        '#374151',
  '--text-3':        '#6b7280',
  '--text-4':        '#9ca3af',
  '--badge-bg':      '#f3f4f6',
  '--badge-color':   '#374151',
  '--brand':         '#5469d4',
  '--brand-soft':    '#c7d2f8',
  '--tooltip-bg':    '#ffffff',
  '--row-hover':     '#f0f2f5',
};

export function AppShell({ children }) {
  const { dark } = useTheme();
  const vars = dark ? DARK : LIGHT;

  return (
    <div
      className="flex h-full"
      style={{
        ...vars,
        backgroundColor: vars['--bg-page'],
        color: vars['--text-1'],
      }}
    >
      {children}
    </div>
  );
}
