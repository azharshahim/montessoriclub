import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BeadGroupProps {
  count: number;
  /** Les dernières perles sont estompées (soustraction : perles retirées). */
  fadedCount?: number;
  colorA: string;
  colorB: string;
  /** Taille d'une perle en pixels (calculée par défaut selon la quantité). */
  size?: number;
}

/** Taille de perle adaptée à la quantité, pour que 100 perles tiennent à l'écran. */
export function beadSizeFor(count: number): number {
  if (count <= 20) return 24;
  if (count <= 50) return 14;
  return 10;
}

/**
 * Perles façon Montessori : rangées de 10, deux nuances qui alternent par groupe de 5
 * pour qu'on voie 5 + 5 sans compter une à une.
 */
export function BeadGroup({ count, fadedCount = 0, colorA, colorB, size }: BeadGroupProps) {
  const bead = size ?? beadSizeFor(count);
  const rows = Math.ceil(count / 10);
  const firstFaded = count - fadedCount;

  return (
    <View style={styles.group} accessible={false}>
      {Array.from({ length: rows }).map((_, row) => {
        const inRow = Math.min(10, count - row * 10);
        return (
          <View key={row} style={[styles.row, { gap: 2 }]}>
            {Array.from({ length: inRow }).map((__, col) => {
              const index = row * 10 + col;
              const faded = index >= firstFaded;
              return (
                <View
                  key={col}
                  style={{
                    width: bead,
                    height: bead,
                    borderRadius: bead / 2,
                    backgroundColor: col < 5 ? colorA : colorB,
                    opacity: faded ? 0.18 : 1,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

interface DotArrayProps {
  /** Nombre de colonnes (le facteur de la table). */
  columns: number;
  /** Nombre de rangées. */
  rows: number;
  color: string;
  altColor: string;
}

/** Grille de points « rangées × colonnes » : visualise une multiplication. */
export function DotArray({ columns, rows, color, altColor }: DotArrayProps) {
  const dot = Math.max(10, Math.min(26, Math.floor(Math.min(220 / rows, 300 / columns)) - 3));
  return (
    <View style={styles.group} accessible={false}>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={[styles.row, { gap: 3 }]}>
          {Array.from({ length: columns }).map((__, col) => (
            <View
              key={col}
              style={{
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                backgroundColor: row % 2 === 0 ? color : altColor,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.12)',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 3,
  },
  row: {
    flexDirection: 'row',
  },
});
