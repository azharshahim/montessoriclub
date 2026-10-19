import type { RoundResult } from '../games/types';

/**
 * Difficulté adaptative Montessori.
 *
 * Règles (jamais de sanction, uniquement des ajustements) :
 *  - 0 erreur              -> niveau + 1 (l'enfant a maîtrisé, on propose plus grand)
 *  - erreurs >= réussites  -> niveau - 1 (on revient à une difficulté confortable)
 *  - sinon                 -> niveau inchangé (on consolide)
 */
export function adaptLevel(currentLevel: number, result: RoundResult, maxLevel: number): number {
  if (result.mistakes === 0 && result.rounds > 0) return Math.min(maxLevel, currentLevel + 1);
  if (result.mistakes >= Math.max(2, result.rounds)) return Math.max(1, currentLevel - 1);
  return currentLevel;
}

/** Étoiles gagnées : 1 par défi réussi, +1 si aucune erreur, plafonné à 5. */
export function computeStars(result: RoundResult): number {
  const base = Math.max(1, result.rounds);
  const bonus = result.mistakes === 0 ? 1 : 0;
  return Math.min(5, base + bonus);
}

/** Échantillonne `count` éléments distincts d'un tableau. */
export function sample<T>(items: readonly T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** Mélange sans mutation. */
export function shuffle<T>(items: readonly T[]): T[] {
  return sample(items, items.length);
}

/** Entier aléatoire inclusif [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
