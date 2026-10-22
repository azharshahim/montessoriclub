import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const FILL = '#F59A4B';
const EMPTY = '#FFFFFF';
const STROKE = '#A96C36';

function point(angleDeg: number, radius: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.cos(radians), y: 50 + radius * Math.sin(radians) };
}

/** Disque partagé en `parts` parts égales dont les `shaded` premières sont coloriées. */
export function FractionPie({ shaded, parts, size = 170 }: { shaded: number; parts: number; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Circle cx="50" cy="50" r="46" fill={EMPTY} stroke={STROKE} strokeWidth="2.5" />
      {Array.from({ length: parts }).map((_, i) => {
        const start = point(-90 + (i * 360) / parts, 46);
        const end = point(-90 + ((i + 1) * 360) / parts, 46);
        const largeArc = 360 / parts > 180 ? 1 : 0;
        return (
          <Path
            key={i}
            d={`M50 50 L${start.x} ${start.y} A46 46 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
            fill={i < shaded ? FILL : EMPTY}
            stroke={STROKE}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}

/** Barre partagée en `parts` parts égales (représentation linéaire de la fraction). */
export function FractionBar({ shaded, parts, width = 260 }: { shaded: number; parts: number; width?: number }) {
  const height = 60;
  const cell = 100 / parts;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 24" preserveAspectRatio="none" accessible={false}>
      {Array.from({ length: parts }).map((_, i) => (
        <Rect
          key={i}
          x={i * cell + 0.4}
          y="1"
          width={cell - 0.8}
          height="22"
          rx="1.5"
          fill={i < shaded ? FILL : EMPTY}
          stroke={STROKE}
          strokeWidth="0.7"
        />
      ))}
    </Svg>
  );
}

/** Écriture verticale d'une fraction : numérateur, barre, dénominateur. */
export function FractionLabel({ n, d, color = '#33302E', size = 26 }: { n: number; d: number; color?: string; size?: number }) {
  return (
    <View style={styles.label} accessible={false}>
      <Text style={[styles.digit, { color, fontSize: size }]}>{n}</Text>
      <View style={[styles.bar, { backgroundColor: color, width: size * 1.1 }]} />
      <Text style={[styles.digit, { color, fontSize: size }]}>{d}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { alignItems: 'center' },
  digit: { fontWeight: '800', lineHeight: 30 },
  bar: { height: 3, borderRadius: 2, marginVertical: 1 },
});

