// Collapsed by default; explicit disclosure choices stay entirely local.
const key = 'easybnf:creator-notice:collapsed:v2';
const prepared = new WeakSet();
function prepare() {
  document.querySelectorAll('details.restoration-notice').forEach(notice => {
    if (prepared.has(notice)) return;
    prepared.add(notice);
    try { notice.open = localStorage.getItem(key) === 'false'; } catch {}
    const summary = notice.querySelector('summary');
    const title = summary.querySelector('h2');
    const body = notice.querySelector('.restoration-notice-body');
    let targetOpen = notice.open;
    let animations = [];
    let generation = 0;
    let moving = false;
    notice.dataset.collapsed = String(!targetOpen);
    function label() { summary.title = targetOpen ? 'Réduire cet encart' : 'Déplier cet encart'; }
    function save() { try { localStorage.setItem(key, String(!targetOpen)); } catch {} }
    function geometry(element, properties) {
      const style = getComputedStyle(element);
      return Object.fromEntries(properties.map(name => [name, style[name]]));
    }
    const boxProperties = ['width','height','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom'];
    const titleProperties = ['fontSize','lineHeight','fontWeight'];
    label();
    notice.addEventListener('toggle', () => {
      if (moving) return;
      targetOpen = notice.open;
      notice.dataset.collapsed = String(!targetOpen);
      label();
      save();
    });
    summary.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      event.preventDefault();
      const beforeBox = geometry(notice, boxProperties);
      const beforeTitle = geometry(title, titleProperties);
      const bodyWidth = body.getBoundingClientRect().width;
      const bodyOpacity = getComputedStyle(body).opacity;
      const wasOpen = notice.open;
      const token = ++generation;
      targetOpen = !targetOpen;
      moving = true;
      animations.forEach(animation => animation.cancel());
      animations = [];
      body.style.width = '';
      notice.open = targetOpen;
      notice.dataset.collapsed = String(!targetOpen);
      label();
      const afterBox = geometry(notice, boxProperties);
      const afterTitle = geometry(title, titleProperties);
      const expandedWidth = targetOpen ? body.getBoundingClientRect().width : bodyWidth;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !notice.animate) {
        moving = false;
        save();
        return;
      }
      // Keep content laid out at its expanded width while the outer frame moves.
      // Closing the native details only after the animation avoids an abrupt jump.
      notice.open = true;
      notice.style.overflow = 'hidden';
      body.style.width = expandedWidth+'px';
      const timing = {duration:360, easing:'cubic-bezier(.25,.8,.25,1)', fill:'both'};
      animations = [
        notice.animate([beforeBox, afterBox], timing),
        title.animate([beforeTitle, afterTitle], timing),
        body.animate([{opacity:wasOpen ? bodyOpacity : 0},{opacity:targetOpen ? 1 : 0}], timing)
      ];
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (token !== generation) return;
        notice.open = targetOpen;
        animations.forEach(animation => animation.cancel());
        animations = [];
        body.style.width = '';
        notice.style.overflow = '';
        moving = false;
        save();
      }).catch(() => { /* A new click reverses smoothly from the current frame. */ });
    });
  });
}
prepare();
new MutationObserver(prepare).observe(document.getElementById('app'), {childList:true, subtree:true});
