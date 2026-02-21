/**
 * Utilitaire cache localStorage — stale-while-revalidate
 * Affiche les données en cache instantanément, puis rafraîchit en arrière-plan
 */

const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes

export const getCache = (key, ttl = DEFAULT_TTL) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > ttl) return null;
    return data;
  } catch {
    return null;
  }
};

export const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};
