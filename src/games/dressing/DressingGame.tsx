import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { useI18n, type TranslationKey } from '../../i18n';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { useTheme } from '../../theme';
import { GameLayout } from '../../ui/GameLayout';
import { ProgressBar } from '../../ui/ProgressBar';
import { RewardOverlay } from '../../ui/RewardOverlay';

/**
 * Module « La fermeture » (3-5 ans) — vie pratique.
 * Trois gestes de la vie quotidienne, un par manche :
 *   1. bouton  : glisser le bouton dans la boutonnière ;
 *   2. fermeture éclair : remonter le curseur jusqu'en haut ;
 *   3. lacet   : suivre le lacet avec le doigt.
 * Chaque geste est auto-correcteur : on avance quand le mouvement est juste,
 * et on peut recommencer autant de fois que nécessaire.
 */

type Task = 'button' | 'zipper' | 'lace';

const TASKS: Task[] = ['button', 'zipper', 'lace'];

const TASK_LABEL: Record<Task, TranslationKey> = {
  button: 'dressing.task.button',
  zipper: 'dressing.task.zipper',
  lace: 'dressing.task.lace',
};

const TASK_INSTRUCTION: Record<Task, TranslationKey> = {
  button: 'dressing.instruction.button',
  zipper: 'dressing.instruction.zipper',
  lace: 'dressing.instruction.lace',
};

export function DressingGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t } = useI18n();
  const { colors, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const session = useGameSession({ rounds: 3, onFinish });

  const task = TASKS[(session.round - 1) % TASKS.length];
  const stageSize = Math.min(width - 80, height * 0.48, 330);

  return (
    <>
      <GameLayout
        title={t(TASK_LABEL[task])}
        instruction={t(TASK_INSTRUCTION[task])}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          {task === 'button' ? (
            <ButtonTask
              key={`button-${session.round}`}
              size={stageSize}
              onSuccess={() => succeed(session)}
              onMiss={() => {
                session.registerMistake();
              }}
              shadowStyle={shadow.soft}
            />
          ) : null}

          {task === 'zipper' ? (
            <ZipperTask
              key={`zip-${session.round}`}
              size={stageSize}
              onSuccess={() => succeed(session)}
              onMiss={() => session.registerMistake()}
              shadowStyle={shadow.soft}
            />
          ) : null}

          {task === 'lace' ? (
            <LaceTask
              key={`lace-${session.round}`}
              size={stageSize}
              onSuccess={() => succeed(session)}
              shadowStyle={shadow.soft}
            />
          ) : null}

          <Text style={[text.caption, { color: colors.inkFaint, textAlign: 'center' }]}>
            {t('dressing.hint')}
          </Text>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={t('dressing.done')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

function succeed(session: ReturnType<typeof useGameSession>) {
  playSfx('success');
  haptic('success');
  session.celebrate();
  session.winRound();
}

/* ------------------------------------------------------------------ */
/* 1. Bouton dans la boutonnière                                       */
/* ------------------------------------------------------------------ */

function ButtonTask({
  size,
  onSuccess,
  onMiss,
  shadowStyle,
}: {
  size: number;
  onSuccess: () => void;
  onMiss: () => void;
  shadowStyle: object;
}) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const startRect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const viewRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const stageRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const stageRect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);

  // La boutonnière est dessinée à 70 % de la largeur et 57 % de la hauteur
  // du plateau (voir le viewBox 100 × 72 du SVG ci-dessous).
  const HOLE_X = 0.70;
  const HOLE_Y = 0.57;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          viewRef.current?.measureInWindow((x, y, w, h) => {
            startRect.current = { x, y, width: w, height: h };
          });
          stageRef.current?.measureInWindow((x, y, w, h) => {
            stageRect.current = { x, y, width: w, height: h };
          });
        },
        onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: g.dy }),
        onPanResponderRelease: (_, g) => {
          if (doneRef.current) return;
          const start = startRect.current;
          const stage = stageRect.current;
          if (!start || !stage) return;

          const dropX = start.x + start.width / 2 + g.dx;
          const dropY = start.y + start.height / 2 + g.dy;

          // Cible : centre réel de la boutonnière, en coordonnées écran.
          const targetX = stage.x + stage.width * HOLE_X;
          const targetY = stage.y + stage.height * HOLE_Y;

          if (Math.hypot(dropX - targetX, dropY - targetY) < Math.max(46, stage.width * 0.15)) {
            doneRef.current = true;
            setDone(true);
            // On aligne le bouton sur la boutonnière, puis on valide.
            Animated.spring(pan, {
              toValue: {
                x: targetX - (start.x + start.width / 2),
                y: targetY - (start.y + start.height / 2),
              },
              useNativeDriver: false,
              speed: 16,
              bounciness: 6,
            }).start(() => onSuccess());
          } else {
            onMiss();
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 28, bounciness: 10 }).start();
          }
        },
      }),
    [onMiss, onSuccess, pan, size]
  );

  const buttonSize = size * 0.2;

  return (
    <View ref={stageRef} style={[styles.stage, { width: size, height: size * 0.72 }]}>
      <Svg width={size} height={size * 0.72} viewBox="0 0 100 72">
        <Defs>
          <LinearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#BFE3F2" />
            <Stop offset="1" stopColor="#8FC7DF" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="6" width="92" height="60" rx="10" fill="url(#cloth)" stroke="#6FB0CE" strokeWidth="2" />
        {/* Boutonnière */}
        <Rect x="66" y="30" width="8" height="22" rx="4" fill="#2F5D73" opacity={done ? 0.35 : 1} />
        <Rect x="64" y="27" width="12" height="28" rx="6" fill="none" stroke="#4E8CA8" strokeWidth="2" strokeDasharray="4 3" />
      </Svg>

      <Animated.View
        ref={viewRef}
        {...responder.panHandlers}
        accessible
        accessibilityRole="button"
        accessibilityLabel="bouton"
        style={[
          shadowStyle,
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            left: size * 0.2,
            top: size * 0.36 - buttonSize / 2,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        <Svg width={buttonSize} height={buttonSize} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="btnGrad" x1="0" y1="0" x2="0.7" y2="1">
              <Stop offset="0" stopColor="#FFC182" />
              <Stop offset="0.6" stopColor="#E8834A" />
              <Stop offset="1" stopColor="#B95F2C" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="46" fill="url(#btnGrad)" stroke="#A9531F" strokeWidth="2" />
          <Circle cx="50" cy="50" r="34" fill="none" stroke="#C96C33" strokeWidth="2" opacity="0.6" />
          <Circle cx="39" cy="39" r="6" fill="#7A3D18" />
          <Circle cx="61" cy="39" r="6" fill="#7A3D18" />
          <Circle cx="39" cy="61" r="6" fill="#7A3D18" />
          <Circle cx="61" cy="61" r="6" fill="#7A3D18" />
          <Circle cx="34" cy="30" r="10" fill="#FFFFFF" opacity="0.25" />
        </Svg>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Fermeture éclair                                                 */
/* ------------------------------------------------------------------ */

function ZipperTask({
  size,
  onSuccess,
  onMiss,
  shadowStyle,
}: {
  size: number;
  onSuccess: () => void;
  onMiss: () => void;
  shadowStyle: object;
}) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stageHeight = size * 0.92;
  const trackTop = stageHeight * 0.09;
  const trackHeight = stageHeight * 0.78;

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      stop();
    },
    [stop]
  );

  const apply = useCallback(
    (value: number) => {
      const next = Math.max(0, Math.min(1, value));
      progressRef.current = next;
      setProgress(next);
      if (next >= 0.92 && !doneRef.current) {
        doneRef.current = true;
        stop();
        playSfx('drop');
        haptic('success');
        onSuccess();
      }
    },
    [onSuccess, stop]
  );

  // Maintenir appuyé fait remonter le curseur ; relâcher le laisse en place.
  const startPulling = useCallback(() => {
    if (doneRef.current) return;
    playSfx('tap', { volume: 0.35 });
    stop();
    timer.current = setInterval(() => apply(progressRef.current + 0.035), 55);
  }, [apply, stop]);

  const releasePull = useCallback(() => {
    stop();
    if (!doneRef.current && progressRef.current < 0.15) onMiss();
  }, [onMiss, stop]);

  // Accessibilité : un simple toucher fait aussi progresser d'un cran.
  const nudge = useCallback(() => {
    if (doneRef.current) return;
    apply(progressRef.current + 0.14);
    playSfx('tap', { volume: 0.4 });
  }, [apply]);

  const pullH = Math.max(38, size * 0.14);
  const pullTop = trackTop + trackHeight - progress * trackHeight - pullH / 2;
  const clampedTop = Math.max(4, Math.min(stageHeight - pullH - 4, pullTop));

  return (
    <View style={[styles.stage, { width: size, height: stageHeight }]}>
      <Svg width={size} height={stageHeight} viewBox="0 0 100 92">
        <Defs>
          <LinearGradient id="fabricL" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#C9DDF0" />
            <Stop offset="1" stopColor="#9FC3DE" />
          </LinearGradient>
        </Defs>

        {/* Deux pans de tissu */}
        <Rect x="14" y="6" width="30" height="78" rx="6" fill="url(#fabricL)" stroke="#7FA6C4" strokeWidth="1.6" />
        <Rect x="56" y="6" width="30" height="78" rx="6" fill="url(#fabricL)" stroke="#7FA6C4" strokeWidth="1.6" />

        {/* Dents de la fermeture : elles se rejoignent à mesure que l'on remonte */}
        <G>
          {Array.from({ length: 15 }).map((_, i) => {
            const y = 9 + i * 5;
            const ratio = Math.max(0, Math.min(1, (y / 84 - (1 - progress)) / Math.max(progress, 0.001)));
            const closed = y > 84 - progress * 84;
            const gap = closed ? 0 : 1.6 * (1 - ratio);
            return (
              <G key={i}>
                <Rect x={43 + gap} y={y} width="5" height="2.7" rx="1.2" fill={closed ? '#9FB6C6' : '#B9C6D2'} />
                <Rect x={52 - gap} y={y} width="5" height="2.7" rx="1.2" fill={closed ? '#9FB6C6' : '#B9C6D2'} />
              </G>
            );
          })}
        </G>
        <Rect x="48.4" y="8" width="3.2" height="76" rx="1.6" fill="#8FA3B4" opacity="0.45" />
      </Svg>

      {/* Curseur : maintenir pour remonter */}
      <Pressable
        onPress={nudge}
        onPressIn={startPulling}
        onPressOut={releasePull}
        accessibilityRole="button"
        accessibilityLabel="curseur de fermeture"
        accessibilityHint="Maintiens appuyé pour remonter le curseur"
        hitSlop={14}
        style={[
          shadowStyle,
          styles.zipperPull,
          { top: clampedTop, left: size * 0.5 - pullH * 0.4, width: pullH * 0.8, height: pullH },
        ]}
      >
        <Svg width={pullH * 0.8} height={pullH} viewBox="0 0 32 40">
          <Path d="M6 4 H26 L22 22 H10 Z" fill="#D9B46A" stroke="#A9843F" strokeWidth="2" strokeLinejoin="round" />
          <Path d="M12 22 H20 L20 34 H12 Z" fill="#C79E52" stroke="#A9843F" strokeWidth="2" />
          <Circle cx="16" cy="16" r="3" fill="#8B6A2E" />
        </Svg>
      </Pressable>

      <View style={[styles.meterWrap, { top: stageHeight - 10, width: size * 0.66 }]}>
        <ProgressBar value={progress} height={8} />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Lacet (tracé guidé)                                              */
/* ------------------------------------------------------------------ */

const LACE_PATH = 'M20 78 C34 44 52 62 46 38 C42 20 62 16 76 26 C90 36 78 54 64 50';

function LaceTask({
  size,
  onSuccess,
  shadowStyle,
}: {
  size: number;
  onSuccess: () => void;
  shadowStyle: object;
}) {
  const { colors } = useTheme();
  const { t, language } = useI18n();
  const checkpoints = useMemo(
    () => [
      [20, 78],
      [30, 56],
      [44, 52],
      [46, 36],
      [60, 22],
      [76, 26],
      [80, 42],
      [66, 50],
    ] as [number, number][],
    []
  );

  const [passed, setPassed] = useState(0);
  const passedRef = useRef(0);
  const doneRef = useRef(false);
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const absRef = useRef<{ x: number; y: number } | null>(null);

  /** Position absolue du doigt (voir TracingGame pour le détail des plateformes). */
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
  const containerRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const [trace, setTrace] = useState<{ x: number; y: number }[]>([]);
  const traceRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const id = setTimeout(() => speak(t('dressing.instruction.lace'), language), 500);
    return () => clearTimeout(id);
  }, [language, t]);

  const measure = useCallback(() => {
    containerRef.current?.measureInWindow((x, y, w, h) => {
      layoutRef.current = { x, y, width: w, height: h };
    });
  }, []);

  const register = useCallback(
    (px: number, py: number) => {
      if (doneRef.current) return;
      traceRef.current = [...traceRef.current, { x: px, y: py }];
      setTrace(traceRef.current);

      let index = passedRef.current;
      while (index < checkpoints.length) {
        const [cx, cy] = checkpoints[index];
        if (Math.hypot(px - cx, py - cy) <= 15) {
          index += 1;
          passedRef.current = index;
          setPassed(index);
          playSfx('pop', { volume: 0.22 });
        } else break;
      }

      if (index >= checkpoints.length && !doneRef.current) {
        doneRef.current = true;
        onSuccess();
      }
    },
    [checkpoints, onSuccess]
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
          register(
            ((abs.x - layout.x) / layout.width) * 100,
            ((abs.y - layout.y) / layout.height) * 100
          );
        },
        onPanResponderMove: (event, gesture) => {
          const layout = layoutRef.current;
          if (!layout) return;
          const abs = readAbsolute(event, gesture);
          if (!abs) return;
          register(
            ((abs.x - layout.x) / layout.width) * 100,
            ((abs.y - layout.y) / layout.height) * 100
          );
        },
        onPanResponderRelease: () => {
          // On ne punit pas un doigt levé : les points acquis restent acquis.
          traceRef.current = [];
          setTrace([]);
        },
        onPanResponderTerminate: () => {
          traceRef.current = [];
          setTrace([]);
        },
      }),
    [measure, readAbsolute, register]
  );

  const tracePath =
    trace.length > 1 ? trace.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') : '';

  return (
    <View
      ref={containerRef}
      onLayout={measure}
      {...responder.panHandlers}
      style={[
        shadowStyle,
        styles.stage,
        {
          width: size,
          height: size,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#F3E3D2',
        },
      ]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t('dressing.instruction.lace')}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Chaussure stylisée */}
        <Path d="M12 84 C12 66 26 56 40 56 C52 56 58 62 66 64 C78 66 88 70 88 80 L88 84 Z" fill="#F2B98A" stroke="#C98A5A" strokeWidth="2" />
        <Path d="M14 84 H86" stroke="#C98A5A" strokeWidth="3" strokeLinecap="round" />

        {/* Lacet guide */}
        <Path d={LACE_PATH} stroke="#E8E0D6" strokeWidth="7" strokeLinecap="round" fill="none" />
        {tracePath ? (
          <Path d={tracePath} stroke="#EE6C5B" strokeWidth="6" strokeLinecap="round" fill="none" opacity={0.92} />
        ) : null}

        {/* Points de passage */}
        {checkpoints.map(([cx, cy], index) => {
          const done = index < passed;
          const isNext = index === passed;
          return (
            <G key={index}>
              {done ? <Circle cx={cx} cy={cy} r="2.8" fill={colors.green} /> : null}
              {isNext ? (
                <>
                  <Circle cx={cx} cy={cy} r="5" fill={colors.coral} opacity={0.22} />
                  <Circle cx={cx} cy={cy} r="3.2" fill={colors.coral} />
                </>
              ) : null}
            </G>
          );
        })}
      </Svg>
    </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
  },
  zipperPull: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
});
