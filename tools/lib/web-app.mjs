/**
 * Démarrage de l'application Web exportée dans jsdom, avec les mêmes réglages
 * que le banc de test de fumée.
 *
 * Ce module est partagé par :
 *  - `tools/smoke-web.mjs`      : parcours complet (profils, ouverture des
 *                                 activités, récompenses, porte parentale…) ;
 *  - `tools/play-activities.mjs` : une session entière, jouée jusqu'au bilan,
 *                                 pour chaque activité de chaque tranche d'âge.
 *
 * jsdom ne sait pas faire de mise en page : les mesures de position
 * (`measureInWindow`) renvoient 0. Chaque script choisit donc comment jouer
 * (glisser simulé, toucher, choix multiple…).
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const ROOT = path.resolve('dist');
const INDEX = path.join(ROOT, 'index.html');

/**
 * Mise en page minimale pour jsdom.
 *
 * jsdom ne calcule aucune position : `offsetWidth`, `offsetLeft` et
 * `getBoundingClientRect` renvoient toujours 0, si bien que les activités qui
 * mesurent leurs cibles (puzzles, tracé, fermetures) refusent tout geste.
 * On déduit donc la géométrie des styles en ligne, ce qui suffit pour que
 * l'application retrouve des coordonnées cohérentes entre elles.
 */
function installMiniLayout(window) {
  const cache = new WeakMap();
  const NO_LAYOUT = { width: 0, height: 0, position: 'static', left: 0, top: 0 };
  const number = (value) => {
    const parsed = Number.parseFloat(value ?? '');
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const box = (element) => {
    if (!element || element.nodeType !== 1) return NO_LAYOUT;
    const key = element.getAttribute('style') ?? '';
    const hit = cache.get(element);
    if (hit && hit.key === key) return hit.value;
    const style = window.getComputedStyle(element);
    const value = {
      width: number(style.width),
      height: number(style.height),
      position: style.position || 'static',
      left: number(style.left),
      top: number(style.top),
    };
    cache.set(element, { key, value });
    return value;
  };

  const offsetParentOf = (element) => {
    let node = element.parentElement;
    while (node && node.nodeType === 1) {
      if (box(node).position !== 'static') return node;
      node = node.parentElement;
    }
    return null;
  };

  /** Position cumulée, comme le fait react-native-web avec les `offset*`. */
  const originOf = (element) => {
    let x = 0;
    let y = 0;
    let node = element;
    while (node && node.nodeType === 1) {
      const style = box(node);
      if (style.position !== 'static') {
        x += style.left;
        y += style.top;
      }
      node = offsetParentOf(node);
    }
    return { x, y };
  };

  const proto = window.HTMLElement.prototype;
  const define = (name, get) =>
    Object.defineProperty(proto, name, { configurable: true, get });

  define('offsetWidth', function () {
    return Math.round(box(this).width);
  });
  define('offsetHeight', function () {
    return Math.round(box(this).height);
  });
  define('offsetLeft', function () {
    return box(this).position === 'static' ? 0 : box(this).left;
  });
  define('offsetTop', function () {
    return box(this).position === 'static' ? 0 : box(this).top;
  });
  define('offsetParent', function () {
    return offsetParentOf(this);
  });

  proto.getBoundingClientRect = function () {
    const origin = originOf(this);
    const style = box(this);
    return {
      x: origin.x,
      y: origin.y,
      left: origin.x,
      top: origin.y,
      width: style.width,
      height: style.height,
      right: origin.x + style.width,
      bottom: origin.y + style.height,
      toJSON() {
        return this;
      },
    };
  };
}

/**
 * Démarre l'application et renvoie les utilitaires d'interaction.
 *
 * @param {object} [options]
 * @param {boolean} [options.dark]   Simule `prefers-color-scheme: dark`.
 * @param {string}  [options.viewport] Format « LxH » (ex. `390x844`).
 * @param {boolean} [options.layout] Simule une mise en page minimale
 *   (positions et tailles lues dans les styles en ligne). Nécessaire aux
 *   activités qui mesurent leurs cibles avant d'accepter un glisser.
 */
export function startApp(options = {}) {
  const {
    dark = process.env.DARK === '1',
    viewport = process.env.VIEWPORT ?? '1024x768',
    layout = false,
  } = options;

  if (!fs.existsSync(INDEX)) {
    throw new Error('dist/index.html introuvable : lance « npm run build:web » d’abord.');
  }

  const errors = [];
  const warnings = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (error) => errors.push(`jsdom: ${error.message ?? error}`));
  vc.on('error', (...args) => errors.push(`console.error: ${args.map(String).join(' ')}`));
  vc.on('warn', (...args) => warnings.push(`console.warn: ${args.map(String).join(' ')}`));

  // Les scripts sont évalués à la main : le bundle doit être chargé après
  // l'installation des simulateurs d'API ci-dessous.
  const html = fs
    .readFileSync(INDEX, 'utf8')
    .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');

  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      // Environnement navigateur minimal mais suffisant pour RN Web.
      Object.defineProperty(window.navigator, 'language', { configurable: true, value: 'fr-FR' });
      Object.defineProperty(window.navigator, 'languages', { configurable: true, value: ['fr-FR', 'fr'] });
      const [viewportWidth, viewportHeight] = viewport.split('x').map(Number);
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: viewportWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewportHeight });
      window.devicePixelRatio = 2;
      window.matchMedia = (query) => ({
        matches: dark && query.includes('dark'),
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
      if (layout) installMiniLayout(window);
    },
  });

  const { window } = dom;
  const { document } = window;
  const bundleDir = path.join(ROOT, '_expo/static/js/web');
  const bundleName = fs.readdirSync(bundleDir).find((file) => file.endsWith('.js'));
  window.eval(fs.readFileSync(path.join(bundleDir, bundleName), 'utf8'));

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const all = (selector) => [...document.querySelectorAll(selector)];
  const bodyText = () => document.body.textContent.replace(/\s+/g, ' ').trim();
  const reactProps = (element) =>
    element?.[Object.keys(element).find((key) => key.startsWith('__reactProps'))];

  function press(element) {
    if (!element) throw new Error('élément introuvable');
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }

  /**
   * Un écran quitté reste monté (pile de navigation) mais il est marqué
   * `aria-hidden` et masqué : on ne doit jamais l'utiliser.
   */
  const isVisible = (element) => !element.closest('[aria-hidden="true"]');

  function allVisible(selector) {
    return all(selector).filter(isVisible);
  }

  function buttonByLabel(label) {
    const buttons = all('[role="button"]').filter((element) => element.getAttribute('aria-label') === label);
    return buttons.find(isVisible) ?? buttons[0];
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

  /** Cartes d'activité de l'accueil (« Niveau 1 », « Niveau 2 »…). */
  function cards() {
    return all('[role="button"]').filter((element) => /Niveau \d+|Level \d+/.test(element.textContent ?? ''));
  }

  function tabByLabel(label) {
    return all('[role="tab"]').find((element) => element.getAttribute('aria-label') === label) ?? buttonByLabel(label);
  }

  /** Bouton du bilan affiché à la fin d'une session (« Rejouer »). */
  const replayVisible = () => /Rejouer|Play again/.test(bodyText());

  /** Libellé du bouton principal de la fenêtre de récompense, s'il est affiché. */
  function rewardPrimary() {
    const label = all('[role="button"]').find((element) =>
      /^(Continuer|Activité terminée|Rejouer|Retour au menu|Continue|Activity complete|Play again|Back to menu)$/.test(
        (element.textContent ?? '').trim()
      )
    );
    return label ?? null;
  }

  /** Rectangle simulé d'un élément (mise en page minimale). */
  function rectOf(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }

  function mouseEvent(type, x, y, target) {
    return target.dispatchEvent(
      new window.MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        button: 0,
        buttons: type === 'mouseup' ? 0 : 1,
      })
    );
  }

  /**
   * Glisser-déposer simulé : appui sur l'élément, déplacement en plusieurs pas
   * (PanResponder ignore les sauts d'un seul coup), puis relâchement.
   */
  async function drag(target, from, to, steps = 8) {
    mouseEvent('mousedown', from.x, from.y, target);
    await sleep(60);
    for (let step = 1; step <= steps; step += 1) {
      const x = from.x + ((to.x - from.x) * step) / steps;
      const y = from.y + ((to.y - from.y) * step) / steps;
      mouseEvent('mousemove', x, y, document);
      await sleep(16);
    }
    mouseEvent('mouseup', to.x, to.y, document);
    await sleep(120);
  }

  /** Appui maintenu (verser, fermeture éclair) : relâchement après `ms`. */
  async function hold(target, point, ms) {
    mouseEvent('mousedown', point.x, point.y, target);
    await sleep(ms);
    mouseEvent('mouseup', point.x, point.y, document);
    await sleep(150);
  }

  /**
   * Toucher simple mais complet : appui puis relâchement sans déplacement.
   * Nécessaire aux éléments pilotés par PanResponder (pièces à glisser), qui
   * ignorent un simple événement `click`.
   */
  async function tap(element, point) {
    const rect = rectOf(element);
    const target = point ?? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    mouseEvent('mousedown', target.x, target.y, element);
    await sleep(60);
    mouseEvent('mouseup', target.x, target.y, document);
    await sleep(120);
  }

  /** Glisser continu le long d'une suite de points (tracé, lacet…). */
  async function dragPath(target, points, stepPx = 6) {
    if (points.length < 2) throw new Error('dragPath : au moins deux points');
    mouseEvent('mousedown', points[0].x, points[0].y, target);
    await sleep(40);
    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1];
      const to = points[index];
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(length / stepPx));
      for (let step = 1; step <= steps; step += 1) {
        mouseEvent('mousemove', from.x + ((to.x - from.x) * step) / steps, from.y + ((to.y - from.y) * step) / steps, document);
      }
      await sleep(16);
    }
    mouseEvent('mouseup', points[points.length - 1].x, points[points.length - 1].y, document);
    await sleep(120);
  }

  return {
    window,
    document,
    dom,
    errors,
    warnings,
    rectOf,
    drag,
    dragPath,
    tap,
    hold,
    sleep,
    all,
    allVisible,
    isVisible,
    bodyText,
    reactProps,
    press,
    buttonByLabel,
    pressLabel,
    pressText,
    type,
    cards,
    tabByLabel,
    replayVisible,
    rewardPrimary,
  };
}
