import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { CONTINENTS, COUNTRIES, type ContinentId } from './geo';

/**
 * Module « Le monde » (9-12 ans).
 * Niveaux 1-2 : sur quel continent se trouve ce pays ? (3 puis 6 continents proposés).
 * Niveaux 3-5 : quelle est sa capitale ? (le niveau 5 propose des capitales du même continent).
 */
export function WorldGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const countries = COUNTRIES[language];
    const country = sample(countries, 1)[0];

    if (level <= 2) {
      const continentIds = Object.keys(CONTINENTS[language]) as ContinentId[];
      const wrong = shuffle(continentIds.filter((id) => id !== country.continent)).slice(0, 2);
      const choices: QuizChoice[] = shuffle([country.continent, ...wrong]).map((id) => ({
        id,
        correct: id === country.continent,
        label: CONTINENTS[language][id],
        a11y: CONTINENTS[language][id],
      }));
      return {
        question: t('world.continentQuestion', { country: country.name }),
        prompt: <CountryCard name={country.name} />,
        choices,
        success: `${country.name} — ${CONTINENTS[language][country.continent]}`,
      };
    }

    const others = countries.filter((c) => c.id !== country.id && c.capital !== country.capital);
    const sameContinent = others.filter((c) => c.continent === country.continent);
    const pool = level >= 5 && sameContinent.length >= 2 ? sameContinent : others;
    const wrong = shuffle(pool).slice(0, 2);
    const choices: QuizChoice[] = shuffle([country, ...wrong]).map((c) => ({
      id: c.id,
      correct: c.id === country.id,
      label: c.capital,
      a11y: c.capital,
    }));
    return {
      question: t('world.capitalQuestion', { country: country.name }),
      prompt: <CountryCard name={country.name} />,
      choices,
      success: `${country.capital}`,
    };
  };

  return <QuizGame {...props} title={t('activity.world.title')} rounds={5} makeRound={makeRound} />;
}

function CountryCard({ name }: { name: string }) {
  const { colors, radius, shadow } = useTheme();
  return (
    <View
      style={[styles.card, shadow.soft, { borderRadius: radius.lg, borderColor: colors.sand, backgroundColor: colors.surface }]}
      accessible={false}
    >
      <Text style={styles.globe}>🌍</Text>
      <Text style={[styles.name, { color: colors.ink }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
  },
  globe: { fontSize: 56 },
  name: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
});
