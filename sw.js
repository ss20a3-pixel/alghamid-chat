const CACHE_NAME = 'alghamid-v4.0.0';
const STATIC_ASSETS = [
  './index.html',
  './admin.html',
  './css/style.css',
  './js/compat.js',
  './js/data.js',
  './js/app.js',
  './js/audio.js',
  './js/perf.js',
  './js/features.js',
  './js/social.js',
  './js/extras.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const FONT_CACHE = 'sawti-fonts-v1';
const DYNAMIC_CACHE = 'sawti-dynamic-v1';
const MAX_DYNAMIC_ITEMS = 50;

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.filter(u => !u.startsWith('http'))))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts → stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // Same-origin static assets → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Everything else → network-first with dynamic cache fallback
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── Strategies ────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('<h1 style="font-family:sans-serif;direction:rtl;text-align:center;margin-top:20%;color:#7C3AED">لا يوجد اتصال بالإنترنت</h1>', {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await trimCache(cache, MAX_DYNAMIC_ITEMS);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function trimCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
  }
}

// ─── Push Notifications ────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'dismiss', title: 'تجاهل' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'صوتي', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// ─── Background Sync ───────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Placeholder for real backend sync
  console.log('[SW] Syncing pending messages...');
}
