'use client';
import { useTheme } from '../context/ThemeContext';

const DARK = {
  '--bg-page':       '#080c14',
  '--bg-card':       'rgba(14,22,44,0.72)',
  '--bg-subtle':     'rgba(20,30,56,0.5)',
  '--bg-input':      'rgba(6,12,24,0.85)',
  '--bg-brand':      'rgba(84,105,212,0.14)',
  '--border':        'rgba(255,255,255,0.09)',
  '--border-subtle': 'rgba(255,255,255,0.05)',
  '--text-1':        '#e6edf3',
  '--text-2':        '#c9d1d9',
  '--text-3':        '#8b949e',
  '--text-4':        '#6e7681',
  '--badge-bg':      'rgba(28,36,56,0.8)',
  '--badge-color':   '#94a3b8',
  '--brand':         '#7b9ef0',
  '--brand-soft':    '#3d5099',
  '--tooltip-bg':    'rgba(16,24,44,0.97)',
  '--row-hover':     'rgba(22,32,60,0.7)',
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
