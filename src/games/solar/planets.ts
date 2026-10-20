import type { Language } from '../../i18n';

export interface Planet {
  id: string;
  /** Rang depuis le Soleil (1 = Mercure). */
  order: number;
  /** Diamètre relatif (Terre = 1), arrondi. */
  diameter: number;
  color: string;
}

export const PLANETS: Planet[] = [
  { id: 'mercury', order: 1, diameter: 0.38, color: '#A79A90' },
  { id: 'venus', order: 2, diameter: 0.95, color: '#E8C07A' },
  { id: 'earth', order: 3, diameter: 1, color: '#4E8FE0' },
  { id: 'mars', order: 4, diameter: 0.53, color: '#E8554A' },
  { id: 'jupiter', order: 5, diameter: 11.2, color: '#D9A066' },
  { id: 'saturn', order: 6, diameter: 9.45, color: '#F0D58A' },
  { id: 'uranus', order: 7, diameter: 4, color: '#8ADDE0' },
  { id: 'neptune', order: 8, diameter: 3.88, color: '#4E6FE0' },
];

export const PLANET_NAMES: Record<Language, Record<string, string>> = {
  fr: {
    mercury: 'Mercure',
    venus: 'Vénus',
    earth: 'la Terre',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturne',
    uranus: 'Uranus',
    neptune: 'Neptune',
  },
  en: {
    mercury: 'Mercury',
    venus: 'Venus',
    earth: 'Earth',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
  },
  ar: {
    mercury: 'عطارد',
    venus: 'الزهرة',
    earth: 'الأرض',
    mars: 'المريخ',
    jupiter: 'المشتري',
    saturn: 'زحل',
    uranus: 'أورانوس',
    neptune: 'نبتون',
  },
};
