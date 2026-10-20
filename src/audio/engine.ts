import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

import { useSettings } from '../store/settings';

/**
 * Moteur d'effets sonores.
 * - Fichiers locaux (assets/sounds) : 100 % hors ligne, aucun appel réseau.
 * - Lecteurs mis en cache et rejoués depuis le début.
 * - Respecte le réglage « Sons et voix » de l'espace parents.
 */
export const SFX = {
  tap: require('../../assets/sounds/tap.wav'),
  drop: require('../../assets/sounds/drop.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
  star: require('../../assets/sounds/star.wav'),
  levelup: require('../../assets/sounds/levelup.wav'),
  celebrate: require('../../assets/sounds/celebrate.wav'),
  note1: require('../../assets/sounds/note1.wav'),
  note2: require('../../assets/sounds/note2.wav'),
  note3: require('../../assets/sounds/note3.wav'),
  note4: require('../../assets/sounds/note4.wav'),
  note5: require('../../assets/sounds/note5.wav'),
} as const;

export type SfxName = keyof typeof SFX;

const cache = new Map<SfxName, AudioPlayer>();
let audioModeReady = false;

/** À appeler une fois au démarrage (et à la première interaction sur le web). */
export async function initAudio(): Promise<void> {
  if (audioModeReady) return;
  audioModeReady = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  } catch {
    // Web : certains modes ne s'appliquent pas, on continue sans bloquer.
  }
}

export function playSfx(name: SfxName, options?: { volume?: number }): void {
  if (!useSettings.getState().sound) return;
  try {
    let player = cache.get(name);
    if (!player) {
      player = createAudioPlayer(SFX[name]);
      cache.set(name, player);
    }
    player.volume = options?.volume ?? 1;
    // seekTo est asynchrone sur web, play() reste valide sur natif.
    void player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // Un son manquant ne doit jamais casser une activité.
  }
}

/** Préchauffe les sons les plus fréquents (après la première interaction). */
export function warmUpSfx(): void {
  (['tap', 'drop', 'success', 'pop'] as SfxName[]).forEach((name) => {
    if (!cache.has(name)) {
      try {
        cache.set(name, createAudioPlayer(SFX[name]));
      } catch {
        /* ignore */
      }
    }
  });
}

/** Utilisé par l'écran parents pour couper tous les sons instantanément. */
export function muteAll(): void {
  cache.forEach((player) => {
    try {
      player.pause();
    } catch {
      /* ignore */
    }
  });
}

export const isWeb = Platform.OS === 'web';
