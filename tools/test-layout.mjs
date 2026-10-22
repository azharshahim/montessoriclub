/**
 * Rejoue le parcours complet sur deux formats de téléphone :
 * portrait (390 × 844) puis paysage (844 × 390).
 *
 * Les écrans compacts (bulle de consigne repliée, cartes resserrées) ont
 * leurs propres branches : sans ce test, seule la taille de bureau serait
 * exercée. Chaque exécution tourne dans un processus séparé, car le bundle
 * React ne peut être évalué qu'une fois par DOM.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const script = path.resolve('tools/smoke-web.mjs');
const viewports = [
  ['portrait', '390x844'],
  ['paysage', '844x390'],
];

let failed = false;
for (const [label, viewport] of viewports) {
  console.log(`\n— Format ${label} (${viewport.replace('x', ' × ')}) —`);
  const result = spawnSync(process.execPath, [script], {
    stdio: 'inherit',
    env: { ...process.env, VIEWPORT: viewport },
  });
  if (result.status !== 0) failed = true;
}

if (failed) {
  console.error('\n❌ Au moins un format de téléphone a échoué.');
  process.exit(1);
}
console.log('\n✅ Formats portrait et paysage : aucune erreur.');
