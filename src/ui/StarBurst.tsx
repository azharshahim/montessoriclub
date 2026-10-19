import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from './Icon';

const STAR_COLORS = ['#F7C948', '#EE6C5B', '#4FBF8B', '#4E8FE0', '#9C7BE0', '#EE8FB1'];
const PARTICLE_COUNT = 14;

interface ParticleConfig {
  angle: number;
  distance: number;
  size: number;
  color: string;
  star: boolean;
}

const PARTICLES: ParticleConfig[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
  return {
    angle,
    distance: 70 + (i % 4) * 26,
    size: 14 + (i % 3) * 6,
    color: STAR_COLORS[i % STAR_COLORS.length],
    star: i % 2 === 0,
  };
});

function Particle({ config, fireKey }: { config: ParticleConfig; fireKey: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      (config.angle * 100) % 120,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [fireKey, progress, config.angle]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(config.angle) * config.distance * p;
    const y = Math.sin(config.angle) * config.distance * p - 26 * p;
    return {
      opacity: p === 0 ? 0 : 1 - Math.max(0, (p - 0.55) / 0.45),
      transform: [{ translateX: x }, { translateY: y }, { scale: 0.4 + p * 0.9 }, { rotate: `${p * 160}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.particle, style]}>
      {config.star ? (
        <Icon name="star" size={config.size} color={config.color} />
      ) : (
        <View style={{ width: config.size * 0.7, height: config.size * 0.7, borderRadius: 99, backgroundColor: config.color }} />
      )}
    </Animated.View>
  );
}

/** Gerbe de particules déclenchée à chaque incrément de `fireKey`. */
export function StarBurst({ fireKey, count = PARTICLE_COUNT }: { fireKey: number; count?: number }) {
  if (fireKey === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.center}>
        {PARTICLES.slice(0, count).map((config, index) => (
          <Particle key={index} config={config} fireKey={fireKey} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
