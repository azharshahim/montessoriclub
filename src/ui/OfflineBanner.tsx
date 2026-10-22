import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { useOnlineStatus } from '../pwa';
import { useTheme } from '../theme';

/**
 * Bandeau discret affiché uniquement lorsque l'appareil n'a plus de réseau.
 * Les activités sont déjà toutes locales : ce message rassure, il n'alerte pas.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useI18n();
  const { colors, text } = useTheme();

  if (online) return null;

  return (
    <View
      style={[styles.banner, { backgroundColor: colors.ink }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[text.caption, { color: colors.cream, textAlign: 'center' }]}>{t('pwa.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 6,
    alignSelf: 'center',
  },
});
