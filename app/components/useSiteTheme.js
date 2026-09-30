'use client';
import { useSyncExternalStore } from 'react';

/* Licht/donker voor de publieke site (homepage, tools, gidsen, enz.), los van het thema in de app.
   De keuze staat in localStorage 'theme'; het script in layout.js zet vóór de eerste render
   data-site-theme="light" op <html>, zodat CSS en componenten zonder flits het juiste thema tonen. */
const ATTR = 'data-site-theme';

function subscribe(cb) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: [ATTR] });
  return () => obs.disconnect();
}

const getDark = () => document.documentElement.getAttribute(ATTR) !== 'light';

export function useSiteDark() {
  return useSyncExternalStore(subscribe, getDark, () => true);
}

export function setSiteTheme(dark) {
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  if (dark) document.documentElement.removeAttribute(ATTR);
  else document.documentElement.setAttribute(ATTR, 'light');
}
