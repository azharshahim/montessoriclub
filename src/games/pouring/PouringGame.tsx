import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { useI18n } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';

/**
 * Module « Verser » (3-5 ans) — vie pratique Montessori.
 * Objectif unique : verser la bonne quantité, sans déborder.
 *
 * Interaction : maintenir le pichet appuyé fait monter le niveau d'eau ;
 * relâcher arrête le versement. Le repère (ligne pointillée) indique la zone cible.
 * Pas de chronomètre : seule la précision du geste compte.
 */

/** Zone cible par niveau : plus le niveau monte, plus la tolérance est fine. */
const TARGET_BY_LEVEL: { min: number; max: number }[] = [
  { min: 0.45, max: 0.95 },
  { min: 0.5, max: 0.88 },
  { min: 0.58, max: 0.82 },
  { min: 0.62, max: 0.78 },
  { min: 0.66, max: 0.75 },
];

const POUR_RATE = 0.0075; // par intervalle de 50 ms
const TICK = 50;

export function PouringGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const session = useGameSession({ rounds: 3, onFinish });

  const target = TARGET_BY_LEVEL[Math.min(Math.max(level, 1), 5) - 1];
  const [fill, setFill] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [overflow, setOverflow] = useState(false);

  const fillRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tilt = useRef(new Animated.Value(0)).current;
  const splash = useRef(new Animated.Value(0)).current;

  const jarHeight = Math.max(180, Math.min(height * 0.4, 300));
  const jarWidth = jarHeight * 0.52;
  const pitcherSize = jarHeight * 0.72;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Réinitialisation à chaque manche.
  useEffect(() => {
    stopInterval();
    fillRef.current = 0;
    setFill(0);
    setPouring(false);
    setFeedback(null);
    setOverflow(false);
    resolvedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.round, level]);

  useEffect(
    () => () => {
      stopInterval();
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    [stopInterval]
  );

  const animateTilt = (to: number) => {
    Animated.timing(tilt, { toValue: to, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
  }, []);

  const evaluate = useCallback(() => {
    if (resolvedRef.current || session.phase !== 'play') return;
    const value = fillRef.current;

    if (value > target.max) {
      // Débordement : encouragement, jamais de sanction.
      resolvedRef.current = true;
      playSfx('error', { volume: 0.4 });
      haptic('warning');
      session.registerMistake();
      onMistake?.();
      setOverflow(true);
      showFeedback(t('game.tooMuch'));
      splash.setValue(0);
      Animated.timing(splash, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
        fillRef.current = 0;
        setFill(0);
        setOverflow(false);
        resolvedRef.current = false;
      });
      return;
    }

    if (value >= target.min) {
      resolvedRef.current = true;
      playSfx('success');
      haptic('success');
      speak(t('game.perfect'), language);
      session.celebrate();
      session.winRound();
      return;
    }

    // Pas assez : on laisse continuer, sans erreur ni message négatif.
    showFeedback(t('game.notEnough'));
  }, [language, onMistake, session, showFeedback, splash, t, target.max, target.min]);

  const startPour = useCallback(() => {
    if (session.phase !== 'play') return;
    setPouring(true);
    animateTilt(1);
    stopInterval();
    intervalRef.current = setInterval(() => {
      fillRef.current = Math.min(1.08, fillRef.current + POUR_RATE);
      // On laisse volontairement dépasser : c'est l'enfant qui décide quand arrêter.
      setFill(fillRef.current);
    }, TICK);
  }, [session.phase, stopInterval, target.max]);

  const stopPour = useCallback(() => {
    if (!pouring) return;
    setPouring(false);
    animateTilt(0);
    stopInterval();
    evaluate();
  }, [evaluate, pouring, stopInterval]);

  const waterHeight = Math.max(0, Math.min(1, fill)) * jarHeight * 0.78;
  const targetY = jarHeight - target.min * jarHeight * 0.78;

  return (
    <>
      <GameLayout
        title={t('activity.pouring.title')}
        instruction={t('game.pourInstruction')}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          <Text style={[text.caption, { color: colors.inkFaint }]}>{t('game.pourHint')}</Text>

          <View style={[styles.stage, { height: jarHeight + 40 }]}>
            {/* Pichet : maintenir pour verser */}
            <Pressable
              onPressIn={startPour}
              onPressOut={stopPour}
              accessibilityRole="button"
              accessibilityLabel={t('game.pourHold')}
              style={{ marginRight: 22 }}
            >
              <Animated.View
                style={{
                  transform: [
                    { rotate: tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '38deg'] }) },
                    { translateX: tilt.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }) },
                  ],
                }}
              >
                <Pitcher size={pitcherSize} pouring={pouring} />
              </Animated.View>
            </Pressable>

            {/* Jet d'eau */}
            {pouring ? (
              <View style={[styles.stream, { height: jarHeight * 0.34, top: jarHeight * 0.28 }]}>
                <Svg width={14} height="100%" viewBox="0 0 14 100" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="stream" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#8ED4F0" stopOpacity="0.95" />
                      <Stop offset="1" stopColor="#4FA8D8" stopOpacity="0.85" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M7 0 C7 40 4 60 7 100" stroke="url(#stream)" strokeWidth="7" fill="none" strokeLinecap="round" />
                </Svg>
              </View>
            ) : null}

            {/* Verre gradué */}
            <View style={[styles.jarWrap, { width: jarWidth, height: jarHeight }]}>
              <Svg width={jarWidth} height={jarHeight} viewBox="0 0 100 190">
                <Defs>
                  <LinearGradient id="glassBody" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <Stop offset="0.5" stopColor="#F2FAFF" stopOpacity="0.8" />
                    <Stop offset="1" stopColor="#DCEFFA" stopOpacity="0.9" />
                  </LinearGradient>
                  <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#9BDCF5" />
                    <Stop offset="1" stopColor="#42A5D8" />
                  </LinearGradient>
                </Defs>

                {/* Corps du verre */}
                <Path d="M12 14 L16 172 C16.5 180 22 184 30 184 L70 184 C78 184 83.5 180 84 172 L88 14 Z" fill="url(#glassBody)" stroke="#CBE6F4" strokeWidth="2" />

                {/* Eau */}
                {waterHeight > 1 ? (
                  <Rect
                    x="14"
                    y={184 - (waterHeight / jarHeight) * 190}
                    width="72"
                    height={(waterHeight / jarHeight) * 190}
                    fill="url(#waterGrad)"
                    opacity="0.9"
                  />
                ) : null}

                {/* Ligne cible */}
                <Path
                  d={`M6 ${(targetY / jarHeight) * 190} H94`}
                  stroke="#4FBF8B"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                />

                {/* Reflet */}
                <Path d="M24 26 L26 160" stroke="#FFFFFF" strokeWidth="4" opacity="0.6" strokeLinecap="round" />
                <Ellipse cx="50" cy="14" rx="38" ry="7" fill="#EAF6FD" stroke="#CBE6F4" strokeWidth="2" />
              </Svg>
            </View>

            {/* Éclaboussure de débordement */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.splash,
                {
                  opacity: splash,
                  transform: [{ translateY: splash.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) }],
                },
              ]}
            >
              <Text style={{ fontSize: 34 }}>💧</Text>
            </Animated.View>
          </View>

          <View style={[styles.meter, { backgroundColor: colors.sand, borderRadius: radius.pill }]}>
            <View
              style={{
                width: `${Math.min(1, fill) * 100}%`,
                height: '100%',
                borderRadius: radius.pill,
                backgroundColor: fill > target.max ? colors.error : colors.blue,
              }}
            />
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.perfect')}
        subtitle={t('game.pourDone')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

/** Pichet en verre, façon matériel Montessori. */
function Pitcher({ size, pouring }: { size: number; pouring: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="pitcherGlass" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="0.6" stopColor="#E7F5FC" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#C9E6F5" stopOpacity="0.95" />
        </LinearGradient>
        <LinearGradient id="pitcherWater" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9BDCF5" />
          <Stop offset="1" stopColor="#3E9ED2" />
        </LinearGradient>
      </Defs>
      {/* Anse */}
      <Path d="M70 40 C92 40 92 70 70 70" stroke="#C9E6F5" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Corps */}
      <Path d="M28 22 L22 82 C21.5 88 26 92 32 92 L58 92 C64 92 68.5 88 68 82 L62 22 Z" fill="url(#pitcherGlass)" stroke="#B9DCEC" strokeWidth="2" />
      {/* Eau */}
      <Path d="M27 52 L23.5 82 C23 87 26 90 31 90 L59 90 C64 90 67 87 66.5 82 L63 52 Z" fill="url(#pitcherWater)" opacity="0.85" />
      {/* Bec verseur */}
      <Path d="M28 22 L18 14 L36 20 Z" fill="#E7F5FC" stroke="#B9DCEC" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Reflet */}
      <Path d="M36 30 L32 80" stroke="#FFFFFF" strokeWidth="4" opacity="0.75" strokeLinecap="round" />
      {/* Niveau quand on verse */}
      {pouring ? <Ellipse cx="45" cy="52" rx="19" ry="3.4" fill="#BFE7F7" opacity="0.9" /> : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  jarWrap: {
    justifyContent: 'flex-end',
  },
  stream: {
    position: 'absolute',
    width: 14,
    alignItems: 'center',
    zIndex: 2,
  },
  splash: {
    position: 'absolute',
    right: '28%',
    top: '18%',
  },
  meter: {
    width: '60%',
    maxWidth: 260,
    height: 10,
    overflow: 'hidden',
  },
});
