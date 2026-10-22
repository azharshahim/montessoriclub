import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { Clock } from './Clock';

interface Time {
  hour: number;
  minute: number;
}

/** « 3:30 » : format identique dans toutes les langues, sans ambiguïté. */
function format({ hour, minute }: Time): string {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

/** Minutes possibles selon le niveau : pile, demi, quarts, puis toutes les 5 minutes. */
function minutesFor(level: number): number[] {
  if (level <= 1) return [0];
  if (level === 2) return [0, 30];
  if (level === 3) return [0, 15, 30, 45];
  return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
}

/**
 * Module « L'horloge » (6-8 ans).
 * Lecture de l'heure sur un cadran analogique : heures pleines, demies, quarts,
 * puis toutes les 5 minutes. Les fausses réponses reprennent les confusions
 * classiques (aiguilles inversées, heure voisine).
 */
export function ClockGame(props: GameProps) {
  const { t } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const minutes = minutesFor(level);
    const time: Time = { hour: randInt(1, 12), minute: minutes[randInt(0, minutes.length - 1)] };

    const candidates: Time[] = [
      // Aiguilles inversées : l'erreur la plus fréquente.
      { hour: time.minute === 0 ? 12 : time.minute / 5, minute: (time.hour % 12) * 5 },
      { hour: (time.hour % 12) + 1, minute: time.minute },
      { hour: time.hour === 1 ? 12 : time.hour - 1, minute: time.minute },
      { hour: time.hour, minute: minutes[(minutes.indexOf(time.minute) + 1) % minutes.length] },
    ];

    const seen = new Set<string>([format(time)]);
    const wrong: Time[] = [];
    for (const candidate of shuffle(candidates)) {
      const key = format(candidate);
      if (!seen.has(key) && wrong.length < 2) {
        seen.add(key);
        wrong.push(candidate);
      }
    }
    // Repli : heures voisines si les candidats étaient en double.
    let offset = 2;
    while (wrong.length < 2) {
      const candidate = { hour: ((time.hour + offset - 1) % 12) + 1, minute: time.minute };
      if (!seen.has(format(candidate))) {
        seen.add(format(candidate));
        wrong.push(candidate);
      }
      offset += 1;
    }

    const choices: QuizChoice[] = shuffle([time, ...wrong]).map((candidate) => ({
      id: format(candidate),
      correct: format(candidate) === format(time),
      label: format(candidate),
      a11y: format(candidate),
    }));

    return {
      question: t('clock.question'),
      prompt: (
        <View style={styles.wrap}>
          <Clock hour={time.hour} minute={time.minute} />
        </View>
      ),
      choices,
      success: format(time),
    };
  };

  return <QuizGame {...props} title={t('activity.clock.title')} rounds={5} makeRound={makeRound} />;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
