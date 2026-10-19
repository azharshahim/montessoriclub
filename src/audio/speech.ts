import * as Speech from 'expo-speech';

import { speechLocale, type Language } from '../i18n';
import { useSettings } from '../store/settings';

/**
 * Voix de la mascotte : synthèse vocale native (aucun fichier à télécharger,
 * fonctionne hors ligne et respecte les réglages d'accessibilité du système).
 * Pour une voix « studio » en production, remplacer speak() par la lecture
 * d'un fichier MP3 généré (voir docs/ASSETS.md, section Voix).
 */
export function speak(text: string, language: Language, options?: { onDone?: () => void }): void {
  if (!useSettings.getState().sound) {
    options?.onDone?.();
    return;
  }
  try {
    Speech.stop();
    Speech.speak(text, {
      language: speechLocale[language],
      rate: language === 'ar' ? 0.86 : 0.94,
      pitch: 1.15, // timbre doux et aigu, adapté à la mascotte
      onDone: options?.onDone,
      onError: () => options?.onDone?.(),
    });
  } catch {
    options?.onDone?.();
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    /* ignore */
  }
}
