'use strict';

const BASE_URL     = 'https://trackmijnbets.nl';
const SB_URL       = 'https://ldyistwkhplfrtbnagxd.supabase.co';
const SB_KEY       = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWlzdHdraHBsZnJ0Ym5hZ3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjYyMDgsImV4cCI6MjA5MTcwMjIwOH0.falhWrRpm0S3LWQHw3qRARZkOVjpqirX5Y1ITpVOdI0';

const BOOKMAKERS = ['bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',"Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino','Tonybet','Starcasino','888','Betnation','ComeOn','Overig'];
const SPORTEN    = ['Voetbal','Tennis','Basketball','Hockey','Formule 1','Wielrennen','Darts','Snooker','American Football','Overig'];
const MARKTEN    = ['1X2','Asian Handicap','Over/Under','BTTS','Wedstrijd Winnaar','Handicap','Totaal Punten','Race Winnaar','Eerste Doelpuntenmaker','Overig'];
const UITKOMSTEN = ['lopend','gewonnen','verloren','push','void','half_gewonnen','half_verloren','onbeslist'];
const UITKOMST_LABELS = { lopend:'Lopend', gewonnen:'Gewonnen', verloren:'Verloren', push:'Push', void:'Void', half_gewonnen:'½ Gewonnen', half_verloren:'½ Verloren', onbeslist:'Onbeslist' };

const $ = id => document.getElementById(id);

let session        = null;
let capturedDataUrl = null;
let parsedBets     = [];
let userEmail      = '';

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // 1. Stored session still valid → go straight to idle
  const stored = await storageGet('session');
  if (stored && !isExpired(stored)) {
    session   = stored;
    userEmail = (await storageGet('userEmail')) || '';
    await showIdle();
    return;
  }

  // 2. No stored session — check if user is already logged in on an open tab
  const tabSession = await readSessionFromTab();
  if (tabSession?.access_token) {
    session   = { access_token: tabSession.access_token, refresh_token: tabSession.refresh_token, expires_at: tabSession.expires_at };
    userEmail = tabSession.user?.email || '';
    await storageSet('session', session);
    await storageSet('userEmail', userEmail);
    await showIdle();
    return;
  }

  // 3. Not logged in anywhere → show auth screen
  showScreen('auth');
}

// Injects a same-origin fetch into an open trackmijnbets.nl tab.
// Because it runs inside the site's context, cookies are sent automatically
// and /api/extension/session can read the server-side Supabase session.
async function readSessionFromTab() {
  return new Promise(resolve => {
    chrome.tabs.query(
      { url: ['*://trackmijnbets.nl/*', '*://localhost:3000/*'] },
      async tabs => {
        if (!tabs.length) { resolve(null); return; }
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: async () => {
              try {
                const res = await fetch('/api/extension/session');
                if (!res.ok) return null;
                return await res.json();
              } catch { return null; }
            },
          });
          resolve(results?.[0]?.result || null);
        } catch { resolve(null); }
      }
    );
  });
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

async function showIdle() {
  $('user-email-label').textContent = userEmail || 'Ingelogd';
  showScreen('idle');
  loadStats();
}

// ── Storage ───────────────────────────────────────────────────────────────────
const storageGet = key => new Promise(r => chrome.storage.local.get([key], d => r(d[key] ?? null)));
const storageSet = (k, v) => new Promise(r => chrome.storage.local.set({ [k]: v }, r));
const storageRemove = k => new Promise(r => chrome.storage.local.remove([k], r));

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [total, todayRes] = await Promise.all([
      fetch(`${SB_URL}/rest/v1/bets?select=id`, {
        headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${session.access_token}` },
      }),
      fetch(`${SB_URL}/rest/v1/bets?select=id&datum=eq.${today}`, {
        headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${session.access_token}` },
      }),
    ]);
    if (total.ok) {
      const d = await total.json();
      $('stat-total').textContent = Array.isArray(d) ? d.length : '—';
    }
    if (todayRes.ok) {
      const d = await todayRes.json();
      $('stat-today').textContent = Array.isArray(d) ? d.length : '—';
    }
  } catch { /* silent */ }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
$('btn-google').addEventListener('click', async () => {
  // Open the site — user logs in normally, then clicks the extension again
  chrome.tabs.create({ url: BASE_URL + '/login' });
  window.close();
});

// ── Email login ───────────────────────────────────────────────────────────────
$('btn-login').addEventListener('click', handleEmailLogin);
$('input-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleEmailLogin(); });
$('input-email').addEventListener('keydown', e => { if (e.key === 'Enter') $('input-password').focus(); });

async function handleEmailLogin() {
  const email    = $('input-email').value.trim();
  const password = $('input-password').value;
  const errEl    = $('auth-error');
  if (!email || !password) { showError(errEl, 'Vul je e-mail en wachtwoord in.'); return; }

  setLoading('btn-login', 'login-text', 'login-spinner', true);
  errEl.style.display = 'none';

  try {
    const res  = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) {
      showError(errEl, data.error_description || data.message || 'Inloggen mislukt.');
      return;
    }
    session   = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at };
    userEmail = data.user?.email || email;
    await storageSet('session', session);
    await storageSet('userEmail', userEmail);
    await showIdle();
  } catch {
    showError(errEl, 'Netwerkfout. Controleer je verbinding.');
  } finally {
    setLoading('btn-login', 'login-text', 'login-spinner', false);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
$('btn-logout').addEventListener('click', async () => {
  await storageRemove('session');
  await storageRemove('userEmail');
  session   = null;
  userEmail = '';
  $('google-text').textContent = 'Doorgaan met Google';
  showScreen('auth');
});

// ── Capture ───────────────────────────────────────────────────────────────────
$('btn-capture').addEventListener('click', async () => {
  const statusEl = $('capture-status');
  statusEl.style.display = 'none';
  setLoading('btn-capture', 'capture-text', 'capture-spinner', true);
  $('capture-cam-icon').style.display = 'none';

  try {
    const resp = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, response => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(response);
      });
    });
    if (resp.error) throw new Error(resp.error);
    capturedDataUrl = resp.dataUrl;

    showStatus(statusEl, 'info', 'AI analyseert je betslip…');
    const bets = await parseScreenshot(capturedDataUrl);

    if (!bets || bets.length === 0) {
      showStatus(statusEl, 'error', 'Geen bets gevonden. Probeer een duidelijkere screenshot.');
      return;
    }
    parsedBets = bets;
    showReviewScreen();
  } catch (e) {
    showStatus(statusEl, 'error', e.message || 'Fout bij screenshot.');
  } finally {
    setLoading('btn-capture', 'capture-text', 'capture-spinner', false);
    $('capture-cam-icon').style.display = '';
  }
});

async function parseScreenshot(dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  const form = new FormData();
  form.append('image', blob, 'screenshot.jpg');
  const res  = await fetch(`${BASE_URL}/api/parse-screenshot`, { method: 'POST', body: form });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Server fout (${res.status})`); }
  const data = await res.json();
  return data.bets || [];
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bin  = atob(b64);
  const arr  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ── Review ────────────────────────────────────────────────────────────────────
function showReviewScreen() {
  $('screenshot-thumb').src = capturedDataUrl;
  $('review-title').textContent = `${parsedBets.length} bet${parsedBets.length !== 1 ? 's' : ''} gevonden`;
  $('review-sub').textContent = `Controleer voor het opslaan`;
  $('save-text').textContent  = `Opslaan (${parsedBets.length})`;
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

  // ── Header: match name + action buttons
  const header = document.createElement('div');
  header.className = 'bet-card-header';
  header.innerHTML = `
    <div class="bet-match-row">
      <div class="bet-match">${esc(bet.wedstrijd || '—')}</div>
      <div class="bet-card-btns">
        <button class="icon-btn edit-btn" title="Bewerken" data-idx="${idx}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-btn danger del-btn" title="Verwijderen" data-idx="${idx}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>`;

  // ── Selection (full width row)
  const selRow = document.createElement('div');
  selRow.className = 'bet-selection-row';
  selRow.innerHTML = `<strong>${esc(bet.selectie || '—')}</strong>&ensp;<span style="color:var(--text-4)">${esc(bet.markt || '')}</span>`;

  // ── Info grid: 2 × 2 cells
  const infoGrid = document.createElement('div');
  infoGrid.className = 'bet-info-grid';
  const colorClass = uitkomstColor(bet.uitkomst);
  infoGrid.innerHTML = `
    <div class="bet-info-cell">
      <div class="bet-info-label">Odds</div>
      <div class="bet-info-val accent">${bet.odds ?? '—'}</div>
    </div>
    <div class="bet-info-cell">
      <div class="bet-info-label">Inzet</div>
      <div class="bet-info-val">${bet.inzet ? `€ ${Number(bet.inzet).toFixed(2)}` : '—'}</div>
    </div>
    <div class="bet-info-cell">
      <div class="bet-info-label">Bookmaker</div>
      <div class="bet-info-val">${esc(bet.bookmaker || '—')}</div>
    </div>
    <div class="bet-info-cell">
      <div class="bet-info-label">Uitkomst</div>
      <div class="bet-info-val ${colorClass}">${UITKOMST_LABELS[bet.uitkomst] || bet.uitkomst || '—'}</div>
    </div>
    <div class="bet-info-cell">
      <div class="bet-info-label">Sport</div>
      <div class="bet-info-val">${esc(bet.sport || '—')}</div>
    </div>
    <div class="bet-info-cell">
      <div class="bet-info-label">Datum</div>
      <div class="bet-info-val">${esc(bet.datum || '—')}</div>
    </div>`;

  // ── Edit panel
  const editPanel = createEditPanel(bet, idx);

  // Events
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
  card.appendChild(infoGrid);
  card.appendChild(editPanel);
  return card;
}

function createEditPanel(bet, idx) {
  const panel = document.createElement('div');
  panel.className = 'bet-edit-panel';

  const mk = (tag, cls, attrs = {}) => {
    const el = document.createElement(tag);
    el.className = cls;
    Object.entries(attrs).forEach(([k, v]) => (el[k] = v));
    return el;
  };

  const mkInput = (name, value, type = 'text') => {
    const el = mk('input', 'edit-input', { type, value: value ?? '' });
    el.addEventListener('input', () => { parsedBets[idx][name] = type === 'number' ? parseFloat(el.value) || 0 : el.value; });
    return el;
  };

  const mkSelect = (name, opts, val) => {
    const sel = mk('select', 'edit-input');
    opts.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (o === val) opt.selected = true; sel.appendChild(opt); });
    sel.addEventListener('change', () => { parsedBets[idx][name] = sel.value; });
    return sel;
  };

  const field = (label, el, full = false) => {
    const wrap = document.createElement('div');
    wrap.className = full ? 'edit-field full' : 'edit-field';
    const lbl = document.createElement('div');
    lbl.className = 'edit-label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    wrap.appendChild(el);
    return wrap;
  };

  const rows = [
    [[field('Wedstrijd', mkInput('wedstrijd', bet.wedstrijd), true)]],
    [[field('Selectie', mkInput('selectie', bet.selectie), true)]],
    [[field('Odds', mkInput('odds', bet.odds, 'number')), field('Inzet (€)', mkInput('inzet', bet.inzet, 'number'))]],
    [[field('Bookmaker', mkSelect('bookmaker', BOOKMAKERS, bet.bookmaker)), field('Uitkomst', mkSelect('uitkomst', UITKOMSTEN, bet.uitkomst))]],
    [[field('Sport', mkSelect('sport', SPORTEN, bet.sport)), field('Markt', mkSelect('markt', MARKTEN, bet.markt))]],
    [[field('Datum', mkInput('datum', bet.datum, 'date'), true)]],
  ];

  rows.forEach(row => {
    const r = document.createElement('div');
    r.className = 'edit-row';
    row[0].forEach(f => r.appendChild(f));
    panel.appendChild(r);
  });

  return panel;
}

// ── Back ──────────────────────────────────────────────────────────────────────
$('btn-back').addEventListener('click', () => {
  showScreen('idle');
  $('capture-status').style.display = 'none';
});

// ── Save ──────────────────────────────────────────────────────────────────────
$('btn-save').addEventListener('click', async () => {
  if (!parsedBets.length) return;
  const errEl = $('save-error');
  errEl.style.display = 'none';
  setLoading('btn-save', 'save-text', 'save-spinner', true);
  $('save-icon').style.display = 'none';

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
    parsedBets = [];
    capturedDataUrl = null;
    showScreen('success');
    loadStats();
  } catch (e) {
    showError(errEl, e.message || 'Opslaan mislukt.');
  } finally {
    setLoading('btn-save', 'save-text', 'save-spinner', false);
    $('save-icon').style.display = '';
  }
});

// ── Success ───────────────────────────────────────────────────────────────────
$('btn-new-screenshot').addEventListener('click', () => {
  showScreen('idle');
  $('capture-status').style.display = 'none';
});

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

function showError(el, msg) { el.textContent = msg; el.style.display = ''; }

function showStatus(el, type, msg) {
  el.className = `status-msg ${type}`;
  el.textContent = msg;
  el.style.display = '';
}

function setLoading(btnId, textId, spinnerId, on) {
  $(btnId).disabled = on;
  $(textId).style.display   = on ? 'none' : '';
  $(spinnerId).style.display = on ? '' : 'none';
}

init();
