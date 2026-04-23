'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ dark: false, toggle: () => {} });

const DARK_VARS = {
  '--color-win':      '#00c951',
  '--color-loss':     '#fb2b37',
  '--bg-page':        '#0d1117',
  '--bg-card':        '#161c2a',
  '--bg-subtle':      '#1c2335',
  '--bg-input':       '#0d1117',
  '--bg-brand':       'rgba(84,105,212,0.12)',
  '--border':         '#2a3347',
  '--border-subtle':  '#1e293b',
  '--text-1':         '#e6edf3',
  '--text-2':         '#c9d1d9',
  '--text-3':         '#8b949e',
  '--text-4':         '#6e7681',
  '--badge-bg':       '#1c2335',
  '--badge-color':    '#94a3b8',
  '--brand':          '#7b9ef0',
  '--brand-soft':     '#3d5099',
  '--tooltip-bg':     '#1c2335',
};

function applyTheme(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    Object.entries(DARK_VARS).forEach(([k, v]) => root.style.setProperty(k, v));
  } else {
    root.classList.remove('dark');
    Object.keys(DARK_VARS).forEach(k => root.style.removeProperty(k));
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  // On mount: read saved preference and apply immediately
  useEffect(() => {
    const saved = localStorage.getItem('trackmijnbets_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'dark' : prefersDark;
    applyTheme(isDark);
    setDark(isDark);
  }, []);

  const toggle = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('trackmijnbets_theme', next ? 'dark' : 'light');
      applyTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
