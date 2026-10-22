import type { Language } from '../../i18n';

export type WordClass = 'noun' | 'verb' | 'adj' | 'det' | 'pron';

export interface TaggedSentence {
  words: string[];
  classes: WordClass[];
}

const s = (pairs: [string, WordClass][]): TaggedSentence => ({
  words: pairs.map((p) => p[0]),
  classes: pairs.map((p) => p[1]),
});

/**
 * Phrases courtes, un mot par classe. Chaque phrase a été choisie pour qu'aucun mot
 * ne soit ambigu (pas de « porte » nom/verbe, pas de « fort » adjectif/adverbe).
 * En arabe, il n'y a ni déterminant ni pronom isolé dans ces phrases : trois classes suffisent.
 */
export const SENTENCES: Record<Language, TaggedSentence[]> = {
  fr: [
    s([['Le', 'det'], ['petit', 'adj'], ['chat', 'noun'], ['dort', 'verb']]),
    s([['La', 'det'], ['fille', 'noun'], ['mange', 'verb'], ['une', 'det'], ['pomme', 'noun'], ['rouge', 'adj']]),
    s([['Mon', 'det'], ['frère', 'noun'], ['lit', 'verb'], ['un', 'det'], ['livre', 'noun']]),
    s([['Les', 'det'], ['enfants', 'noun'], ['joyeux', 'adj'], ['chantent', 'verb']]),
    s([['Un', 'det'], ['oiseau', 'noun'], ['bleu', 'adj'], ['vole', 'verb']]),
    s([['Elle', 'pron'], ['ouvre', 'verb'], ['la', 'det'], ['grande', 'adj'], ['fenêtre', 'noun']]),
    s([['Nous', 'pron'], ['regardons', 'verb'], ['le', 'det'], ['ciel', 'noun']]),
    s([['Ils', 'pron'], ['dessinent', 'verb'], ['un', 'det'], ['joli', 'adj'], ['soleil', 'noun']]),
  ],
  en: [
    s([['The', 'det'], ['small', 'adj'], ['cat', 'noun'], ['sleeps', 'verb']]),
    s([['The', 'det'], ['girl', 'noun'], ['eats', 'verb'], ['a', 'det'], ['red', 'adj'], ['apple', 'noun']]),
    s([['My', 'det'], ['brother', 'noun'], ['reads', 'verb'], ['a', 'det'], ['book', 'noun']]),
    s([['The', 'det'], ['happy', 'adj'], ['children', 'noun'], ['sing', 'verb']]),
    s([['A', 'det'], ['blue', 'adj'], ['bird', 'noun'], ['flies', 'verb']]),
    s([['She', 'pron'], ['opens', 'verb'], ['the', 'det'], ['big', 'adj'], ['window', 'noun']]),
    s([['We', 'pron'], ['watch', 'verb'], ['the', 'det'], ['sky', 'noun']]),
    s([['They', 'pron'], ['draw', 'verb'], ['a', 'det'], ['pretty', 'adj'], ['sun', 'noun']]),
  ],
  ar: [
    s([['يقرأ', 'verb'], ['الولد', 'noun'], ['الصغير', 'adj'], ['كتابًا', 'noun']]),
    s([['تأكل', 'verb'], ['البنت', 'noun'], ['تفاحةً', 'noun'], ['حمراء', 'adj']]),
    s([['يلعب', 'verb'], ['الأطفال', 'noun'], ['السعداء', 'adj']]),
    s([['الطائر', 'noun'], ['الأزرق', 'adj'], ['يطير', 'verb']]),
    s([['تفتح', 'verb'], ['الأم', 'noun'], ['النافذة', 'noun'], ['الكبيرة', 'adj']]),
    s([['يرسم', 'verb'], ['الطفل', 'noun'], ['شمسًا', 'noun'], ['جميلة', 'adj']]),
  ],
};

/** Classes réellement présentes dans une langue (l'arabe n'a pas de det/pron ici). */
export const CLASSES_BY_LANGUAGE: Record<Language, WordClass[]> = {
  fr: ['noun', 'verb', 'adj', 'det', 'pron'],
  en: ['noun', 'verb', 'adj', 'det', 'pron'],
  ar: ['noun', 'verb', 'adj'],
};
