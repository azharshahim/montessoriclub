import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

interface ProgressBarProps {
  /** Valeur entre 0 et 1. */
  value: number;
  height?: number;
  color?: string;
  trackColor?: string;
  /** Style Montessori : pastilles plutôt que barre continue. */
  dots?: boolean;
  dotsCount?: number;
}

/** Barre de progression douce — jamais de compte à rebours anxiogène. */
export function ProgressBar({ value, height = 12, color, trackColor, dots, dotsCount = 5 }: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));

  if (dots) {
    return (
      <View style={[styles.dots, { gap: 6 }]} accessibilityElementsHidden>
        {Array.from({ length: dotsCount }).map((_, i) => {
          const filled = i < Math.round(clamped * dotsCount);
          return (
            <View
              key={i}
              style={{
                width: height + 4,
                height: height + 4,
                borderRadius: 99,
                backgroundColor: filled ? color ?? colors.green : trackColor ?? colors.sand,
              }}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[
        styles.track,
        { height, borderRadius: radius.pill, backgroundColor: trackColor ?? colors.sand, overflow: 'hidden' },
      ]}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.green,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%' },
  dots: { flexDirection: 'row', alignItems: 'center' },
});
