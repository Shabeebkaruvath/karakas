const CACHE_NAME = 'arts-fest-v1';
const ASSETS_TO_CACHE = [
  '/',                // The root URL
  '/index.html',      // Just in case
  '/schedule.html',
  '/leaderboard.html',
  '/result.html',
  '/admin.html',
  '/index.js',
  '/admin.js',
  '/schedule.json',
  '/program_wise_participant_list.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined'
];

// 1. Install Service Worker & Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Intercept Requests (Network First for API, Cache First for Assets)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If it's an API call (JSONBin), try Network first, fall back to nothing (don't cache API aggressively)
  if (url.hostname.includes('jsonbin.io')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Optional: Return cached API data if you decide to cache it
        return caches.match(event.request);
      })
    );
    return;
  }

  // For everything else (HTML, JS, CSS), try Cache first, then Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return from cache
      }
      return fetch(event.request).then((networkResponse) => {
        // Optional: Cache new files dynamically
        return networkResponse;
      });
    })
  );
});