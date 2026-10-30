// Delight Smile PWA Service Worker
// SECURITY POLICY: Never cache confidential medical records, patient profiles, or API responses in browser caches.
const STATIC_CACHE = 'delight-smile-static-v1';
const STATIC_ASSETS = ['/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Strictly bypass cache for all API, Supabase, patient, and clinical routes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/portal') ||
    url.pathname.startsWith('/dashboard') ||
    url.hostname.includes('supabase.co')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
});
