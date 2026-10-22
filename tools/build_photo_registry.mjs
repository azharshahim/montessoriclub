#!/usr/bin/env node
/**
 * Génère src/ui/illustrations/photoRegistry.ts à partir des images déposées
 * dans assets/photos/objects/ (apple.webp, bear.png, …).
 *
 * Usage :  npm run photos
 *
 * Règle : le nom du fichier (sans extension) doit être un ObjectId valide
 * (voir src/ui/illustrations/objects.tsx). Les objets sans image gardent
 * automatiquement leur illustration vectorielle (repli).
 * Metro exige des chemins `require` statiques : c'est pourquoi le registre
 * est généré plutôt que calculé à l'exécution.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photosDir = join(root, 'assets', 'photos', 'objects');
const outFile = join(root, 'src', 'ui', 'illustrations', 'photoRegistry.ts');
const EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true });

// Identifiants d'objets valides, lus dans src/ui/illustrations/objects.tsx (type ObjectId).
const objectsSource = readFileSync(join(root, 'src', 'ui', 'illustrations', 'objects.tsx'), 'utf8');
const unionMatch = objectsSource.match(/export type ObjectId =([^;]+);/);
const validIds = new Set(unionMatch ? [...unionMatch[1].matchAll(/'([a-z]+)'/g)].map((m) => m[1]) : []);

const candidates = readdirSync(photosDir)
  .filter((name) => EXTENSIONS.has(parse(name).ext.toLowerCase()))
  .sort();

// Un fichier dont le nom n'est pas un objet connu est ignoré (et signalé) :
// il ne doit jamais faire échouer la compilation ni le déploiement.
const files = candidates.filter((name) => {
  const ok = validIds.has(parse(name).name);
  if (!ok) console.warn(`  ignoré : ${name} (nom inconnu, attendu : ${[...validIds].join(', ')})`);
  return ok;
});

const lines = files.map((name) => {
  const { name: id } = parse(name);
  return `  ${id}: require('../../../assets/photos/objects/${name}'),`;
});

const body = `// FICHIER GÉNÉRÉ par tools/build_photo_registry.mjs — ne pas modifier à la main.
// Pour ajouter une image : la déposer dans assets/photos/objects/ puis lancer \`npm run photos\`.
import type { ImageSourcePropType } from 'react-native';

import type { ObjectId } from './objects';

export const OBJECT_PHOTOS: Partial<Record<ObjectId, ImageSourcePropType>> = {
${lines.join('\n')}${lines.length ? '\n' : ''}};
`;

writeFileSync(outFile, body);
console.log(`photoRegistry.ts : ${files.length} image(s) branchée(s).`);
