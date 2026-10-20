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
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photosDir = join(root, 'assets', 'photos', 'objects');
const outFile = join(root, 'src', 'ui', 'illustrations', 'photoRegistry.ts');
const EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true });

const files = readdirSync(photosDir)
  .filter((name) => EXTENSIONS.has(parse(name).ext.toLowerCase()))
  .sort();

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
