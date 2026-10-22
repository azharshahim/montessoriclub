import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useI18n } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import { BADGES, earnedBadges, totalSessions, useActiveProfile } from '../store/profiles';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Mascot } from '../ui/Mascot';
import { Screen } from '../ui/Screen';

/**
 * Collection de récompenses.
 * Les autocollants se débloquent par la régularité (nombre de sessions),
 * jamais par la vitesse ni par la performance.
 */
const STICKERS = [
  { emoji: '🌼', threshold: 1 },
  { emoji: '🐞', threshold: 2 },
  { emoji: '🦋', threshold: 3 },
  { emoji: '🌈', threshold: 5 },
  { emoji: '🍓', threshold: 7 },
  { emoji: '🐬', threshold: 9 },
  { emoji: '⭐', threshold: 12 },
  { emoji: '🦄', threshold: 15 },
  { emoji: '🚀', threshold: 18 },
  { emoji: '🐢', threshold: 22 },
  { emoji: '🌙', threshold: 26 },
  { emoji: '🏆', threshold: 30 },
];

const BADGE_KEYS: Record<string, string> = {
  first: 'rewards.badge.first',
  ten: 'rewards.badge.ten',
  thirty: 'rewards.badge.thirty',
  master: 'rewards.badge.master',
};

export function RewardsScreen({ navigation }: ScreenProps<'Rewards'>) {
  const { t } = useI18n();
  const { colors, radius, shadow, text, spacing, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const profile = useActiveProfile();

  // Aucun profil : jamais d'écran vide, on propose d'en créer un.
  if (!profile) {
    return (
      <Screen scene="sunset" tab="rewards" header={{ title: t('rewards.title') }} centered>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Icon name="star" size={40} color={colors.inkFaint} />
          <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>{t('parents.noChild')}</Text>
          <Button
            label={t('onboarding.addChild')}
            icon="plus"
            size="lg"
            onPress={() => navigation.navigate('Onboarding')}
          />
        </View>
      </Screen>
    );
  }

  const earned = earnedBadges(profile.stars).map((badge) => badge.id);
  const sessions = totalSessions(profile);
  const unlockedStickers = STICKERS.filter((s) => sessions >= s.threshold).length;
  const columns = width > 720 ? 6 : 4;

  return (
    <Screen scene="sunset" tab="rewards" header={{ title: t('rewards.title') }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ['#3A2B23', '#2A2220'] : ['#FFF1D6', '#FFE3C2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderRadius: radius.xl, borderColor: colors.sand }]}
        >
          <Mascot size={92} mood="happy" />
          <View style={{ alignItems: 'center' }}>
            <Text style={[text.caption, { color: colors.inkSoft }]}>{t('rewards.stars')}</Text>
            <View style={styles.starTotal}>
              <Icon name="star" size={34} color={colors.yellow} />
              <Text style={[text.display, { color: colors.ink }]}>{profile.stars}</Text>
            </View>
            <Text style={[text.body, { color: colors.inkSoft }]}>
              {t('rewards.stickers')} : {unlockedStickers}/{STICKERS.length}
            </Text>
          </View>
        </LinearGradient>

        <Text style={[text.h2, { color: colors.ink, marginTop: spacing.lg }]}>{t('rewards.badges')}</Text>
        <View style={[styles.badges, { gap: spacing.sm }]}>
          {BADGES.map((badge) => {
            const unlocked = earned.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  shadow.soft,
                  {
                    backgroundColor: unlocked ? colors.surface : colors.creamDeep,
                    borderColor: colors.sand,
                    borderRadius: radius.lg,
                    opacity: unlocked ? 1 : 0.6,
                  },
                ]}
              >
                <Text style={styles.badgeEmoji}>{unlocked ? badge.emoji : '🔒'}</Text>
                <Text style={[text.caption, { color: colors.inkSoft, textAlign: 'center' }]} numberOfLines={2}>
                  {t(BADGE_KEYS[badge.id] as never)}
                </Text>
                <Text style={[text.caption, { color: colors.inkFaint }]}>{badge.threshold} ★</Text>
              </View>
            );
          })}
        </View>

        <Text style={[text.h2, { color: colors.ink, marginTop: spacing.xl }]}>{t('rewards.stickers')}</Text>
        {sessions === 0 ? (
          <Text style={[text.body, { color: colors.inkFaint }]}>{t('rewards.empty')}</Text>
        ) : null}
        <View style={[styles.stickers, { gap: 10 }]}>
          {STICKERS.map((sticker, index) => {
            const unlocked = sessions >= sticker.threshold;
            const size = Math.min(64, (Math.min(width, 720) - 40 - (columns - 1) * 10) / columns);
            return (
              <View
                key={index}
                style={[
                  styles.sticker,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: unlocked ? colors.surface : colors.creamDeep,
                    borderColor: unlocked ? colors.sand : 'transparent',
                    opacity: unlocked ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={{ fontSize: size * 0.46 }}>{unlocked ? sticker.emoji : '·'}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 18,
    borderWidth: 2,
  },
  starTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  badgeCard: {
    flexGrow: 1,
    flexBasis: 92,
    maxWidth: 160,
    alignItems: 'center',
    padding: 12,
    gap: 4,
    borderWidth: 1.5,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  stickers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  sticker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
