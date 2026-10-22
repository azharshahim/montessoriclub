import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { PRONOUNS, VERBS } from './verbs';

/**
 * Module « La conjugaison » (9-12 ans).
 * Le présent de l'indicatif : l'enfant complète « nous ___ (chanter) ».
 * Niveau 1 : être, avoir, aller avec je/tu/il. 2 : les mêmes avec tous les pronoms.
 * 3 : verbes en -er. 4 : + autres verbes. 5 : tous les verbes, tous les pronoms.
 * Les fausses réponses sont d'autres formes du même verbe, jamais identiques à la bonne.
 */
export function ConjugationGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const verbs = VERBS[language];
    const pronouns = PRONOUNS[language];

    const byLevel = (v: (typeof verbs)[number]) =>
      level <= 2 ? v.group === 1 : level === 3 ? v.group === 2 : level === 4 ? v.group >= 2 : true;
    let pool = verbs.filter(byLevel);
    if (!pool.length) pool = verbs; // l'arabe n'a pas de verbes irréguliers ici

    const verb = pool[randInt(0, pool.length - 1)];
    const maxPerson = level <= 1 ? 3 : pronouns.length;
    const person = randInt(0, maxPerson - 1);
    const correct = verb.forms[person];

    const wrong = shuffle(Array.from(new Set(verb.forms.filter((form) => form !== correct)))).slice(0, 2);
    const choices: QuizChoice[] = shuffle([correct, ...wrong]).map((form) => ({
      id: form,
      correct: form === correct,
      label: form,
      a11y: form,
    }));

    return {
      question: t('conjugation.question'),
      prompt: <Blank pronoun={pronouns[person]} infinitive={verb.infinitive} />,
      choices,
      success: `${pronouns[person]} ${correct}`,
    };
  };

  return <QuizGame {...props} title={t('activity.conjugation.title')} rounds={5} makeRound={makeRound} />;
}

function Blank({ pronoun, infinitive }: { pronoun: string; infinitive: string }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.row} accessible={false}>
      <Text style={[styles.text, { color: colors.ink }]}>{pronoun}</Text>
      <View style={[styles.blank, { borderColor: colors.coral, borderRadius: radius.sm, backgroundColor: colors.creamDeep }]}>
        <Text style={[styles.text, { color: colors.coral }]}>?</Text>
      </View>
      <Text style={[styles.hint, { color: colors.inkSoft }]}>{`(${infinitive})`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  text: { fontSize: 32, fontWeight: '800' },
  blank: { minWidth: 70, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', paddingHorizontal: 10 },
  hint: { fontSize: 22, fontWeight: '600' },
});
