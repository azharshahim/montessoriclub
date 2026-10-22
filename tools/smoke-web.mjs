/**
 * Test de fumée Web (sans navigateur) — vérifie que l'application exportée
 * démarre, que chaque activité s'ouvre et se referme, et qu'aucune erreur
 * JavaScript n'est émise.
 *
 * Usage : npm run build:web && npm run test:web
 * Dépendance de développement : jsdom (DOM suffisant pour React Native Web).
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve('dist');
const INDEX = path.join(ROOT, 'index.html');
if (!fs.existsSync(INDEX)) {
  console.error('dist/index.html introuvable : lance « npm run build:web » d’abord.');
  process.exit(1);
}

const errors = [];
const warnings = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (error) => errors.push(`jsdom: ${error.message ?? error}`));
vc.on('error', (...args) => errors.push(`console.error: ${args.map(String).join(' ')}`));
vc.on('warn', (...args) => warnings.push(`console.warn: ${args.map(String).join(' ')}`));

const html = fs.readFileSync(INDEX, 'utf8').replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    // Environnement navigateur minimal mais suffisant pour RN Web.
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: 'fr-FR' });
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: ['fr-FR', 'fr'] });
    // Format « largeur x hauteur » : permet de rejouer le parcours sur un
    // téléphone en portrait puis en paysage (branches compactes).
    const [viewportWidth, viewportHeight] = (process.env.VIEWPORT ?? '1024x768')
      .split('x')
      .map(Number);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: viewportWidth });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewportHeight });
    window.devicePixelRatio = 2;
    const prefersDark = process.env.DARK === '1';
    window.matchMedia = (query) => ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.scrollTo = () => {};
    window.HTMLMediaElement.prototype.play = () => Promise.resolve();
    window.HTMLMediaElement.prototype.pause = () => {};
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.speechSynthesis = {
      speak() {},
      cancel() {},
      pause() {},
      resume() {},
      getVoices: () => [],
      addEventListener() {},
      removeEventListener() {},
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: { register: async () => ({ addEventListener() {} }), ready: Promise.resolve({}) },
    });
    window.addEventListener('unhandledrejection', (event) => {
      errors.push(`promesse rejetée : ${event.reason?.message ?? event.reason}`);
    });
  },
});

const { window } = dom;
const { document } = window;
const bundleDir = path.join(ROOT, '_expo/static/js/web');
const bundleName = fs.readdirSync(bundleDir).find((file) => file.endsWith('.js'));
window.eval(fs.readFileSync(path.join(bundleDir, bundleName), 'utf8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const bodyText = () => document.body.textContent.replace(/\s+/g, ' ').trim();
const all = (selector) => [...document.querySelectorAll(selector)];
const reactProps = (element) => element?.[Object.keys(element).find((key) => key.startsWith('__reactProps'))];

function fail(message) {
  errors.push(`assertion: ${message}`);
}

function press(element) {
  if (!element) throw new Error('élément introuvable');
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
}

function buttonByLabel(label) {
  return all('[role="button"]').find((element) => element.getAttribute('aria-label') === label);
}

function pressLabel(label) {
  const element = buttonByLabel(label);
  if (!element) throw new Error(`bouton « ${label} » introuvable`);
  press(element);
}

function pressText(text) {
  const candidates = all('[role="button"],[role="radio"],button,div,span');
  const exact = candidates.filter((element) => (element.textContent ?? '').trim() === text);
  const element = exact[exact.length - 1];
  if (!element) throw new Error(`texte « ${text} » introuvable`);
  press(element);
}

function type(value, index = 0) {
  const input = document.querySelectorAll('input')[index];
  if (!input) throw new Error('champ texte introuvable');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  reactProps(input).onChange({ nativeEvent: {}, target: input, currentTarget: input });
}

function cards() {
  return all('[role="button"]').filter((element) => /Niveau \d+|Level \d+/.test(element.textContent ?? ''));
}

async function createProfile(name, ageLabel) {
  if (bodyText().includes('Qui joue aujourd’hui') || bodyText().includes('Who is playing')) {
    const add = buttonByLabel('Ajouter un enfant') ?? buttonByLabel("Add a child");
    if (add) {
      press(add);
      await sleep(250);
    }
  }
  await sleep(150);
  type(name);
  await sleep(100);
  pressText(ageLabel);
  await sleep(100);
  pressText('Enregistrer');
  await sleep(700);
  if (!bodyText().includes(name)) fail(`profil ${name} non affiché après enregistrement`);
}

function tabByLabel(label) {
  return all('[role="tab"]').find((element) => element.getAttribute('aria-label') === label) ?? buttonByLabel(label);
}

async function openProfileTab() {
  const tab = tabByLabel('Profil') ?? tabByLabel('Profile');
  if (!tab) throw new Error('onglet Profil introuvable');
  press(tab);
  await sleep(500);
}

async function backFromGame() {
  const back = buttonByLabel('Retour') ?? buttonByLabel('Back');
  if (!back) {
    fail('bouton retour absent dans l’activité');
    return;
  }
  press(back);
  await sleep(450);
}

async function main() {
  await sleep(1200);
  if (!bodyText().includes('Nouveau profil')) fail('écran de création de profil non affiché');

  // 1. Un profil par tranche d'âge, chacune ouverte et vérifiée.
  const bands = [
    ['Lina', '0 – 2 ans', 5],
    ['Noah', '3 – 5 ans', 9],
    ['Mila', '6 – 8 ans', 10],
    ['Elias', '9 – 12 ans', 12],
  ];
  let expectedBands = {};

  for (const [name, ageLabel, expectedCount] of bands) {
    await createProfile(name, ageLabel);
    expectedBands[name] = expectedCount;
    if (!bodyText().includes(`Bonjour ${name}`)) fail(`accueil non affiché pour ${name}`);
    if (process.env.DARK === '1' && name === 'Lina') {
      const background = window.getComputedStyle(document.body).backgroundColor;
      if (!/23, 21, 19|#171513/i.test(background)) fail(`mode sombre non appliqué (fond ${background})`);
    }
    const visibleCards = cards();
    if (visibleCards.length !== expectedCount) {
      fail(`${name} (${ageLabel}) : ${visibleCards.length} activités affichées au lieu de ${expectedCount}`);
    }

    // Ouvre chaque activité puis revient : détecte les écrans blancs/crashs.
    const labels = visibleCards.map((card) => card.getAttribute('aria-label')).filter(Boolean);
    for (const label of labels) {
      const card = visibleCards.find((element) => element.getAttribute('aria-label') === label);
      press(card);
      await sleep(500);
      if (buttonByLabel('Retour') == null && buttonByLabel('Back') == null) {
        fail(`« ${label} » : en-tête de jeu absent`);
      }
      await backFromGame();
      if (!bodyText().includes(`Bonjour ${name}`)) fail(`« ${label} » : retour à l’accueil impossible`);
    }

    await openProfileTab();
    const add = buttonByLabel('Ajouter un enfant') ?? buttonByLabel('Add a child');
    if (!add) {
      fail(`ajout de profil indisponible après ${name}`);
      break;
    }
    press(add);
    await sleep(400);
  }

  // 2. Une manche complète d'addition, avec enregistrement de la progression.
  //    (le formulaire du 5e profil est annulé : retour à la liste puis Mila)
  const formBack = buttonByLabel('Retour') ?? buttonByLabel('Back');
  if (formBack) {
    press(formBack);
    await sleep(350);
  }
  const mila = all('[role="button"]').find((element) => (element.getAttribute('aria-label') ?? '').includes('Mila'));
  if (!mila) fail('profil Mila introuvable dans la liste');
  else {
    press(mila);
    await sleep(700);
  }
  // 2bis. Onglet Récompenses : accessible depuis l'accueil et cohérent.
  const rewardsTab = tabByLabel('Récompenses');
  if (!rewardsTab) fail('onglet Récompenses introuvable');
  else {
    press(rewardsTab);
    await sleep(600);
    if (!bodyText().includes('Mes récompenses')) fail('écran des récompenses non affiché');
    if (!bodyText().includes('Étoiles')) fail('total d’étoiles absent des récompenses');
    const backToActivities = tabByLabel('Activités');
    if (!backToActivities) fail('retour aux activités absent des récompenses');
    else {
      press(backToActivities);
      await sleep(500);
    }
  }

  // 2ter. Modification d'un profil via le crayon : elle ne doit pas ouvrir
  // l'accueil à la place (deux zones tactiles ne doivent pas s'imbriquer).
  await openProfileTab();
  const editButtons = all('[role="button"]').filter(
    (element) => element.getAttribute('aria-label') === 'Modifier'
  );
  if (editButtons.length < 2) {
    fail(`boutons « Modifier » insuffisants (${editButtons.length})`);
  } else {
    press(editButtons[1]);
    await sleep(450);
    if (!bodyText().includes('Modifier')) fail('formulaire de modification non ouvert');
    type('Noé');
    await sleep(120);
    pressText('Enregistrer');
    await sleep(700);
    if (!bodyText().includes('Bonjour Noé')) {
      fail('le profil modifié n’est pas devenu le profil actif');
    }
    const storedEdit = JSON.parse(window.localStorage.getItem('mc-profiles-v1') ?? 'null');
    if (!storedEdit?.state?.profiles?.some((item) => item.name === 'Noé')) {
      fail('nom du profil modifié non enregistré');
    }
  }

  // Retour au profil 6-8 pour la manche d'addition.
  await openProfileTab();
  const milaCard = all('[role="button"]').find((element) =>
    (element.getAttribute('aria-label') ?? '').includes('Mila')
  );
  if (!milaCard) fail('profil Mila introuvable après modification');
  else {
    press(milaCard);
    await sleep(650);
  }

  const additionCard = cards().find((card) => /additions?/i.test(card.getAttribute('aria-label') ?? ''));
  if (!additionCard) {
    fail('activité Additions introuvable pour le profil 6-8');
  } else {
    press(additionCard);
    await sleep(600);
    // Joue jusqu'au bilan : répond aux 5 manches (les erreurs sont permises).
    let actions = 0;
    while (actions < 40 && !/Rejouer|Play again/.test(bodyText())) {
      actions += 1;
      const proceed = all('[role="button"]').find((element) =>
        /^(Continuer|Activité terminée|Continue|Activity complete)$/.test((element.textContent ?? '').trim())
      );
      if (proceed) {
        press(proceed);
        await sleep(350);
        continue;
      }
      const choices = all('[role="button"]')
        .filter((element) => /^\d+$/.test(element.getAttribute('aria-label') ?? ''))
        .filter((element) => element.getAttribute('aria-disabled') !== 'true');
      if (choices.length === 0) break;
      press(choices[0]);
      await sleep(350);
    }
    const finished = /Rejouer|Play again/.test(bodyText());
    if (!finished) fail('bilan de fin de session non affiché');
    // Retour à l'accueil depuis le bilan.
    const home = all('[role="button"]').find((element) => /Retour au menu|Back to menu/.test(element.textContent ?? ''));
    if (home) {
      press(home);
      await sleep(600);
    }
    const stored = JSON.parse(window.localStorage.getItem('mc-profiles-v1') ?? 'null');
    const profile = stored?.state?.profiles?.find((item) => item.name === 'Mila');
    const progress = profile?.progress?.addition;
    if (!progress || progress.sessions < 1 || progress.stars < 1) {
      fail('progression de l’addition non enregistrée');
    }
  }

  // 3. Porte parentale : la question affichée doit être résolue correctement.
  const parentsTab = tabByLabel('Parents');
  if (!parentsTab) {
    fail('onglet Parents introuvable');
  } else {
    press(parentsTab);
    await sleep(500);
    const match = bodyText().match(/(\d+)\s*×\s*(\d+)/);
    if (!match) {
      fail('question de la porte parentale introuvable');
    } else {
      const input = document.querySelector('input');
      const answer = String(Number(match[1]) * Number(match[2]));
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '');
      reactProps(input).onChange({ nativeEvent: {}, target: input, currentTarget: input });
      setter.call(input, answer);
      reactProps(input).onChange({ nativeEvent: {}, target: input, currentTarget: input });
      await sleep(150);
      pressText('Continuer');
      await sleep(700);
      if (!bodyText().includes('Espace parents')) fail('espace parents inaccessible avec la bonne réponse');
      if (!bodyText().includes('Progression')) fail('tableau de bord parents vide');

      // Réglages : bascule explicite clair / sombre / automatique.
      pressText('Réglages');
      await sleep(350);
      pressText('Sombre');
      await sleep(350);
      const dark = window.getComputedStyle(document.body).backgroundColor;
      if (!/23, 21, 19/i.test(dark)) fail(`thème sombre non appliqué (fond ${dark})`);
      pressText('Clair');
      await sleep(350);
      const light = window.getComputedStyle(document.body).backgroundColor;
      if (!/255, 249, 240/i.test(light)) fail(`thème clair non appliqué (fond ${light})`);
      pressText('Automatique');
      await sleep(250);

      // Code parental : définition, puis vérification de la porte.
      pressText('Définir un code');
      await sleep(300);
      type('1234', 0);
      type('1234', 1);
      await sleep(150);
      pressText('Définir un code');
      await sleep(400);
      if (!bodyText().includes('Code enregistré')) fail('code parental non enregistré');
      await sleep(300);

      const homeTab = tabByLabel('Activités') ?? tabByLabel('Activities');
      if (homeTab) {
        press(homeTab);
        await sleep(500);
      }
      const gateTab = tabByLabel('Parents');
      if (!gateTab) fail('onglet Parents introuvable après le code');
      else {
        press(gateTab);
        await sleep(500);
        if (!bodyText().includes('code parental')) fail('la porte ne demande pas le code parental');
        type('1234', 0);
        await sleep(120);
        pressText('Continuer');
        await sleep(600);
        if (!bodyText().includes('Espace parents')) fail('code parental refusé à tort');

        // Limite de temps : le choix du parent est enregistré.
        pressText('15 min');
        await sleep(350);
        const withLimit = JSON.parse(window.localStorage.getItem('mc-profiles-v1') ?? 'null');
        const currentId = withLimit?.state?.selectedId;
        const currentChild = withLimit?.state?.profiles?.find((item) => item.id === currentId);
        if (currentChild?.dailyLimitMinutes !== 15) {
          fail(`limite de temps non enregistrée (${currentChild?.dailyLimitMinutes})`);
        }

        // Changement de langue : toute l'interface doit suivre, puis revenir.
        pressText('Réglages');
        await sleep(350);
        pressText('English');
        await sleep(550);
        if (!bodyText().includes('Settings') || !bodyText().includes('Language')) {
          fail('passage en anglais inopérant');
        }
        pressText('Français');
        await sleep(550);
        if (!bodyText().includes('Réglages')) fail('retour au français inopérant');

        // Réinitialisation : confirmation explicite puis effacement réel.
        pressText('Mila');
        await sleep(350);
        pressText('Progression');
        await sleep(350);
        pressText('Réinitialiser la progression');
        await sleep(350);
        if (!bodyText().includes('Effacer toute la progression')) {
          fail('confirmation de réinitialisation absente');
        }
        pressText('Supprimer');
        await sleep(500);
        if (!bodyText().includes('Progression réinitialisée')) {
          fail('message de réinitialisation absent');
        }
        const afterReset = JSON.parse(window.localStorage.getItem('mc-profiles-v1') ?? 'null');
        const milaAfter = afterReset?.state?.profiles?.find((item) => item.name === 'Mila');
        if (milaAfter && Object.keys(milaAfter.progress ?? {}).length > 0) {
          fail('progression non effacée après réinitialisation');
        }
      }
    }
  }

  // 4. Aucun texte non traduit (clé brute) ne doit apparaître.
  const KNOWN_PREFIXES = new Set([
    'activity', 'game', 'home', 'parents', 'common', 'nav', 'color', 'shape', 'item', 'number',
    'rewards', 'mascot', 'a11y', 'language', 'theme', 'pwa', 'profile', 'age', 'sorting',
    'criterion', 'bin', 'kind', 'dressing', 'worldmap', 'tenses', 'solids', 'living',
    'equivalents', 'angles', 'code', 'fractions', 'geometry', 'solar', 'world', 'grammar',
    'conjugation', 'clock', 'money', 'reading', 'math',
  ]);
  const rawKeys = bodyText().match(/\b[a-z]+\.[a-zA-Z0-9_]+\b/g) ?? [];
  const suspicious = rawKeys.filter((key) => KNOWN_PREFIXES.has(key.split('.')[0]));
  if (suspicious.length) fail(`clés de traduction brutes affichées : ${suspicious.slice(0, 5).join(', ')}`);
}

try {
  await main();
} catch (error) {
  errors.push(`exception: ${error.stack ?? error}`);
}

await sleep(300);
if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) console (non bloquants) :`);
  console.log(warnings.slice(0, 5).join('\n'));
}
if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) détecté(s) :`);
  for (const error of errors.slice(0, 30)) console.error(` - ${error}`);
  process.exit(1);
}
console.log(
  `\n✅ Test de fumée Web (${process.env.VIEWPORT ?? '1024x768'}) : profils, 36 activités, ` +
    'addition, récompenses, édition de profil, porte parentale, réglages, langue et ' +
    'réinitialisation — aucune erreur.'
);
process.exit(0);
