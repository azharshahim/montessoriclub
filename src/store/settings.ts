import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Language } from '../i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

/** Détection de la langue du système, repli sur le français. */
export function detectLanguage(): Language {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    if (code === 'en') return 'en';
    if (code === 'ar') return 'ar';
    return 'fr';
  } catch {
    return 'fr';
  }
}

interface SettingsState {
  language: Language;
  /** Apparence : suit le système par défaut, ou forcée par le parent. */
  themeMode: ThemeMode;
  /** Sons et voix de la mascotte. */
  sound: boolean;
  /** Sous-titres systématiques sous la mascotte. */
  subtitles: boolean;
  /** Mode daltonisme : motifs + contrastes renforcés. */
  colorBlind: boolean;
  /** Respecte aussi le réglage système « réduire les animations ». */
  reducedMotion: boolean;
  haptics: boolean;
  setLanguage: (language: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggle: (key: 'sound' | 'subtitles' | 'colorBlind' | 'reducedMotion' | 'haptics') => void;
  set: <K extends 'sound' | 'subtitles' | 'colorBlind' | 'reducedMotion' | 'haptics'>(key: K, value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      themeMode: 'system',
      sound: true,
      subtitles: true,
      colorBlind: false,
      reducedMotion: false,
      haptics: true,
      setLanguage: (language) => {
        set({ language });
        // En arabe, on demande le sens RTL. React Native Web l'applique via dir ;
        // sur natif, l'utilisateur redémarre l'app pour un rendu parfaitement RTL.
        const shouldBeRTL = language === 'ar';
        if (I18nManager.isRTL !== shouldBeRTL) {
          try {
            I18nManager.forceRTL(shouldBeRTL);
            I18nManager.allowRTL(shouldBeRTL);
          } catch {
            /* Web : pas d'effet, géré par le style dir */
          }
        }
      },
      setThemeMode: (themeMode) => set({ themeMode }),
      toggle: (key) => set((state) => ({ [key]: !state[key] }) as Pick<SettingsState, typeof key>),
      set: (key, value) => set({ [key]: value } as Pick<SettingsState, typeof key>),
    }),
    {
      name: 'mc-settings-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
