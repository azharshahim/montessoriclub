import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { formatMoney, MoneyItem, type Denomination } from './MoneyItems';

type Setup = { values: Denomination[]; min: number; max: number };

/** Pièces et billets proposés selon le niveau (valeurs en centimes). */
const SETUPS: Record<number, Setup> = {
  1: { values: [100, 200], min: 2, max: 4 },
  2: { values: [100, 200, 500, 1000], min: 2, max: 4 },
  3: { values: [200, 500, 1000, 2000], min: 3, max: 4 },
  4: { values: [10, 20, 50, 100, 200], min: 3, max: 5 },
  5: { values: [10, 20, 50, 100, 200, 500, 1000], min: 4, max: 6 },
};

/**
 * Module « La monnaie » (6-8 ans).
 * Compter des pièces et des billets en euros : d'abord 1 € et 2 €, puis les billets,
 * puis les centimes. Les fausses réponses sont proches du vrai total (un écart d'une
 * pièce) : il faut bien compter.
 */
export function MoneyGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const setup = SETUPS[Math.min(Math.max(level, 1), 5)];
    const count = randInt(setup.min, setup.max);
    const items: Denomination[] = Array.from({ length: count }).map(
      () => setup.values[randInt(0, setup.values.length - 1)]
    );
    const total = items.reduce((sum, value) => sum + value, 0);
    const smallest = Math.min(...items);

    const wrongTotals = new Set<number>();
    for (const delta of shuffle([smallest, 2 * smallest, 100, 50, 10, 200])) {
      for (const candidate of [total + delta, total - delta]) {
        if (candidate > 0 && candidate !== total && wrongTotals.size < 2) wrongTotals.add(candidate);
      }
      if (wrongTotals.size >= 2) break;
    }

    const choices: QuizChoice[] = shuffle([total, ...Array.from(wrongTotals)]).map((value) => ({
      id: String(value),
      correct: value === total,
      label: formatMoney(value, language),
      a11y: formatMoney(value, language),
    }));

    // Les billets d'abord, puis les pièces de la plus grande à la plus petite.
    const sorted = [...items].sort((a, b) => b - a);

    return {
      question: t('money.question'),
      prompt: (
        <View style={styles.items}>
          {sorted.map((value, index) => (
            <MoneyItem key={`${value}-${index}`} value={value} />
          ))}
        </View>
      ),
      choices,
      success: formatMoney(total, language),
    };
  };

  return <QuizGame {...props} title={t('activity.money.title')} rounds={5} makeRound={makeRound} />;
}

const styles = StyleSheet.create({
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
});
