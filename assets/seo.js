// The same metadata is built into each HTML page and retained on SPA navigation.
export function applyPageMetadata(path) {
  const config = JSON.parse(document.getElementById('seo-page-data').textContent);
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');
  const page = config.pages[normalized];
  function meta(attribute, name, value) {
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.append(element); }
    element.content = value;
  }
  if (!page) {
    document.title = 'Page introuvable — EasyBnF';
    meta('name', 'robots', 'noindex');
    document.head.querySelector('link[rel="canonical"]')?.remove();
    return;
  }
  document.title = page.title;
  const url = config.origin + normalized;
  meta('name', 'robots', page.indexable === false ? 'noindex,follow' : 'index,follow');
  meta('name', 'title', page.title);
  meta('name', 'description', page.description);
  for (const [key, value] of Object.entries({'og:title':page.title, 'og:description':page.description, 'og:url':url})) meta('property', key, value);
  for (const [key, value] of Object.entries({'twitter:title':page.title, 'twitter:description':page.description, 'twitter:url':url})) meta('name', key, value);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = url;
}
