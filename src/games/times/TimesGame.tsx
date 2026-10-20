import React from 'react';
import { StyleSheet, View } from 'react-native';

import { shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { DotArray } from '../../ui/Beads';
import { Equation, numberChoices, randInt } from '../math/mathHelpers';
import { QuizGame, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

/** Tables travaillées par niveau : les plus faciles d'abord. */
const TABLES_BY_LEVEL: Record<number, number[]> = {
  1: [2, 5, 10],
  2: [3, 4],
  3: [6],
  4: [7, 8, 9],
  5: [2, 3, 4, 5, 6, 7, 8, 9, 10],
};

/**
 * Module « Les multiplications » (6-8 ans).
 * Une grille de points (rangées × colonnes) donne le sens de la multiplication
 * avant de mémoriser les tables, façon table de Pythagore.
 */
export function TimesGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const tables = TABLES_BY_LEVEL[Math.min(Math.max(level, 1), 5)];
    const a = shuffle(tables)[0];
    const b = randInt(2, 10);
    const product = a * b;
    return {
      question: t('math.timesQuestion', { a, b }),
      prompt: <TimesPrompt a={a} b={b} />,
      choices: numberChoices(product, [a, 1, 2]),
      success: `${a} × ${b} = ${product}`,
    };
  };

  return <QuizGame {...props} title={t('activity.times.title')} rounds={5} makeRound={makeRound} />;
}

function TimesPrompt({ a, b }: { a: number; b: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Equation text={`${a} × ${b} = ?`} color={colors.ink} />
      <DotArray columns={a} rows={b} color="#F59A4B" altColor="#F7C948" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
});
