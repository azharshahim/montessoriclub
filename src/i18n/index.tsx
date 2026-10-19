import React, { createContext, useCallback, useContext, useMemo } from 'react';

import { useSettings } from '../store/settings';
import { ar } from './translations/ar';
import { en } from './translations/en';
import { fr } from './translations/fr';

export type Language = 'fr' | 'en' | 'ar';
export type TranslationKey = keyof typeof fr;
export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export const dictionaries: Record<Language, Record<TranslationKey, string>> = { fr, en, ar };

/** Locale BCP-47 utilisée pour la synthèse vocale et le formatage. */
export const speechLocale: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA',
};

export const LANGUAGES: Language[] = ['fr', 'en', 'ar'];

interface I18nValue {
  language: Language;
  t: TFunction;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  /** Aligne le texte selon la langue (utilitaire pour les styles). */
  align: 'left' | 'right';
}

const I18nContext = createContext<I18nValue>({
  language: 'fr',
  t: (key) => fr[key] ?? key,
  isRTL: false,
  dir: 'ltr',
  align: 'left',
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSettings((s) => s.language);

  const t = useCallback<TFunction>(
    (key, vars) => {
      const dict = dictionaries[language] ?? fr;
      let value: string = dict[key] ?? fr[key] ?? key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.split(`{${name}}`).join(String(replacement));
        }
      }
      return value;
    },
    [language]
  );

  const value = useMemo<I18nValue>(
    () => ({
      language,
      t,
      isRTL: language === 'ar',
      dir: language === 'ar' ? 'rtl' : 'ltr',
      align: language === 'ar' ? 'right' : 'left',
    }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** Traduction hors composant (utile dans les services audio, par ex.). */
export function translate(language: Language, key: TranslationKey, vars?: Record<string, string | number>): string {
  let value = dictionaries[language]?.[key] ?? fr[key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.split(`{${name}}`).join(String(replacement));
    }
  }
  return value;
}
