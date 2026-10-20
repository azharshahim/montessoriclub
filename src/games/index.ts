import type { AgeBandId, GameModule } from './types';
import { ColorsGame } from './colors/ColorsGame';
import { DressingGame } from './dressing/DressingGame';
import { MemoryGame } from './memory/MemoryGame';
import { NumbersGame } from './numbers/NumbersGame';
import { PouringGame } from './pouring/PouringGame';
import { PuzzleGame } from './puzzle/PuzzleGame';
import { SensoryGame } from './sensory/SensoryGame';
import { ShapesGame } from './shapes/ShapesGame';
import { SortingGame } from './sorting/SortingGame';
import { TracingGame } from './tracing/TracingGame';

/**
 * Catalogue des activités livrées.
 * Chaque module respecte le même contrat (GameProps) : il peut donc être
 * ajouté au fil des versions sans toucher au reste de l'application.
 */
export const GAME_MODULES: GameModule[] = [
  {
    id: 'sensory',
    titleKey: 'activity.sensory.title',
    instructionKey: 'activity.sensory.instruction',
    emoji: '🫧',
    accent: '#3FB1B5',
    ageBands: ['0-2'],
    maxLevel: 1,
    rounds: 10,
    Component: SensoryGame,
  },
  {
    id: 'colors',
    titleKey: 'activity.colors.title',
    instructionKey: 'activity.colors.instruction',
    emoji: '🎨',
    accent: '#EE6C5B',
    ageBands: ['3-5'],
    maxLevel: 5,
    rounds: 4,
    Component: ColorsGame,
  },
  {
    id: 'shapes',
    titleKey: 'activity.shapes.title',
    instructionKey: 'activity.shapes.instruction',
    emoji: '🔷',
    accent: '#4E8FE0',
    ageBands: ['3-5', '6-8'],
    maxLevel: 5,
    rounds: 4,
    Component: ShapesGame,
  },
  {
    id: 'numbers',
    titleKey: 'activity.numbers.title',
    instructionKey: 'activity.numbers.instruction',
    emoji: '🔢',
    accent: '#F59A4B',
    ageBands: ['3-5', '6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: NumbersGame,
  },
  {
    id: 'tracing',
    titleKey: 'activity.tracing.title',
    instructionKey: 'activity.tracing.instruction',
    emoji: '✏️',
    accent: '#4FBF8B',
    ageBands: ['3-5'],
    maxLevel: 5,
    rounds: 3,
    Component: TracingGame,
  },
  {
    id: 'sorting',
    titleKey: 'activity.sorting.title',
    instructionKey: 'activity.sorting.instruction',
    emoji: '🧺',
    accent: '#4FBF8B',
    ageBands: ['3-5'],
    maxLevel: 5,
    rounds: 3,
    Component: SortingGame,
  },
  {
    id: 'memory',
    titleKey: 'activity.memory.title',
    instructionKey: 'activity.memory.instruction',
    emoji: '🃏',
    accent: '#6C6FDB',
    ageBands: ['3-5', '6-8'],
    maxLevel: 5,
    rounds: 2,
    Component: MemoryGame,
  },
  {
    id: 'puzzle',
    titleKey: 'activity.puzzle.title',
    instructionKey: 'activity.puzzle.instruction',
    emoji: '🧩',
    accent: '#F59A4B',
    ageBands: ['3-5', '6-8'],
    maxLevel: 5,
    rounds: 2,
    Component: PuzzleGame,
  },
  {
    id: 'pouring',
    titleKey: 'activity.pouring.title',
    instructionKey: 'activity.pouring.instruction',
    emoji: '💧',
    accent: '#4E8FE0',
    ageBands: ['3-5'],
    maxLevel: 5,
    rounds: 3,
    Component: PouringGame,
  },
  {
    id: 'dressing',
    titleKey: 'activity.dressing.title',
    instructionKey: 'activity.dressing.instruction',
    emoji: '👕',
    accent: '#EE8FB1',
    ageBands: ['3-5'],
    maxLevel: 1,
    rounds: 3,
    Component: DressingGame,
  },
];

export function gamesForAge(ageBand: AgeBandId): GameModule[] {
  return GAME_MODULES.filter((game) => game.ageBands.includes(ageBand));
}

export function getGame(id: string): GameModule | undefined {
  return GAME_MODULES.find((game) => game.id === id);
}
