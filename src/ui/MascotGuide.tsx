import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { speak, stopSpeaking } from '../audio/speech';
import { useI18n } from '../i18n';
import { useSettings } from '../store/settings';
import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Mascot, type MascotMood } from './Mascot';

interface MascotGuideProps {
  message: string;
  mood?: MascotMood;
  size?: number;
  /** Masque la bulle (écrans très denses). */
  hideBubble?: boolean;
}

/**
 * Mascotte + bulle de dialogue.
 * Elle parle automatiquement en français (ou langue choisie), se tait si les
 * sons sont coupés, et reste réécoutable d'un toucher (accessibilité).
 */
export function MascotGuide({ message, mood = 'idle', size = 108, hideBubble }: MascotGuideProps) {
  const { colors, radius, shadow, text, spacing } = useTheme();
  const { language, t, align } = useI18n();
  const { sound, subtitles } = useSettings();
  const [speaking, setSpeaking] = useState(false);
  const { width } = useWindowDimensions();
  const stacked = width < 560;

  useEffect(() => {
    if (!message || !sound) {
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(message, language, { onDone: () => setSpeaking(false) });
    return () => stopSpeaking();
  }, [message, language, sound]);

  const replay = () => {
    setSpeaking(true);
    speak(message, language, { onDone: () => setSpeaking(false) });
  };

  const bubble = subtitles && !hideBubble ? (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: '#FFFFFF',
          borderRadius: radius.lg,
          borderColor: colors.sand,
          ...shadow.soft,
        },
      ]}
    >
      <Text style={[text.body, { color: colors.ink, textAlign: align }]}>{message}</Text>
      <Pressable
        onPress={replay}
        style={styles.replay}
        accessibilityRole="button"
        accessibilityLabel={t('nav.listenAgain')}
        hitSlop={12}
      >
        <Icon name={speaking ? 'sparkles' : 'sound'} size={22} color={colors.teal} />
      </Pressable>
    </View>
  ) : null;

  return (
    <View
      style={[
        styles.row,
        stacked && styles.column,
        { gap: spacing.md },
      ]}
    >
      <View style={stacked ? { alignItems: 'flex-end', width: '100%' } : { flexShrink: 1 }}>{bubble}</View>
      <Pressable
        onPress={replay}
        accessibilityRole="button"
        accessibilityLabel={t('nav.listenAgain')}
        style={styles.mascotButton}
      >
        <Mascot size={size} mood={mood} speaking={speaking} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    maxWidth: 420,
  },
  replay: {
    // 40 px visuels + hitSlop 12 = zone tactile de 64 px (recommandation 44 px mini).
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
