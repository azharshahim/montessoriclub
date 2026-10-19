import { Platform } from 'react-native';

/**
 * Typographie : polices arrondies natives quand elles existent,
 * sinon police système. Aucun téléchargement = démarrage instantané hors ligne.
 */
export const fontFamily =
  Platform.select({
    ios: 'Arial Rounded MT Bold',
    android: 'sans-serif-rounded',
    web: '"Baloo 2", "Nunito", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif',
    default: 'System',
  }) ?? 'System';

const line = (size: number, factor = 1.3) => Math.round(size * factor);

export const text = {
  display: { fontFamily, fontSize: 34, lineHeight: line(34, 1.15), fontWeight: '800' as const, letterSpacing: 0.2 },
  h1: { fontFamily, fontSize: 28, lineHeight: line(28, 1.2), fontWeight: '800' as const },
  h2: { fontFamily, fontSize: 22, lineHeight: line(22, 1.25), fontWeight: '700' as const },
  h3: { fontFamily, fontSize: 18, lineHeight: line(18, 1.3), fontWeight: '700' as const },
  body: { fontFamily, fontSize: 16, lineHeight: line(16, 1.45), fontWeight: '500' as const },
  label: { fontFamily, fontSize: 14, lineHeight: line(14, 1.3), fontWeight: '700' as const },
  caption: { fontFamily, fontSize: 12, lineHeight: line(12, 1.35), fontWeight: '600' as const },
  numeral: { fontFamily, fontSize: 44, lineHeight: line(44, 1.05), fontWeight: '800' as const },
} as const;

/** Échelle tactile minimale par tranche d'âge (accessibilité + motricité fine). */
export function touchTarget(ageBand: string): number {
  switch (ageBand) {
    case '0-2':
      return 96;
    case '3-5':
      return 72;
    case '6-8':
      return 60;
    default:
      return 48;
  }
}
