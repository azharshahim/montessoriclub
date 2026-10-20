import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { BeadGroup } from '../../ui/Beads';
import { Equation, numberChoices, randInt } from '../math/mathHelpers';
import { QuizGame, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

/** Départ et quantité retirée selon le niveau (le résultat n'est jamais négatif). */
function pickTerms(level: number): [number, number] {
  switch (level) {
    case 1: {
      const a = randInt(3, 6);
      return [a, randInt(1, a - 1)];
    }
    case 2: {
      const a = randInt(6, 10);
      return [a, randInt(1, a - 2)];
    }
    case 3:
      return [randInt(11, 20), randInt(2, 9)];
    case 4:
      return [randInt(21, 50), randInt(2, 19)];
    default: {
      const a = randInt(31, 100);
      return [a, randInt(11, Math.min(60, a - 10))];
    }
  }
}

/**
 * Module « Les soustractions » (6-8 ans).
 * Les perles retirées restent visibles mais estompées : l'enfant voit
 * ce qui est enlevé et ce qui reste. Niveaux : départ jusqu'à 6, 10, 20, 50 puis 100.
 */
export function SubtractionGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const [a, b] = pickTerms(level);
    const rest = a - b;
    return {
      question: t('math.subQuestion', { a, b }),
      prompt: <SubtractionPrompt a={a} b={b} />,
      choices: numberChoices(rest, level >= 4 ? [1, 2, 10] : [1, 2]),
      success: `${a} − ${b} = ${rest}`,
    };
  };

  return <QuizGame {...props} title={t('activity.subtraction.title')} rounds={5} makeRound={makeRound} />;
}

function SubtractionPrompt({ a, b }: { a: number; b: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Equation text={`${a} − ${b} = ?`} color={colors.ink} />
      <BeadGroup count={a} fadedCount={b} colorA="#4FBF8B" colorB="#96E5BE" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
});
