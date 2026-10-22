import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { FractionBar, FractionLabel, FractionPie } from '../../ui/FractionViz';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

type Fraction = { n: number; d: number };
const same = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;

/**
 * Module « Fractions équivalentes » (9-12 ans).
 * On montre une fraction dessinée ; l'enfant retrouve celle qui représente la même part
 * (1/2 = 2/4 = 3/6…). Les fausses réponses ne sont jamais égales à la bonne.
 */
export function EquivalentsGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const baseDen = level <= 2 ? [2, 3, 4] : [2, 3, 4, 5];
    const d = baseDen[randInt(0, baseDen.length - 1)];
    const n = randInt(1, d - 1);
    const kMax = level <= 2 ? 2 : level <= 4 ? 3 : 4;
    const k = randInt(2, kMax);
    const target: Fraction = { n, d };
    const answer: Fraction = { n: n * k, d: d * k };

    const pool: Fraction[] = [
      { n: n * k + 1, d: d * k },
      { n: n * k - 1, d: d * k },
      { n, d: d * k },
      { n: n * k, d },
      { n: n + k, d: d + k },
    ].filter((f) => f.n >= 1 && f.n < f.d && f.d <= 24 && !same(f, target));

    const wrong: Fraction[] = [];
    for (const f of shuffle(pool)) {
      if (wrong.length < 2 && !wrong.some((w) => same(w, f))) wrong.push(f);
    }
    for (const f of [{ n: 1, d: 5 }, { n: 3, d: 7 }, { n: 2, d: 9 }]) {
      if (wrong.length < 2 && !same(f, target) && !wrong.some((w) => same(w, f))) wrong.push(f);
    }

    const choices: QuizChoice[] = shuffle([answer, ...wrong]).map((f) => ({
      id: `${f.n}/${f.d}`,
      correct: f === answer,
      node: <FractionLabel n={f.n} d={f.d} />,
      a11y: `${f.n}/${f.d}`,
    }));

    return {
      question: t('equivalents.question'),
      prompt: (
        <View style={styles.wrap}>
          {level <= 3 ? <FractionPie shaded={n} parts={d} size={150} /> : <FractionBar shaded={n} parts={d} />}
          <FractionLabel n={n} d={d} />
        </View>
      ),
      choices,
      success: `${n}/${d} = ${answer.n}/${answer.d}`,
    };
  };

  return <QuizGame {...props} title={t('activity.equivalents.title')} rounds={5} makeRound={makeRound} />;
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', gap: 6 } });
