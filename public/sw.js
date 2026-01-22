const CACHE_NAME = 'fb-video-player-v2-dev';
const urlsToCache = [
  // Minimal caching for development - only cache static assets
  '/vite.svg',
  '/manifest.json'
];

// Install event - cache minimal assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - NETWORK FIRST for development (no aggressive caching)
self.addEventListener('fetch', (event) => {
  // Skip caching for localhost and development
  if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    // Always fetch from network during development
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cache only on network failure
        return caches.match(event.request);
      })
    );
    return;
  }

  // For production URLs, use cache
  event.respondWith(
    fetch(event.request).then((response) => {
      // Check if valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone the response
      const responseToCache = response.clone();

      caches.open(CACHE_NAME).then((cache) => {
        // Don't cache API requests, HTML, or video URLs
        if (!event.request.url.includes('/api/') &&
            !event.request.url.includes('facebook.com') &&
            !event.request.url.includes('fbcdn.net') &&
            !event.request.url.endsWith('.html') &&
            !event.request.url.endsWith('.js') &&
            !event.request.url.endsWith('.css')) {
          cache.put(event.request, responseToCache);
        }
      });

      return response;
    }).catch(() => {
      // Network request failed, try cache
      return caches.match(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Push notifications (optional, for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FB Video Player', options)
  );
});

async function syncFavorites() {
  // Sync favorites with server when back online
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_FAVORITES' });
  });
}
