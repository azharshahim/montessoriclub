/**
 * Contrôle statique des traductions (sans navigateur ni TypeScript).
 *
 * TypeScript garantit déjà que `en.ts` et `ar.ts` possèdent toutes les clés de
 * `fr.ts`. Ce script vérifie les deux angles morts restants :
 *
 *  1. les clés employées dans le code, notamment celles passées par une chaîne
 *     (`t(game.titleKey as never)`) que le typage ne peut pas vérifier ;
 *  2. les variables interpolées (`{name}`, `{count}`…), qui doivent être
 *     identiques dans les trois langues sous peine d'afficher « {count} ».
 *
 * Usage : node tools/check-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SRC = path.resolve('src');
const TRANSLATIONS = path.join(SRC, 'i18n/translations');

function readDictionary(language) {
  const file = path.join(TRANSLATIONS, `${language}.ts`);
  const source = fs.readFileSync(file, 'utf8');
  const entries = new Map();
  const pattern = /^\s*'([^']+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*,?\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    entries.set(match[1], match[2] ?? match[3] ?? '');
  }
  return entries;
}

const french = readDictionary('fr');
const english = readDictionary('en');
const arabic = readDictionary('ar');
const problems = [];

/** Préfixes réellement utilisés par l'application (évite les faux positifs). */
const PREFIXES = new Set([
  'activity', 'game', 'home', 'parents', 'common', 'nav', 'color', 'shape', 'item', 'number',
  'rewards', 'mascot', 'a11y', 'language', 'theme', 'pwa', 'profile', 'age', 'sorting',
  'criterion', 'bin', 'kind', 'dressing', 'worldmap', 'tenses', 'solids', 'living',
  'equivalents', 'angles', 'code', 'fractions', 'geometry', 'solar', 'world', 'grammar',
  'conjugation', 'clock', 'money', 'reading', 'math', 'app', 'onboarding',
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

// 1. Toutes les clés citées en dur dans le code existent-elles ?
const files = walk(SRC).filter((file) => !file.includes(`${path.sep}i18n${path.sep}translations`));
const keyPattern = /['"`]([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+)['"`]/g;
const missing = new Map();
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(keyPattern)) {
    const key = match[1];
    const prefix = key.split('.')[0];
    if (!PREFIXES.has(prefix)) continue;
    if (!french.has(key)) {
      const relative = path.relative(SRC, file);
      if (!missing.has(key)) missing.set(key, new Set());
      missing.get(key).add(relative);
    }
  }
}
for (const [key, where] of missing) {
  problems.push(`clé absente de fr.ts : « ${key} » (${[...where].join(', ')})`);
}

// 2. Les variables interpolées sont-elles identiques partout ?
const variables = (value) => new Set([...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]));
const asSorted = (set) => [...set].sort().join(',');
for (const [key, value] of french) {
  for (const [language, dictionary] of [['en', english], ['ar', arabic]]) {
    const translated = dictionary.get(key);
    if (translated === undefined) {
      problems.push(`clé absente de ${language}.ts : « ${key} »`);
      continue;
    }
    if (asSorted(variables(value)) !== asSorted(variables(translated))) {
      problems.push(
        `variables différentes pour « ${key} » en ${language} : ` +
          `fr={${asSorted(variables(value))}} ${language}={${asSorted(variables(translated))}}`
      );
    }
    if (translated.trim() === '') problems.push(`traduction vide en ${language} : « ${key} »`);
  }
}

// 3. Les clés d'un dictionnaire sont-elles uniques ? (une clé en double écrase la précédente)
for (const [language, file] of [['fr', 'fr.ts'], ['en', 'en.ts'], ['ar', 'ar.ts']]) {
  const source = fs.readFileSync(path.join(TRANSLATIONS, file), 'utf8');
  const seen = new Set();
  for (const match of source.matchAll(/^\s*'([^']+)':/gm)) {
    if (seen.has(match[1])) problems.push(`clé en double dans ${language}.ts : « ${match[1]} »`);
    seen.add(match[1]);
  }
}

if (problems.length) {
  console.error(`\n❌ Traductions : ${problems.length} problème(s).`);
  for (const problem of problems.slice(0, 40)) console.error(` - ${problem}`);
  process.exit(1);
}

console.log(
  `\n✅ Traductions : ${french.size} clés cohérentes en fr/en/ar (variables incluses).`
);
