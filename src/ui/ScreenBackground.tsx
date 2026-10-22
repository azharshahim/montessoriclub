import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

/** Décors disponibles : chacun a son ambiance, tous restent doux pour les yeux. */
export type Scene = 'sky' | 'meadow' | 'sunset' | 'calm';

const SCENES: Record<Scene, { gradient: [string, string, string, string]; hill: [string, string]; accent: string[] }> = {
  // Accueil, profils : ciel bleu → lavande → rose → pêche
  sky: {
    gradient: ['#BFE8FF', '#DCD9FF', '#FFE1EE', '#FFF1D6'],
    hill: ['#8EE0B5', '#5CCB97'],
    accent: ['#FF8FA8', '#FFD25E', '#7CC4FF', '#A78BFA', '#6EE7B7'],
  },
  // Jeux : prairie ensoleillée
  meadow: {
    gradient: ['#C9EEFF', '#E2F7E4', '#FFF7CF', '#FFEBD2'],
    hill: ['#9BE7A6', '#62D084'],
    accent: ['#FFB454', '#FF8FA8', '#7CC4FF', '#FFD25E', '#B79CFF'],
  },
  // Récompenses : coucher de soleil festif
  sunset: {
    gradient: ['#FFD6A5', '#FFC2D6', '#E3CBFF', '#C8E6FF'],
    hill: ['#FFB38A', '#FF8F8F'],
    accent: ['#FFFFFF', '#FFE066', '#FF8FA8', '#7CC4FF', '#B79CFF'],
  },
  // Espace parents : plus sobre
  calm: {
    gradient: ['#E4F1FF', '#EEF0FF', '#FFF1F6', '#FFF8EA'],
    hill: ['#BDEBD3', '#9AD9BC'],
    accent: ['#C9B8FF', '#A5D6FF', '#FFC8DC'],
  },
};

const STAR_PATH = 'M0 -6 L1.8 -1.9 L6 -1.7 L2.7 1 L3.8 5.2 L0 2.9 L-3.8 5.2 L-2.7 1 L-6 -1.7 L-1.8 -1.9 Z';

function Cloud({ x, y, s, o = 0.75 }: { x: number; y: number; s: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <Ellipse cx="0" cy="4" rx="16" ry="5.5" fill="#FFFFFF" />
      <Circle cx="-7" cy="0" r="6" fill="#FFFFFF" />
      <Circle cx="2" cy="-3" r="8" fill="#FFFFFF" />
      <Circle cx="10" cy="1" r="5.5" fill="#FFFFFF" />
    </G>
  );
}

/**
 * Fond d'écran illustré : dégradé coloré, nuages, confettis, étoiles et collines.
 * Purement décoratif (aucune interaction, ignoré par les lecteurs d'écran).
 */
export function ScreenBackground({ scene = 'sky' }: { scene?: Scene }) {
  const cfg = SCENES[scene];
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
        <Circle cx="88" cy="22" r="30" fill="#FFFFFF" opacity={0.22} />
        <Circle cx="6" cy="92" r="26" fill={a[0]} opacity={0.12} />
        <Circle cx="95" cy="130" r="22" fill={a[2]} opacity={0.14} />

        <Cloud x={18} y={20} s={0.9} />
        <Cloud x={72} y={44} s={0.7} o={0.6} />
        <Cloud x={34} y={92} s={0.55} o={0.45} />

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
        <Path d="M0 178 C20 166 38 168 56 176 C74 184 88 170 100 166 L100 200 L0 200 Z" fill={cfg.hill[0]} opacity={0.55} />
        <Path d="M0 188 C22 180 44 186 64 190 C82 194 92 186 100 182 L100 200 L0 200 Z" fill={cfg.hill[1]} opacity={0.6} />
      </Svg>
    </View>
  );
}
