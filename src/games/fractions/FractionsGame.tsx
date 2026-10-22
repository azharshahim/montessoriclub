import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { FractionBar, FractionLabel, FractionPie } from '../../ui/FractionViz';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

type Fraction = { n: number; d: number };

/** Dénominateurs possibles selon le niveau : 2 et 4, puis jusqu'à 10. */
function denominatorsFor(level: number): number[] {
  if (level <= 1) return [2, 4];
  if (level === 2) return [2, 3, 4];
  if (level === 3) return [2, 3, 4, 5, 6];
  if (level === 4) return [3, 4, 5, 6, 8];
  return [4, 5, 6, 7, 8, 9, 10];
}

const sameValue = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;

/**
 * Module « Les fractions » (9-12 ans).
 * Un disque (niveaux 1-3) puis une barre (niveaux 4-5) partagés en parts égales :
 * l'enfant lit quelle fraction est coloriée. Les fausses réponses n'ont jamais la
 * même valeur que la bonne (1/2 et 2/4 ne sont pas proposés ensemble).
 */
export function FractionsGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const dens = denominatorsFor(level);
    const d = dens[randInt(0, dens.length - 1)];
    const target: Fraction = { n: randInt(1, d - 1), d };

    const candidates: Fraction[] = [
      { n: target.n + 1, d },
      { n: target.n - 1, d },
      { n: target.n, d: d + 1 },
      { n: target.n, d: d - 1 },
      { n: d - target.n, d },
    ].filter((f) => f.n >= 1 && f.d >= 2 && f.n < f.d && !sameValue(f, target));

    const wrong: Fraction[] = [];
    for (const f of shuffle(candidates)) {
      if (wrong.length < 2 && !wrong.some((w) => sameValue(w, f))) wrong.push(f);
    }
    // Repli (très rare) : fractions simples différentes de la cible.
    for (const f of [{ n: 1, d: 3 }, { n: 2, d: 5 }, { n: 3, d: 7 }]) {
      if (wrong.length < 2 && !sameValue(f, target) && !wrong.some((w) => sameValue(w, f))) wrong.push(f);
    }

    const choices: QuizChoice[] = shuffle([target, ...wrong]).map((f) => ({
      id: `${f.n}/${f.d}`,
      correct: f === target,
      node: <FractionLabel n={f.n} d={f.d} />,
      a11y: `${f.n}/${f.d}`,
    }));

    return {
      question: t('fractions.question'),
      prompt: (
        <View style={styles.wrap}>
          {level <= 3 ? <FractionPie shaded={target.n} parts={target.d} /> : <FractionBar shaded={target.n} parts={target.d} />}
        </View>
      ),
      choices,
      success: `${target.n}/${target.d}`,
    };
  };

  return <QuizGame {...props} title={t('activity.fractions.title')} rounds={5} makeRound={makeRound} />;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
