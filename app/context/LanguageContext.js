'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { startTranslation } from '@/lib/i18n/runtime';

const KEY = 'trackmijnbets_lang';
const LanguageContext = createContext({ lang: 'nl', setLang: () => {}, toggleLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('nl');

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved === 'en') {
      setLangState('en');
      startTranslation().finally(() => document.documentElement.classList.remove('i18n-pending'));
    }
  }, []);

  const setLang = (next) => {
    try { localStorage.setItem(KEY, next); } catch {}
    if (next === 'en') {
      setLangState('en');
      startTranslation();
    } else {
      /* Terug naar Nederlands: de originele teksten komen het snelst terug met een herlaad */
      window.location.reload();
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang: () => setLang(lang === 'en' ? 'nl' : 'en') }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

/* Vlag van de taal waar je naartoe schakelt (zoals zon/maan bij het thema) */
export const langFlag = (lang) => (lang === 'en' ? '🇳🇱' : '🇬🇧');
export const langSwitchLabel = (lang) => (lang === 'en' ? 'Nederlands' : 'English');
