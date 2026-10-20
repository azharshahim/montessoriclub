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
import { SyllablesGame } from './reading/SyllablesGame';
import { ReadingGame } from './reading/ReadingGame';
import { ClockGame } from './clock/ClockGame';
import { MoneyGame } from './money/MoneyGame';
import { FractionsGame } from './fractions/FractionsGame';
import { GeometryGame } from './geometry/GeometryGame';
import { SolarGame } from './solar/SolarGame';
import { WorldGame } from './world/WorldGame';
import { GrammarGame } from './grammar/GrammarGame';
import { ConjugationGame } from './conjugation/ConjugationGame';
import { CodeGame } from './code/CodeGame';
import { LivingGame } from './living/LivingGame';
import { EquivalentsGame } from './equivalents/EquivalentsGame';
import { AnglesGame } from './angles/AnglesGame';
import { TensesGame } from './tenses/TensesGame';
import { SolidsGame } from './solids/SolidsGame';

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
  {
    id: 'syllables',
    titleKey: 'activity.syllables.title',
    instructionKey: 'activity.syllables.instruction',
    emoji: '🔤',
    accent: '#6C6FDB',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: SyllablesGame,
  },
  {
    id: 'reading',
    titleKey: 'activity.reading.title',
    instructionKey: 'activity.reading.instruction',
    emoji: '📖',
    accent: '#3FB1B5',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: ReadingGame,
  },
  {
    id: 'clock',
    titleKey: 'activity.clock.title',
    instructionKey: 'activity.clock.instruction',
    emoji: '🕒',
    accent: '#4E8FE0',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: ClockGame,
  },
  {
    id: 'money',
    titleKey: 'activity.money.title',
    instructionKey: 'activity.money.instruction',
    emoji: '💶',
    accent: '#4FBF8B',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: MoneyGame,
  },
  {
    id: 'fractions',
    titleKey: 'activity.fractions.title',
    instructionKey: 'activity.fractions.instruction',
    emoji: '🍕',
    accent: '#F59A4B',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: FractionsGame,
  },
  {
    id: 'geometry',
    titleKey: 'activity.geometry.title',
    instructionKey: 'activity.geometry.instruction',
    emoji: '📐',
    accent: '#4E8FE0',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: GeometryGame,
  },
  {
    id: 'solar',
    titleKey: 'activity.solar.title',
    instructionKey: 'activity.solar.instruction',
    emoji: '🪐',
    accent: '#6C6FDB',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: SolarGame,
  },
  {
    id: 'world',
    titleKey: 'activity.world.title',
    instructionKey: 'activity.world.instruction',
    emoji: '🗺️',
    accent: '#4FBF8B',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: WorldGame,
  },
  {
    id: 'grammar',
    titleKey: 'activity.grammar.title',
    instructionKey: 'activity.grammar.instruction',
    emoji: '📝',
    accent: '#EE6C5B',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: GrammarGame,
  },
  {
    id: 'conjugation',
    titleKey: 'activity.conjugation.title',
    instructionKey: 'activity.conjugation.instruction',
    emoji: '✍️',
    accent: '#9C7BE0',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: ConjugationGame,
  },
  {
    id: 'code',
    titleKey: 'activity.code.title',
    instructionKey: 'activity.code.instruction',
    emoji: '🤖',
    accent: '#4E8FE0',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: CodeGame,
  },
  {
    id: 'living',
    titleKey: 'activity.living.title',
    instructionKey: 'activity.living.instruction',
    emoji: '🌿',
    accent: '#4FBF8B',
    ageBands: ['6-8'],
    maxLevel: 5,
    rounds: 5,
    Component: LivingGame,
  },
  {
    id: 'equivalents',
    titleKey: 'activity.equivalents.title',
    instructionKey: 'activity.equivalents.instruction',
    emoji: '🟰',
    accent: '#F59A4B',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: EquivalentsGame,
  },
  {
    id: 'angles',
    titleKey: 'activity.angles.title',
    instructionKey: 'activity.angles.instruction',
    emoji: '📏',
    accent: '#EE6C5B',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: AnglesGame,
  },
  {
    id: 'tenses',
    titleKey: 'activity.tenses.title',
    instructionKey: 'activity.tenses.instruction',
    emoji: '⏳',
    accent: '#9C7BE0',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: TensesGame,
  },
  {
    id: 'solids',
    titleKey: 'activity.solids.title',
    instructionKey: 'activity.solids.instruction',
    emoji: '🧊',
    accent: '#3FB1B5',
    ageBands: ['9-12'],
    maxLevel: 5,
    rounds: 5,
    Component: SolidsGame,
  },
];

export function gamesForAge(ageBand: AgeBandId): GameModule[] {
  return GAME_MODULES.filter((game) => game.ageBands.includes(ageBand));
}

export function getGame(id: string): GameModule | undefined {
  return GAME_MODULES.find((game) => game.id === id);
}
