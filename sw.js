const CACHE_NAME = 'robs-delivery-v4';
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

  // Solo interceptar peticiones del MISMO ORIGEN (los archivos propios de la app:
  // index.html, manifest.json, íconos, etc.). Cualquier petición a un dominio externo
  // (Nominatim para geocodificación, OSRM para rutas, tiles de OpenStreetMap, el stream
  // de la radio, Firebase, Google APIs, etc.) se deja pasar directo al navegador sin
  // pasar por el Service Worker, evitando errores de "network error response".
  if (!url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
