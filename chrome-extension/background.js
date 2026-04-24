// Service worker

const SB_KEY = 'sb-ldyistwkhplfrtbnagxd-auth-token';
const DASHBOARD_ORIGINS = ['https://trackmijnbets.nl', 'http://localhost:3000'];

// ── Screenshot capture ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, (dataUrl) => {
      if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
      else sendResponse({ dataUrl });
    });
    return true;
  }

  if (msg.type === 'OPEN_LOGIN_TAB') {
    const loginUrl = (msg.base || 'https://trackmijnbets.nl') + '/login';
    chrome.tabs.create({ url: loginUrl }, (tab) => {
      chrome.storage.local.set({ pendingLoginTabId: tab.id });
      sendResponse({ tabId: tab.id });
    });
    return true;
  }
});

// ── Session capture after Google login ───────────────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete') return;
  if (!tab.url) return;

  chrome.storage.local.get(['pendingLoginTabId'], (stored) => {
    if (stored.pendingLoginTabId !== tabId) return;

    const isDashboard = DASHBOARD_ORIGINS.some(o => tab.url.startsWith(o + '/dashboard'));
    if (!isDashboard) return;

    // Inject script to read Supabase session from localStorage
    chrome.scripting.executeScript({
      target: { tabId },
      func: (key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
      },
      args: [SB_KEY],
    }, (results) => {
      const parsed = results?.[0]?.result;
      if (!parsed) return;

      // Supabase v2 stores { access_token, refresh_token, expires_at, user, ... }
      const session = {
        access_token:  parsed.access_token,
        refresh_token: parsed.refresh_token,
        expires_at:    parsed.expires_at,
      };
      const email = parsed.user?.email || '';

      chrome.storage.local.set({ session, userEmail: email, pendingLoginTabId: null }, () => {
        // Notify any open popup
        chrome.runtime.sendMessage({ type: 'SESSION_READY', session, email }).catch(() => {});
        // Close the login tab
        chrome.tabs.remove(tabId);
      });
    });
  });
});
