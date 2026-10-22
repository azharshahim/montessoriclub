import type { Language } from '../../i18n';

export type MapContinent = 'europe' | 'africa' | 'asia' | 'northAmerica' | 'southAmerica' | 'oceania' | 'antarctica';

type Pt = [number, number]; // [longitude, latitude]

/** Contours simplifiés (projection équirectangulaire) : une carte stylisée pour enfants. */
export const OUTLINES: Record<MapContinent, Pt[][]> = {
  northAmerica: [
    [[-168, 66], [-160, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 70], [-65, 60], [-55, 52], [-67, 45], [-76, 38], [-81, 30], [-80, 25], [-90, 29], [-97, 26], [-97, 20], [-90, 21], [-87, 21], [-88, 16], [-83, 10], [-79, 9], [-86, 13], [-92, 15], [-105, 20], [-110, 24], [-114, 31], [-118, 34], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 60]],
    [[-55, 60], [-45, 60], [-20, 70], [-20, 82], [-60, 82], [-72, 78], [-55, 68]],
  ],
  southAmerica: [
    [[-80, 9], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -5], [-39, -14], [-41, -22], [-48, -26], [-58, -35], [-65, -41], [-66, -48], [-69, -55], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 5]],
  ],
  europe: [
    [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [8, 57], [5, 62], [14, 68], [25, 71], [40, 68], [60, 68], [60, 52], [50, 47], [40, 45], [30, 45], [28, 41], [24, 38], [20, 40], [15, 38], [12, 44], [8, 44], [3, 43], [-5, 36]],
  ],
  asia: [
    [[60, 68], [70, 73], [100, 77], [140, 72], [170, 68], [180, 65], [160, 60], [140, 52], [142, 46], [130, 42], [122, 40], [122, 30], [110, 20], [105, 10], [100, 2], [98, 10], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [56, 17], [52, 15], [43, 12], [39, 21], [35, 30], [36, 36], [28, 37], [28, 41], [30, 45], [40, 45], [50, 47], [60, 52]],
  ],
  africa: [
    [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [25, 32], [32, 31], [35, 28], [43, 12], [51, 12], [41, -3], [40, -15], [35, -24], [30, -31], [20, -35], [17, -30], [12, -17], [13, -6], [9, 3], [5, 5], [-8, 4], [-15, 11], [-17, 15]],
  ],
  oceania: [
    [[114, -22], [122, -18], [130, -12], [136, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [135, -34], [124, -34], [115, -34]],
    [[172, -35], [178, -38], [174, -41], [167, -46], [170, -44]],
    [[141, -3], [150, -6], [147, -9], [141, -9]],
  ],
  antarctica: [
    [[-180, -72], [-120, -75], [-60, -65], [0, -70], [60, -67], [120, -66], [180, -72], [180, -88], [-180, -88]],
  ],
};

/** Zone de la carte : longitude -180..180 → x 0..360 ; latitude 85..-90 → y 0..175. */
export const MAP_W = 360;
export const MAP_H = 175;

export function outlinePath(polys: Pt[][]): string {
  return polys
    .map((poly) => poly.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${(lon + 180).toFixed(1)} ${(85 - lat).toFixed(1)}`).join(' ') + ' Z')
    .join(' ');
}

export const MAP_COLORS: Record<MapContinent, string> = {
  northAmerica: '#F59A4B',
  southAmerica: '#EE8FB1',
  europe: '#4E8FE0',
  asia: '#F7C948',
  africa: '#4FBF8B',
  oceania: '#9C7BE0',
  antarctica: '#CFE8F5',
};

export const MAP_NAMES: Record<Language, Record<MapContinent, string>> = {
  fr: { europe: 'l’Europe', africa: 'l’Afrique', asia: 'l’Asie', northAmerica: 'l’Amérique du Nord', southAmerica: 'l’Amérique du Sud', oceania: 'l’Océanie', antarctica: 'l’Antarctique' },
  en: { europe: 'Europe', africa: 'Africa', asia: 'Asia', northAmerica: 'North America', southAmerica: 'South America', oceania: 'Oceania', antarctica: 'Antarctica' },
  ar: { europe: 'أوروبا', africa: 'أفريقيا', asia: 'آسيا', northAmerica: 'أمريكا الشمالية', southAmerica: 'أمريكا الجنوبية', oceania: 'أوقيانوسيا', antarctica: 'القارة القطبية الجنوبية' },
};
