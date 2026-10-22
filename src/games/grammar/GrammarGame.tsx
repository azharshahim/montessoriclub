import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { randInt, sample, shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import { useTheme } from '../../theme';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { CLASSES_BY_LANGUAGE, SENTENCES, type WordClass } from './sentences';

const CLASS_KEYS: Record<WordClass, TranslationKey> = {
  noun: 'grammar.noun',
  verb: 'grammar.verb',
  adj: 'grammar.adj',
  det: 'grammar.det',
  pron: 'grammar.pron',
};

/** Classes interrogées selon le niveau : nom et verbe, puis adjectif, puis toutes. */
function askableFor(level: number, available: WordClass[]): WordClass[] {
  const wanted: WordClass[] = level <= 1 ? ['noun', 'verb'] : level === 2 ? ['noun', 'verb', 'adj'] : available;
  return wanted.filter((c) => available.includes(c));
}

/**
 * Module « La grammaire » (9-12 ans).
 * Un mot est colorié dans une phrase : l'enfant donne sa nature.
 * Niveau 1 : nom ou verbe. 2 : + adjectif. 3-5 : + déterminant et pronom (français et anglais),
 * avec trois propositions parmi toutes les natures.
 */
export function GrammarGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const available = CLASSES_BY_LANGUAGE[language];
    const askable = askableFor(level, available);
    const candidates = SENTENCES[language].filter((sentence) => sentence.classes.some((c) => askable.includes(c)));
    const sentence = sample(candidates, 1)[0];

    const indexes = sentence.classes.map((c, i) => (askable.includes(c) ? i : -1)).filter((i) => i >= 0);
    const target = indexes[randInt(0, indexes.length - 1)];
    const correct = sentence.classes[target];

    // Les propositions : la bonne nature + deux autres parmi celles du niveau.
    const pool = (level <= 2 ? askable : available).filter((c) => c !== correct);
    const wrong = shuffle(pool).slice(0, 2);
    const choices: QuizChoice[] = shuffle([correct, ...wrong]).map((c) => ({
      id: c,
      correct: c === correct,
      label: t(CLASS_KEYS[c]),
      a11y: t(CLASS_KEYS[c]),
    }));

    return {
      question: t('grammar.question'),
      prompt: <SentenceView words={sentence.words} target={target} />,
      choices,
      success: `${sentence.words[target]} : ${t(CLASS_KEYS[correct])}`,
    };
  };

  return <QuizGame {...props} title={t('activity.grammar.title')} rounds={5} makeRound={makeRound} />;
}

function SentenceView({ words, target }: { words: string[]; target: number }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.sentence} accessible={false}>
      {words.map((word, index) => {
        const active = index === target;
        return (
          <View
            key={`${word}-${index}`}
            style={[
              styles.word,
              active && { backgroundColor: '#FFE0D9', borderRadius: radius.sm, borderColor: colors.coral, borderWidth: 2 },
            ]}
          >
            <Text style={[styles.wordText, { color: active ? colors.coralDeep : colors.ink }]}>{word}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sentence: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 12 },
  word: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2, borderColor: 'transparent' },
  wordText: { fontSize: 26, fontWeight: '700' },
});
