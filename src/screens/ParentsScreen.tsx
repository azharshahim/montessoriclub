import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { APP_VERSION, DAILY_LIMITS } from '../constants';
import { gamesForAge } from '../games';
import { LANGUAGES, useI18n, type Language, type TranslationKey } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import { dayKey, earnedBadges, useProfiles, type Profile } from '../store/profiles';
import { useSettings, type ThemeMode } from '../store/settings';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { ParentalCodeCard } from '../ui/ParentalCodeCard';
import { ProgressBar } from '../ui/ProgressBar';
import { Screen } from '../ui/Screen';

type Tab = 'progress' | 'settings';

/**
 * Espace parents (protégé par la porte de calcul).
 * Aucune donnée ne quitte l'appareil : ce tableau de bord lit uniquement
 * le stockage local AsyncStorage.
 */
export function ParentsScreen({ navigation }: ScreenProps<'Parents'>) {
  const { t, language } = useI18n();
  const { colors, radius, shadow, text, spacing } = useTheme();
  const profiles = useProfiles((s) => s.profiles);
  const selectedId = useProfiles((s) => s.selectedId);
  const select = useProfiles((s) => s.select);
  const updateProfile = useProfiles((s) => s.updateProfile);
  const resetProgress = useProfiles((s) => s.resetProgress);

  const settings = useSettings();
  const [tab, setTab] = useState<Tab>('progress');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const profile: Profile | undefined = profiles.find((p) => p.id === selectedId) ?? profiles[0];

  const stats = useMemo(() => {
    if (!profile) return null;
    const entries = Object.values(profile.progress);
    const successes = entries.reduce((sum, p) => sum + p.successes, 0);
    const mistakes = entries.reduce((sum, p) => sum + p.mistakes, 0);
    const sessions = entries.reduce((sum, p) => sum + p.sessions, 0);
    const totalAttempts = successes + mistakes;
    const today = profile.playDays.find((d) => d.date === dayKey())?.minutes ?? 0;
    const weekKeys = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return dayKey(date);
    });
    const week = profile.playDays.filter((d) => weekKeys.includes(d.date)).reduce((s, d) => s + d.minutes, 0);
    return {
      sessions,
      rate: totalAttempts === 0 ? 0 : Math.round((successes / totalAttempts) * 100),
      today,
      week,
      badges: earnedBadges(profile.stars).length,
    };
  }, [profile]);

  if (!profile || !stats) {
    return (
      <Screen scene="calm" tab="parents" header={{ title: t('parents.title') }}>
        <View style={styles.emptyState}>
          <Icon name="user" size={40} color={colors.inkFaint} />
          <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>{t('parents.noChild')}</Text>
          <Button label={t('onboarding.addChild')} icon="plus" onPress={() => navigation.navigate('Onboarding')} size="lg" />
        </View>
      </Screen>
    );
  }

  const games = gamesForAge(profile.ageBand);

  return (
    <Screen scene="calm" tab="parents" header={{ title: t('parents.title') }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Sélecteur d'enfant suivi */}
        <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 6 }]}>{t('parents.selectChild')}</Text>
        <View style={styles.childrenRow}>
          {profiles.map((child) => {
            const active = child.id === profile.id;
            return (
              <Pressable
                key={child.id}
                onPress={() => select(child.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.childChip,
                  {
                    backgroundColor: active ? colors.coral : colors.surface,
                    borderColor: active ? colors.coral : colors.sand,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text style={[text.label, { color: active ? '#FFFFFF' : colors.inkSoft }]}>{child.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <Button
          label={t('parents.manageProfiles')}
          icon="user"
          variant="ghost"
          size="sm"
          onPress={() => navigation.navigate('Onboarding')}
        />

        {/* Onglets */}
        <View style={[styles.tabs, { backgroundColor: colors.sand, borderRadius: radius.pill }]}>
          {(['progress', 'settings'] as Tab[]).map((item) => {
            const active = tab === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[
                  styles.tab,
                  { backgroundColor: active ? colors.surface : 'transparent', borderRadius: radius.pill },
                ]}
              >
                <Icon name={item === 'progress' ? 'chart' : 'sliders'} size={16} color={active ? colors.ink : colors.inkSoft} />
                <Text style={[text.label, { color: active ? colors.ink : colors.inkSoft }]}>
                  {item === 'progress' ? t('parents.tabProgress') : t('parents.tabSettings')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'progress' ? (
          <>
            <View style={styles.statsRow}>
              <Stat icon="star" label={t('rewards.stars')} value={String(profile.stars)} color={colors.yellow} />
              <Stat icon="check" label={t('parents.sessions')} value={String(stats.sessions)} color={colors.green} />
              <Stat icon="chart" label={t('parents.successRate')} value={`${stats.rate}%`} color={colors.blue} />
            </View>

            <View style={[styles.card, shadow.soft, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand }]}>
              <View style={styles.cardTitle}>
                <Icon name="clock" size={18} color={colors.teal} />
                <Text style={[text.h3, { color: colors.ink }]}>{t('parents.dashboard')}</Text>
              </View>
              <Text style={[text.body, { color: colors.inkSoft }]}>{t('parents.timeToday', { minutes: stats.today })}</Text>
              <Text style={[text.body, { color: colors.inkSoft }]}>{t('parents.timeWeek', { minutes: stats.week })}</Text>
            </View>

            {games.map((game) => {
              const entry = profile.progress[game.id];
              const attempts = (entry?.successes ?? 0) + (entry?.mistakes ?? 0);
              const rate = attempts === 0 ? 0 : Math.round(((entry?.successes ?? 0) / attempts) * 100);
              return (
                <View
                  key={game.id}
                  style={[styles.card, shadow.soft, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand }]}
                >
                  <View style={styles.gameRow}>
                    <View style={[styles.gameEmoji, { backgroundColor: `${game.accent}22` }]}>
                      <Text style={{ fontSize: 20 }}>{game.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[text.label, { color: colors.ink }]}>{t(game.titleKey as TranslationKey)}</Text>
                      <Text style={[text.caption, { color: colors.inkFaint }]}>
                        {t('common.level', { level: entry?.level ?? 1 })} / {game.maxLevel} • {t('parents.successRate')} {rate}% •{' '}
                        {entry?.stars ?? 0} ★
                      </Text>
                    </View>
                  </View>
                  <ProgressBar value={(entry?.level ?? 1) / game.maxLevel} color={game.accent} height={10} />
                </View>
              );
            })}

            <Text style={[text.h3, { color: colors.ink, marginTop: spacing.md }]}>{t('parents.limit')}</Text>
            <View style={styles.chips}>
              {DAILY_LIMITS.map((limit) => {
                const active = profile.dailyLimitMinutes === limit;
                return (
                  <Pressable
                    key={String(limit)}
                    onPress={() => updateProfile(profile.id, { dailyLimitMinutes: limit })}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.teal : colors.surface,
                        borderColor: active ? colors.teal : colors.sand,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text style={[text.label, { color: active ? '#FFFFFF' : colors.inkSoft }]}>
                      {limit === null ? t('parents.unlimited') : t('parents.limitValue', { count: limit })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.resetBlock}>
              <Button
                label={t('parents.reset')}
                icon="refresh"
                variant="danger"
                size="md"
                onPress={() => setConfirmReset(true)}
              />
              {resetDone ? (
                <Text style={[text.caption, { color: colors.success, textAlign: 'center' }]}>{t('parents.resetDone')}</Text>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <Text style={[text.h3, { color: colors.ink, marginTop: spacing.md }]}>{t('parents.language')}</Text>
            <View style={styles.chips}>
              {LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => settings.setLanguage(lang as Language)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.indigo : colors.surface,
                        borderColor: active ? colors.indigo : colors.sand,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text style={[text.label, { color: active ? '#FFFFFF' : colors.inkSoft }]}>
                      {t(`language.${lang}` as TranslationKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[text.h3, { color: colors.ink, marginTop: spacing.lg }]}>{t('parents.theme')}</Text>
            <View style={styles.chips}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((item) => {
                const active = settings.themeMode === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => settings.setThemeMode(item)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.teal : colors.surface,
                        borderColor: active ? colors.teal : colors.sand,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text style={[text.label, { color: active ? '#FFFFFF' : colors.inkSoft }]}>
                      {t(`theme.${item}` as TranslationKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[text.caption, { color: colors.inkFaint, marginTop: 6 }]}>{t('parents.themeHint')}</Text>

            <View style={[styles.card, shadow.soft, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand, marginTop: spacing.md }]}>
              <View style={styles.cardTitle}>
                <Icon name="shield" size={20} color={colors.green} />
                <Text style={[text.h3, { color: colors.ink }]}>{t('parents.security')}</Text>
              </View>
              <ParentalCodeCard />
            </View>

            <View style={[styles.card, shadow.soft, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand, marginTop: spacing.md }]}>
              <ToggleRow
                icon="sound"
                label={t('parents.sound')}
                value={settings.sound}
                onChange={(v) => settings.set('sound', v)}
              />
              <ToggleRow
                icon="eye"
                label={t('parents.subtitles')}
                value={settings.subtitles}
                onChange={(v) => settings.set('subtitles', v)}
              />
              <ToggleRow
                icon="globe"
                label={t('parents.colorBlind')}
                value={settings.colorBlind}
                onChange={(v) => settings.set('colorBlind', v)}
              />
              <ToggleRow
                icon="refresh"
                label={t('parents.reducedMotion')}
                value={settings.reducedMotion}
                onChange={(v) => settings.set('reducedMotion', v)}
              />
              <ToggleRow
                icon="sparkles"
                label={t('parents.haptics')}
                value={settings.haptics}
                onChange={(v) => settings.set('haptics', v)}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.creamDeep, borderRadius: radius.lg, borderColor: colors.sand, borderWidth: 1.5 }]}>
              <View style={styles.cardTitle}>
                <Icon name="shield" size={20} color={colors.green} />
                <Text style={[text.h3, { color: colors.ink }]}>{t('parents.privacy')}</Text>
              </View>
            </View>

            <Text style={[text.caption, { color: colors.inkFaint, textAlign: 'center', marginTop: spacing.lg }]}>
              {t('parents.version', { version: APP_VERSION })} • {t('app.name')}
            </Text>
          </>
        )}
      </ScrollView>

      {/* Confirmation de réinitialisation (pas d'Alert natif : cohérent web/mobile) */}
      {confirmReset ? (
        <View style={styles.confirmBackdrop}>
          <View style={[styles.confirmCard, shadow.lifted, { backgroundColor: colors.cream, borderRadius: radius.lg, borderColor: colors.sand }]}>
            <Text style={[text.h3, { color: colors.ink, textAlign: 'center' }]}>
              {t('parents.resetConfirm', { name: profile.name })}
            </Text>
            <View style={styles.confirmRow}>
              <Button label={t('common.cancel')} variant="ghost" onPress={() => setConfirmReset(false)} />
              <Button
                label={t('common.delete')}
                variant="danger"
                onPress={() => {
                  resetProgress(profile.id);
                  setConfirmReset(false);
                  setResetDone(true);
                }}
              />
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function Stat({ icon, label, value, color }: { icon: IconName; label: string; value: string; color: string }) {
  const { colors, radius, shadow, text } = useTheme();
  return (
    <View style={[styles.stat, shadow.soft, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.sand }]}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[text.h2, { color: colors.ink }]}>{value}</Text>
      <Text style={[text.caption, { color: colors.inkFaint, textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: IconName;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors, text } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Icon name={icon} size={20} color={colors.inkSoft} />
      <Text style={[text.body, { color: colors.ink, flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.sand, true: colors.green }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  childChip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  card: {
    marginTop: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameEmoji: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  resetBlock: {
    marginTop: 26,
    alignItems: 'center',
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(51,48,46,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 40,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    gap: 14,
    borderWidth: 2,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
});
