import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { PLANET_NAMES, PLANETS, type Planet } from './planets';
import { SolarSystem } from './SolarSystem';

/**
 * Module « Le système solaire » (9-12 ans).
 * Niveau 1 : questions simples (la plus grande, la plus proche, notre planète).
 * 2 : trouver la planète n°N, rangs affichés. 3 : nommer la planète entourée, rangs affichés.
 * 4 : nommer la planète entourée, sans les rangs. 5 : trouver la planète n°N, sans les rangs.
 */
export function SolarGame(props: GameProps) {
  const { t, language } = useI18n();
  const names = PLANET_NAMES[language];

  const choicesFor = (target: Planet): QuizChoice[] => {
    const wrong = shuffle(PLANETS.filter((p) => p.id !== target.id)).slice(0, 2);
    return shuffle([target, ...wrong]).map((p) => ({
      id: p.id,
      correct: p.id === target.id,
      label: names[p.id],
      a11y: names[p.id],
    }));
  };

  const makeRound = (level: number): QuizRound => {
    if (level <= 1) {
      const kind = randInt(0, 2);
      const target =
        kind === 0
          ? PLANETS.find((p) => p.id === 'jupiter')!
          : kind === 1
            ? PLANETS.find((p) => p.id === 'mercury')!
            : PLANETS.find((p) => p.id === 'earth')!;
      const key = kind === 0 ? 'solar.biggestQuestion' : kind === 1 ? 'solar.nearestQuestion' : 'solar.homeQuestion';
      return {
        question: t(key),
        prompt: <Wrap><SolarSystem showNumbers /></Wrap>,
        choices: choicesFor(target),
        success: names[target.id],
      };
    }

    const target = sample(PLANETS, 1)[0];
    const askOrder = level === 2 || level === 5;
    const showNumbers = level <= 3;

    return {
      question: askOrder ? t('solar.orderQuestion', { n: target.order }) : t('solar.nameQuestion'),
      prompt: (
        <Wrap>
          <SolarSystem highlight={askOrder ? null : target.id} showNumbers={showNumbers} />
        </Wrap>
      ),
      choices: choicesFor(target),
      success: names[target.id],
    };
  };

  return <QuizGame {...props} title={t('activity.solar.title')} rounds={5} makeRound={makeRound} />;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
