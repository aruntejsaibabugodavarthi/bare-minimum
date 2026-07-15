const CACHE_NAME = 'bare-minimum-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/shop.html',
  '/css/style.css',
  '/js/common.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
