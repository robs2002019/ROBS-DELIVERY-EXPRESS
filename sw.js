// ============================================================
// ROBS DELIVERY EXPRESS — Service Worker v1.0
// ============================================================

const CACHE_NAME = 'robs-delivery-v1';
const BASE = '/robsdelivery/';

const ASSETS_TO_CACHE = [
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap'
];

self.addEventListener('install', event => {
  console.log('[SW Delivery] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS_TO_CACHE.map(url => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    (url.hostname.includes('googleapis.com') && url.pathname.includes('/v1/')) ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('osrm.me') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('identitytoolkit') ||
    url.protocol === 'chrome-extension:'
  ) return;

  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)
          .then(cached => cached || caches.match(BASE + 'index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'ROBS DELIVERY', {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || BASE + 'icon-192.png',
    badge: BASE + 'icon-192.png',
    tag: data.tag || 'robs-delivery-notif',
    data: { url: data.url || BASE },
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || BASE;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('robsdelivery') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-pendientes') console.log('[SW Delivery] Sync activado');
});
