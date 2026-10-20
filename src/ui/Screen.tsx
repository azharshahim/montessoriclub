import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { RoundButton } from './Button';
import { ScreenBackground, type Scene } from './ScreenBackground';

interface HeaderConfig {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Affiche un titre centré (sinon aligné à gauche). */
  centerTitle?: boolean;
}

interface ScreenProps {
  children: React.ReactNode;
  header?: HeaderConfig;
  /** Contenu centré verticalement (utile pour les jeux). */
  centered?: boolean;
  backgroundColor?: string;
  /** Décor du fond (ciel, prairie, coucher de soleil, calme). */
  scene?: Scene;
  contentStyle?: StyleProp<ViewStyle>;
  /** Largeur maximale sur tablette / web pour garder une lecture confortable. */
  maxWidth?: number;
}

/**
 * Conteneur d'écran commun : fond crème dégradé, safe-area, en-tête accessible,
 * largeur maîtrisée sur grand écran et mode portrait/paysage.
 */
export function Screen({ children, header, centered, backgroundColor, scene = 'sky', contentStyle, maxWidth = 1080 }: ScreenProps) {
  const { colors, text } = useTheme();
  const { t, align } = useI18n();

  return (
    <View style={[styles.root, { backgroundColor: backgroundColor ?? colors.cream }]}>
      <ScreenBackground scene={scene} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.inner, { maxWidth }]}>
          {header ? (
            <View style={styles.header}>
              <View style={styles.headerSide}>
                {header.onBack ? (
                  <RoundButton icon="back" onPress={header.onBack} accessibilityLabel={t('a11y.back')} />
                ) : null}
              </View>
              {header.title ? (
                <Text
                  style={[
                    text.h2,
                    { color: colors.ink, flex: 1, textAlign: header.centerTitle ? 'center' : align },
                  ]}
                  numberOfLines={1}
                >
                  {header.title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <View style={[styles.headerSide, styles.headerRight]}>{header.right}</View>
            </View>
          ) : null}
          <View style={[styles.content, centered && styles.centered, contentStyle]}>{children}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 60,
  },
  headerSide: {
    width: 64,
    justifyContent: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  content: { flex: 1 },
  centered: { justifyContent: 'center' },
});
