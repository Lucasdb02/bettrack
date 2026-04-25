// Service worker

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

  // Full-tab capture (called from popup while activeTab permission is active)
  if (msg.type === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, dataUrl => {
      if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
      else sendResponse({ dataUrl });
    });
    return true;
  }

  // Inject region-selection overlay into the active tab
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

  // User confirmed selection — crop the already-captured fullCapture
  if (msg.type === 'SELECTION_DONE') {
    const { rect } = msg;
    chrome.storage.local.get(['fullCapture'], ({ fullCapture }) => {
      if (!fullCapture) return;
      chrome.storage.local.remove(['fullCapture']);
      cropDataUrl(fullCapture, rect).then(cropped => {
        chrome.storage.local.set({ pendingCapture: cropped });
        chrome.action.setBadgeText({ text: '●' });
        chrome.action.setBadgeBackgroundColor({ color: '#818cf8' });
      }).catch(() => {});
    });
    return false;
  }

  // User pressed Escape — clean up stored full capture
  if (msg.type === 'SELECTION_CANCEL') {
    chrome.storage.local.remove(['fullCapture']);
    return false;
  }
});
