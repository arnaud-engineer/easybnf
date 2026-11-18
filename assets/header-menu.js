// Purely local disclosure: opening the menu stores and sends nothing.
function closeMenu(actions, focus = false) {
  actions.dataset.menuOpen = 'false';
  const button = actions.querySelector('.header-menu-toggle');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Ouvrir le menu');
  if (focus) button.focus();
}
document.addEventListener('click', event => {
  const button = event.target.closest('.header-menu-toggle');
  if (button) {
    const actions = button.closest('.header-actions');
    const open = actions.dataset.menuOpen !== 'true';
    actions.dataset.menuOpen = String(open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    return;
  }
  document.querySelectorAll('.header-actions[data-menu-open="true"]').forEach(actions => {
    if (!actions.contains(event.target) || event.target.closest('.header-secondary a')) closeMenu(actions);
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.header-actions[data-menu-open="true"]').forEach(actions => closeMenu(actions, true));
});

// Reserve the actual fixed-header height on desktop and small screens.
let measuredHeader;
let headerResize;
function measureHeader() {
  const header = document.querySelector('#app>header');
  if (!header || header === measuredHeader) return;
  headerResize?.disconnect();
  measuredHeader = header;
  const update = () => document.documentElement.style.setProperty('--easybnf-header-height', header.offsetHeight+'px');
  update();
  headerResize = new ResizeObserver(update);
  headerResize.observe(header);
}
measureHeader();
new MutationObserver(measureHeader).observe(document.getElementById('app'), {childList:true});
