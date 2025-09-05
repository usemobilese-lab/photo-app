self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("photo-app-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/upload.html",
        "/gallery.html"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});