'use client';
/* Vertaalt de pagina in de browser van Nederlands naar Engels.
   Werkt op tekstnodes en een paar attributen; houdt via een MutationObserver
   ook nieuwe/gewijzigde tekst bij. Woordenboek: lib/i18n/en.json
   (opnieuw genereren: node scripts/i18n/extract.mjs && node --env-file=.env.local scripts/i18n/translate.mjs) */

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);

const MONTHS = { januari: 'January', februari: 'February', maart: 'March', april: 'April', mei: 'May', juni: 'June', juli: 'July', augustus: 'August', september: 'September', oktober: 'October', november: 'November', december: 'December' };
const DAYS = { maandag: 'Monday', dinsdag: 'Tuesday', woensdag: 'Wednesday', donderdag: 'Thursday', vrijdag: 'Friday', zaterdag: 'Saturday', zondag: 'Sunday' };
const DATE_RE = new RegExp(`\\b(${[...Object.keys(MONTHS), ...Object.keys(DAYS)].join('|')})\\b`, 'gi');

let exact = null;
let lowerExact = null;
let patterns = [];
const cache = new Map();
let observer = null;

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export async function loadDictionary() {
  if (exact) return;
  const mod = await import('./en.json');
  const dict = mod.default || mod;
  exact = dict.exact;
  lowerExact = new Map(Object.entries(exact).map(([k, v]) => [k.toLowerCase(), v]));
  patterns = Object.entries(dict.patterns)
    .map(([nl, en]) => {
      const re = new RegExp('^' + escapeRe(nl).replace(/\\\{(\d+)\\\}/g, '(.+?)') + '$', 's');
      const order = [...nl.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1]));
      return { re, en, order };
    })
    /* Specifiekste patronen eerst */
    .sort((a, b) => b.re.source.length - a.re.source.length);
}

function translateFragment(s) {
  if (s in exact) return exact[s];
  const low = lowerExact.get(s.toLowerCase());
  if (low !== undefined) return s[0] === s[0].toLowerCase() ? low.charAt(0).toLowerCase() + low.slice(1) : low;
  return null;
}

export function translateText(raw) {
  if (!exact || !raw) return null;
  const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const core = m[2].replace(/\s+/g, ' ');
  if (!core || !/[A-Za-zÀ-ÿ]/.test(core)) return null;
  if (cache.has(core)) {
    const hit = cache.get(core);
    return hit === null ? null : m[1] + hit + m[3];
  }

  let out = translateFragment(core);

  if (out === null) {
    for (const p of patterns) {
      const mm = core.match(p.re);
      if (!mm) continue;
      out = p.en.replace(/\{(\d+)\}/g, (_, n) => {
        const cap = mm[p.order.indexOf(Number(n)) + 1] ?? '';
        return translateFragment(cap.trim()) ?? cap;
      });
      break;
    }
  }

  /* Titels als "Prijzen | TrackMijnBets" */
  if (out === null && core.includes(' | ')) {
    const parts = core.split(' | ');
    const tr = parts.map(p => translateFragment(p) ?? p);
    if (tr.some((t, i) => t !== parts[i])) out = tr.join(' | ');
  }

  /* Datums: maand- en dagnamen */
  if (out === null && DATE_RE.test(core)) {
    DATE_RE.lastIndex = 0;
    out = core.replace(DATE_RE, w => MONTHS[w.toLowerCase()] || DAYS[w.toLowerCase()]);
  }
  DATE_RE.lastIndex = 0;

  if (out === core) out = null;
  cache.set(core, out);
  return out === null ? null : m[1] + out + m[3];
}

function skip(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName) || n.hasAttribute('data-no-translate') || n.isContentEditable) return true;
  }
  return false;
}

function translateNode(node) {
  if (node.nodeType === 3) {
    const p = node.parentElement;
    if (!p || skip(p)) return;
    const t = translateText(node.nodeValue);
    if (t !== null && t !== node.nodeValue) node.nodeValue = t;
    return;
  }
  if (node.nodeType !== 1 || skip(node)) return;
  translateAttrs(node);
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: n => (n.nodeType === 1 && (SKIP_TAGS.has(n.tagName) || n.hasAttribute('data-no-translate'))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  let n = walker.nextNode();
  while (n) {
    if (n.nodeType === 3) {
      const t = translateText(n.nodeValue);
      if (t !== null && t !== n.nodeValue) n.nodeValue = t;
    } else {
      translateAttrs(n);
    }
    n = walker.nextNode();
  }
}

function translateAttrs(el) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const t = translateText(v);
    if (t !== null && t !== v) el.setAttribute(a, t);
  }
}

function translateTitle() {
  const t = translateText(document.title);
  if (t !== null && t !== document.title) document.title = t;
}

export async function startTranslation() {
  await loadDictionary();
  document.documentElement.lang = 'en';
  translateNode(document.body);
  translateTitle();
  if (observer) return;
  observer = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'characterData') translateNode(m.target);
      else if (m.type === 'attributes') { if (!skip(m.target)) translateAttrs(m.target); }
      else m.addedNodes.forEach(translateNode);
    }
    translateTitle();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  new MutationObserver(translateTitle).observe(document.head, { subtree: true, childList: true, characterData: true });
}
