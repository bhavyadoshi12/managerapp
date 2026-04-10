const CACHE_NAME = 'themanager-v2'; // Bumped version to force reset
const urlsToCache = [
  '/',
  '/login/',
  '/register/',
  '/maintenance/',
  '/static/core/pwa/logo.png',
  '/static/core/pwa/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control of all open tabs immediately
      // Delete old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  // 1. Only handle GET requests
  if (event.request.method !== 'GET') return;

  // 2. Do not intercept external CDNs to avoid CORS errors
  if (event.request.url.startsWith('http') && !event.request.url.includes(self.location.origin)) {
    return;
  }

  // 3. Normal cache-first or network-fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
