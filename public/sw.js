/* Service worker Montessori Club — cache versionné, hors ligne complet.
 * Toute modification de l'application doit incrémenter CACHE_VERSION :
 * les anciens caches sont alors supprimés à l'activation. */
const CACHE_VERSION = '1.2.0';
const CACHE_PREFIX = 'montessoriclub-';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

const scoped = (pathname) => new URL(pathname, self.registration.scope).toString();

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './favicon.ico',
].map(scoped);

const OFFLINE_PAGE = scoped('./index.html');

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Chaque fichier est mis en cache indépendamment : un asset facultatif
      // manquant (favicon par exemple) ne bloque pas l'installation.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) await cache.put(url, response);
          } catch {
            /* hors ligne pendant l'installation : tant pis, le runtime complétera */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/** Réseau d'abord pour le document : une mise à jour est visible dès qu'on est en ligne. */
function handleNavigation(request) {
  return (async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(OFFLINE_PAGE, response.clone());
      return response;
    } catch {
      const cached = await cache.match(OFFLINE_PAGE);
      if (cached) return cached;
      return new Response(
        '<!doctype html><html lang="fr"><meta charset="utf-8"><title>Montessori Club</title><body style="font-family:system-ui;background:#FFF9F0;color:#33302E;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div><h1>Montessori Club</h1><p>Ouvre l’application une première fois avec une connexion pour l’utiliser hors ligne.</p></div></body></html>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
      );
    }
  })();
}

/** Cache d'abord pour les assets, revalidation silencieuse en arrière-plan. */
async function refreshInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
  } catch {
    /* hors ligne : la version en cache reste valable */
  }
}

function handleAsset(request) {
  return (async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      // Les bundles sont hachés : inutile de les revalider à chaque fois.
      if (!/\/_expo\/static\//.test(request.url)) {
        void refreshInBackground(request);
      }
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch {
      return cached ?? Response.error();
    }
  })();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
