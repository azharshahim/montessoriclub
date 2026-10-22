import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { pick, randInt, shuffle } from '../../engine/adaptive';
import { useI18n, type Language } from '../../i18n';
import { useTheme } from '../../theme';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { PRONOUNS, VERBS } from '../conjugation/verbs';

type Tense = 'past' | 'present' | 'future';

/** Participes passés et radicaux du futur (français). */
const FR_EXTRA: Record<string, { pp: string; stem: string; aux?: 'être' }> = {
  être: { pp: 'été', stem: 'ser' },
  avoir: { pp: 'eu', stem: 'aur' },
  aller: { pp: 'allé', stem: 'ir', aux: 'être' },
  chanter: { pp: 'chanté', stem: 'chanter' },
  jouer: { pp: 'joué', stem: 'jouer' },
  manger: { pp: 'mangé', stem: 'manger' },
  regarder: { pp: 'regardé', stem: 'regarder' },
  finir: { pp: 'fini', stem: 'finir' },
};
const FR_AVOIR = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
const FR_ETRE = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];
const FR_FUT_END = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];

/** Passé simple anglais (2e personne et pluriel identiques sauf « to be »). */
const EN_PAST: Record<string, string[]> = {
  'to be': ['was', 'were', 'was', 'were', 'were', 'were'],
  'to have': ['had', 'had', 'had', 'had', 'had', 'had'],
  'to go': ['went', 'went', 'went', 'went', 'went', 'went'],
  'to sing': ['sang', 'sang', 'sang', 'sang', 'sang', 'sang'],
  'to play': ['played', 'played', 'played', 'played', 'played', 'played'],
  'to eat': ['ate', 'ate', 'ate', 'ate', 'ate', 'ate'],
  'to watch': ['watched', 'watched', 'watched', 'watched', 'watched', 'watched'],
};
const EN_BASE: Record<string, string> = {
  'to be': 'be', 'to have': 'have', 'to go': 'go', 'to sing': 'sing', 'to play': 'play', 'to eat': 'eat', 'to watch': 'watch',
};

const AR_PAST: Record<string, string[]> = {
  كتب: ['كتبتُ', 'كتبتَ', 'كتبَ', 'كتبنا', 'كتبتم', 'كتبوا'],
  لعب: ['لعبتُ', 'لعبتَ', 'لعبَ', 'لعبنا', 'لعبتم', 'لعبوا'],
  ذهب: ['ذهبتُ', 'ذهبتَ', 'ذهبَ', 'ذهبنا', 'ذهبتم', 'ذهبوا'],
  شرب: ['شربتُ', 'شربتَ', 'شربَ', 'شربنا', 'شربتم', 'شربوا'],
  فتح: ['فتحتُ', 'فتحتَ', 'فتحَ', 'فتحنا', 'فتحتم', 'فتحوا'],
};

const MARKERS: Record<Language, Record<Tense, string>> = {
  fr: { past: 'Hier', present: 'Aujourd’hui', future: 'Demain' },
  en: { past: 'Yesterday', present: 'Today', future: 'Tomorrow' },
  ar: { past: 'أمس', present: 'اليوم', future: 'غدًا' },
};

function frJoin(pronoun: string, form: string): string {
  return pronoun === 'je' && /^[aeiouhéèê]/i.test(form) ? `j’${form}` : `${pronoun} ${form}`;
}

/** Les trois formes (passé, présent, futur) d'un verbe pour une personne, pronom inclus. */
function tenseForms(lang: Language, verbIdx: number, person: number): Record<Tense, string> {
  const verb = VERBS[lang][verbIdx];
  const pronoun = PRONOUNS[lang][person];
  if (lang === 'fr') {
    const extra = FR_EXTRA[verb.infinitive];
    const aux = (extra.aux === 'être' ? FR_ETRE : FR_AVOIR)[person];
    return {
      present: frJoin(pronoun, verb.forms[person]),
      past: frJoin(pronoun, `${aux} ${extra.pp}`),
      future: frJoin(pronoun, `${extra.stem}${FR_FUT_END[person]}`),
    };
  }
  if (lang === 'en') {
    return {
      present: `${pronoun} ${verb.forms[person]}`,
      past: `${pronoun} ${EN_PAST[verb.infinitive][person]}`,
      future: `${pronoun} will ${EN_BASE[verb.infinitive]}`,
    };
  }
  return {
    present: `${pronoun} ${verb.forms[person]}`,
    past: `${pronoun} ${AR_PAST[verb.infinitive][person]}`,
    future: `${pronoun} سوف ${verb.forms[person]}`,
  };
}

/**
 * Module « Passé, présent, futur » (9-12 ans).
 * Un repère de temps (hier, aujourd'hui, demain) ; l'enfant choisit la bonne forme du verbe.
 * Les trois propositions sont les trois temps du même verbe : une seule convient.
 */
export function TensesGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    const verbs = VERBS[language];
    const eligible = verbs
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => {
        if (language === 'fr' && !FR_EXTRA[v.infinitive]) return false;
        return level <= 2 ? v.group === 1 || language === 'ar' : level === 3 ? v.group === 2 : true;
      });
    const { v, i } = pick(eligible.length ? eligible : verbs.map((x, idx) => ({ v: x, i: idx })));
    const person = randInt(0, level <= 1 ? 2 : PRONOUNS[language].length - 1);
    const correctTense = pick<Tense>(level <= 1 ? ['past', 'future'] : ['past', 'present', 'future']);
    const forms = tenseForms(language, i, person);

    const choices: QuizChoice[] = shuffle(['past', 'present', 'future'] as Tense[]).map((tense) => ({
      id: tense,
      correct: tense === correctTense,
      label: forms[tense],
      a11y: forms[tense],
    }));

    return {
      question: t('tenses.question'),
      prompt: <Marker word={MARKERS[language][correctTense]} infinitive={v.infinitive} />,
      choices,
      success: `${MARKERS[language][correctTense]} : ${forms[correctTense]}`,
    };
  };

  return <QuizGame {...props} title={t('activity.tenses.title')} rounds={5} makeRound={makeRound} />;
}

function Marker({ word, infinitive }: { word: string; infinitive: string }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.col} accessible={false}>
      <View style={[styles.pill, { backgroundColor: '#FFF3D6', borderColor: '#F7C948', borderRadius: radius.pill }]}>
        <Text style={[styles.word, { color: colors.ink }]}>{word}</Text>
      </View>
      <Text style={[styles.hint, { color: colors.inkSoft }]}>{`(${infinitive})`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { alignItems: 'center', gap: 6 },
  pill: { paddingHorizontal: 26, paddingVertical: 10, borderWidth: 3 },
  word: { fontSize: 34, fontWeight: '800' },
  hint: { fontSize: 22, fontWeight: '600' },
});
