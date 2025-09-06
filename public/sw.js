// sw.js (save in public/ folder)

// ✅ Cache का नाम
const CACHE_NAME = "photo-app-cache-v1";

// ✅ Cache करने वाली files
const urlsToCache = [
  "/",
  "/index.html",
  "/upload-form.html",
  "/gallery.html",
  "/css/style.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json"
];

// ✅ Install event (cache add karega)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching files...");
      return cache.addAll(urlsToCache);
    })
  );
});

// ✅ Fetch event (offline support)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// ✅ Activate event (purane cache delete karega)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});