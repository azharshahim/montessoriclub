import type { Language } from '../../i18n';
import type { ObjectId } from '../../ui/illustrations/objects';

export interface ReadingWord {
  /** Image qui illustre le mot (les mêmes objets que dans le reste du jeu). */
  id: ObjectId;
  text: string;
  /** Découpage en syllabes (un seul élément pour un mot monosyllabique). */
  syllables: string[];
}

/**
 * Vocabulaire de lecture, par langue.
 * En arabe, on ne découpe pas en syllabes : couper un mot en morceaux
 * sépare les lettres liées et déforme l'écriture. L'activité « Syllabes »
 * y devient « la première lettre ».
 */
export const WORDS: Record<Language, ReadingWord[]> = {
  fr: [
    { id: 'apple', text: 'pomme', syllables: ['pom', 'me'] },
    { id: 'banana', text: 'banane', syllables: ['ba', 'na', 'ne'] },
    { id: 'carrot', text: 'carotte', syllables: ['ca', 'rot', 'te'] },
    { id: 'fish', text: 'poisson', syllables: ['pois', 'son'] },
    { id: 'flower', text: 'fleur', syllables: ['fleur'] },
    { id: 'butterfly', text: 'papillon', syllables: ['pa', 'pil', 'lon'] },
    { id: 'icecream', text: 'glace', syllables: ['gla', 'ce'] },
    { id: 'cookie', text: 'biscuit', syllables: ['bis', 'cuit'] },
    { id: 'bear', text: 'ours', syllables: ['ours'] },
    { id: 'balloon', text: 'ballon', syllables: ['bal', 'lon'] },
    { id: 'grapes', text: 'raisin', syllables: ['rai', 'sin'] },
    { id: 'orange', text: 'orange', syllables: ['o', 'ran', 'ge'] },
    { id: 'star', text: 'étoile', syllables: ['é', 'toi', 'le'] },
    { id: 'leaf', text: 'feuille', syllables: ['feuil', 'le'] },
    { id: 'ball', text: 'balle', syllables: ['bal', 'le'] },
    { id: 'cup', text: 'tasse', syllables: ['tas', 'se'] },
  ],
  en: [
    { id: 'apple', text: 'apple', syllables: ['ap', 'ple'] },
    { id: 'banana', text: 'banana', syllables: ['ba', 'na', 'na'] },
    { id: 'carrot', text: 'carrot', syllables: ['car', 'rot'] },
    { id: 'fish', text: 'fish', syllables: ['fish'] },
    { id: 'flower', text: 'flower', syllables: ['flow', 'er'] },
    { id: 'butterfly', text: 'butterfly', syllables: ['but', 'ter', 'fly'] },
    { id: 'icecream', text: 'ice cream', syllables: ['ice', 'cream'] },
    { id: 'cookie', text: 'cookie', syllables: ['cook', 'ie'] },
    { id: 'bear', text: 'bear', syllables: ['bear'] },
    { id: 'balloon', text: 'balloon', syllables: ['bal', 'loon'] },
    { id: 'grapes', text: 'grapes', syllables: ['grapes'] },
    { id: 'orange', text: 'orange', syllables: ['or', 'ange'] },
    { id: 'star', text: 'star', syllables: ['star'] },
    { id: 'leaf', text: 'leaf', syllables: ['leaf'] },
    { id: 'ball', text: 'ball', syllables: ['ball'] },
    { id: 'cup', text: 'cup', syllables: ['cup'] },
  ],
  ar: [
    { id: 'apple', text: 'تفاحة', syllables: ['تفاحة'] },
    { id: 'banana', text: 'موزة', syllables: ['موزة'] },
    { id: 'carrot', text: 'جزرة', syllables: ['جزرة'] },
    { id: 'fish', text: 'سمكة', syllables: ['سمكة'] },
    { id: 'flower', text: 'زهرة', syllables: ['زهرة'] },
    { id: 'butterfly', text: 'فراشة', syllables: ['فراشة'] },
    { id: 'cookie', text: 'بسكويت', syllables: ['بسكويت'] },
    { id: 'bear', text: 'دب', syllables: ['دب'] },
    { id: 'balloon', text: 'بالون', syllables: ['بالون'] },
    { id: 'grapes', text: 'عنب', syllables: ['عنب'] },
    { id: 'orange', text: 'برتقالة', syllables: ['برتقالة'] },
    { id: 'star', text: 'نجمة', syllables: ['نجمة'] },
    { id: 'leaf', text: 'ورقة', syllables: ['ورقة'] },
    { id: 'ball', text: 'كرة', syllables: ['كرة'] },
    { id: 'cup', text: 'كوب', syllables: ['كوب'] },
  ],
};
