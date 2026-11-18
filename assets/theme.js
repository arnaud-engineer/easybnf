// The theme preference stays on this device; no request or telemetry is sent.
(() => {
  const key = 'easybnf:theme:v1';
  const root = document.documentElement;
  let theme = 'light';
  try { if (localStorage.getItem(key) === 'dark') theme = 'dark'; } catch {}
  function sync() {
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
    const dark = theme === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    const color = dark ? '#000000' : '#ffffff';
    if (meta && meta.content !== color) meta.content = color;
    document.querySelectorAll('.theme-toggle').forEach(button => {
      const label = dark ? 'Activer le mode clair' : 'Activer le mode sombre OLED';
      if (button.getAttribute('aria-label') === label) return;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(dark));
    });
  }
  sync();
  document.addEventListener('click', event => {
    if (!event.target.closest('.theme-toggle')) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, theme); } catch {}
    sync();
  });
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    new MutationObserver(sync).observe(document.getElementById('app'), {childList:true, subtree:true});
  }, {once:true});
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    theme = event.newValue === 'dark' ? 'dark' : 'light';
    sync();
  });
})();
