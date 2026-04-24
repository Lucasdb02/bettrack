'use strict';

const BASE_URL = 'https://trackmijnbets.nl';
const SB_URL   = 'https://ldyistwkhplfrtbnagxd.supabase.co';
const SB_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWlzdHdraHBsZnJ0Ym5hZ3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjYyMDgsImV4cCI6MjA5MTcwMjIwOH0.falhWrRpm0S3LWQHw3qRARZkOVjpqirX5Y1ITpVOdI0';

const BOOKMAKERS = ['bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',"Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino','Tonybet','Starcasino','888','Betnation','ComeOn','Overig'];
const SPORTEN    = ['Voetbal','Tennis','Basketball','Hockey','Formule 1','Wielrennen','Darts','Snooker','American Football','Overig'];
const MARKTEN    = ['1X2','Asian Handicap','Over/Under','BTTS','Wedstrijd Winnaar','Handicap','Totaal Punten','Race Winnaar','Eerste Doelpuntenmaker','Overig'];
const UITKOMSTEN = ['lopend','gewonnen','verloren','push','void','half_gewonnen','half_verloren','onbeslist'];
const UITKOMST_LABELS = { lopend:'Lopend', gewonnen:'Gewonnen', verloren:'Verloren', push:'Push', void:'Void', half_gewonnen:'½ Gewonnen', half_verloren:'½ Verloren', onbeslist:'Onbeslist' };

const $ = id => document.getElementById(id);
const storageGet    = k     => new Promise(r => chrome.storage.local.get([k], d => r(d[k] ?? null)));
const storageSet    = (k,v) => new Promise(r => chrome.storage.local.set({ [k]: v }, r));
const storageRemove = k     => new Promise(r => chrome.storage.local.remove([k], r));

let session        = null;
let capturedDataUrl = null;
let parsedBets     = [];
let userEmail      = '';

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // 1. Valid stored session → straight to capture screen
  const stored = await storageGet('session');
  if (stored && !isExpired(stored)) {
    session   = stored;
    userEmail = (await storageGet('userEmail')) || '';
    showIdle();
    return;
  }

  // 2. Try reading session from any open trackmijnbets.nl tab
  const tabSession = await readSessionFromTab();
  if (tabSession?.access_token) {
    session   = { access_token: tabSession.access_token, refresh_token: tabSession.refresh_token, expires_at: tabSession.expires_at };
    userEmail = tabSession.email || '';
    await storageSet('session', session);
    await storageSet('userEmail', userEmail);
    showIdle();
    return;
  }

  // 3. Not logged in — show debug info in footer hint
  const dbg = await storageGet('debugKeys');
  if (dbg) $('footer-hint').textContent = 'LS keys: ' + dbg;
  showScreen('auth');
}

// Try every possible way to find the Supabase session:
// 1. chrome.cookies (works if @supabase/ssr stores in cookies)
// 2. executeScript → localStorage (works if stored there)
// 3. executeScript → document.cookie (fallback)
async function readSessionFromTab() {
  const prefix = 'sb-ldyistwkhplfrtbnagxd-auth-token';

  // ── 1. chrome.cookies ────────────────────────────────────────────────────
  const cookieSession = await new Promise(resolve => {
    chrome.cookies.getAll({ domain: 'trackmijnbets.nl' }, prodC => {
      chrome.cookies.getAll({ domain: 'localhost' }, devC => {
        const all = [...(prodC || []), ...(devC || [])];
        const chunks = all
          .filter(c => c.name === prefix || c.name.startsWith(prefix + '.'))
          .sort((a, b) => {
            const n = s => parseInt(s.replace(prefix, '').replace('.', '') || '0');
            return n(a.name) - n(b.name);
          });
        if (!chunks.length) { resolve(null); return; }
        try {
          const parsed = JSON.parse(chunks.map(c => c.value).join(''));
          resolve({ access_token: parsed.access_token, refresh_token: parsed.refresh_token, expires_at: parsed.expires_at, email: parsed.user?.email || '' });
        } catch { resolve(null); }
      });
    });
  });
  if (cookieSession?.access_token) return cookieSession;

  // ── 2. executeScript → localStorage + document.cookie ───────────────────
  const tabs = await new Promise(r => chrome.tabs.query({ url: ['*://trackmijnbets.nl/*', '*://localhost:3000/*'] }, r));
  if (!tabs.length) return null;

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (key) => {
        // Try localStorage (synchronous)
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const p = JSON.parse(raw);
            if (p?.access_token) return { src: 'ls', access_token: p.access_token, refresh_token: p.refresh_token, expires_at: p.expires_at, email: p.user?.email || '' };
            // supabase v2 nests under .session
            if (p?.session?.access_token) return { src: 'ls.session', access_token: p.session.access_token, refresh_token: p.session.refresh_token, expires_at: p.session.expires_at, email: p.session.user?.email || '' };
          }
        } catch {}

        // Try document.cookie (synchronous)
        try {
          const parts = document.cookie.split('; ').filter(c => c.startsWith(key));
          if (parts.length) {
            const val = decodeURIComponent(parts.sort().map(c => c.slice(c.indexOf('=') + 1)).join(''));
            const p = JSON.parse(val);
            if (p?.access_token) return { src: 'cookie', access_token: p.access_token, refresh_token: p.refresh_token, expires_at: p.expires_at, email: p.user?.email || '' };
          }
        } catch {}

        // Return all localStorage keys for debugging
        return { src: 'none', keys: Object.keys(localStorage).join(',') };
      },
      args: [prefix],
    });

    const r = results?.[0]?.result;
    if (r?.access_token) return r;

    // Debug: show what keys were found
    if (r?.keys !== undefined) {
      await storageSet('debugKeys', r.keys || '(empty)');
    }
  } catch (e) {
    await storageSet('debugKeys', 'executeScript error: ' + e.message);
  }

  return null;
}

function isExpired(s) {
  if (!s?.expires_at) return false;
  return Date.now() / 1000 > s.expires_at - 60;
}

function showScreen(name) {
  ['auth','idle','review','success'].forEach(k => {
    $(`screen-${k}`).style.display = k === name ? '' : 'none';
  });
}

function showIdle() {
  $('user-email-label').textContent = userEmail || 'Ingelogd';
  showScreen('idle');
}

// ── Auth: open login page ─────────────────────────────────────────────────────
$('btn-open-login').addEventListener('click', () => {
  chrome.tabs.create({ url: BASE_URL + '/login' });
  window.close();
});

// ── Logout ────────────────────────────────────────────────────────────────────
$('btn-logout').addEventListener('click', async () => {
  await storageRemove('session');
  await storageRemove('userEmail');
  session = null; userEmail = '';
  showScreen('auth');
});

// ── Capture ───────────────────────────────────────────────────────────────────
$('btn-capture').addEventListener('click', async () => {
  const statusEl = $('capture-status');
  statusEl.style.display = 'none';
  $('btn-capture').disabled = true;
  $('capture-text').style.display  = 'none';
  $('capture-spinner').style.display = '';

  try {
    const resp = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, r => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(r);
      });
    });
    if (resp.error) throw new Error(resp.error);
    capturedDataUrl = resp.dataUrl;

    showStatus(statusEl, 'info', 'AI analyseert je betslip…');
    const bets = await parseScreenshot(capturedDataUrl);
    if (!bets?.length) { showStatus(statusEl, 'error', 'Geen bets gevonden. Probeer een duidelijkere screenshot.'); return; }
    parsedBets = bets;
    showReviewScreen();
  } catch (e) {
    showStatus(statusEl, 'error', e.message || 'Fout bij screenshot.');
  } finally {
    $('btn-capture').disabled = false;
    $('capture-text').style.display   = '';
    $('capture-spinner').style.display = 'none';
  }
});

async function parseScreenshot(dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  const form = new FormData();
  form.append('image', blob, 'screenshot.jpg');
  const res = await fetch(`${BASE_URL}/api/parse-screenshot`, { method: 'POST', body: form });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Server fout (${res.status})`); }
  return (await res.json()).bets || [];
}

function dataUrlToBlob(dataUrl) {
  const [hdr, b64] = dataUrl.split(',');
  const mime = hdr.match(/:(.*?);/)[1];
  const bin  = atob(b64);
  const arr  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ── Review ────────────────────────────────────────────────────────────────────
function showReviewScreen() {
  $('screenshot-thumb').src = capturedDataUrl;
  const n = parsedBets.length;
  $('review-title').textContent = `${n} bet${n !== 1 ? 's' : ''} gevonden`;
  $('save-text').textContent    = `Opslaan (${n})`;
  renderBetsList();
  showScreen('review');
}

function renderBetsList() {
  const list = $('bets-list');
  list.innerHTML = '';
  parsedBets.forEach((bet, idx) => list.appendChild(createBetCard(bet, idx)));
}

function uitkomstColor(u) {
  if (u === 'gewonnen' || u === 'half_gewonnen') return 'green';
  if (u === 'verloren' || u === 'half_verloren') return 'red';
  if (u === 'lopend') return 'yellow';
  return '';
}

function createBetCard(bet, idx) {
  const card = document.createElement('div');
  card.className = 'bet-card';

  const header = document.createElement('div');
  header.className = 'bet-card-header';
  header.innerHTML = `
    <div class="bet-match-row">
      <div class="bet-match">${esc(bet.wedstrijd || '—')}</div>
      <div class="bet-card-btns">
        <button class="icon-btn edit-btn" title="Bewerken">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-btn danger del-btn" title="Verwijderen">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>`;

  const selRow = document.createElement('div');
  selRow.className = 'bet-selection-row';
  selRow.innerHTML = `<strong>${esc(bet.selectie || '—')}</strong>&ensp;<span style="color:#334155">${esc(bet.markt || '')}</span>`;

  const grid = document.createElement('div');
  grid.className = 'bet-info-grid';
  grid.innerHTML = `
    <div class="bet-info-cell"><div class="bet-info-label">Odds</div><div class="bet-info-val accent">${bet.odds ?? '—'}</div></div>
    <div class="bet-info-cell"><div class="bet-info-label">Inzet</div><div class="bet-info-val">${bet.inzet ? `€ ${Number(bet.inzet).toFixed(2)}` : '—'}</div></div>
    <div class="bet-info-cell"><div class="bet-info-label">Bookmaker</div><div class="bet-info-val">${esc(bet.bookmaker || '—')}</div></div>
    <div class="bet-info-cell"><div class="bet-info-label">Uitkomst</div><div class="bet-info-val ${uitkomstColor(bet.uitkomst)}">${UITKOMST_LABELS[bet.uitkomst] || '—'}</div></div>
    <div class="bet-info-cell"><div class="bet-info-label">Sport</div><div class="bet-info-val">${esc(bet.sport || '—')}</div></div>
    <div class="bet-info-cell"><div class="bet-info-label">Datum</div><div class="bet-info-val">${esc(bet.datum || '—')}</div></div>`;

  const editPanel = createEditPanel(bet, idx);

  header.querySelector('.edit-btn').addEventListener('click', e => { e.stopPropagation(); editPanel.classList.toggle('open'); });
  header.querySelector('.del-btn').addEventListener('click', e => {
    e.stopPropagation();
    parsedBets.splice(idx, 1);
    const n = parsedBets.length;
    $('review-title').textContent = `${n} bet${n !== 1 ? 's' : ''} gevonden`;
    $('save-text').textContent    = `Opslaan (${n})`;
    renderBetsList();
  });
  header.addEventListener('click', () => editPanel.classList.toggle('open'));

  card.appendChild(header);
  card.appendChild(selRow);
  card.appendChild(grid);
  card.appendChild(editPanel);
  return card;
}

function createEditPanel(bet, idx) {
  const panel = document.createElement('div');
  panel.className = 'bet-edit-panel';

  const mkInput = (name, value, type = 'text') => {
    const el = document.createElement('input');
    el.className = 'edit-input'; el.type = type; el.value = value ?? '';
    el.addEventListener('input', () => { parsedBets[idx][name] = type === 'number' ? parseFloat(el.value) || 0 : el.value; });
    return el;
  };

  const mkSelect = (name, opts, val) => {
    const sel = document.createElement('select');
    sel.className = 'edit-input';
    opts.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (o === val) opt.selected = true; sel.appendChild(opt); });
    sel.addEventListener('change', () => { parsedBets[idx][name] = sel.value; });
    return sel;
  };

  const field = (label, el, full = false) => {
    const w = document.createElement('div'); w.className = full ? 'edit-field full' : 'edit-field';
    const l = document.createElement('div'); l.className = 'edit-label'; l.textContent = label;
    w.appendChild(l); w.appendChild(el); return w;
  };

  [
    [[field('Wedstrijd', mkInput('wedstrijd', bet.wedstrijd), true)]],
    [[field('Selectie',  mkInput('selectie',  bet.selectie),  true)]],
    [[field('Odds', mkInput('odds', bet.odds, 'number')), field('Inzet (€)', mkInput('inzet', bet.inzet, 'number'))]],
    [[field('Bookmaker', mkSelect('bookmaker', BOOKMAKERS, bet.bookmaker)), field('Uitkomst', mkSelect('uitkomst', UITKOMSTEN, bet.uitkomst))]],
    [[field('Sport', mkSelect('sport', SPORTEN, bet.sport)), field('Markt', mkSelect('markt', MARKTEN, bet.markt))]],
    [[field('Datum', mkInput('datum', bet.datum, 'date'), true)]],
  ].forEach(([fields]) => {
    const row = document.createElement('div'); row.className = 'edit-row';
    fields.forEach(f => row.appendChild(f)); panel.appendChild(row);
  });

  return panel;
}

$('btn-back').addEventListener('click', () => { showScreen('idle'); $('capture-status').style.display = 'none'; });

// ── Save ──────────────────────────────────────────────────────────────────────
$('btn-save').addEventListener('click', async () => {
  if (!parsedBets.length) return;
  const errEl = $('save-error');
  errEl.style.display = 'none';
  $('btn-save').disabled = true;
  $('save-text').style.display   = 'none';
  $('save-icon').style.display   = 'none';
  $('save-spinner').style.display = '';

  try {
    if (!session || isExpired(session)) {
      const ok = await refreshSession();
      if (!ok) { showScreen('auth'); return; }
    }
    const res  = await fetch(`${BASE_URL}/api/extension/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ bets: parsedBets }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Fout (${res.status})`);
    const n = data.saved ?? parsedBets.length;
    $('success-title').textContent = `${n} bet${n !== 1 ? 's' : ''} opgeslagen!`;
    parsedBets = []; capturedDataUrl = null;
    showScreen('success');
  } catch (e) {
    errEl.textContent = e.message || 'Opslaan mislukt.';
    errEl.style.display = '';
  } finally {
    $('btn-save').disabled = false;
    $('save-text').style.display   = '';
    $('save-icon').style.display   = '';
    $('save-spinner').style.display = 'none';
  }
});

$('btn-new-screenshot').addEventListener('click', () => { showScreen('idle'); $('capture-status').style.display = 'none'; });

// ── Token refresh ─────────────────────────────────────────────────────────────
async function refreshSession() {
  if (!session?.refresh_token) return false;
  try {
    const res  = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) return false;
    session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at };
    await storageSet('session', session);
    return true;
  } catch { return false; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function showStatus(el, type, msg) {
  el.className = `status-msg ${type}`;
  el.textContent = msg;
  el.style.display = '';
}

init();
