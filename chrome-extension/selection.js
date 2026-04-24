'use strict';
(function () {
  if (document.getElementById('tmb-sel-overlay')) return;

  const dpr = window.devicePixelRatio || 1;

  const ov = document.createElement('div');
  ov.id = 'tmb-sel-overlay';
  Object.assign(ov.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647',
    cursor: 'crosshair', background: 'rgba(0,0,0,0.45)',
  });

  const hint = document.createElement('div');
  Object.assign(hint.style, {
    position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(10,12,27,0.95)', color: '#f1f5f9', padding: '9px 18px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none',
    whiteSpace: 'nowrap', letterSpacing: '-0.01em',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  });
  hint.textContent = 'Sleep om het betslip te selecteren  •  Esc om te annuleren';
  ov.appendChild(hint);

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed', border: '2px solid #818cf8',
    background: 'rgba(129,140,248,0.06)',
    display: 'none', pointerEvents: 'none',
    boxShadow: '0 0 0 1px rgba(129,140,248,0.25), inset 0 0 0 1px rgba(129,140,248,0.1)',
  });
  ov.appendChild(box);

  const confirmBtn = document.createElement('button');
  Object.assign(confirmBtn.style, {
    position: 'fixed', display: 'none',
    background: '#818cf8', color: '#fff', border: 'none',
    borderRadius: '7px', padding: '7px 16px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', zIndex: '2147483647',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 12px rgba(129,140,248,0.4)',
    letterSpacing: '-0.01em',
  });
  confirmBtn.textContent = '✓  Opslaan';
  ov.appendChild(confirmBtn);

  let sx = 0, sy = 0, ex = 0, ey = 0, dragging = false;

  function getRect() {
    return {
      x: Math.min(sx, ex), y: Math.min(sy, ey),
      w: Math.abs(ex - sx), h: Math.abs(ey - sy),
    };
  }

  function updateBox() {
    const { x, y, w, h } = getRect();
    const visible = w > 4 && h > 4;
    Object.assign(box.style, {
      left: x + 'px', top: y + 'px',
      width: w + 'px', height: h + 'px',
      display: visible ? '' : 'none',
    });
    if (w > 60 && h > 40 && !dragging) {
      Object.assign(confirmBtn.style, {
        display: '',
        left: Math.max(8, x + w - 100) + 'px',
        top: Math.min(window.innerHeight - 48, y + h + 8) + 'px',
      });
    } else {
      confirmBtn.style.display = 'none';
    }
  }

  ov.addEventListener('mousedown', e => {
    e.preventDefault();
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    ex = e.clientX; ey = e.clientY;
    confirmBtn.style.display = 'none';
    updateBox();
  });

  ov.addEventListener('mousemove', e => {
    if (!dragging) return;
    ex = e.clientX; ey = e.clientY;
    updateBox();
  });

  ov.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    ex = e.clientX; ey = e.clientY;
    updateBox();
  });

  confirmBtn.addEventListener('click', e => {
    e.stopPropagation();
    const { x, y, w, h } = getRect();
    if (w < 10 || h < 10) return;
    chrome.runtime.sendMessage({ type: 'SELECTION_DONE', rect: { x, y, width: w, height: h, dpr } });
    ov.remove();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { chrome.runtime.sendMessage({ type: 'SELECTION_CANCEL' }); ov.remove(); }
  }, { capture: true, once: true });

  document.body.appendChild(ov);
})();
