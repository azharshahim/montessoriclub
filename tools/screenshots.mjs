/**
 * Régénère les captures du dossier `docs/screenshots/` depuis l'application
 * réellement exportée, dans un vrai navigateur (Chrome ou Chromium).
 *
 * Quatre formats sont couverts : portrait / paysage et thème clair / sombre.
 *
 * Usage :
 *   EXPO_BASE_URL=/montessoriclub npm run build:web
 *   npm run screenshots
 *
 * Le navigateur est cherché dans cet ordre : variable `CHROME_PATH`, puis les
 * emplacements habituels (Debian/Ubuntu, macOS). Exemple :
 *   CHROME_PATH=/usr/bin/google-chrome npm run screenshots
 *
 * Prérequis : `puppeteer-core` (devDependency) et un Chrome installé.
 * Le script ne dépend d'aucun réseau : il sert `dist/` lui-même.
 */
import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';

import puppeteer from 'puppeteer-core';

const BASE_PATH = `${(process.env.EXPO_BASE_URL ?? '/montessoriclub').replace(/\/+$/, '')}/`;
const PORT = Number(process.env.SCREENSHOT_PORT ?? 4319);
const OUTPUT = path.resolve('docs/screenshots');
const DIST = path.resolve('dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Serveur statique (aucune dépendance)                                */
/* ------------------------------------------------------------------ */

function serveDist() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith(BASE_PATH)) pathname = pathname.slice(BASE_PATH.length);
    if (pathname === '' || pathname === '/') pathname = 'index.html';
    let file = path.join(DIST, pathname);
    if (!file.startsWith(DIST)) {
      response.writeHead(403).end('interdit');
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
    const extension = path.extname(file);
    response.writeHead(200, { 'Content-Type': MIME[extension] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

/* ------------------------------------------------------------------ */
/* Navigateur                                                          */
/* ------------------------------------------------------------------ */

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/homebrew/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      'Aucun navigateur trouvé. Installe Google Chrome puis relance avec CHROME_PATH=/chemin/vers/chrome npm run screenshots.'
    );
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Données de démonstration (aucune donnée réelle)                     */
/* ------------------------------------------------------------------ */

const today = new Date();
const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
  today.getDate()
).padStart(2, '0')}`;

function progress(level, stars, sessions, successes, mistakes = 0) {
  return { level, stars, sessions, successes, mistakes, lastPlayedAt: Date.now() };
}

function profile({ id, name, ageBand, avatar, stars, entries, dailyLimitMinutes }) {
  const progressEntries = Object.fromEntries(entries.map(([gameId, values]) => [gameId, progress(...values)]));
  return {
    id,
    name,
    ageBand,
    avatar,
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
    stars,
    progress: progressEntries,
    playDays: [
      { date: dayKey, minutes: 11 },
      { date: `${dayKey.slice(0, 8)}${String(Math.max(1, today.getDate() - 1)).padStart(2, '0')}`, minutes: 18 },
    ],
    dailyLimitMinutes,
  };
}

const PROFILES = [
  profile({
    id: 'p_demo_lina',
    name: 'Lina',
    ageBand: '3-5',
    avatar: 'fox',
    stars: 24,
    entries: [
      ['colors', [3, 9, 4, 16, 1]],
      ['shapes', [2, 7, 3, 12, 0]],
      ['numbers', [2, 5, 2, 10, 2]],
      ['tracing', [3, 3, 2, 6, 0]],
    ],
    dailyLimitMinutes: 20,
  }),
  profile({
    id: 'p_demo_mila',
    name: 'Mila',
    ageBand: '6-8',
    avatar: 'panda',
    stars: 41,
    entries: [
      ['addition', [3, 12, 5, 25, 3]],
      ['memory', [4, 8, 3, 12, 1]],
      ['reading', [2, 6, 3, 14, 2]],
      ['clock', [2, 4, 2, 9, 1]],
    ],
    dailyLimitMinutes: 30,
  }),
];

const settingsSeed = (overrides = {}) => ({
  state: {
    language: 'fr',
    themeMode: 'light',
    parentalCode: null,
    sound: true,
    subtitles: true,
    colorBlind: false,
    reducedMotion: false,
    haptics: true,
    ...overrides,
  },
  version: 1,
});

function seeds({ profileId, settings }) {
  return {
    'mc-profiles-v1': JSON.stringify({ state: { profiles: PROFILES, selectedId: profileId }, version: 1 }),
    'mc-settings-v1': JSON.stringify(settingsSeed(settings)),
  };
}

/* ------------------------------------------------------------------ */
/* Captures                                                            */
/* ------------------------------------------------------------------ */

const SHOTS = [
  {
    file: '01-accueil.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
  },
  {
    file: '02-formes-paysage.png',
    width: 1100,
    height: 820,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
    open: 'Les formes',
  },
  {
    file: '03-recompenses.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
    tab: 'Récompenses',
  },
  {
    file: '04-couleurs.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
    open: 'Les couleurs',
  },
  {
    file: '05-trace.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
    open: 'Tracer les chiffres',
  },
  {
    file: '06-arabe-daltonisme.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light', language: 'ar', colorBlind: true },
    // Titre arabe de « Les couleurs » : les libellés suivent la langue choisie.
    open: 'الألوان',
  },
  {
    file: '07-espace-parents.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_lina',
    settings: { themeMode: 'light' },
    parents: true,
  },
  {
    file: '08-paysage-sombre.png',
    width: 1100,
    height: 820,
    profileId: 'p_demo_mila',
    settings: { themeMode: 'dark' },
    open: 'Les additions',
  },
  {
    file: '09-accueil-sombre.png',
    width: 900,
    height: 1000,
    profileId: 'p_demo_mila',
    settings: { themeMode: 'dark' },
  },
];

async function clickLabel(page, label) {
  const clicked = await page.evaluate((wanted) => {
    const elements = [...document.querySelectorAll('[role="button"],[role="tab"]')];
    const target = elements.find(
      (element) =>
        element.getAttribute('aria-label') === wanted &&
        !element.closest('[aria-hidden="true"]')
    );
    if (!target) return false;
    target.click();
    return true;
  }, label);
  if (!clicked) throw new Error(`élément « ${label} » introuvable`);
  await sleep(700);
}

async function clickText(page, text) {
  await page.evaluate((wanted) => {
    const elements = [...document.querySelectorAll('[role="button"]')];
    const target = elements
      .filter((element) => (element.textContent ?? '').trim() === wanted)
      .filter((element) => !element.closest('[aria-hidden="true"]'));
    target[target.length - 1]?.click();
  }, text);
  await sleep(700);
}

async function capture(browser, shot) {
  const page = await browser.newPage();
  await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: shot.settings?.themeMode === 'dark' ? 'dark' : 'light' },
  ]);

  const url = `http://127.0.0.1:${PORT}${BASE_PATH}index.html`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate((values) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
  }, seeds({ profileId: shot.profileId, settings: shot.settings }));
  await page.reload({ waitUntil: 'networkidle2' });
  // Signal indépendant de la langue : l'accueil affiche la barre d'onglets.
  await page.waitForFunction(
    () => document.querySelectorAll('[role="tab"]').length >= 3 && document.getElementById('boot-splash') === null,
    { timeout: 30_000 }
  );
  await sleep(1200);

  if (shot.tab) await clickLabel(page, shot.tab);
  if (shot.open) {
    await clickLabel(page, shot.open);
    await page.waitForFunction(() => document.body.innerText.includes('/'), { timeout: 15_000 });
    await sleep(1400);
  }
  if (shot.parents) {
    await clickLabel(page, 'Parents');
    await sleep(400);
    const question = await page.evaluate(() => {
      const match = document.body.innerText.match(/(\d+)\s*×\s*(\d+)/);
      return match ? [Number(match[1]), Number(match[2])] : null;
    });
    if (!question) throw new Error('question de la porte parentale introuvable');
    await page.click('input');
    await page.keyboard.type(String(question[0] * question[1]));
    await sleep(200);
    await clickText(page, 'Continuer');
    await page.waitForFunction(() => document.body.innerText.includes('Espace parents'), { timeout: 15_000 });
    await sleep(1000);
  }

  await sleep(600);
  fs.mkdirSync(OUTPUT, { recursive: true });
  await page.screenshot({ path: path.join(OUTPUT, shot.file) });
  await page.close();
  console.log(`✅ ${shot.file} (${shot.width} × ${shot.height}, ${shot.settings?.themeMode ?? 'light'})`);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html introuvable : lance « npm run build:web » d’abord.');
  }
  const server = await serveDist();
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  try {
    for (const shot of SHOTS) {
      await capture(browser, shot);
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n${SHOTS.length} captures écrites dans ${OUTPUT}.`);
}

main().catch((error) => {
  console.error(`\n❌ Captures : ${error.message}`);
  process.exit(1);
});
