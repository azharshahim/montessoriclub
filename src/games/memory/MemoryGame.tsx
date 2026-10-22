import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout, useBoardArea } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import { OBJECTS, OBJECT_IDS, ObjectIllustration, type ObjectId } from '../../ui/illustrations/objects';

/**
 * Module « Les paires » (3-5 ans) — mémoire immédiate.
 * Objectif unique : retrouver deux cartes identiques.
 * Aucune pénalité : une paire manquée se retourne simplement, sans message négatif.
 */

interface Card {
  id: string;
  objectId: ObjectId;
  /** Identifiant de paire : deux cartes qui le partagent sont identiques. */
  pairId: number;
}

const PAIRS_BY_LEVEL = [3, 4, 6, 6, 8];

export function MemoryGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const area = useBoardArea();
  const session = useGameSession({ rounds: 2, onFinish });

  const pairCount = PAIRS_BY_LEVEL[Math.min(Math.max(level, 1), 5) - 1];

  const [cards, setCards] = useState<Card[]>(() => makeCards(pairCount));
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nouvelle grille à chaque manche.
  useEffect(() => {
    setCards(makeCards(pairCount));
    setOpenIds([]);
    setMatchedPairIds([]);
    setBusy(false);
  }, [pairCount, session.round]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const matchedCount = matchedPairIds.length;

  const flip = useCallback(
    (card: Card) => {
      if (busy || session.phase !== 'play') return;
      if (openIds.includes(card.id) || matchedPairIds.includes(card.pairId)) return;

      playSfx('tap', { volume: 0.6 });
      haptic('light');

      const nextOpen = [...openIds, card.id];
      setOpenIds(nextOpen);
      if (nextOpen.length < 2) return;

      const [firstId, secondId] = nextOpen;
      const first = cards.find((c) => c.id === firstId);
      const second = cards.find((c) => c.id === secondId);
      if (!first || !second) return;

      if (first.pairId === second.pairId) {
        // Paire trouvée : les deux cartes restent visibles définitivement.
        const nextMatched = [...matchedPairIds, first.pairId];
        setMatchedPairIds(nextMatched);
        setOpenIds([]);
        playSfx('star', { volume: 0.5 });
        haptic('success');

        if (nextMatched.length === pairCount) {
          setTimeout(() => {
            playSfx('success');
            session.celebrate();
            session.winRound();
          }, 420);
        }
        return;
      }

      // Paire manquée : retournement doux, compté pour l'adaptation du niveau.
      setBusy(true);
      session.registerMistake();
      onMistake?.();
      playSfx('error', { volume: 0.3 });
      timer.current = setTimeout(() => {
        setOpenIds([]);
        setBusy(false);
      }, 900);
    },
    [busy, cards, matchedPairIds, onMistake, openIds, pairCount, session]
  );

  const columns = cards.length <= 6 ? 3 : 4;
  const boardWidth = Math.min((area?.width ?? width) - 24, 640);
  const boardHeight = area?.height ?? height * 0.5;
  const rows = Math.ceil(cards.length / columns);
  const cardSize = Math.max(
    46,
    Math.min(
      (boardWidth - (columns - 1) * 10) / columns,
      (boardHeight - (rows - 1) * 10 - 28) / rows,
      118
    )
  );

  return (
    <>
      <GameLayout
        title={t('activity.memory.title')}
        instruction={t('game.findPairs')}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          <Text style={[text.caption, { color: colors.inkFaint }]}>
            {t('game.pairsFound', { found: matchedCount, total: pairCount })}
          </Text>
          <View style={[styles.grid, { width: columns * cardSize + (columns - 1) * 10, gap: 10 }]}>
            {cards.map((card) => {
              const faceUp = openIds.includes(card.id) || matchedPairIds.includes(card.pairId);
              return (
                <MemoryCard
                  key={card.id}
                  card={card}
                  size={cardSize}
                  faceUp={faceUp}
                  onPress={() => flip(card)}
                  borderRadius={radius.md}
                  shadowStyle={shadow.soft}
                  backColor={colors.teal}
                />
              );
            })}
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={t('game.allPairs')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

function MemoryCard({
  card,
  size,
  faceUp,
  onPress,
  borderRadius,
  shadowStyle,
  backColor,
}: {
  card: Card;
  size: number;
  faceUp: boolean;
  onPress: () => void;
  borderRadius: number;
  shadowStyle: object;
  backColor: string;
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const progress = useRef(new Animated.Value(faceUp ? 1 : 0)).current;
  const [showFace, setShowFace] = useState(faceUp);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: faceUp ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

    if (faceUp) {
      const id = setTimeout(() => setShowFace(true), 90);
      return () => clearTimeout(id);
    }
    setShowFace(false);
    return undefined;
  }, [faceUp, progress]);

  const scaleX = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.08, 1] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        showFace ? t(OBJECTS[card.objectId].labelKey as never) : t('a11y.hiddenCard')
      }
      accessibilityState={{ selected: showFace }}
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[
          styles.card,
          shadowStyle,
          {
            borderRadius,
            backgroundColor: showFace ? colors.surface : backColor,
            borderColor: showFace ? '#F3E3D2' : 'transparent',
            transform: [{ scaleX }],
          },
        ]}
      >
        {showFace ? (
          <ObjectIllustration id={card.objectId} size={size * 0.72} />
        ) : (
          <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" fill="#FFFFFF" opacity="0.18" />
            <Path
              d="M50 22 C40 22 34 30 34 40 C34 48 39 53 44 57 L44 70 C44 74 47 76 50 76 C53 76 56 74 56 70 L56 57 C61 53 66 48 66 40 C66 30 60 22 50 22 Z"
              fill="#FFFFFF"
              opacity="0.85"
            />
            <Circle cx="50" cy="40" r="9" fill={backColor} opacity="0.9" />
          </Svg>
        )}
      </Animated.View>
    </Pressable>
  );
}

function makeCards(pairCount: number): Card[] {
  const objects = sample(OBJECT_IDS, pairCount);
  const cards: Card[] = objects.flatMap((objectId, index) => [
    { id: `${objectId}-a-${index}`, objectId, pairId: index },
    { id: `${objectId}-b-${index}`, objectId, pairId: index },
  ]);
  return shuffle(cards);
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
