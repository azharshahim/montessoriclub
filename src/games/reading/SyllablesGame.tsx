import React from 'react';

import { randInt, sample, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { WORDS, type ReadingWord } from './words';
import { WordPrompt } from './WordPrompt';

/**
 * Module « Les syllabes » (6-8 ans).
 * Français et anglais : l'enfant retrouve la syllabe qui manque pour écrire le mot.
 * Arabe : un mot ne se coupe pas sans déformer l'écriture, l'activité devient
 * « la première lettre » du mot illustré.
 * Niveaux : mots de 2 syllabes (syllabe finale), puis de 3, puis syllabe manquante au hasard.
 */
export function SyllablesGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound =>
    language === 'ar' ? makeFirstLetterRound(t('reading.firstLetterQuestion')) : makeSyllableRound(level, t('reading.syllableQuestion'), language);

  return <QuizGame {...props} title={t('activity.syllables.title')} rounds={5} makeRound={makeRound} />;
}

function makeSyllableRound(level: number, question: string, language: 'fr' | 'en' | 'ar'): QuizRound {
  const pool = WORDS[language].filter((word) => word.syllables.length >= 2);
  const wanted = level <= 2 ? pool.filter((w) => w.syllables.length === 2) : pool;
  const word: ReadingWord = sample(wanted.length ? wanted : pool, 1)[0];
  const hiddenIndex = level <= 2 ? word.syllables.length - 1 : level <= 4 ? randInt(0, word.syllables.length - 1) : randInt(0, word.syllables.length - 1);
  const correct = word.syllables[hiddenIndex];

  // Fausses réponses : des syllabes d'autres mots, jamais identiques à la bonne.
  const others = Array.from(
    new Set(pool.flatMap((w) => w.syllables).filter((syllable) => syllable !== correct))
  );
  const wrong = shuffle(others).slice(0, 2);

  const choices: QuizChoice[] = shuffle([correct, ...wrong]).map((syllable) => ({
    id: syllable,
    correct: syllable === correct,
    label: syllable,
    a11y: syllable,
  }));

  return {
    question,
    prompt: <WordPrompt word={word} showSyllables hiddenIndex={hiddenIndex} />,
    choices,
    success: word.text,
  };
}

function makeFirstLetterRound(question: string): QuizRound {
  const pool = WORDS.ar;
  const word = sample(pool, 1)[0];
  const correct = Array.from(word.text)[0];
  const wrong = shuffle(Array.from(new Set(pool.map((w) => Array.from(w.text)[0]).filter((letter) => letter !== correct)))).slice(0, 2);

  const choices: QuizChoice[] = shuffle([correct, ...wrong]).map((letter) => ({
    id: letter,
    correct: letter === correct,
    label: letter,
    a11y: letter,
  }));

  return {
    question,
    prompt: <WordPrompt word={word} />,
    choices,
    success: word.text,
  };
}
