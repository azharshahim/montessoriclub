/**
 * Test du service worker hors navigateur : installation, précache, purge des
 * anciens caches, navigation hors ligne et cache des assets.
 *
 * Usage : npm run build:web && npm run test:sw
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';

const root = path.resolve('dist');
const swPath = path.join(root, 'sw.js');
const failures = [];
const swSource = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf8') : '';
const swVersion = /CACHE_VERSION\s*=\s*'([^']+)'/.exec(swSource)?.[1];
const currentCache = `montessoriclub-${swVersion}`;

function check(condition, message) {
  if (!condition) failures.push(message);
}

if (!fs.existsSync(swPath)) {
  console.error('dist/sw.js introuvable : lance « npm run build:web » d’abord.');
  process.exit(1);
}

// --- Vérifications statiques du manifeste et des icônes -------------------
const manifestPath = path.join(root, 'manifest.webmanifest');
check(fs.existsSync(manifestPath), 'manifest.webmanifest absent du build');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  check(manifest.name && manifest.short_name, 'nom ou nom court absent du manifeste');
  check(manifest.start_url && manifest.scope, 'start_url ou scope absent');
  check(manifest.display === 'standalone', 'display devrait être « standalone »');
  check(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'icônes PWA incomplètes');
  for (const icon of manifest.icons ?? []) {
    check(fs.existsSync(path.join(root, icon.src.replace(/^\.\//, ''))), `icône absente : ${icon.src}`);
  }
  check(
    (manifest.icons ?? []).some((icon) => icon.purpose === 'maskable'),
    'aucune icône maskable'
  );
}
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check(indexHtml.includes('manifest.webmanifest'), 'le document ne référence pas le manifeste');
check(indexHtml.includes('apple-touch-icon'), 'lien apple-touch-icon absent');
check(indexHtml.includes('id="boot-splash"'), 'écran de démarrage absent du document');

// --- Exécution du service worker dans un contexte simulé -------------------
const ORIGIN = 'https://app.test';
const SCOPE = `${ORIGIN}/montessoriclub/`;

const caches = new Map();
const cacheStore = (name) => {
  if (!caches.has(name)) caches.set(name, new Map());
  return caches.get(name);
};
const keyOf = (key) => (typeof key === 'string' ? key : key?.url ?? String(key));
const cacheApi = {
  async open(name) {
    return {
      async put(key, response) {
        cacheStore(name).set(keyOf(key), response);
      },
      async match(key) {
        return cacheStore(name).get(keyOf(key));
      },
      async addAll(keys) {
        for (const key of keys) cacheStore(name).set(String(key), { ok: true, body: key });
      },
    };
  },
  async keys() {
    return [...caches.keys()];
  },
  async delete(name) {
    return caches.delete(name);
  },
  async match(key) {
    for (const store of caches.values()) {
      const found = store.get(keyOf(key));
      if (found) return found;
    }
    return undefined;
  },
};

const listeners = {};
let networkUp = true;
const fetchMock = async (request) => {
  if (!networkUp) throw new Error('offline');
  return {
    ok: true,
    type: 'basic',
    body: String(request),
    clone() {
      return this;
    },
  };
};

const self = {
  registration: { scope: SCOPE },
  location: { origin: ORIGIN },
  addEventListener(type, handler) {
    listeners[type] = handler;
  },
  skipWaiting: async () => {},
  clients: { claim: async () => {} },
};

const context = vm.createContext({
  self,
  caches: cacheApi,
  fetch: fetchMock,
  URL,
  Response: class {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
    static error() {
      return new Response('', { status: 500 });
    }
  },
  console,
  Promise,
  setTimeout,
  clearTimeout,
});
vm.runInContext(fs.readFileSync(swPath, 'utf8'), context);

async function dispatch(type) {
  let promise = Promise.resolve();
  listeners[type]?.({
    waitUntil(value) {
      promise = value;
    },
    respondWith(value) {
      promise = value;
    },
    request: undefined,
  });
  return promise;
}

// 1. Installation : la coque est précachée.
caches.set('montessoriclub-0.9.0', new Map([['https://app.test/old', { ok: true }]]));
await dispatch('install');
const precache = caches.get(currentCache) ?? new Map();
check(!!swVersion, 'version de cache introuvable dans sw.js');
check(caches.has(currentCache), 'cache versionné absent après installation');
check(precache.size >= 6, `précache incomplet (${precache.size} entrées)`);

// 2. Activation : purge des anciens caches.
await dispatch('activate');
check(!caches.has('montessoriclub-0.9.0'), 'ancien cache non supprimé');
check(caches.has(currentCache), 'cache courant supprimé par erreur');

// 3. Navigation hors ligne : sert index.html depuis le cache.
networkUp = false;
let response;
listeners.fetch({
  request: { method: 'GET', mode: 'navigate', url: `${SCOPE}jeu` },
  respondWith(value) {
    response = value;
  },
});
const navigation = await response;
check(navigation?.ok === true, 'aucune page hors ligne servie pour une navigation');

// 4. Asset : mis en cache au premier chargement puis servi hors ligne.
networkUp = true;
const assetUrl = `${SCOPE}_expo/static/js/web/index-test.js`;
let first;
listeners.fetch({
  request: { method: 'GET', mode: 'cors', url: assetUrl },
  respondWith(value) {
    first = value;
  },
});
const firstResponse = await first;
check(firstResponse?.ok === true, 'asset non servi en ligne');
const cachedAsset = await cacheApi.match(assetUrl);
check(!!cachedAsset, 'asset non mis en cache');

networkUp = false;
let second;
listeners.fetch({
  request: { method: 'GET', mode: 'cors', url: assetUrl },
  respondWith(value) {
    second = value;
  },
});
check((await second)?.ok === true, 'asset non servi depuis le cache hors ligne');

// 5. Les requêtes non-GET ne sont pas interceptées.
let intercepted = false;
listeners.fetch({
  request: { method: 'POST', mode: 'cors', url: assetUrl },
  respondWith() {
    intercepted = true;
  },
});
check(!intercepted, 'une requête POST a été interceptée');

if (failures.length) {
  console.error(`\n❌ Service worker : ${failures.length} problème(s)`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log('✅ Service worker : manifeste, icônes, précache, purge, navigation et assets hors ligne.');
