const cacheName = "photo-app-cache-v1";
const assetsToCache = [
  "/",
  "/index.html",
  "/feed.html",
  "/css/style.css",
  "/js/feed.js",
  "/favicon.png"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});