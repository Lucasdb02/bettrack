// Service worker

const DASHBOARD_ORIGINS = ['https://trackmijnbets.nl', 'http://localhost:3000'];

// ── Crop helper ───────────────────────────────────────────────────────────────
async function cropDataUrl(dataUrl, { x, y, width, height, dpr }) {
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  const bmp  = await createImageBitmap(blob);
  const w    = Math.round(width  * dpr);
  const h    = Math.round(height * dpr);
  const canvas = new OffscreenCanvas(w, h);
  const ctx    = canvas.getContext('2d');
  ctx.drawImage(bmp, Math.round(x * dpr), Math.round(y * dpr), w, h, 0, 0, w, h);
  const outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.88 });
  return new Promise(resolve => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(outBlob);
  });
}

// ── Message handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // Popup → start region selection
  if (msg.type === 'START_SELECTION') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) { sendResponse({ error: 'No active tab' }); return; }
      chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, files: ['selection.js'] },
        () => sendResponse({ ok: true })
      );
    });
    return true;
  }

  // Content script → user finished selection
  if (msg.type === 'SELECTION_DONE') {
    const { rect } = msg;
    const windowId = sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
    chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 90 }, dataUrl => {
      if (chrome.runtime.lastError || !dataUrl) return;
      cropDataUrl(dataUrl, rect).then(cropped => {
        chrome.storage.local.set({ pendingCapture: cropped });
        chrome.action.setBadgeText({ text: '●' });
        chrome.action.setBadgeBackgroundColor({ color: '#818cf8' });
      });
    });
    return false;
  }

  // Content script → user cancelled selection
  if (msg.type === 'SELECTION_CANCEL') {
    return false;
  }

  // Legacy full-tab capture (kept for fallback)
  if (msg.type === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, dataUrl => {
      if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
      else sendResponse({ dataUrl });
    });
    return true;
  }
});
