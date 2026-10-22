/**
 * Palette « Montessori Club »
 * Couleurs vives mais harmonieuses : base crème chaude, accents saturés
 * désaturés à 10-15 % pour rester doux à l'œil de l'enfant.
 */
export const palette = {
  // Fonds
  cream: '#FFF9F0',
  creamDeep: '#FDEFDF',
  sand: '#F3E3D2',
  white: '#FFFFFF',
  /** Surface des cartes (blanc en clair, ardoise en sombre). */
  surface: '#FFFFFF',
  /** Surface translucide utilisée par les compteurs flottants. */
  surfaceTranslucent: 'rgba(255,255,255,0.84)',
  /** Texte/icône posé sur un aplat de couleur. */
  onAccent: '#FFFFFF',

  // Encres
  ink: '#33302E',
  inkSoft: '#6E645C',
  inkFaint: '#A79A90',

  // Accents principaux
  coral: '#EE6C5B',
  coralDeep: '#D9553F',
  orange: '#F59A4B',
  yellow: '#F7C948',
  green: '#4FBF8B',
  teal: '#3FB1B5',
  blue: '#4E8FE0',
  indigo: '#6C6FDB',
  purple: '#9C7BE0',
  pink: '#EE8FB1',
  brown: '#9A6B4F',

  // États
  success: '#3FA96B',
  error: '#E2564A',

  // Ombres douces
  shadow: 'rgba(74, 55, 42, 0.14)',
} as const;

/** Couleurs des éléments manipulés dans l'activité « Couleurs ». */
export const objectColors = {
  red: { base: '#E8554A', light: '#FF8C7E', deep: '#B8382F', label: '#FFFFFF' },
  blue: { base: '#4E8FE0', light: '#8EBDFA', deep: '#2F63A8', label: '#FFFFFF' },
  yellow: { base: '#F5C33B', light: '#FFE38A', deep: '#C4941B', label: '#4A3B10' },
  green: { base: '#4FBF8B', light: '#96E5BE', deep: '#2D8C62', label: '#FFFFFF' },
  orange: { base: '#F5943C', light: '#FFC182', deep: '#C46A19', label: '#FFFFFF' },
  purple: { base: '#9C7BE0', light: '#C9B4FF', deep: '#6F51AE', label: '#FFFFFF' },
  pink: { base: '#EE8FB1', light: '#FFC1D5', deep: '#C25B80', label: '#4A2030' },
  brown: { base: '#A5765A', light: '#D3AC93', deep: '#714A33', label: '#FFFFFF' },
  teal: { base: '#3FB1B5', light: '#8ADDE0', deep: '#227F83', label: '#FFFFFF' },
} as const;

export type ObjectColor = keyof typeof objectColors;

/**
 * Motifs daltonisme : chaque couleur porte un symbole distinct.
 * Le tri ne repose alors jamais uniquement sur la teinte (WCAG 1.4.1).
 */
export const colorBlindPatterns: Record<ObjectColor, 'dot' | 'stripe' | 'star' | 'cross' | 'wave' | 'ring' | 'none'> = {
  red: 'dot',
  blue: 'stripe',
  yellow: 'star',
  green: 'cross',
  orange: 'wave',
  purple: 'ring',
  pink: 'dot',
  brown: 'cross',
  teal: 'wave',
};


/**
 * Palette sombre, déclinée de la palette claire.
 *
 * Les accents (corail, vert, bleu…) restent identiques : ils sont toujours
 * utilisés comme aplats avec du texte blanc, et conserver leurs valeurs
 * garantit les contrastes déjà validés. Seuls les fonds, les surfaces et les
 * encres changent, pour un mode sombre chaud — jamais noir pur, jamais gris froid.
 */
export const darkPalette = {
  cream: '#171513',
  creamDeep: '#211E1B',
  sand: '#3B3530',
  white: '#FFFDF8',

  surface: '#262320',
  surfaceTranslucent: 'rgba(38, 35, 32, 0.88)',
  onAccent: '#FFFFFF',

  ink: '#F7F1E8',
  inkSoft: '#D6CABD',
  inkFaint: '#A99B8E',

  coral: '#E8665A',
  coralDeep: '#F08376',
  orange: '#F09A55',
  yellow: '#F5C84B',
  green: '#57C795',
  teal: '#45B8BC',
  blue: '#619BE5',
  indigo: '#8184E0',
  purple: '#A98BE0',
  pink: '#E88EAF',
  brown: '#B08265',

  success: '#5FD3A0',
  error: '#FF8174',

  shadow: 'rgba(0, 0, 0, 0.55)',
} as const;
