import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkPalette, palette, type ObjectColor, objectColors } from './palette';
import { fontFamily, text, touchTarget } from './typography';
import { useSettings } from '../store/settings';
import type { AgeBand } from '../store/profiles';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const shadow = {
  soft: {
    shadowColor: palette.ink,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lifted: {
    shadowColor: palette.ink,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

export type ColorSet = { base: string; light: string; deep: string; label: string };

export type ColorMode = 'light' | 'dark';

export interface AppTheme {
  colors: typeof palette;
  /** Mode réellement appliqué (après résolution de « suivre le système »). */
  mode: ColorMode;
  isDark: boolean;
  objectColors: Record<ObjectColor, ColorSet>;
  text: typeof text;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  fontFamily: string;
  /** true = motifs + contours renforcés (daltonisme / fort contraste) */
  colorBlind: boolean;
  reducedMotion: boolean;
  touchMin: number;
  /** Couleur d'un objet, ajustée si besoin par les modes d'accessibilité. */
  colorOf: (key: ObjectColor) => ColorSet;
}

/**
 * Thème réactif : prend en compte le mode daltonisme, les animations réduites
 * et la tranche d'âge active (taille des cibles tactiles).
 */
export function useTheme(ageBand?: AgeBand | null): AppTheme {
  const colorBlind = useSettings((s) => s.colorBlind);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const themeMode = useSettings((s) => s.themeMode);
  const systemScheme = useColorScheme();
  const mode: ColorMode =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  return useMemo<AppTheme>(() => {
    const boost = colorBlind;
    const base = mode === 'dark' ? darkPalette : palette;

    const colors = {
      ...base,
      // En mode daltonisme, on renforce le contraste du texte secondaire.
      inkSoft: boost ? (mode === 'dark' ? '#E4DACC' : '#4F4741') : base.inkSoft,
      inkFaint: boost ? (mode === 'dark' ? '#C2B4A6' : '#6E645C') : base.inkFaint,
    } as typeof palette;

    const adjustedObjects: Record<ObjectColor, ColorSet> = { ...objectColors };
    if (boost) {
      // On assombrit les bases pour garantir un contraste 3:1 sur fond crème.
      (Object.keys(adjustedObjects) as ObjectColor[]).forEach((key) => {
        adjustedObjects[key] = { ...adjustedObjects[key], base: adjustedObjects[key].deep };
      });
    }

    return {
      colors,
      mode,
      isDark: mode === 'dark',
      objectColors: adjustedObjects,
      text,
      spacing,
      radius,
      shadow,
      fontFamily,
      colorBlind,
      reducedMotion,
      touchMin: touchTarget(ageBand ?? '3-5'),
      colorOf: (key: ObjectColor) => adjustedObjects[key],
    };
  }, [ageBand, colorBlind, mode, reducedMotion]);
}
