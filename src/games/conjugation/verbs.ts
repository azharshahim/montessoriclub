import type { Language } from '../../i18n';

export interface VerbTable {
  /** Infinitif affiché entre parenthèses. */
  infinitive: string;
  /** Formes du présent, dans l'ordre des pronoms de la langue. */
  forms: string[];
  /** 1 = être/avoir/aller (irréguliers), 2 = verbes en -er, 3 = autres, pour régler la difficulté. */
  group: 1 | 2 | 3;
}

/** Pronoms sujets, dans l'ordre des tables de conjugaison. */
export const PRONOUNS: Record<Language, string[]> = {
  fr: ['je', 'tu', 'il', 'nous', 'vous', 'ils'],
  en: ['I', 'you', 'he', 'we', 'you (pl.)', 'they'],
  ar: ['أنا', 'أنتَ', 'هو', 'نحن', 'أنتم', 'هم'],
};

export const VERBS: Record<Language, VerbTable[]> = {
  fr: [
    { infinitive: 'être', group: 1, forms: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] },
    { infinitive: 'avoir', group: 1, forms: ['ai', 'as', 'a', 'avons', 'avez', 'ont'] },
    { infinitive: 'aller', group: 1, forms: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'] },
    { infinitive: 'chanter', group: 2, forms: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'] },
    { infinitive: 'jouer', group: 2, forms: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'] },
    { infinitive: 'manger', group: 2, forms: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'] },
    { infinitive: 'regarder', group: 2, forms: ['regarde', 'regardes', 'regarde', 'regardons', 'regardez', 'regardent'] },
    { infinitive: 'finir', group: 3, forms: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'] },
  ],
  en: [
    { infinitive: 'to be', group: 1, forms: ['am', 'are', 'is', 'are', 'are', 'are'] },
    { infinitive: 'to have', group: 1, forms: ['have', 'have', 'has', 'have', 'have', 'have'] },
    { infinitive: 'to go', group: 1, forms: ['go', 'go', 'goes', 'go', 'go', 'go'] },
    { infinitive: 'to sing', group: 2, forms: ['sing', 'sing', 'sings', 'sing', 'sing', 'sing'] },
    { infinitive: 'to play', group: 2, forms: ['play', 'play', 'plays', 'play', 'play', 'play'] },
    { infinitive: 'to eat', group: 2, forms: ['eat', 'eat', 'eats', 'eat', 'eat', 'eat'] },
    { infinitive: 'to watch', group: 3, forms: ['watch', 'watch', 'watches', 'watch', 'watch', 'watch'] },
  ],
  ar: [
    { infinitive: 'كتب', group: 2, forms: ['أكتب', 'تكتب', 'يكتب', 'نكتب', 'تكتبون', 'يكتبون'] },
    { infinitive: 'لعب', group: 2, forms: ['ألعب', 'تلعب', 'يلعب', 'نلعب', 'تلعبون', 'يلعبون'] },
    { infinitive: 'ذهب', group: 2, forms: ['أذهب', 'تذهب', 'يذهب', 'نذهب', 'تذهبون', 'يذهبون'] },
    { infinitive: 'شرب', group: 2, forms: ['أشرب', 'تشرب', 'يشرب', 'نشرب', 'تشربون', 'يشربون'] },
    { infinitive: 'فتح', group: 2, forms: ['أفتح', 'تفتح', 'يفتح', 'نفتح', 'تفتحون', 'يفتحون'] },
  ],
};
