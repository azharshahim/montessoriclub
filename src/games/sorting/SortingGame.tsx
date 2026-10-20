import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { sample, shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { objectColors, type ObjectColor } from '../../theme/palette';
import { DragDropBoard, type BoardBin, type BoardItem } from '../../ui/DragDropBoard';
import { GameLayout } from '../../ui/GameLayout';
import { PatternBadge } from '../../ui/PatternBadge';
import { RewardOverlay } from '../../ui/RewardOverlay';
import { OBJECTS, OBJECT_IDS, ObjectIllustration, type ObjectId } from '../../ui/illustrations/objects';

/**
 * Module « Trier » (3-5 ans) — vie pratique Montessori.
 * Objectif unique par manche : classer selon UN critère (couleur, taille ou famille).
 * Le critère change d'une manche à l'autre : c'est l'enfant qui doit le découvrir
 * à partir de la consigne, pas l'interface qui le lui impose visuellement.
 */

type Kind = 'fruit' | 'animal' | 'toy';
type Size = 'big' | 'small';
type Criterion = 'color' | 'size' | 'kind';

interface Piece {
  id: string;
  objectId: ObjectId;
  size: Size;
  matchKey: string;
}

interface Bin {
  key: string;
  labelKey: TranslationKey;
  color: string;
  patternColor?: ObjectColor;
}

interface Board {
  criterion: Criterion;
  bins: Bin[];
  pieces: Piece[];
  instructionKey: TranslationKey;
}

/** Familles d'objets (une seule appartenance par objet). */
const KIND_OF: Partial<Record<ObjectId, Kind>> = {
  apple: 'fruit',
  banana: 'fruit',
  orange: 'fruit',
  grapes: 'fruit',
  fish: 'animal',
  butterfly: 'animal',
  bear: 'animal',
  balloon: 'toy',
  ball: 'toy',
  icecream: 'toy',
};

const KINDS: Kind[] = ['fruit', 'animal', 'toy'];

/** Couleurs disposant d'au moins deux objets (pour former une catégorie lisible). */
const COLORS_WITH_PAIRS: ObjectColor[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];

/** Progression : critère et taille de plateau par niveau. */
function criterionForLevel(level: number): Criterion {
  const cycle: Criterion[] = ['color', 'size', 'kind'];
  return cycle[(level - 1) % cycle.length];
}

const BIN_COLORS: Record<string, string> = {
  red: objectColors.red.base,
  blue: objectColors.blue.base,
  yellow: objectColors.yellow.base,
  green: objectColors.green.base,
  orange: objectColors.orange.base,
  purple: objectColors.purple.base,
  big: '#8C6A4A',
  small: '#8C6A4A',
  fruit: '#EE6C5B',
  animal: '#4FBF8B',
  toy: '#6C6FDB',
};

const BIN_LABEL: Record<string, TranslationKey> = {
  red: 'color.red',
  blue: 'color.blue',
  yellow: 'color.yellow',
  green: 'color.green',
  orange: 'color.orange',
  purple: 'color.purple',
  big: 'bin.big',
  small: 'bin.small',
  fruit: 'kind.fruit',
  animal: 'kind.animal',
  toy: 'kind.toy',
};

const SCENE_EMOJI: Record<string, string> = {
  fruit: '🍎',
  animal: '🐾',
  toy: '🧸',
  big: '🐘',
  small: '🐭',
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢',
  orange: '🟠',
  purple: '🟣',
};

export function SortingGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colorBlind, colors } = useTheme();
  const session = useGameSession({ rounds: 3, onFinish });

  const [board, setBoard] = useState<Board>(() => makeBoard(level));
  const [remaining, setRemaining] = useState<Piece[]>(board.pieces);
  const [placed, setPlaced] = useState<Record<string, Piece[]>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback(null), 2200);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    const next = makeBoard(level);
    setBoard(next);
    setRemaining(next.pieces);
    setPlaced({});
    setFeedback(null);
  }, [level, session.round]);

  const handleDrop = useCallback(
    (itemId: string, _binId: string, correct: boolean) => {
      const piece = remaining.find((p) => p.id === itemId);
      if (!piece || session.phase !== 'play') return;

      if (!correct) {
        playSfx('error', { volume: 0.5 });
        haptic('warning');
        session.registerMistake();
        onMistake?.();
        showFeedback(t('game.almost'));
        return;
      }

      playSfx('drop');
      haptic('light');

      const willBeLast = remaining.length === 1;
      setRemaining((prev) => prev.filter((p) => p.id !== itemId));
      setPlaced((prev) => ({ ...prev, [piece.matchKey]: [...(prev[piece.matchKey] ?? []), piece] }));

      if (willBeLast) {
        speak(t('mascot.cheer'), language);
        setTimeout(() => {
          playSfx('success');
          haptic('success');
          session.celebrate();
          session.winRound();
        }, 320);
      } else {
        playSfx('star', { volume: 0.3 });
      }
    },
    [language, onMistake, remaining, session, showFeedback, t]
  );

  const bins: BoardBin[] = useMemo(
    () =>
      board.bins.map((bin) => ({
        id: `bin-${bin.key}`,
        matchKey: bin.key,
        label: t(bin.labelKey),
        color: bin.color,
        labelBadge:
          colorBlind && bin.patternColor ? <PatternBadge color={bin.patternColor} size={16} /> : undefined,
        renderEmpty: (size: number) => (
          <View style={styles.binEmpty}>
            {bin.patternColor ? (
              // Pastille de couleur assortie au panier (et non une couleur arbitraire).
              <View
                style={{
                  width: size * 0.5,
                  height: size * 0.5,
                  borderRadius: size * 0.25,
                  backgroundColor: `${bin.color}33`,
                  borderWidth: 2.5,
                  borderColor: bin.color,
                }}
              />
            ) : (
              <Text style={{ fontSize: size * 0.6 }}>{SCENE_EMOJI[bin.key] ?? '📦'}</Text>
            )}
          </View>
        ),
        placed: (placed[bin.key] ?? []).map((piece) => ({
          id: piece.id,
          render: (size: number) => (
            <ObjectIllustration id={piece.objectId} size={piece.size === 'big' ? size : size * 0.72} />
          ),
        })),
      })),
    [board.bins, colorBlind, placed, t]
  );

  const items: BoardItem[] = useMemo(
    () =>
      remaining.map((piece) => ({
        id: piece.id,
        matchKey: piece.matchKey,
        label: t(OBJECTS[piece.objectId].labelKey as TranslationKey),
        render: (size: number) => (
          <ObjectIllustration id={piece.objectId} size={piece.size === 'big' ? size : size * 0.7} />
        ),
      })),
    [remaining, t]
  );

  return (
    <>
      <GameLayout
        title={t('activity.sorting.title')}
        instruction={t(board.instructionKey)}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <DragDropBoard
          items={items}
          bins={bins}
          onDrop={handleDrop}
          disabled={session.phase !== 'play'}
          maxItemSize={100}
        />
        <Text style={[styles.criterion, { color: colors.inkFaint }]}>
          {t('sorting.criterion', { criterion: t(`criterion.${board.criterion}` as TranslationKey) })}
        </Text>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={t('mascot.cheer')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

const INSTRUCTION: Record<Criterion, TranslationKey> = {
  color: 'sorting.byColor',
  size: 'sorting.bySize',
  kind: 'sorting.byKind',
};

function makeBoard(level: number): Board {
  const criterion = criterionForLevel(level);
  const binCount = level <= 3 ? 2 : 3;

  if (criterion === 'color') {
    const colorsChosen = sample(COLORS_WITH_PAIRS, Math.min(binCount + 1, 3));
    const pieces: Piece[] = colorsChosen.flatMap((color) =>
      OBJECT_IDS.filter((id) => OBJECTS[id].color === color)
        .slice(0, level <= 2 ? 1 : 2)
        .map((objectId) => ({
          id: `${objectId}-${color}`,
          objectId,
          size: 'big' as Size,
          matchKey: color,
        }))
    );
    return {
      criterion,
      bins: colorsChosen.map((color) => ({
        key: color,
        labelKey: BIN_LABEL[color],
        color: objectColors[color].base,
        patternColor: color,
      })),
      pieces: shuffle(pieces),
      instructionKey: INSTRUCTION.color,
    };
  }

  if (criterion === 'size') {
    const objects = sample(OBJECT_IDS, 6);
    const pieces: Piece[] = objects.map((objectId, index) => {
      const size: Size = index % 2 === 0 ? 'big' : 'small';
      return { id: `${objectId}-${size}`, objectId, size, matchKey: size };
    });
    return {
      criterion,
      bins: (['big', 'small'] as Size[]).map((size) => ({
        key: size,
        labelKey: BIN_LABEL[size],
        color: BIN_COLORS[size],
      })),
      pieces: shuffle(pieces),
      instructionKey: INSTRUCTION.size,
    };
  }

  // Critère « famille »
  const kinds = sample(KINDS, binCount);
  const pieces: Piece[] = kinds.flatMap((kind) =>
    (Object.keys(KIND_OF) as ObjectId[])
      .filter((id) => KIND_OF[id] === kind)
      .slice(0, level <= 3 ? 2 : 3)
      .map((objectId) => ({
        id: `${objectId}-${kind}`,
        objectId,
        size: 'big' as Size,
        matchKey: kind,
      }))
  );
  return {
    criterion,
    bins: kinds.map((kind) => ({
      key: kind,
      labelKey: BIN_LABEL[kind],
      color: BIN_COLORS[kind],
    })),
    pieces: shuffle(pieces),
    instructionKey: INSTRUCTION.kind,
  };
}

const styles = StyleSheet.create({
  binEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterion: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    paddingBottom: 2,
  },
});
