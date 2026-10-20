import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { BeadGroup } from '../../ui/Beads';
import { Equation, numberChoices, randInt } from '../math/mathHelpers';
import { QuizGame, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

const RED = ['#E8554A', '#FF8C7E'] as const;
const BLUE = ['#4E8FE0', '#8EBDFA'] as const;

/** Termes de l'addition selon le niveau : de 10, puis 20, puis 50, puis 100. */
function pickAddends(level: number): [number, number] {
  switch (level) {
    case 1: {
      return [randInt(1, 5), randInt(1, 5)];
    }
    case 2: {
      const a = randInt(2, 8);
      return [a, randInt(1, 10 - a)];
    }
    case 3: {
      const a = randInt(5, 14);
      return [a, randInt(Math.max(1, 11 - a), Math.min(9, 20 - a))];
    }
    case 4:
      return [randInt(11, 40), randInt(2, 9)];
    default: {
      const a = randInt(11, 70);
      return [a, randInt(11, Math.min(40, 99 - a))];
    }
  }
}

/**
 * Module « Les additions » (6-8 ans).
 * Les perles Montessori montrent les deux quantités : l'enfant les compte,
 * puis les rassemble mentalement. Niveaux : somme jusqu'à 10, 20, 50 puis 100.
 */
export function AdditionGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const [a, b] = pickAddends(level);
    const sum = a + b;
    return {
      question: t('math.addQuestion', { a, b }),
      prompt: <AdditionPrompt a={a} b={b} />,
      choices: numberChoices(sum, level >= 4 ? [1, 2, 10] : [1, 2]),
      success: `${a} + ${b} = ${sum}`,
    };
  };

  return <QuizGame {...props} title={t('activity.addition.title')} rounds={5} makeRound={makeRound} />;
}

function AdditionPrompt({ a, b }: { a: number; b: number }) {
  const { colors } = useTheme();
  const stacked = a > 20 || b > 20;
  return (
    <View style={styles.wrap}>
      <Equation text={`${a} + ${b} = ?`} color={colors.ink} />
      <View style={[styles.groups, stacked && styles.groupsStacked]}>
        <BeadGroup count={a} colorA={RED[0]} colorB={RED[1]} />
        <Text style={[styles.sign, { color: colors.inkSoft }]}>+</Text>
        <BeadGroup count={b} colorA={BLUE[0]} colorB={BLUE[1]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  groups: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  groupsStacked: { flexDirection: 'column', gap: 6 },
  sign: { fontSize: 30, fontWeight: '800' },
});
