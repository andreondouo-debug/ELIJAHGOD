/**
 * 🚫 Service Worker désactivé
 * Fichier minimal pour désenregistrer tout service worker existant
 */

// Désenregistrer tous les service workers existants
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Vider tous les caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ]).then(() => {
      console.log('🗑️ Service worker désactivé et caches vidés');
      // Se désenregistrer lui-même
      self.registration.unregister();
    })
  );
});

// Ne rien mettre en cache
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes sans interception
  return;
});
