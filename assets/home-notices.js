// Independent dismissals, stored only in this browser, including after SPA navigation.
const prefix = 'easybnf:home-notice:';
function restoreDismissals() {
  document.querySelectorAll('[data-dismiss-home-notice]').forEach(button => {
    try {
      if (localStorage.getItem(prefix + button.dataset.dismissHomeNotice) === 'true') {
        button.closest('.home-notice').hidden = true;
      }
    } catch { /* Notices remain usable when browser storage is unavailable. */ }
  });
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-dismiss-home-notice]');
  if (!button) return;
  button.closest('.home-notice').hidden = true;
  try { localStorage.setItem(prefix + button.dataset.dismissHomeNotice, 'true'); } catch {}
});
new MutationObserver(restoreDismissals).observe(document.getElementById('app'), {childList: true, subtree: true});
restoreDismissals();
