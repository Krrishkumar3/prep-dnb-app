// ─── Cache Utilities ───────────────────────────────────────────

const CACHE_KEY = 'prepDNB_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Cache write failed', e);
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}
