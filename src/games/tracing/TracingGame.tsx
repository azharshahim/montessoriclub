import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout, useBoardArea } from '../../ui/GameLayout';
import { ProgressBar } from '../../ui/ProgressBar';
import { RewardOverlay } from '../../ui/RewardOverlay';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Vec = [number, number];

/** Tracé de référence de chaque chiffre (viewBox 100 × 100). */
const DIGIT_PATHS: Record<Digit, string> = {
  '0': 'M50 16 C28 16 22 40 24 56 C26 76 40 84 50 84 C60 84 74 76 76 56 C78 40 72 16 50 16 Z',
  '1': 'M42 30 L52 20 L52 82',
  '2': 'M28 32 C28 12 74 12 72 36 C70 52 48 60 28 82 L76 82',
  '3': 'M30 26 C46 8 78 22 64 44 C82 50 78 76 56 80 C42 83 32 78 28 72',
  '4': 'M58 84 L58 16 L24 62 L78 62',
  '5': 'M72 18 L36 18 L34 46 C46 38 76 40 74 62 C72 80 46 84 30 74',
  '6': 'M64 16 C40 22 26 44 28 62 C30 82 60 88 70 70 C78 54 56 44 42 54 C32 60 30 68 32 74',
  '7': 'M26 18 L74 18 L44 84',
  '8': 'M50 50 C30 46 30 20 50 18 C70 20 70 46 50 50 C28 54 28 82 50 82 C72 82 72 54 50 50',
  '9': 'M68 44 C66 22 36 20 32 38 C28 56 52 64 68 52 C76 46 74 62 70 74 C66 84 52 86 42 82',
};

/**
 * Points de passage successifs : l'enfant doit les frôler dans l'ordre.
 * C'est l'« auto-correction » Montessori : le tracé se valide de lui-même.
 */
const CHECKPOINTS: Record<Digit, Vec[]> = {
  '0': [[50, 16], [30, 28], [24, 50], [30, 72], [50, 84], [70, 72], [76, 50], [70, 28]],
  '1': [[46, 26], [52, 30], [52, 56], [52, 82]],
  '2': [[30, 24], [50, 16], [68, 26], [66, 42], [52, 55], [34, 72], [52, 82], [76, 82]],
  '3': [[34, 20], [56, 16], [66, 30], [62, 42], [72, 55], [68, 70], [52, 79], [34, 74]],
  '4': [[58, 84], [58, 40], [58, 16], [40, 42], [24, 62], [50, 62], [78, 62]],
  '5': [[72, 18], [50, 18], [36, 18], [35, 38], [44, 43], [62, 44], [73, 54], [70, 70], [54, 80], [34, 76]],
  '6': [[64, 16], [42, 26], [30, 46], [30, 66], [44, 81], [62, 79], [68, 66], [62, 55], [48, 52], [36, 61]],
  '7': [[26, 18], [50, 18], [74, 18], [60, 48], [44, 84]],
  '8': [[50, 50], [36, 44], [36, 26], [50, 18], [64, 26], [64, 44], [50, 50], [36, 60], [36, 76], [50, 82], [64, 76], [64, 60]],
  '9': [[66, 32], [54, 22], [36, 28], [30, 42], [40, 56], [58, 58], [68, 48], [72, 62], [68, 76], [54, 84]],
};

const DIGITS_BY_LEVEL: Record<number, Digit[]> = {
  1: ['1', '2', '3'],
  2: ['1', '2', '3', '4', '5'],
  3: ['4', '5', '6', '7'],
  4: ['6', '7', '8', '9'],
  5: ['0', '8', '9'],
};

const TOLERANCE = 15;
const SESSION_ROUNDS = 3;

/**
 * Module « Tracer les chiffres » (3-5 ans).
 * Objectif unique : suivre le tracé d'un chiffre avec le doigt.
 * Le tracé se valide en frôlant les points lumineux ; aucun échec possible.
 */
export function TracingGame({ level, onFinish, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const { colors, radius, shadow, text, reducedMotion } = useTheme();
  const { width, height } = useWindowDimensions();
  const area = useBoardArea();
  const session = useGameSession({ rounds: SESSION_ROUNDS, onFinish });

  const sequence = useMemo(() => shuffle(DIGITS_BY_LEVEL[Math.min(Math.max(level, 1), 5)]), [level]);
  const digit = sequence[(session.round - 1) % sequence.length];
  const checkpoints = CHECKPOINTS[digit];

  const [passed, setPassedState] = useState(0);
  const [stroke, setStroke] = useState<{ x: number; y: number }[]>([]);
  const passedRef = useRef(0);
  const strokeRef = useRef<{ x: number; y: number }[]>([]);
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const absRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Position absolue du doigt, toutes plateformes confondues.
   * - iOS/Android : gestureState.moveX/moveY (absolus) sont fournis.
   * - Web : moveX/moveY sont fournis, mais dx/dy peuvent se réinitialiser
   *   d'un événement à l'autre : on ne s'appuie jamais uniquement sur eux.
   */
  const readAbsolute = useCallback(
    (event: { nativeEvent: { pageX?: number; pageY?: number } }, gesture: { moveX: number; moveY: number; x0: number; y0: number; dx: number; dy: number }) => {
      const candidates: [number, number][] = [
        [gesture.moveX, gesture.moveY],
        [gesture.x0, gesture.y0],
        [event.nativeEvent.pageX ?? 0, event.nativeEvent.pageY ?? 0],
        [gesture.x0 + gesture.dx, gesture.y0 + gesture.dy],
      ];
      const found = candidates.find(([x, y]) => x > 0 && y > 0);
      if (found) absRef.current = { x: found[0], y: found[1] };
      return absRef.current;
    },
    []
  );
  const completedRef = useRef(false);
  const containerRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  // Le plateau se dimensionne sur la place réellement disponible sous l'en-tête :
  // en paysage, la hauteur de la fenêtre ne dit rien de la place restante.
  const side = Math.max(
    150,
    Math.min((area?.width ?? width) - 24, (area?.height ?? height * 0.6) - 56, 330)
  );

  const resetRound = useCallback(() => {
    passedRef.current = 0;
    strokeRef.current = [];
    completedRef.current = false;
    setPassedState(0);
    setStroke([]);
  }, []);

  useEffect(() => {
    resetRound();
  }, [session.round, digit, resetRound]);

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reducedMotion]);

  const speakDigit = useCallback(() => {
    speak(t(`number.${digit}` as TranslationKey), language);
  }, [digit, language, t]);

  useEffect(() => {
    const id = setTimeout(speakDigit, 600);
    return () => clearTimeout(id);
  }, [digit, speakDigit]);

  const measure = useCallback(() => {
    containerRef.current?.measureInWindow((x, y, w, h) => {
      layoutRef.current = { x, y, width: w, height: h };
    });
  }, []);

  const complete = useCallback(() => {
    playSfx('success');
    haptic('success');
    session.celebrate();
    setTimeout(() => session.winRound(), 600);
  }, [session]);

  const registerPoint = useCallback(
    (px: number, py: number) => {
      const last = strokeRef.current[strokeRef.current.length - 1];
      if (!last || Math.hypot(px - last.x, py - last.y) > 1.4) {
        strokeRef.current = [...strokeRef.current, { x: px, y: py }];
        setStroke(strokeRef.current);
      }

      let index = passedRef.current;
      while (index < checkpoints.length) {
        const [cx, cy] = checkpoints[index];
        if (Math.hypot(px - cx, py - cy) <= TOLERANCE) {
          index += 1;
          passedRef.current = index;
          setPassedState(index);
          playSfx('pop', { volume: 0.25 });
        } else {
          break;
        }
      }

      if (index >= checkpoints.length && !completedRef.current) {
        completedRef.current = true;
        complete();
      }
    },
    [checkpoints, complete]
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event, gesture) => {
          measure();
          const abs = readAbsolute(event, gesture);
          const layout = layoutRef.current;
          if (!layout || !abs) return;
          const px = ((abs.x - layout.x) / layout.width) * 100;
          const py = ((abs.y - layout.y) / layout.height) * 100;
          if (px < -8 || py < -8 || px > 108 || py > 108) return;
          registerPoint(px, py);
        },
        onPanResponderMove: (event, gesture) => {
          const layout = layoutRef.current;
          if (!layout) return;
          const abs = readAbsolute(event, gesture);
          if (!abs) return;
          const px = ((abs.x - layout.x) / layout.width) * 100;
          const py = ((abs.y - layout.y) / layout.height) * 100;
          if (px < -8 || py < -8 || px > 108 || py > 108) return;
          registerPoint(px, py);
        },
        onPanResponderRelease: () => {
          // On ne punit pas un doigt levé : les points validés restent acquis.
          strokeRef.current = [];
          setStroke([]);
        },
        onPanResponderTerminate: () => {
          strokeRef.current = [];
          setStroke([]);
        },
      }),
    [measure, readAbsolute, registerPoint]
  );

  const strokePath =
    stroke.length > 1
      ? stroke.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';

  const progress = passed / checkpoints.length;

  return (
    <>
      <GameLayout
        title={t('activity.tracing.title')}
        instruction={`${t('game.traceStart')} — ${t(`number.${digit}` as TranslationKey)}`}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          <View
            ref={containerRef}
            onLayout={measure}
            {...responder.panHandlers}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`${t('activity.tracing.instruction')} ${t(`number.${digit}` as TranslationKey)}`}
            style={[
              styles.canvas,
              shadow.soft,
              {
                width: side,
                height: side,
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                borderColor: colors.sand,
              },
            ]}
          >
            <Svg width={side} height={side} viewBox="0 0 100 100">
              {/* Écriteau Montessori : le chiffre est présent dans un cadre */}
              <G opacity={0.5}>
                <Path d="M8 8 H92 M8 92 H92 M8 8 V92 M92 8 V92" stroke={colors.sand} strokeWidth="1.6" fill="none" />
              </G>

              {/* Tracé guide */}
              <Path
                d={DIGIT_PATHS[digit]}
                stroke="#E8E0D6"
                strokeWidth="17"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Tracé du doigt */}
              {strokePath ? (
                <Path
                  d={strokePath}
                  stroke={colors.green}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.9}
                />
              ) : null}

              {/* Points de passage */}
              {checkpoints.map(([cx, cy], index) => {
                const done = index < passed;
                const isNext = index === passed;
                return (
                  <G key={`${cx}-${cy}-${index}`}>
                    {done ? <Circle cx={cx} cy={cy} r="3.4" fill={colors.green} /> : null}
                    {isNext ? (
                      <>
                        <Circle cx={cx} cy={cy} r="5.6" fill={colors.coral} opacity={0.25} />
                        <Circle cx={cx} cy={cy} r="3.6" fill={colors.coral} />
                      </>
                    ) : null}
                  </G>
                );
              })}
            </Svg>
          </View>

          <View style={styles.footer}>
            <ProgressBar value={progress} color={colors.green} height={14} />
            <Text style={[text.caption, { color: colors.inkFaint }]}>
              {t('game.tracePercent', { percent: Math.round(progress * 100) })}
            </Text>
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.traceSuccess')}
        subtitle={t(`number.${digit}` as TranslationKey)}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  canvas: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  footer: {
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 6,
  },
});
