import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { useI18n } from '../../i18n';
import type { GameProps } from '../types';
import { useTheme } from '../../theme';
import { GameLayout } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';

const BUBBLE_COLORS = ['#F7C948', '#EE6C5B', '#4FBF8B', '#4E8FE0', '#9C7BE0', '#3FB1B5'];
const BUBBLE_COUNT = 6;
const POPS_TO_FINISH = 10;

interface BubbleConfig {
  id: number;
  leftPct: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function makeBubble(id: number): BubbleConfig {
  return {
    id,
    leftPct: 6 + Math.random() * 74,
    size: 74 + Math.random() * 46,
    color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
    duration: 5200 + Math.random() * 3800,
    delay: Math.random() * 2200,
  };
}

/**
 * Module « Éveil sensoriel » (0-2 ans).
 * Cause à effet pur : chaque bulle éclate avec un son doux et des paillettes.
 * Aucun objectif chiffré, aucune erreur possible, zones tactiles très grandes.
 */
export function SensoryGame({ onFinish, onQuit }: GameProps) {
  const { t } = useI18n();
  const { colors, radius, shadow, text, reducedMotion } = useTheme();
  const { height } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(height * 0.6);
  const [bubbles, setBubbles] = useState<BubbleConfig[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, (_, i) => makeBubble(i))
  );
  const [pops, setPops] = useState(0);
  const [burst, setBurst] = useState(0);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  const popBubble = useCallback(
    (id: number) => {
      playSfx('pop');
      haptic('light');
      setBurst((b) => b + 1);
      setBubbles((prev) => prev.map((bubble) => (bubble.id === id ? makeBubble(id) : bubble)));
      setPops((previous) => {
        const next = previous + 1;
        if (next >= POPS_TO_FINISH && !finishedRef.current) {
          finishedRef.current = true;
          setTimeout(() => {
            playSfx('celebrate');
            setFinished(true);
          }, 500);
        }
        return next;
      });
    },
    []
  );

  return (
    <>
      <GameLayout
        title={t('activity.sensory.title')}
        instruction={t('activity.sensory.instruction')}
        onBack={() => onQuit?.({ stars: Math.min(5, Math.floor(pops / 3)), mistakes: 0, rounds: 0 })}
        round={Math.min(pops + 1, POPS_TO_FINISH)}
        rounds={POPS_TO_FINISH}
        stars={Math.min(5, Math.floor(pops / 3))}
        fireKey={burst}
      >
        <View style={styles.area} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              config={bubble}
              containerHeight={containerHeight}
              reducedMotion={reducedMotion}
              onPop={() => popBubble(bubble.id)}
            />
          ))}

          <View style={[styles.counter, { backgroundColor: '#FFFFFFCC', borderRadius: radius.pill, borderColor: colors.sand, ...shadow.soft }]}>
            {Array.from({ length: POPS_TO_FINISH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.counterDot,
                  { backgroundColor: i < pops ? colors.coral : colors.sand },
                ]}
              />
            ))}
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={finished}
        title={t('game.wellDone', { name: '★' })}
        subtitle={t('game.bubblesHint')}
        stars={5}
        primaryLabel={t('game.playAgain')}
        onPrimary={() => {
          setFinished(false);
          setPops(0);
          finishedRef.current = false;
          setBubbles(Array.from({ length: BUBBLE_COUNT }, (_, i) => makeBubble(i)));
        }}
        secondaryLabel={t('game.backHome')}
        onSecondary={() => onFinish({ mistakes: 0, rounds: POPS_TO_FINISH })}
        fireKey={burst}
      />
    </>
  );
}

function Bubble({
  config,
  containerHeight,
  reducedMotion,
  onPop,
}: {
  config: BubbleConfig;
  containerHeight: number;
  reducedMotion: boolean;
  onPop: () => void;
}) {
  const { t } = useI18n();
  const progress = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(0.5);
      return;
    }
    progress.setValue(0);
    const float = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const swing = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    float.start();
    swing.start();
    return () => {
      float.stop();
      swing.stop();
    };
  }, [config.delay, config.duration, progress, reducedMotion, wiggle]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [containerHeight + 40, -140],
  });
  const translateX = wiggle.interpolate({ inputRange: [-1, 1], outputRange: [-16, 16] });

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        {
          left: `${config.leftPct}%`,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      <Pressable
        onPress={onPop}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.bubble')}
        hitSlop={12}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.92 : 1 }] })}
      >
        <Svg width={config.size} height={config.size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id={`bubble-${config.id}`} cx="0.35" cy="0.3" r="0.75">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="0.35" stopColor={config.color} stopOpacity="0.85" />
              <Stop offset="1" stopColor={config.color} stopOpacity="0.55" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="46" fill={`url(#bubble-${config.id})`} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2.5" />
          <Ellipse cx="34" cy="30" rx="11" ry="8" fill="#FFFFFF" opacity="0.65" transform="rotate(-25 34 30)" />
          <Circle cx="68" cy="72" r="6" fill="#FFFFFF" opacity="0.25" />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  bubbleWrap: {
    position: 'absolute',
    top: 0,
  },
  counter: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  counterDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
});
