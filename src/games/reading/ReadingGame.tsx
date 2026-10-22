import React from 'react';

import { sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { WORDS } from './words';
import { WordPrompt } from './WordPrompt';

/**
 * Module « Lire un mot » (6-8 ans).
 * Une image, trois mots écrits : l'enfant lit et choisit le bon.
 * Niveaux 1-2 : mots au hasard ; 3-5 : les mots proposés commencent par la même lettre
 * quand c'est possible, il faut donc lire le mot en entier.
 */
export function ReadingGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const pool = WORDS[language];
    const word = sample(pool, 1)[0];
    const first = Array.from(word.text)[0];

    const rest = pool.filter((w) => w.id !== word.id);
    const similar = level >= 3 ? rest.filter((w) => Array.from(w.text)[0] === first) : [];
    const distractors = [...shuffle(similar), ...shuffle(rest.filter((w) => !similar.includes(w)))].slice(0, 2);

    const choices: QuizChoice[] = shuffle([word, ...distractors]).map((candidate) => ({
      id: candidate.id,
      correct: candidate.id === word.id,
      label: candidate.text,
      a11y: candidate.text,
    }));

    return {
      question: t('reading.wordQuestion'),
      prompt: <WordPrompt word={word} />,
      choices,
      success: word.text,
    };
  };

  return <QuizGame {...props} title={t('activity.reading.title')} rounds={5} makeRound={makeRound} />;
}
