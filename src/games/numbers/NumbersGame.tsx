import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { sample } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import { ObjectIllustration, type ObjectId } from '../../ui/illustrations/objects';

type Round = {
  objectId: ObjectId;
  quantity: number;
  options: number[];
};

const COUNTABLE: ObjectId[] = ['apple', 'star', 'leaf'];
const MAX_BY_LEVEL = [3, 5, 7, 9, 10];

/**
 * Module « Les chiffres » (3-5 ans).
 * Objectif unique : dénombrer une collection (1-10) et reconnaître le chiffre écrit.
 * Aucun chronomètre : l'enfant compte aussi longtemps qu'il le souhaite.
 */
export function NumbersGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const session = useGameSession({ rounds: 5, onFinish });

  const maxNumber = MAX_BY_LEVEL[Math.min(Math.max(level, 1), 5) - 1];
  const [round, setRound] = useState<Round>(() => makeRound(maxNumber, 1));
  const [wrongOptions, setWrongOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setRound(makeRound(maxNumber, level));
    setWrongOptions([]);
    setFeedback(null);
  }, [session.round, maxNumber, level]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Balancement doux du groupe en cas d'erreur (jamais de rouge agressif).
  useEffect(() => {
    if (shake === 0) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.5, duration: 90, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [anim, shake]);

  const question = useMemo(
    () =>
      t('game.countQuestion', {
        thing: t(`item.${round.objectId}` as TranslationKey).toLowerCase(),
      }),
    [round.objectId, t]
  );

  const handleAnswer = useCallback(
    (value: number) => {
      if (session.phase !== 'play' || wrongOptions.includes(value)) return;

      if (value !== round.quantity) {
        playSfx('error', { volume: 0.45 });
        haptic('warning');
        session.registerMistake();
        onMistake?.();
        setWrongOptions((prev) => [...prev, value]);
        setShake((s) => s + 1);
        setFeedback(t('game.almost'));
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setFeedback(null), 2200);
        return;
      }

      playSfx('success');
      haptic('success');
      speak(t(`number.${value}` as TranslationKey), language);
      session.celebrate();
      session.winRound();
    },
    [language, onMistake, round.quantity, session, t, wrongOptions]
  );

  // Tailles adaptatives : 10 objets doivent tenir sur un téléphone.
  const columns = round.quantity <= 3 ? 3 : round.quantity <= 6 ? 3 : 5;
  const availableWidth = Math.min(width, 900) - 64;
  const itemSize = Math.max(38, Math.min(86, Math.floor(availableWidth / columns) - 14, height * 0.12));

  const translateX = anim.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  return (
    <>
      <GameLayout
        title={t('activity.numbers.title')}
        instruction={question}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.playArea}>
          <Animated.View
            style={[
              styles.objects,
              { transform: [{ translateX }], maxWidth: Math.min(width, 860), gap: Math.max(4, itemSize * 0.12) },
            ]}
            accessibilityLabel={`${question}`}
          >
            {Array.from({ length: round.quantity }).map((_, index) => (
              <View
                key={index}
                style={[styles.object, { width: itemSize, height: itemSize }]}
              >
                <ObjectIllustration id={round.objectId} size={itemSize} />
              </View>
            ))}
          </Animated.View>

          <View style={[styles.options, { maxWidth: Math.min(width, 720) }]}>
            {round.options.map((option) => {
              const isWrong = wrongOptions.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => handleAnswer(option)}
                  disabled={isWrong || session.phase !== 'play'}
                  accessibilityRole="button"
                  accessibilityLabel={t(`number.${option}` as TranslationKey)}
                  accessibilityState={{ disabled: isWrong }}
                  style={({ pressed }) => [
                    styles.option,
                    shadow.soft,
                    {
                      backgroundColor: isWrong ? colors.sand : colors.surface,
                      borderColor: isWrong ? colors.sand : colors.sand,
                      borderRadius: radius.lg,
                      opacity: isWrong ? 0.45 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text style={[text.numeral, { color: colors.ink }]}>{option}</Text>
                  <Dots count={option} color={colors.green} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={`${round.quantity} — ${t(`number.${round.quantity}` as TranslationKey)}`}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

/** Représentation en points : ancrage concret du nombre (inspiration perles Montessori). */
function Dots({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function makeRound(maxNumber: number, level: number): Round {
  // Au niveau 1, on commence par de petites quantités très lisibles.
  const min = level <= 1 ? 1 : 2;
  const quantity = Math.floor(Math.random() * (maxNumber - min + 1)) + min;

  const candidates = new Set<number>();
  candidates.add(quantity);
  const spread = level <= 2 ? 1 : 2;
  let guard = 0;
  while (candidates.size < 3 && guard < 60) {
    guard += 1;
    const delta = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
    const value = quantity + delta;
    if (value >= 1 && value <= maxNumber + 1 && value !== quantity) candidates.add(value);
  }
  // Repli si les voisins sont hors bornes.
  let fallback = 1;
  while (candidates.size < 3 && fallback <= maxNumber + 1) {
    candidates.add(fallback);
    fallback += 1;
  }

  return {
    objectId: sample(COUNTABLE, 1)[0],
    quantity,
    options: shuffleNumbers(Array.from(candidates).slice(0, 3)),
  };
}

function shuffleNumbers(values: number[]): number[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const styles = StyleSheet.create({
  playArea: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 4,
  },
  objects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    rowGap: 6,
  },
  object: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 6,
  },
  option: {
    minWidth: 92,
    minHeight: 108,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 4,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    maxWidth: 76,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
});
