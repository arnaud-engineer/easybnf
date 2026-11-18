// Preferences never leave this browser. Store only explicit changes to defaults.
const storageKey = 'easybnf:favorites:v1';
const alphabet = new Intl.Collator('fr', {sensitivity: 'base', numeric: true});
export function readFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, selected]) => key && typeof selected === 'boolean'));
  } catch { return {}; }
}
export function isFavorite(resource, overrides) {
  return Object.hasOwn(overrides, resource.easybnf_id)
    ? overrides[resource.easybnf_id] : Boolean(resource.official_favorite_rank);
}
export function sortFavorites(resources, overrides) {
  function group(resource) {
    return isFavorite(resource, overrides) ? (resource.official_favorite_rank ? 0 : 1) : 2;
  }
  return [...resources].sort((a, b) => {
    const first = group(a), second = group(b);
    if (first !== second) return first - second;
    if (first === 0) return a.official_favorite_rank - b.official_favorite_rank;
    return alphabet.compare(a.name, b.name) || a.easybnf_id.localeCompare(b.easybnf_id);
  });
}
export function toggleFavorite(resource, overrides) {
  const next = {...overrides};
  const selected = !isFavorite(resource, overrides);
  if (selected === Boolean(resource.official_favorite_rank)) delete next[resource.easybnf_id];
  else next[resource.easybnf_id] = selected;
  try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Still works for this visit. */ }
  return next;
}
