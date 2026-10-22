import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutRectangle,
  type ViewStyle,
} from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout, useBoardArea } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import { OBJECTS, ObjectIllustration, type ObjectId } from '../../ui/illustrations/objects';

/**
 * Module « Puzzles » (3-5 ans) — discrimination visuelle et coordination.
 * Objectif unique : replacer chaque pièce dans sa case.
 *
 * Les cases vides montrent une version fantôme de la pièce (comme les puzzles
 * en bois Montessori) : l'enfant réussit par la forme, pas par essais aveugles.
 */

type Grid = { cols: number; rows: number };
type Piece = { id: string; index: number };

const GRID_BY_LEVEL: Grid[] = [
  { cols: 2, rows: 2 }, // 4 pièces
  { cols: 3, rows: 2 }, // 6 pièces
  { cols: 3, rows: 3 }, // 9 pièces
  { cols: 3, rows: 3 },
  { cols: 4, rows: 3 }, // 12 pièces
];

/** Empêche le défilement de la page pendant un glisser (react-native-web). */
const NO_SCROLL_STYLE = { touchAction: 'none' } as unknown as ViewStyle;

/** Couleurs bonbon : chaque pièce a son cadre, le plateau prend la teinte du puzzle. */
const CANDY = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC', '#38D9A9'];
const BOARD_TINTS = ['#FFE3E3', '#FFF0D9', '#FFF9DB', '#E3F9E5', '#E0F2FF', '#EDE5FF', '#FFE0EE', '#D9FBF1'];

const PUZZLE_OBJECTS: ObjectId[] = ['bear', 'butterfly', 'fish', 'icecream', 'apple', 'balloon', 'flower', 'cookie'];

export function PuzzleGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const area = useBoardArea();
  const session = useGameSession({ rounds: 2, onFinish });

  const grid = GRID_BY_LEVEL[Math.min(Math.max(level, 1), 5) - 1];
  const [objectId, setObjectId] = useState<ObjectId>(() => sample(PUZZLE_OBJECTS, 1)[0]);
  const themeIndex = Math.max(0, PUZZLE_OBJECTS.indexOf(objectId)) % CANDY.length;
  const themeColor = CANDY[themeIndex];
  const themeTint = BOARD_TINTS[themeIndex];
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [tray, setTray] = useState<Piece[]>(() => makeTray(grid));
  const [feedback, setFeedback] = useState<string | null>(null);

  const slotRefs = useRef<Record<number, React.ComponentRef<typeof View> | null>>({});
  const slotRects = useRef<Record<number, LayoutRectangle>>({});
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Le plateau et la réserve doivent tenir ensemble à l'écran,
  // même sur un téléphone en portrait (430 × 932).
  // Dimensionnement sur la place réellement disponible sous la mascotte.
  // En paysage, plateau et réserve sont côte à côte pour gagner la hauteur.
  // -40 : marges latérales du contenu d'écran (20 px de chaque côté).
  const availWidth = (area?.width ?? width) - 40;
  const availHeight = (area?.height ?? height * 0.45) - 8;
  const wide = availWidth > availHeight * 1.35;
  // La réserve garde une part garantie : sinon, sur petit écran, les pièces
  // devenaient minuscules et impossibles à attraper au doigt.
  const trayReserve = Math.max(76, Math.min(150, availHeight * 0.3));
  const boardSize = wide
    ? Math.max(132, Math.min(availHeight - 34, availWidth * 0.55, 330))
    : Math.max(120, Math.min(availWidth - 8, availHeight - trayReserve - 26, 330));
  const pieceW = boardSize / grid.cols;
  const pieceH = boardSize / grid.rows;

  // Nouveau puzzle à chaque manche.
  useEffect(() => {
    setObjectId(sample(PUZZLE_OBJECTS, 1)[0]);
    setTray(makeTray(grid));
    setPlaced({});
    setFeedback(null);
    slotRects.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.round, level]);

  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    []
  );

  const measureSlots = useCallback(() => {
    Object.entries(slotRefs.current).forEach(([index, node]) => {
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) slotRects.current[Number(index)] = { x, y, width: w, height: h };
        });
      }
    });
  }, []);

  useEffect(() => {
    const id = setTimeout(measureSlots, 80);
    return () => clearTimeout(id);
  }, [measureSlots, placed, boardSize]);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1800);
  }, []);

  const dropPiece = useCallback(
    (piece: Piece, point: { x: number; y: number }) => {
      if (session.phase !== 'play') return false;

      // Trouve la case sous le doigt.
      let target: number | null = null;
      for (const [index, rect] of Object.entries(slotRects.current)) {
        if (
          point.x >= rect.x - 12 &&
          point.x <= rect.x + rect.width + 12 &&
          point.y >= rect.y - 12 &&
          point.y <= rect.y + rect.height + 12
        ) {
          target = Number(index);
          break;
        }
      }

      if (target === null) return false;

      if (target !== piece.index) {
        playSfx('error', { volume: 0.42 });
        haptic('warning');
        session.registerMistake();
        onMistake?.();
        showFeedback(t('game.almost'));
        return false;
      }

      playSfx('drop');
      haptic('light');
      const nextPlaced = { ...placed, [piece.index]: true };
      setPlaced(nextPlaced);
      setTray((prev) => prev.filter((p) => p.id !== piece.id));

      if (Object.keys(nextPlaced).length === grid.cols * grid.rows) {
        setTimeout(() => {
          playSfx('success');
          haptic('success');
          session.celebrate();
          session.winRound();
        }, 320);
      } else {
        playSfx('star', { volume: 0.3 });
      }
      return true;
    },
    [grid, onMistake, placed, session, showFeedback, t]
  );

  const total = grid.cols * grid.rows;
  const placedCount = Object.keys(placed).length;

  const slots = useMemo(() => Array.from({ length: total }, (_, index) => index), [total]);

  // Réserve : on choisit le nombre de rangées qui offre les plus grosses
  // pièces possibles, en gardant une marge pour que la rangée ne déborde pas.
  const trayMaxWidth = wide ? availWidth - boardSize - 24 : availWidth;
  const trayAvailHeight = wide ? availHeight - 12 : trayReserve;
  const trayGap = 6;
  let trayScale = 0;
  for (let rows = 1; rows <= 4; rows += 1) {
    const cols = Math.ceil(total / rows);
    const widthPerPiece = (trayMaxWidth - (cols - 1) * trayGap - 10) / cols;
    const heightPerPiece = (trayAvailHeight - (rows - 1) * trayGap - 6) / rows;
    const candidate = Math.min(1, widthPerPiece / (pieceW + 4), heightPerPiece / (pieceH + 4));
    if (candidate > trayScale) trayScale = candidate;
    if (candidate >= 0.55) break;
  }
  trayScale = Math.max(0.3, trayScale);

  return (
    <>
      <GameLayout
        title={t('activity.puzzle.title')}
        instruction={t('activity.puzzle.instruction')}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View
          style={[
            styles.area,
            { flex: undefined, flexDirection: wide ? 'row' : 'column', gap: wide ? 14 : 6 },
          ]}
        >
          <View style={{ alignItems: 'center', gap: 4 }}>
          {/* Plateau : illustration découpée en cases */}
          <View
            style={[
              styles.board,
              shadow.soft,
              {
                width: boardSize,
                height: boardSize,
                borderRadius: radius.lg,
                borderColor: themeColor,
                borderWidth: 5,
                backgroundColor: themeTint,
              },
            ]}
          >
            {slots.map((index) => {
              const col = index % grid.cols;
              const row = Math.floor(index / grid.cols);
              const isPlaced = placed[index];
              return (
                <View
                  key={index}
                  ref={(node) => {
                    slotRefs.current[index] = node;
                  }}
                  onLayout={() => setTimeout(measureSlots, 0)}
                  style={{
                    position: 'absolute',
                    left: col * pieceW,
                    top: row * pieceH,
                    width: pieceW,
                    height: pieceH,
                    overflow: 'hidden',
                    backgroundColor: (col + row) % 2 === 0 ? `${themeColor}26` : `${themeColor}12`,
                    borderWidth: !isPlaced ? 1 : 0,
                    borderColor: `${themeColor}55`,
                  }}
                >
                  {/* Fantôme du puzzle : aide visuelle Montessori */}
                  {!isPlaced ? (
                    <View style={{ opacity: 0.28 }}>
                      <PuzzlePieceArt objectId={objectId} index={index} grid={grid} pieceW={pieceW} pieceH={pieceH} boardSize={boardSize} />
                    </View>
                  ) : (
                    <PuzzlePieceArt objectId={objectId} index={index} grid={grid} pieceW={pieceW} pieceH={pieceH} boardSize={boardSize} />
                  )}
                </View>
              );
            })}
          </View>

          <Text style={[text.caption, { color: colors.inkFaint }]}>
            {t('game.puzzleProgress', { done: placedCount, total })}
          </Text>
          </View>

          {/* Réserve de pièces */}
          <View style={[styles.tray, { maxWidth: trayMaxWidth, gap: trayGap, backgroundColor: `${themeColor}1F`, borderRadius: radius.lg, padding: 6 }]}>
            {tray.map((piece) => (
              <DraggablePuzzlePiece
                key={piece.id}
                piece={piece}
                objectId={objectId}
                grid={grid}
                pieceW={pieceW * trayScale}
                pieceH={pieceH * trayScale}
                boardSize={boardSize}
                onDrop={dropPiece}
                borderRadius={radius.sm}
                shadowStyle={shadow.soft}
                frameColor={CANDY[(piece.index + themeIndex) % CANDY.length]}
              />
            ))}
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.puzzleComplete')}
        subtitle={t(OBJECTS[objectId].labelKey as never)}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

/** Rendu d'une pièce : l'illustration complète, décalée et rognée par son conteneur. */
function PuzzlePieceArt({
  objectId,
  index,
  grid,
  pieceW,
  pieceH,
  boardSize,
}: {
  objectId: ObjectId;
  index: number;
  grid: Grid;
  pieceW: number;
  pieceH: number;
  boardSize: number;
}) {
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  return (
    <View style={{ width: pieceW, height: pieceH, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: -col * pieceW, top: -row * pieceH }}>
        <ObjectIllustration id={objectId} size={boardSize} />
      </View>
    </View>
  );
}

function DraggablePuzzlePiece({
  piece,
  objectId,
  grid,
  pieceW,
  pieceH,
  boardSize,
  onDrop,
  borderRadius,
  shadowStyle,
  frameColor,
}: {
  piece: Piece;
  objectId: ObjectId;
  grid: Grid;
  pieceW: number;
  pieceH: number;
  boardSize: number;
  onDrop: (piece: Piece, point: { x: number; y: number }) => boolean;
  borderRadius: number;
  shadowStyle: object;
  frameColor: string;
}) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const viewRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const startRect = useRef<LayoutRectangle | null>(null);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          viewRef.current?.measureInWindow((x, y, w, h) => {
            startRect.current = { x, y, width: w, height: h };
          });
        },
        onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: g.dy }),
        onPanResponderRelease: (_, g) => {
          const start = startRect.current;
          if (start) {
            const point = { x: start.x + start.width / 2 + g.dx, y: start.y + start.height / 2 + g.dy };
            const ok = onDrop(piece, point);
            if (!ok) {
              Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 30, bounciness: 10 }).start();
            }
          } else {
            pan.setValue({ x: 0, y: 0 });
          }
        },
        onPanResponderTerminate: () => pan.setValue({ x: 0, y: 0 }),
      }),
    [onDrop, pan, piece]
  );

  return (
    <Animated.View
      ref={viewRef}
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`pièce ${piece.index + 1}`}
      style={[
        shadowStyle,
        NO_SCROLL_STYLE,
        {
          width: pieceW,
          height: pieceH,
          borderRadius,
          backgroundColor: '#FFFFFF',
          borderWidth: 3,
          borderColor: frameColor,
          overflow: 'hidden',
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          zIndex: 10,
        },
      ]}
    >
      <PuzzlePieceArt objectId={objectId} index={piece.index} grid={grid} pieceW={pieceW} pieceH={pieceH} boardSize={boardSize} />
    </Animated.View>
  );
}

function makeTray(grid: Grid): Piece[] {
  const total = grid.cols * grid.rows;
  return shuffle(Array.from({ length: total }, (_, index) => ({ id: `p-${index}`, index })));
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  board: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    overflow: 'hidden',
  },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 60,
  },
});
