/* =========================================================================
   ClassroomHub Progressive Web App (PWA) Service Worker
   Version: 1.0.0
   Author: Fahim Niloy (CUET ME '20, Roll: 2003063)
   ========================================================================= */

const CACHE_NAME = 'classroomhub-pwa-v4';

const STATIC_PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css?v=4.0.0',
  './app.js?v=4.0.0',
  './data.js?v=4.0.0',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './cuet_routine_template_blank.docx',
  './cuet_routine_template_sample.docx',
  './jszip.min.js'
];

// 1. Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn('[PWA SW] Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First for main documents with Cache Fallback, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET and non-HTTP/HTTPS requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Never cache private server API endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Google Drive & external streaming API: Always go to network directly
  if (url.hostname.includes('google.com') || url.hostname.includes('youtube.com') || url.hostname.includes('googleapis.com')) {
    return;
  }

  // For HTML documents: Stale-While-Revalidate or Network-First so updates show up
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match(request);
        })
    );
    return;
  }

  // For CSS, JS, Fonts, Images, and CDN assets: Cache-First with Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // If offline and request is an image
        if (request.destination === 'image') {
          return caches.match('./icon-192.png');
        }
      });
    })
  );
});
