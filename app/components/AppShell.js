'use client';
import { useTheme } from '../context/ThemeContext';

const DARK = {
  '--color-win':  '#00c951',
  '--color-loss': '#fb2b37',
  '--bg-page':        '#07091a',
  '--bg-card':        'rgba(12,16,36,0.82)',
  '--bg-subtle':      'rgba(16,22,48,0.65)',
  '--bg-input':       'rgba(6,8,22,0.95)',
  '--bg-brand':       'rgba(99,102,241,0.1)',
  '--bg-brand-hover': 'rgba(99,102,241,0.18)',
  '--border':         'rgba(255,255,255,0.07)',
  '--border-subtle':  'rgba(255,255,255,0.04)',
  '--border-strong':  'rgba(255,255,255,0.12)',
  '--text-1':  '#f1f5f9',
  '--text-2':  '#cbd5e1',
  '--text-3':  '#64748b',
  '--text-4':  '#475569',
  '--badge-bg':    'rgba(18,24,56,0.9)',
  '--badge-color': '#94a3b8',
  '--brand':       '#818cf8',
  '--brand-soft':  '#4338ca',
  '--brand-hover': '#6366f1',
  '--tooltip-bg':  'rgba(7,9,22,0.97)',
  '--row-hover':   'rgba(14,20,48,0.65)',
  '--shadow-xs': '0 1px 3px rgba(0,0,0,0.35)',
  '--shadow-sm': '0 2px 6px rgba(0,0,0,0.4)',
  '--shadow-md': '0 4px 16px rgba(0,0,0,0.5)',
  '--shadow-lg': '0 12px 40px rgba(0,0,0,0.6)',
  '--sidebar-bg':             'rgba(7,9,22,0.98)',
  '--sidebar-border':         'rgba(255,255,255,0.05)',
  '--nav-section':            'rgba(99,102,241,0.3)',
  '--nav-item-text':          '#475569',
  '--nav-item-hover-text':    '#94a3b8',
  '--nav-item-hover-bg':      'rgba(255,255,255,0.04)',
  '--nav-item-active-text':   '#e2e8f0',
  '--nav-item-active-bg':     'rgba(99,102,241,0.13)',
  '--nav-item-active-border': '#818cf8',
  '--nav-icon':               '#2d3f60',
  '--nav-icon-active':        '#818cf8',
  '--sidebar-logo-text':      '#f1f5f9',
  '--sidebar-logo-sub':       '#2d3f60',
  '--sidebar-footer-bg':      'rgba(0,0,0,0.2)',
};

const LIGHT = {
  '--color-win':  '#00c951',
  '--color-loss': '#fb2b37',
  '--bg-page':        '#f5f5f5',
  '--bg-card':        '#ffffff',
  '--bg-subtle':      '#f1f5f9',
  '--bg-input':       '#ffffff',
  '--bg-brand':       '#eef2ff',
  '--bg-brand-hover': '#e0e7ff',
  '--border':         '#e2e8f0',
  '--border-subtle':  '#f1f5f9',
  '--border-strong':  '#cbd5e1',
  '--text-1':  '#0f172a',
  '--text-2':  '#334155',
  '--text-3':  '#64748b',
  '--text-4':  '#94a3b8',
  '--badge-bg':    '#f1f5f9',
  '--badge-color': '#475569',
  '--brand':       '#6366f1',
  '--brand-soft':  '#c7d2fe',
  '--brand-hover': '#4f46e5',
  '--tooltip-bg':  '#ffffff',
  '--row-hover':   '#f8fafc',
  '--shadow-xs': 'none',
  '--shadow-sm': 'none',
  '--shadow-md': '0 4px 12px rgba(0,0,0,0.06)',
  '--shadow-lg': '0 10px 30px rgba(0,0,0,0.08)',
  '--sidebar-bg':             '#ffffff',
  '--sidebar-border':         '#e2e8f0',
  '--nav-section':            '#94a3b8',
  '--nav-item-text':          '#64748b',
  '--nav-item-hover-text':    '#334155',
  '--nav-item-hover-bg':      '#f8fafc',
  '--nav-item-active-text':   '#4f46e5',
  '--nav-item-active-bg':     '#eef2ff',
  '--nav-item-active-border': '#6366f1',
  '--nav-icon':               '#94a3b8',
  '--nav-icon-active':        '#6366f1',
  '--sidebar-logo-text':      '#334155',
  '--sidebar-logo-sub':       '#64748b',
  '--sidebar-footer-bg':      '#f8fafc',
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
