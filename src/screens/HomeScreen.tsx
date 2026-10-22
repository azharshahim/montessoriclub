import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useI18n } from '../i18n';
import { gamesForAge } from '../games';
import type { ScreenProps } from '../navigation/types';
import { dayKey, useActiveProfile, useProfiles } from '../store/profiles';
import { useTheme } from '../theme';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { MascotGuide } from '../ui/MascotGuide';
import { RewardOverlay } from '../ui/RewardOverlay';
import { Screen } from '../ui/Screen';

/**
 * Accueil enfant.
 * Une seule question : « Que veux-tu explorer ? ».
 * La grille s'adapte à la tranche d'âge du profil actif.
 */
export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const { t } = useI18n();
  const { colors, radius, shadow, text, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const profile = useActiveProfile();
  const select = useProfiles((s) => s.select);
  const [restOpen, setRestOpen] = useState(false);

  if (!profile) {
    // Filet de sécurité : aucun profil actif -> retour à la sélection.
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={[text.h2, { color: colors.ink }]}>{t('onboarding.title')}</Text>
          <Pressable onPress={() => navigation.replace('Onboarding')}>
            <Text style={[text.body, { color: colors.teal }]}>{t('onboarding.subtitle')}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const games = gamesForAge(profile.ageBand);
  const todayMinutes = profile.playDays.find((d) => d.date === dayKey())?.minutes ?? 0;
  const limited = profile.dailyLimitMinutes !== null && todayMinutes >= profile.dailyLimitMinutes;

  const columns = width >= 900 ? 3 : 2;
  const cardWidth = (Math.min(width, 1080) - 40 - (columns - 1) * 12) / columns;

  const openGame = (gameId: string) => {
    if (limited) {
      setRestOpen(true);
      return;
    }
    navigation.navigate('Game', { gameId });
  };

  return (
    <Screen tab="home">
      <View style={styles.header}>
        <Avatar id={profile.avatar} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={[text.h2, { color: colors.ink }]} numberOfLines={1}>
            {t('home.greeting', { name: profile.name })}
          </Text>
          <Text style={[text.caption, { color: colors.inkFaint }]} numberOfLines={1}>
            {t('home.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MascotGuide
          message={t('mascot.hello', { name: profile.name })}
          mood="happy"
          size={width > 700 ? 96 : 76}
        />

        {games.length === 0 ? (
          <View
            style={[
              styles.emptyBand,
              shadow.soft,
              { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand },
            ]}
          >
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[text.h3, { color: colors.ink, textAlign: 'center' }]}>{t('home.emptyBandTitle')}</Text>
            <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>{t('home.emptyBandText')}</Text>
          </View>
        ) : null}

        <View style={[styles.grid, { gap: spacing.md }]}>
          {games.map((game) => {
            const progress = profile.progress[game.id];
            // Niveau réellement proposé : la progression ne peut pas être
            // inférieure au plancher de la tranche d'âge (ex. puzzles en 6-8).
            const level = Math.max(progress?.level ?? 1, game.minLevelByAge?.[profile.ageBand] ?? 1);
            return (
              <Pressable
                key={game.id}
                onPress={() => openGame(game.id)}
                accessibilityRole="button"
                accessibilityLabel={t(game.titleKey as never)}
                style={({ pressed }) => [
                  styles.card,
                  shadow.soft,
                  {
                    width: cardWidth,
                    borderRadius: radius.lg,
                    backgroundColor: colors.surface,
                    borderColor: colors.sand,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[`${game.accent}26`, '#FFFFFF00']}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
                />
                <View style={[styles.emojiBubble, { backgroundColor: `${game.accent}22` }]}>
                  <Text style={styles.emoji}>{game.emoji}</Text>
                </View>
                <Text style={[text.h3, { color: colors.ink }]} numberOfLines={2}>
                  {t(game.titleKey as never)}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={[styles.levelChip, { backgroundColor: colors.creamDeep, borderRadius: radius.pill }]}>
                    <Text style={[text.caption, { color: colors.inkSoft }]}>{t('common.level', { level })}</Text>
                  </View>
                  <View style={styles.stars}>
                    <Icon name="star" size={14} color={colors.yellow} />
                    <Text style={[text.caption, { color: colors.inkSoft }]}>{progress?.stars ?? 0}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

        </View>

      </ScrollView>

      <RewardOverlay
        visible={restOpen}
        title={t('home.restTitle')}
        subtitle={t('home.restText')}
        primaryLabel={t('common.close')}
        onPrimary={() => setRestOpen(false)}
        emojiFallback
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  scroll: {
    paddingBottom: 32,
    gap: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    padding: 14,
    gap: 8,
    minHeight: 158,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  emojiBubble: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  emptyBand: {
    alignItems: 'center',
    gap: 8,
    padding: 22,
    borderWidth: 1.5,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  soon: {
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
    minHeight: 62,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
