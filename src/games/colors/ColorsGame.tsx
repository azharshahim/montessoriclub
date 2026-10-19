import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { haptic } from '../../audio/haptics';
import { playSfx } from '../../audio/engine';
import { speak } from '../../audio/speech';
import { sample, shuffle } from '../../engine/adaptive';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useI18n, type TranslationKey } from '../../i18n';
import { useActiveProfile } from '../../store/profiles';
import { useTheme } from '../../theme';
import { objectColors, type ObjectColor } from '../../theme/palette';
import { DragDropBoard, type BoardBin, type BoardItem } from '../../ui/DragDropBoard';
import { GameLayout } from '../../ui/GameLayout';
import { PatternBadge } from '../../ui/PatternBadge';
import { RewardOverlay } from '../../ui/RewardOverlay';
import { OBJECTS, OBJECT_IDS, ObjectIllustration, type ObjectId } from '../../ui/illustrations/objects';

type Piece = { id: string; objectId: ObjectId; color: ObjectColor };
type Board = { colors: ObjectColor[]; items: Piece[] };

const BASIC: ObjectColor[] = ['red', 'blue', 'yellow', 'green'];
const EXTENDED: ObjectColor[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const ALL_COLORS: ObjectColor[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'];

/**
 * Module « Les couleurs » (3-5 ans).
 * Objectif unique : associer un objet à la couleur de sa corbeille.
 *
 * Progression :
 *  1-2 : 2 couleurs de base, 2 objets par couleur
 *  3   : 3 couleurs, ajout d'orange et violet
 *  4-5 : 4 couleurs, teintes proches (rose / marron) pour affiner la discrimination
 */
export function ColorsGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colorBlind, colors } = useTheme();
  const profile = useActiveProfile();

  const session = useGameSession({ rounds: 4, onFinish });

  const [board, setBoard] = useState<Board>(() => makeBoard(level));
  const [remaining, setRemaining] = useState<Piece[]>(board.items);
  const [placed, setPlaced] = useState<Record<string, Piece[]>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2400);
  }, []);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  // Nouveau plateau à chaque manche.
  useEffect(() => {
    const next = makeBoard(level);
    setBoard(next);
    setRemaining(next.items);
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
      speak(t(`color.${piece.color}` as TranslationKey), language);

      const willBeLast = remaining.length === 1;
      setRemaining((prev) => prev.filter((p) => p.id !== itemId));
      setPlaced((prev) => ({ ...prev, [piece.color]: [...(prev[piece.color] ?? []), piece] }));

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
      board.colors.map((color) => {
        const c = objectColors[color];
        const pieces = placed[color] ?? [];
        return {
          id: `bin-${color}`,
          matchKey: color,
          label: t(`color.${color}` as TranslationKey),
          color: c.base,
          labelBadge: colorBlind ? <PatternBadge color={color} size={16} /> : undefined,
          renderEmpty: (size: number) => <Basket color={color} size={size} />,
          placed: pieces.map((piece) => ({
            id: piece.id,
            render: (size: number) => <ObjectIllustration id={piece.objectId} size={size} />,
          })),
        };
      }),
    [board.colors, colorBlind, placed, t]
  );

  const items: BoardItem[] = useMemo(
    () =>
      remaining.map((piece) => ({
        id: piece.id,
        matchKey: piece.color,
        label: `${t(OBJECTS[piece.objectId].labelKey as TranslationKey)} — ${t(`color.${piece.color}` as TranslationKey)}`,
        render: (size: number) => (
          <View style={styles.itemWrap}>
            <ObjectIllustration id={piece.objectId} size={size} />
            {colorBlind ? (
              <View style={styles.badge}>
                <PatternBadge color={piece.color} size={18} />
              </View>
            ) : null}
          </View>
        ),
      })),
    [colorBlind, remaining, t]
  );

  return (
    <>
      <GameLayout
        title={t('activity.colors.title')}
        instruction={t('activity.colors.instruction')}
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
        subtitle={profile ? t('game.wellDone', { name: profile.name }) : t('mascot.cheer')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

function makeBoard(level: number): Board {
  const colorCount = Math.min(2 + Math.floor((level - 1) / 2), 4);
  const pool = level <= 2 ? BASIC : level <= 3 ? EXTENDED : ALL_COLORS;
  const chosen = sample(pool, colorCount);
  const items: Piece[] = chosen.flatMap((color) =>
    OBJECT_IDS.filter((id) => OBJECTS[id].color === color).map((objectId) => ({
      id: objectId,
      objectId,
      color,
    }))
  );
  return { colors: chosen, items: shuffle(items) };
}

/** Petit panier tissé, teinté de la couleur cible. */
function Basket({ color, size }: { color: ObjectColor; size: number }) {
  const c = objectColors[color];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M18 44 H82 L74 92 H26 Z" fill={c.light} stroke={c.deep} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M18 44 H82" stroke={c.deep} strokeWidth="5" strokeLinecap="round" />
      <Path d="M26 44 Q50 14 74 44" fill="none" stroke={c.base} strokeWidth="6" strokeLinecap="round" />
      <G stroke={c.deep} opacity="0.32" strokeWidth="2" strokeLinecap="round">
        <Path d="M33 54 L31 84" />
        <Path d="M44 54 L43 84" />
        <Path d="M56 54 L57 84" />
        <Path d="M67 54 L69 84" />
        <Path d="M23 60 H77" />
        <Path d="M24 72 H76" />
        <Path d="M25 84 H75" />
      </G>
      <Ellipse cx="50" cy="44" rx="29" ry="4.6" fill={c.base} opacity="0.4" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  itemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
  },
});
