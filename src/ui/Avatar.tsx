import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { AvatarId } from '../store/profiles';
import { useTheme } from '../theme';

/**
 * Avatars enfants.
 * v1 : emoji système (rendu net, aucune dépendance réseau, universel).
 * v2 : remplacer par les illustrations 3D listées dans docs/ASSETS.md.
 */
export const AVATARS: { id: AvatarId; emoji: string; from: string; to: string }[] = [
  { id: 'fox', emoji: '🦊', from: '#FFC392', to: '#F58B4E' },
  { id: 'owl', emoji: '🦉', from: '#CDB4FF', to: '#9C7BE0' },
  { id: 'panda', emoji: '🐼', from: '#E6ECF2', to: '#B9C6D2' },
  { id: 'frog', emoji: '🐸', from: '#96E5BE', to: '#4FBF8B' },
  { id: 'cat', emoji: '🐱', from: '#FFC1D5', to: '#EE8FB1' },
  { id: 'bunny', emoji: '🐰', from: '#FFE9A3', to: '#F5C33B' },
  { id: 'bear', emoji: '🐻', from: '#D3AC93', to: '#A5765A' },
  { id: 'penguin', emoji: '🐧', from: '#8EBDFA', to: '#4E8FE0' },
];

export function avatarById(id: AvatarId) {
  return AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0];
}

export function Avatar({ id, size = 64, ring }: { id: AvatarId; size?: number; ring?: boolean }) {
  const avatar = avatarById(id);
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[avatar.from, avatar.to]}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.8, y: 1 }}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 3 : 0,
          borderColor: colors.white,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.52 }}>{avatar.emoji}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
