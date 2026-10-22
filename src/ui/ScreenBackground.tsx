import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { useTheme } from '../theme';

/** Décors disponibles : chacun a son ambiance, tous restent doux pour les yeux. */
export type Scene = 'sky' | 'meadow' | 'sunset' | 'calm';

interface SceneConfig {
  gradient: [string, string, string, string];
  hill: [string, string];
  accent: string[];
  cloud: string;
  cloudOpacity: number;
}

const LIGHT_SCENES: Record<Scene, SceneConfig> = {
  // Accueil, profils : ciel bleu → lavande → rose → pêche
  sky: {
    gradient: ['#BFE8FF', '#DCD9FF', '#FFE1EE', '#FFF1D6'],
    hill: ['#8EE0B5', '#5CCB97'],
    accent: ['#FF8FA8', '#FFD25E', '#7CC4FF', '#A78BFA', '#6EE7B7'],
    cloud: '#FFFFFF',
    cloudOpacity: 0.75,
  },
  // Jeux : prairie ensoleillée
  meadow: {
    gradient: ['#C9EEFF', '#E2F7E4', '#FFF7CF', '#FFEBD2'],
    hill: ['#9BE7A6', '#62D084'],
    accent: ['#FFB454', '#FF8FA8', '#7CC4FF', '#FFD25E', '#B79CFF'],
    cloud: '#FFFFFF',
    cloudOpacity: 0.75,
  },
  // Récompenses : coucher de soleil festif
  sunset: {
    gradient: ['#FFD6A5', '#FFC2D6', '#E3CBFF', '#C8E6FF'],
    hill: ['#FFB38A', '#FF8F8F'],
    accent: ['#FFFFFF', '#FFE066', '#FF8FA8', '#7CC4FF', '#B79CFF'],
    cloud: '#FFFFFF',
    cloudOpacity: 0.8,
  },
  // Espace parents : plus sobre
  calm: {
    gradient: ['#E4F1FF', '#EEF0FF', '#FFF1F6', '#FFF8EA'],
    hill: ['#BDEBD3', '#9AD9BC'],
    accent: ['#C9B8FF', '#A5D6FF', '#FFC8DC'],
    cloud: '#FFFFFF',
    cloudOpacity: 0.7,
  },
};

/** Variantes nocturnes : mêmes repères, lumière basse, jamais de noir pur. */
const DARK_SCENES: Record<Scene, SceneConfig> = {
  sky: {
    gradient: ['#141A2A', '#1B2140', '#2A2038', '#3A2A2E'],
    hill: ['#1E3A31', '#17302A'],
    accent: ['#FF9DB2', '#FFE08A', '#8FCBFF', '#BCA6FF', '#7BE7C0'],
    cloud: '#C9D8FF',
    cloudOpacity: 0.14,
  },
  meadow: {
    gradient: ['#111D25', '#15271F', '#1C2B21', '#2A2620'],
    hill: ['#1E3A2B', '#183124'],
    accent: ['#FFC27A', '#FF9DB2', '#8FCBFF', '#FFE08A', '#C6A9FF'],
    cloud: '#D6E6DA',
    cloudOpacity: 0.12,
  },
  sunset: {
    gradient: ['#2C1C26', '#2A1E33', '#201E3A', '#172334'],
    hill: ['#3D2631', '#2E1F28'],
    accent: ['#FFF3CF', '#FFE08A', '#FFA6BE', '#8FCBFF', '#C6A9FF'],
    cloud: '#FFD9C2',
    cloudOpacity: 0.12,
  },
  calm: {
    gradient: ['#141A24', '#171B28', '#1D1A24', '#221E1A'],
    hill: ['#1B2E28', '#172823'],
    accent: ['#C9B8FF', '#A5D6FF', '#FFC8DC'],
    cloud: '#CBD6EA',
    cloudOpacity: 0.1,
  },
};

const STAR_PATH = 'M0 -6 L1.8 -1.9 L6 -1.7 L2.7 1 L3.8 5.2 L0 2.9 L-3.8 5.2 L-2.7 1 L-6 -1.7 L-1.8 -1.9 Z';

function Cloud({ x, y, s, o, color }: { x: number; y: number; s: number; o: number; color: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <Ellipse cx="0" cy="4" rx="16" ry="5.5" fill={color} />
      <Circle cx="-7" cy="0" r="6" fill={color} />
      <Circle cx="2" cy="-3" r="8" fill={color} />
      <Circle cx="10" cy="1" r="5.5" fill={color} />
    </G>
  );
}

/**
 * Fond d'écran illustré : dégradé coloré, nuages, confettis, étoiles et collines.
 * Purement décoratif (aucune interaction, ignoré par les lecteurs d'écran).
 * En mode sombre, le décor devient nocturne et les nuages s'effacent.
 */
export function ScreenBackground({ scene = 'sky' }: { scene?: Scene }) {
  const { isDark } = useTheme();
  const cfg = (isDark ? DARK_SCENES : LIGHT_SCENES)[scene];
  const { width, height } = useWindowDimensions();
  const a = cfg.accent;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      <LinearGradient
        colors={cfg.gradient}
        locations={[0, 0.38, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <Svg style={StyleSheet.absoluteFill} width={width} height={height} viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice">
        {/* Grandes bulles de lumière */}
        <Circle cx="88" cy="22" r="30" fill={cfg.cloud} opacity={isDark ? 0.06 : 0.22} />
        <Circle cx="6" cy="92" r="26" fill={a[0]} opacity={0.12} />
        <Circle cx="95" cy="130" r="22" fill={a[2]} opacity={0.14} />

        <Cloud x={18} y={20} s={0.9} o={cfg.cloudOpacity} color={cfg.cloud} />
        <Cloud x={72} y={44} s={0.7} o={cfg.cloudOpacity * 0.8} color={cfg.cloud} />
        <Cloud x={34} y={92} s={0.55} o={cfg.cloudOpacity * 0.6} color={cfg.cloud} />

        {/* Confettis */}
        <Circle cx="12" cy="58" r="2" fill={a[0]} opacity={0.7} />
        <Circle cx="86" cy="76" r="2.6" fill={a[1 % a.length]} opacity={0.7} />
        <Circle cx="48" cy="30" r="1.6" fill={a[2 % a.length]} opacity={0.7} />
        <Circle cx="64" cy="108" r="2" fill={a[3 % a.length]} opacity={0.6} />
        <Circle cx="22" cy="132" r="2.4" fill={a[1 % a.length]} opacity={0.55} />
        <Circle cx="78" cy="152" r="1.8" fill={a[0]} opacity={0.6} />

        {/* Étoiles */}
        <G transform="translate(8 76) rotate(12)" opacity={0.8}>
          <Path d={STAR_PATH} fill={a[1 % a.length]} />
        </G>
        <G transform="translate(92 118) rotate(-14) scale(1.1)" opacity={0.75}>
          <Path d={STAR_PATH} fill={a[2 % a.length]} />
        </G>
        <G transform="translate(10 150) rotate(8) scale(1.1)" opacity={0.7}>
          <Path d={STAR_PATH} fill={a[3 % a.length]} />
        </G>
        <G transform="translate(93 6) rotate(-8) scale(0.8)" opacity={0.8}>
          <Path d={STAR_PATH} fill={a[0]} />
        </G>

        {/* Collines au pied de l'écran */}
        <Path d="M0 178 C20 166 38 168 56 176 C74 184 88 170 100 166 L100 200 L0 200 Z" fill={cfg.hill[0]} opacity={isDark ? 0.7 : 0.55} />
        <Path d="M0 188 C22 180 44 186 64 190 C82 194 92 186 100 182 L100 200 L0 200 Z" fill={cfg.hill[1]} opacity={isDark ? 0.75 : 0.6} />
      </Svg>
    </View>
  );
}
