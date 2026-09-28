'use client';
import { useLanguage, langFlag, langSwitchLabel } from '../context/LanguageContext';

export default function LangToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button type="button" onClick={toggleLang} className="lang-toggle" title={langSwitchLabel(lang)} aria-label={langSwitchLabel(lang)} data-no-translate>
      {langFlag(lang)}
    </button>
  );
}
