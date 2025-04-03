// Service Worker for MemoVault PWA

const CACHE_NAME = 'memovault-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png',
  '/icons/favicon.ico'
];

// Pre-cache app shell during installation
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // Force activation on install success
        return self.skipWaiting();
      })
  );
});

// Clean up old caches and take control of clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Stale-while-revalidate strategy for all requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests like Google Fonts
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Even if we have a cached response, we'll fetch an update for next time
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // If we got a valid response, cache it
            if (networkResponse && networkResponse.status === 200 && 
                networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page instead.', error);
            // Don't return error here - fall back to cached content
          });
        
        // Return the cached response immediately if we have one, otherwise wait for the network
        return cachedResponse || fetchPromise;
      })
      .catch(error => {
        // If both cache and network fail, serve the offline page for HTML requests
        if (event.request.mode === 'navigate' || 
            (event.request.method === 'GET' && 
             event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('/offline.html');
        }
        
        // Otherwise, let the error through
        throw error;
      })
  );
});