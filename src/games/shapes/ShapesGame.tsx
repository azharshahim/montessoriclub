import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { sample, shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { DragDropBoard, type BoardBin, type BoardItem } from '../../ui/DragDropBoard';
import { GameLayout } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import {
  SHAPES,
  SHAPE_LABEL_KEYS,
  ShapeSVG,
  type ShapeId,
} from '../../ui/illustrations/shapes';

/** Toutes les pièces partagent la même teinte « bois » : l'attention porte sur la forme. */
const WOOD = { fill: '#F0B878', deep: '#C58549', stroke: '#A96C36' };
const SLOT = { fill: '#D9CDBF', deep: '#8C7B69' };

type Piece = { id: string; shape: ShapeId };
type Board = { shapes: ShapeId[]; pieces: Piece[] };

const POOLS: Record<number, ShapeId[]> = {
  1: ['circle', 'square', 'triangle'],
  2: ['circle', 'square', 'triangle', 'rectangle'],
  3: ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval'],
  4: ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval', 'hexagon'],
  5: SHAPES,
};

/**
 * Module « Les formes » (3-5 ans).
 * Objectif unique : reconnaître une forme et l'emboîter dans son emplacement.
 * Progression : 3 formes simples → 4 → 6 pièces avec doublons → formes proches
 * (cercle/ovale, carré/rectangle) qui affinent la discrimination visuelle.
 */
export function ShapesGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colors } = useTheme();
  const session = useGameSession({ rounds: 4, onFinish });

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
      speak(t(SHAPE_LABEL_KEYS[piece.shape] as TranslationKey), language);

      const willBeLast = remaining.length === 1;
      setRemaining((prev) => prev.filter((p) => p.id !== itemId));
      setPlaced((prev) => ({ ...prev, [piece.shape]: [...(prev[piece.shape] ?? []), piece] }));

      if (willBeLast) {
        setTimeout(() => {
          playSfx('success');
          haptic('success');
          session.celebrate();
          session.winRound();
        }, 320);
      } else {
        playSfx('star', { volume: 0.35 });
      }
    },
    [language, onMistake, remaining, session, showFeedback, t]
  );

  const bins: BoardBin[] = useMemo(
    () =>
      board.shapes.map((shape) => ({
        id: `bin-${shape}`,
        matchKey: shape,
        label: t(SHAPE_LABEL_KEYS[shape] as TranslationKey),
        color: '#8C6A4A',
        renderEmpty: (size: number) => (
          <ShapeSVG shape={shape} size={size} fill="transparent" fillDeep="transparent" stroke={SLOT.deep} dashed strokeWidth={3} />
        ),
        placed: (placed[shape] ?? []).map((piece) => ({
          id: piece.id,
          render: (size: number) => (
            <ShapeSVG shape={piece.shape} size={size} fill={WOOD.fill} fillDeep={WOOD.deep} stroke={WOOD.stroke} glossy />
          ),
        })),
      })),
    [board.shapes, placed, t]
  );

  const items: BoardItem[] = useMemo(
    () =>
      remaining.map((piece) => ({
        id: piece.id,
        matchKey: piece.shape,
        label: t(SHAPE_LABEL_KEYS[piece.shape] as TranslationKey),
        render: (size: number) => (
          <ShapeSVG shape={piece.shape} size={size} fill={WOOD.fill} fillDeep={WOOD.deep} stroke={WOOD.stroke} glossy />
        ),
      })),
    [remaining, t]
  );

  return (
    <>
      <GameLayout
        title={t('activity.shapes.title')}
        instruction={t('activity.shapes.instruction')}
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
          maxItemSize={108}
        />
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

function makeBoard(level: number): Board {
  const pool = POOLS[Math.min(Math.max(level, 1), 5)];
  const shapeCount = Math.min(4, pool.length);
  const chosen = sample(pool, shapeCount);
  // Niveaux 3+ : deux pièces supplémentaires pour consolider la reconnaissance.
  const duplicates = level >= 3 ? sample(chosen, Math.min(2, chosen.length)) : [];
  const pieces: Piece[] = shuffle([...chosen, ...duplicates]).map((shape, index) => ({
    id: `${shape}-${index}`,
    shape,
  }));
  return { shapes: chosen, pieces };
}
