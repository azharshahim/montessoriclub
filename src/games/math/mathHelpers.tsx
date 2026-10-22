import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import type { QuizChoice } from '../QuizGame';

/**
 * Trois réponses numériques : la bonne et deux « presque justes »
 * (écarts choisis selon le niveau), mélangées.
 */
export function numberChoices(correct: number, spreads: number[]): QuizChoice[] {
  const values = new Set<number>([correct]);
  const candidates = shuffle(spreads.flatMap((s) => [correct - s, correct + s]));
  for (const value of candidates) {
    if (values.size >= 3) break;
    if (value >= 0 && value !== correct) values.add(value);
  }
  // Repli : on complète avec les voisins immédiats.
  let delta = 1;
  while (values.size < 3) {
    values.add(correct + delta);
    delta += 1;
  }
  return shuffle(Array.from(values)).map((value) => ({
    id: String(value),
    correct: value === correct,
    label: String(value),
    a11y: String(value),
  }));
}

export { randInt };

/** Ligne de calcul affichée au-dessus du matériel, ex. « 7 + 5 = ? ». */
export function Equation({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.equation} accessible={false}>
      <Text style={[styles.equationText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  equation: { paddingVertical: 4 },
  equationText: { fontSize: 34, fontWeight: '800' },
});
