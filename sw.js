const CACHE_NAME = 'robs-delivery-v3';
const ASSETS = [
  '/ROBS-DELIVERY-EXPRESS/',
  '/ROBS-DELIVERY-EXPRESS/index.html',
  '/ROBS-DELIVERY-EXPRESS/manifest.json',
  '/ROBS-DELIVERY-EXPRESS/icon-192.png',
  '/ROBS-DELIVERY-EXPRESS/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // No interceptar peticiones que no sean GET (POST de login, etc.)
  if (e.request.method !== 'GET') return;

  // No interceptar llamadas a Firebase, Google APIs, Firestore, Auth, etc.
  if (
    url.includes('googleapis.com') ||
    url.includes('google.com') ||
    url.includes('gstatic.com') ||
    url.includes('firebaseio.com') ||
    url.includes('firebaseapp.com') ||
    url.includes('firebasestorage.app')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
