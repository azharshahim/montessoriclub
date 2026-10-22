import type { Language } from '../../i18n';

export type ContinentId = 'europe' | 'africa' | 'asia' | 'northAmerica' | 'southAmerica' | 'oceania';

export interface Country {
  id: string;
  continent: ContinentId;
  name: string;
  capital: string;
}

export const CONTINENTS: Record<Language, Record<ContinentId, string>> = {
  fr: {
    europe: 'Europe',
    africa: 'Afrique',
    asia: 'Asie',
    northAmerica: 'Amérique du Nord',
    southAmerica: 'Amérique du Sud',
    oceania: 'Océanie',
  },
  en: {
    europe: 'Europe',
    africa: 'Africa',
    asia: 'Asia',
    northAmerica: 'North America',
    southAmerica: 'South America',
    oceania: 'Oceania',
  },
  ar: {
    europe: 'أوروبا',
    africa: 'أفريقيا',
    asia: 'آسيا',
    northAmerica: 'أمريكا الشمالية',
    southAmerica: 'أمريكا الجنوبية',
    oceania: 'أوقيانوسيا',
  },
};

const c = (id: string, continent: ContinentId, name: string, capital: string): Country => ({ id, continent, name, capital });

export const COUNTRIES: Record<Language, Country[]> = {
  fr: [
    c('france', 'europe', 'la France', 'Paris'),
    c('spain', 'europe', 'l’Espagne', 'Madrid'),
    c('italy', 'europe', 'l’Italie', 'Rome'),
    c('germany', 'europe', 'l’Allemagne', 'Berlin'),
    c('morocco', 'africa', 'le Maroc', 'Rabat'),
    c('egypt', 'africa', 'l’Égypte', 'Le Caire'),
    c('senegal', 'africa', 'le Sénégal', 'Dakar'),
    c('algeria', 'africa', 'l’Algérie', 'Alger'),
    c('japan', 'asia', 'le Japon', 'Tokyo'),
    c('china', 'asia', 'la Chine', 'Pékin'),
    c('india', 'asia', 'l’Inde', 'New Delhi'),
    c('brazil', 'southAmerica', 'le Brésil', 'Brasilia'),
    c('argentina', 'southAmerica', 'l’Argentine', 'Buenos Aires'),
    c('canada', 'northAmerica', 'le Canada', 'Ottawa'),
    c('usa', 'northAmerica', 'les États-Unis', 'Washington'),
    c('australia', 'oceania', 'l’Australie', 'Canberra'),
  ],
  en: [
    c('france', 'europe', 'France', 'Paris'),
    c('spain', 'europe', 'Spain', 'Madrid'),
    c('italy', 'europe', 'Italy', 'Rome'),
    c('germany', 'europe', 'Germany', 'Berlin'),
    c('morocco', 'africa', 'Morocco', 'Rabat'),
    c('egypt', 'africa', 'Egypt', 'Cairo'),
    c('senegal', 'africa', 'Senegal', 'Dakar'),
    c('algeria', 'africa', 'Algeria', 'Algiers'),
    c('japan', 'asia', 'Japan', 'Tokyo'),
    c('china', 'asia', 'China', 'Beijing'),
    c('india', 'asia', 'India', 'New Delhi'),
    c('brazil', 'southAmerica', 'Brazil', 'Brasília'),
    c('argentina', 'southAmerica', 'Argentina', 'Buenos Aires'),
    c('canada', 'northAmerica', 'Canada', 'Ottawa'),
    c('usa', 'northAmerica', 'the United States', 'Washington, D.C.'),
    c('australia', 'oceania', 'Australia', 'Canberra'),
  ],
  ar: [
    c('france', 'europe', 'فرنسا', 'باريس'),
    c('spain', 'europe', 'إسبانيا', 'مدريد'),
    c('italy', 'europe', 'إيطاليا', 'روما'),
    c('germany', 'europe', 'ألمانيا', 'برلين'),
    c('morocco', 'africa', 'المغرب', 'الرباط'),
    c('egypt', 'africa', 'مصر', 'القاهرة'),
    c('senegal', 'africa', 'السنغال', 'داكار'),
    c('algeria', 'africa', 'الجزائر', 'الجزائر العاصمة'),
    c('japan', 'asia', 'اليابان', 'طوكيو'),
    c('china', 'asia', 'الصين', 'بكين'),
    c('india', 'asia', 'الهند', 'نيودلهي'),
    c('brazil', 'southAmerica', 'البرازيل', 'برازيليا'),
    c('argentina', 'southAmerica', 'الأرجنتين', 'بوينس آيرس'),
    c('canada', 'northAmerica', 'كندا', 'أوتاوا'),
    c('usa', 'northAmerica', 'الولايات المتحدة', 'واشنطن'),
    c('australia', 'oceania', 'أستراليا', 'كانبرا'),
  ],
};
