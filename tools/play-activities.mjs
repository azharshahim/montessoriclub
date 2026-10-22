/**
 * Joue une session entière de **chaque activité**, tranche d'âge par tranche
 * d'âge, dans l'application Web exportée (jsdom).
 *
 * Le banc de test de fumée (`npm run test:web`) ouvre chaque activité puis
 * revient à l'accueil. Ici, on va plus loin : chaque activité est réellement
 * jouée jusqu'au bilan (« Quel beau travail ! »), manche après manche, ce qui
 * exerce les mécaniques de réussite et la progression enregistrée.
 *
 * Chaque activité a sa stratégie, car jsdom ne sait pas faire de mise en page :
 * le module partagé `tools/lib/web-app.mjs` simule une géométrie minimale
 * (positions lues dans les styles en ligne) et des gestes souris, ce qui permet
 * de rejouer les glisser-déposer, tracés et appuis maintenus.
 *
 * Usage : npm run test:activities            (toutes les tranches)
 *         BAND=9-12 npm run test:activities  (une seule tranche)
 *         ACTIVITY=code npm run test:activities (une seule activité)
 */
import process from 'node:process';

import { startApp } from './lib/web-app.mjs';

const {
  document,
  all,
  allVisible,
  bodyText,
  press,
  pressText,
  type,
  cards,
  sleep,
  rectOf,
  drag,
  dragPath,
  tap,
  hold,
  buttonByLabel,
  errors,
} = startApp({ layout: true });

/* ------------------------------------------------------------------ */
/* Utilitaires communs                                                 */
/* ------------------------------------------------------------------ */

const REWARD = /^(Continuer|Activité terminée|Rejouer|Retour au menu|Continue|Activity complete|Play again|Back to menu)$/;
const IGNORED_LABELS = new Set(['Retour', 'Back', 'Écouter encore', 'Listen again']);

const textOf = (element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim();
const ariaOf = (element) => element.getAttribute('aria-label') ?? '';

/** Boutons du bilan ou de la récompense (« Continuer », « Activité terminée »…). */
function rewardButton() {
  return allVisible('[role="button"]').find((element) => REWARD.test(textOf(element)));
}

/** Carte de fin de session affichée par GameScreen. */
const summaryVisible = () => bodyText().includes('Quel beau travail');

/** Boutons tactiles de l'activité, hors en-tête et hors mascotte. */
function gameButtons() {
  return allVisible('[role="button"]').filter(
    (element) => element.hasAttribute('tabindex') && !IGNORED_LABELS.has(ariaOf(element)) && !REWARD.test(textOf(element))
  );
}

/** Éléments accessibles non tactiles (pièces à glisser de DragDropBoard). */
function draggableItems() {
  return allVisible('[role="button"]').filter((element) => !element.hasAttribute('tabindex'));
}

/** Première réponse encore active d'un jeu à choix multiple. */
function pressFirstChoice() {
  const choice = gameButtons().find((element) => element.getAttribute('aria-disabled') !== 'true');
  if (!choice) return false;
  press(choice);
  return true;
}

/* ------------------------------------------------------------------ */
/* Stratégies par activité                                             */
/* ------------------------------------------------------------------ */

/** 0-2 ans : jeu libre, chaque toucher fait avancer la session. */
function freePlay(matcher, touches) {
  return async () => {
    for (let index = 0; index < touches; index += 1) {
      const target = allVisible('[role="button"]').find((element) => matcher(ariaOf(element))) ?? gameButtons()[0];
      if (!target) return false;
      press(target);
      await sleep(260);
    }
    return true;
  };
}

/** 3-5 ans : associer un objet à sa corbeille (toucher puis corbeille). */
const colorsPlay = async () => {
  const item = draggableItems().find((element) => ariaOf(element).includes(' — '));
  if (!item) return false;
  const color = ariaOf(item).split(' — ').pop();
  await tap(item);
  await sleep(160);
  const bin = gameButtons().find((element) => ariaOf(element) === color);
  if (!bin) return false;
  press(bin);
  await sleep(360);
  return true;
};

/** 3-5 ans : emboîter une forme dans son emplacement (libellés identiques). */
const shapesPlay = async () => {
  const item = draggableItems()[0];
  if (!item) return false;
  const shape = ariaOf(item);
  await tap(item);
  await sleep(160);
  const bin = gameButtons().find((element) => ariaOf(element) === shape);
  if (!bin) return false;
  press(bin);
  await sleep(360);
  return true;
};

/** Trier : le critère n'est pas lisible dans le DOM, on essaie chaque panier. */
const sortingPlay = async () => {
  const items = draggableItems();
  const item = items[0];
  if (!item) return false;
  const name = ariaOf(item);
  for (const bin of gameButtons()) {
    const current = draggableItems().find((element) => ariaOf(element) === name);
    if (!current) return true;
    await tap(current);
    await sleep(140);
    press(bin);
    await sleep(300);
    if (!draggableItems().some((element) => ariaOf(element) === name)) return true;
  }
  return false;
};

/** Les paires : retourner les cartes jusqu'à retrouver chaque paire. */
function memoryPlay() {
  const pairsFound = () => {
    const match = bodyText().match(/(\d+) sur (\d+) paires/);
    return match ? Number(match[1]) : 0;
  };
  const hidden = () => gameButtons().filter((element) => /carte cachée|hidden card/.test(ariaOf(element)));
  const isHidden = (element) => /carte cachée|hidden card/.test(ariaOf(element));

  // `known` mémorise la position d'une carte déjà retournée : dès qu'on
  // retrouve la même image, la paire est gagnée sans nouvelle erreur.
  const known = new Map();
  let cursor = 0;

  return async () => {
    const before = pairsFound();
    const cardsNow = gameButtons();
    const hiddenCards = cardsNow.filter(isHidden);
    if (!hiddenCards.length) return false;

    // On avance dans l'ordre des cartes pour ne pas toujours tester la même.
    const position = cardsNow.indexOf(hiddenCards.find((element) => cardsNow.indexOf(element) >= cursor) ?? hiddenCards[0]);
    cursor = position + 1;
    const first = cardsNow[position];

    press(first);
    await sleep(230);
    if (pairsFound() > before) return true;

    const label = ariaOf(first);
    const partner = known.get(label);
    if (partner && partner !== first && partner.isConnected && isHidden(partner)) {
      press(partner);
      await sleep(380);
      known.delete(label);
      return pairsFound() > before;
    }
    known.set(label, first);

    const second = hidden().find((element) => element !== first);
    if (!second) return false;
    press(second);
    await sleep(340);
    if (pairsFound() > before) {
      known.delete(label);
      return true;
    }
    const secondLabel = ariaOf(second);
    if (secondLabel && !/carte cachée|hidden card/.test(secondLabel)) known.set(secondLabel, second);
    // Paire manquée : les cartes se retournent, on laisse le temps au jeu.
    await sleep(950);
    return true;
  };
}

/** Puzzles : glisser chaque pièce dans sa case (mesures simulées). */
async function puzzlePlay() {
  const pieces = allVisible('[role="button"]').filter((element) => /^pièce \d+/.test(ariaOf(element)));
  if (!pieces.length) return false;
  const board = pieces[0].parentElement.previousElementSibling.firstElementChild;
  const slots = [...board.children];
  for (const piece of pieces) {
    const index = Number(ariaOf(piece).replace(/\D/g, '')) - 1;
    const slot = slots[index];
    if (!slot) continue;
    const from = rectOf(piece);
    const to = rectOf(slot);
    await drag(piece, { x: from.width / 2, y: from.height / 2 }, { x: to.x + to.width / 2, y: to.y + to.height / 2 }, 6);
  }
  await sleep(500);
  return true;
}

/** Tracer les chiffres : un balayage dense passe forcément par tous les points. */
async function tracingPlay() {
  const canvas = allVisible('[role="slider"]').pop();
  if (!canvas) return false;
  const rect = rectOf(canvas);
  const points = [];
  const step = 8;
  for (let row = 4; row <= 96; row += step) {
    const xs = [];
    for (let column = 4; column <= 96; column += step) xs.push(column);
    const ordered = Math.round(row / step) % 2 === 0 ? xs : [...xs].reverse();
    for (const column of ordered) {
      points.push({ x: rect.x + (column / 100) * rect.width, y: rect.y + (row / 100) * rect.height });
    }
  }
  await dragPath(canvas, points, 12);
  await sleep(500);
  return true;
}

/** Verser : maintenir le pichet jusqu'à la zone cible, puis relâcher. */
async function pouringPlay() {
  const pitcher = buttonByLabel('Maintenir pour verser');
  if (!pitcher) return false;
  const rect = rectOf(pitcher);
  await hold(pitcher, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, 3600);
  await sleep(400);
  return true;
}

/** Les fermetures : bouton (glisser), fermeture éclair (maintenir), lacet (tracer). */
const LACE_CHECKPOINTS = [
  [20, 78],
  [30, 56],
  [44, 52],
  [46, 36],
  [60, 22],
  [76, 26],
  [80, 42],
  [66, 50],
];

async function dressingPlay() {
  const button = buttonByLabel('bouton');
  if (button) {
    const stage = button.parentElement;
    const from = rectOf(button);
    const to = rectOf(stage);
    await drag(
      button,
      { x: from.x + from.width / 2, y: from.y + from.height / 2 },
      { x: to.x + to.width * 0.7, y: to.y + to.height * 0.57 },
      6
    );
    await sleep(600);
    return true;
  }

  const pull = buttonByLabel('curseur de fermeture');
  if (pull) {
    const rect = rectOf(pull);
    await hold(pull, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, 1700);
    await sleep(300);
    return true;
  }

  const lace = allVisible('[role="slider"]').pop();
  if (!lace) return false;
  const rect = rectOf(lace);
  const points = LACE_CHECKPOINTS.map(([x, y]) => ({
    x: rect.x + (x / 100) * rect.width,
    y: rect.y + (y / 100) * rect.height,
  }));
  await dragPath(lace, points, 6);
  await sleep(400);
  return true;
}

/** Carte du monde : le nom demandé est écrit dans la consigne. */
async function worldMapPlay() {
  const match = bodyText().match(/Touche (.+?) sur la carte/);
  if (!match) return false;
  const name = match[1];
  const path = [...document.querySelectorAll('svg path[aria-label]')].find((element) => ariaOf(element) === name);
  if (!path) return false;
  press(path);
  await sleep(400);
  return true;
}

const DIRECTION_FOR = {
  '0,-1': 0,
  '1,0': 1,
  '0,1': 2,
  '-1,0': 3,
};

/** Code par blocs : plus court chemin, traduit en blocs puis exécuté. */
async function codePlay() {
  const robot = document.querySelector('[aria-label="robot"]');
  if (!robot) return false;
  const board = robot.parentElement;
  const cell = rectOf(robot).width || 1;
  const boardRect = rectOf(board);
  const gridSize = Math.max(1, Math.round(boardRect.width / cell));
  const cellOf = (element) => {
    const rect = rectOf(element);
    return {
      x: Math.round((rect.x - boardRect.x) / cell),
      y: Math.round((rect.y - boardRect.y) / cell),
    };
  };

  const starText = [...board.querySelectorAll('div')].find((element) => textOf(element) === '⭐');
  if (!starText) return false;
  const star = cellOf(starText);
  const start = cellOf(robot);
  const rocks = new Set(
    [...board.querySelectorAll('div')]
      .filter((element) => textOf(element) === '🪨')
      .map((element) => {
        const { x, y } = cellOf(element);
        return `${x},${y}`;
      })
  );

  // Parcours en largeur : (x, y, direction).
  const key = (x, y, direction) => `${x},${y},${direction}`;
  const startState = { x: start.x, y: start.y, direction: 0 };
  const queue = [startState];
  const previous = new Map([[key(start.x, start.y, 0), null]]);
  let found = null;
  while (queue.length) {
    const state = queue.shift();
    if (state.x === star.x && state.y === star.y) {
      found = state;
      break;
    }
    const moves = [
      { next: { x: state.x, y: state.y, direction: (state.direction + 3) % 4 }, command: 'L' },
      { next: { x: state.x, y: state.y, direction: (state.direction + 1) % 4 }, command: 'R' },
    ];
    const forwards = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ][state.direction];
    const ahead = { x: state.x + forwards[0], y: state.y + forwards[1], direction: state.direction };
    const blocked =
      ahead.x < 0 || ahead.y < 0 || ahead.x >= gridSize || ahead.y >= gridSize || rocks.has(`${ahead.x},${ahead.y}`);
    if (!blocked) moves.push({ next: ahead, command: 'F' });

    for (const move of moves) {
      const moveKey = key(move.next.x, move.next.y, move.next.direction);
      if (previous.has(moveKey)) continue;
      previous.set(moveKey, { state, command: move.command });
      queue.push(move.next);
    }
  }
  if (!found) return false;

  const commands = [];
  let cursor = key(found.x, found.y, found.direction);
  while (previous.get(cursor)) {
    const step = previous.get(cursor);
    commands.unshift(step.command);
    const from = step.state;
    cursor = key(from.x, from.y, from.direction);
  }

  const labelOf = { F: 'Avancer', L: 'Gauche', R: 'Droite' };
  for (const command of commands) {
    const block = buttonByLabel(labelOf[command]);
    if (!block) return false;
    press(block);
    await sleep(40);
  }
  const go = buttonByLabel('Go');
  if (!go) return false;
  press(go);
  // Le robot avance d'une case toutes les 450 ms, puis le jeu conclut.
  await sleep(450 * commands.length + 900);
  // Programme trop long pour la réserve de blocs, ou rocher sur le chemin :
  // aucune récompense n'apparaît, la manche est à rejouer.
  return rewardButton() != null;
}

/* ------------------------------------------------------------------ */
/* Catalogue joué                                                      */
/* ------------------------------------------------------------------ */

const QUIZ = () => async () => pressFirstChoice();

const ACTIVITIES = {
  sensory: () => freePlay((label) => /bulle|bubble/.test(label), 10),
  animals: () => freePlay((label) => label.startsWith('Toucher'), 8),
  colortouch: () => freePlay((label) => label.startsWith('Toucher'), 8),
  shapefit: () => async () => {
    const pieces = allVisible('[role="button"]').filter((element) => ariaOf(element).startsWith('Toucher'));
    for (const piece of pieces) {
      press(piece);
      await sleep(320);
    }
    return pieces.length > 0;
  },
  music: () => freePlay((label) => /^Note \d+$/.test(label), 12),
  colors: () => colorsPlay,
  shapes: () => shapesPlay,
  numbers: QUIZ,
  tracing: () => tracingPlay,
  sorting: () => sortingPlay,
  memory: memoryPlay,
  puzzle: () => puzzlePlay,
  pouring: () => pouringPlay,
  dressing: () => dressingPlay,
  addition: QUIZ,
  subtraction: QUIZ,
  times: QUIZ,
  syllables: QUIZ,
  reading: QUIZ,
  clock: QUIZ,
  money: QUIZ,
  living: QUIZ,
  fractions: QUIZ,
  geometry: QUIZ,
  solar: QUIZ,
  world: QUIZ,
  grammar: QUIZ,
  conjugation: QUIZ,
  code: () => codePlay,
  equivalents: QUIZ,
  angles: QUIZ,
  tenses: QUIZ,
  solids: QUIZ,
  worldmap: () => worldMapPlay,
};

const BANDS = [
  {
    id: '0-2',
    name: 'Lina',
    age: '0 – 2 ans',
    activities: [
      ['sensory', 'Éveil sensoriel'],
      ['animals', 'Les animaux'],
      ['colortouch', 'Touche les couleurs'],
      ['shapefit', 'Emboîte les formes'],
      ['music', 'Petite musique'],
    ],
  },
  {
    id: '3-5',
    name: 'Noah',
    age: '3 – 5 ans',
    activities: [
      ['colors', 'Les couleurs'],
      ['shapes', 'Les formes'],
      ['numbers', 'Les chiffres'],
      ['tracing', 'Tracer les chiffres'],
      ['sorting', 'Trier'],
      ['memory', 'Les paires'],
      ['puzzle', 'Puzzles'],
      ['pouring', 'Verser'],
      ['dressing', 'Les fermetures'],
    ],
  },
  {
    id: '6-8',
    name: 'Mila',
    age: '6 – 8 ans',
    activities: [
      ['memory', 'Les paires'],
      ['puzzle', 'Puzzles'],
      ['addition', 'Les additions'],
      ['subtraction', 'Les soustractions'],
      ['times', 'Les multiplications'],
      ['syllables', 'Les syllabes'],
      ['reading', 'Lire un mot'],
      ['clock', 'L’horloge'],
      ['money', 'La monnaie'],
      ['living', 'Le vivant'],
    ],
  },
  {
    id: '9-12',
    name: 'Elias',
    age: '9 – 12 ans',
    activities: [
      ['fractions', 'Les fractions'],
      ['geometry', 'La géométrie'],
      ['solar', 'Le système solaire'],
      ['world', 'Le monde'],
      ['grammar', 'La grammaire'],
      ['conjugation', 'La conjugaison'],
      ['code', 'Code par blocs'],
      ['equivalents', 'Fractions équivalentes'],
      ['angles', 'Les angles'],
      ['tenses', 'Passé, présent, futur'],
      ['solids', 'Les solides'],
      ['worldmap', 'La carte du monde'],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Parcours                                                            */
/* ------------------------------------------------------------------ */

const results = [];

async function createProfile(name, ageLabel) {
  if (bodyText().includes('Qui joue aujourd’hui')) {
    const add = buttonByLabel('Ajouter un enfant');
    if (add) {
      press(add);
      await sleep(300);
    }
  } else {
    // Retour à l'accueil puis onglet Profil pour créer l'enfant suivant.
    const home = allVisible('[role="tab"]').find((element) => /Activités|Activities/.test(ariaOf(element)));
    if (home) {
      press(home);
      await sleep(500);
    }
    const tab = allVisible('[role="tab"]').find((element) => /Profil|Profile/.test(ariaOf(element)));
    if (tab) {
      press(tab);
      await sleep(500);
    }
    const add = buttonByLabel('Ajouter un enfant');
    if (add) {
      press(add);
      await sleep(400);
    }
  }
  await sleep(150);
  type(name);
  await sleep(120);
  pressText(ageLabel);
  await sleep(120);
  pressText('Enregistrer');
  await sleep(900);
}

async function openActivity(title) {
  const card = cards().find((element) => ariaOf(element) === title);
  if (!card) throw new Error(`carte « ${title} » introuvable`);
  press(card);
  await sleep(1300);
}

async function leaveActivity() {
  const back = buttonByLabel('Retour');
  if (back) {
    press(back);
    await sleep(600);
  }
}

/** Joue une activité jusqu'au bilan ; renvoie true si la session est terminée. */
async function playToEnd(title, play) {
  const maxSteps = 120;
  let stalls = 0;
  let restarts = 0;
  for (let step = 0; step < maxSteps; step += 1) {
    if (summaryVisible()) return true;
    const reward = rewardButton();
    if (reward) {
      press(reward);
      await sleep(800);
      continue;
    }
    const handled = await play();
    if (handled) {
      stalls = 0;
      await sleep(150);
      continue;
    }
    stalls += 1;
    await sleep(200);
    // Une manche impossible (niveau tiré au hasard) : on relance l'activité,
    // qui repart sur une nouvelle grille, plutôt que d'insister sans fin.
    if (stalls >= 3 && restarts < 3) {
      restarts += 1;
      stalls = 0;
      await leaveActivity();
      await openActivity(title);
    }
  }
  return summaryVisible();
}

async function run() {
  const only = process.env.BAND;
  const onlyActivity = process.env.ACTIVITY;
  await sleep(1200);
  if (!bodyText().includes('Nouveau profil')) throw new Error('écran de création de profil non affiché');

  for (const band of BANDS) {
    if (only && band.id !== only) continue;
    await createProfile(band.name, band.age);
    if (!bodyText().includes(`Bonjour ${band.name}`)) throw new Error(`accueil non affiché pour ${band.name}`);

    for (const [id, title] of band.activities) {
      if (onlyActivity && !title.toLowerCase().includes(onlyActivity.toLowerCase())) continue;
      let note = '';
      let played = false;
      try {
        await openActivity(title);
        played = await playToEnd(title, ACTIVITIES[id]());
        if (!played) note = `session non terminée (${bodyText().slice(-80)})`;
      } catch (error) {
        note = `exception : ${error.message}`;
      }

      results.push({ band: band.id, id, title, played, note });
      console.log(`${played ? '✅' : '❌'} ${band.id.padEnd(5)} ${title}${note ? ` — ${note}` : ''}`);

      if (played) {
        const home = allVisible('[role="button"]').find((element) => /Retour au menu|Back to menu/.test(textOf(element)));
        if (home) {
          press(home);
          await sleep(800);
        }
      } else {
        await leaveActivity();
      }
      if (!bodyText().includes('Bonjour')) {
        await sleep(500);
      }
    }
  }
}

try {
  await run();
} catch (error) {
  errors.push(`exception: ${error.stack ?? error}`);
}

await sleep(300);
const failures = results.filter((result) => !result.played);
const covered = results.filter((result) => result.played);
console.log(`\n${covered.length}/${results.length} activité(s) jouée(s) de bout en bout.`);
if (failures.length) {
  console.log('Non couvertes :');
  for (const failure of failures) console.log(` - ${failure.band} · ${failure.title} : ${failure.note}`);
}
if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const error of errors.slice(0, 20)) console.error(` - ${error}`);
  process.exit(1);
}
process.exit(failures.length ? 1 : 0);
