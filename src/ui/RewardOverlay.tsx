import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { speak, stopSpeaking } from '../audio/speech';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
import { StarBurst } from './StarBurst';

interface RewardOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  /** Nombre d'étoiles à afficher en grand (optionnel). */
  stars?: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  fireKey?: number;
  emojiFallback?: boolean;
  /** Annonce vocale (la mascotte lit le titre). */
  speakOnOpen?: boolean;
}

/**
 * Carte de récompense plein écran — toujours positive, jamais de « perdu ».
 * Se ferme uniquement par une action volontaire de l'enfant.
 */
export function RewardOverlay({
  visible,
  title,
  subtitle,
  stars,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  fireKey = 0,
  emojiFallback = false,
  speakOnOpen = true,
}: RewardOverlayProps) {
  const { colors, radius, shadow, text, spacing, reducedMotion } = useTheme();
  const { language } = useI18n();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // La mascotte félicite l'enfant à voix haute (désactivable avec les sons).
  useEffect(() => {
    if (!visible || !speakOnOpen) return;
    const id = setTimeout(() => speak(title, language), 180);
    return () => {
      clearTimeout(id);
      stopSpeaking();
    };
  }, [visible, speakOnOpen, title, language]);

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.85);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: reducedMotion ? 100 : 14,
        bounciness: reducedMotion ? 0 : 10,
      }),
    ]).start();
  }, [visible, opacity, reducedMotion, scale]);

  if (!visible) return null;

  return (
    <View style={[styles.backdrop, { backgroundColor: 'rgba(51, 48, 46, 0.38)' }]}>
      <Animated.View
        style={[
          styles.card,
          shadow.lifted,
          {
            backgroundColor: colors.cream,
            borderRadius: radius.xl,
            borderColor: colors.sand,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {emojiFallback ? null : <Mascot size={104} mood="happy" />}
        <Text style={[text.h1, { color: colors.ink, textAlign: 'center' }]}>{title}</Text>
        {subtitle ? (
          <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>{subtitle}</Text>
        ) : null}

        {typeof stars === 'number' ? (
          <View style={styles.starRow}>
            {Array.from({ length: Math.min(5, Math.max(1, stars)) }).map((_, i) => (
              <Icon key={i} name="star" size={30} color={colors.yellow} />
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing.sm, width: '100%', marginTop: spacing.sm }}>
          <Button label={primaryLabel} onPress={onPrimary} size="lg" fullWidth icon="chevron" />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} size="md" fullWidth />
          ) : null}
        </View>
      </Animated.View>
      <StarBurst fireKey={fireKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 50,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: 24,
    gap: 10,
    borderWidth: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
});
