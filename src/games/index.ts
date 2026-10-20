import type { AgeBandId, GameModule } from './types';
import { AnimalsGame } from './animals/AnimalsGame';
import { ColorsGame } from './colors/ColorsGame';
import { ColorTouchGame } from './colortouch/ColorTouchGame';
import { DressingGame } from './dressing/DressingGame';
import { MemoryGame } from './memory/MemoryGame';
import { MusicGame } from './music/MusicGame';
import { NumbersGame } from './numbers/NumbersGame';
import { PouringGame } from './pouring/PouringGame';
import { PuzzleGame } from './puzzle/PuzzleGame';
import { SensoryGame } from './sensory/SensoryGame';
import { ShapeFitGame } from './shapefit/ShapeFitGame';
import { ShapesGame } from './shapes/ShapesGame';
import { SortingGame } from './sorting/SortingGame';
import { TracingGame } from './tracing/TracingGame';
import { AdditionGame } from './addition/AdditionGame';
import { SubtractionGame } from './subtraction/SubtractionGame';
import { TimesGame } from './times/TimesGame';

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
    id: 'animals',
    titleKey: 'activity.animals.title',
    instructionKey: 'activity.animals.instruction',
    emoji: '🐶',
    accent: '#F59A4B',
    ageBands: ['0-2'],
    maxLevel: 1,
    rounds: 8,
    Component: AnimalsGame,
  },
  {
    id: 'colortouch',
    titleKey: 'activity.colortouch.title',
    instructionKey: 'activity.colortouch.instruction',
    emoji: '🔴',
    accent: '#EE6C5B',
    ageBands: ['0-2'],
    maxLevel: 1,
    rounds: 8,
    Component: ColorTouchGame,
  },
  {
    id: 'shapefit',
    titleKey: 'activity.shapefit.title',
    instructionKey: 'activity.shapefit.instruction',
    emoji: '🟠',
    accent: '#4E8FE0',
    ageBands: ['0-2'],
    maxLevel: 1,
    rounds: 4,
    Component: ShapeFitGame,
  },
  {
    id: 'music',
    titleKey: 'activity.music.title',
    instructionKey: 'activity.music.instruction',
    emoji: '🎵',
    accent: '#9C7BE0',
    ageBands: ['0-2'],
    maxLevel: 1,
    rounds: 12,
    Component: MusicGame,
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
    // 6-8 ans : le contenu reste des formes simples, trop facile pour la tranche.
    ageBands: ['3-5'],
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
    // 6-8 ans : dénombrer jusqu'à 10 est acquis, en attendant les additions.
    ageBands: ['3-5'],
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
    // Les plus grands démarrent directement sur 8 cartes, pas sur 3.
    minLevelByAge: { '6-8': 4 },
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
    // 6-8 ans : grilles 3x3 et 4x3 minimum (les grilles 2x2 sont trop simples).
    minLevelByAge: { '6-8': 4 },
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
  {
    id: 'addition',
    titleKey: 'activity.addition.title',
    instructionKey: 'activity.addition.instruction',
    emoji: '➕',
    accent: '#E8554A',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: AdditionGame,
  },
  {
    id: 'subtraction',
    titleKey: 'activity.subtraction.title',
    instructionKey: 'activity.subtraction.instruction',
    emoji: '➖',
    accent: '#4FBF8B',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: SubtractionGame,
  },
  {
    id: 'times',
    titleKey: 'activity.times.title',
    instructionKey: 'activity.times.instruction',
    emoji: '✖️',
    accent: '#F59A4B',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: TimesGame,
  },
];

export function gamesForAge(ageBand: AgeBandId): GameModule[] {
  return GAME_MODULES.filter((game) => game.ageBands.includes(ageBand));
}

export function getGame(id: string): GameModule | undefined {
  return GAME_MODULES.find((game) => game.id === id);
}
