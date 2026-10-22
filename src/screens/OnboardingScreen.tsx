import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { useI18n } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import {
  AGE_BANDS,
  ageBandKey,
  useProfiles,
  type AgeBand,
  type AvatarId,
} from '../store/profiles';
import { useTheme } from '../theme';
import { Avatar, AVATARS } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Mascot } from '../ui/Mascot';
import { Screen } from '../ui/Screen';

/**
 * Sélection / création de profil.
 * Étape réservée à l'adulte la première fois, puis très simple pour l'enfant :
 * une grande carte avec son avatar et son prénom.
 */
export function OnboardingScreen({ navigation }: ScreenProps<'Onboarding'>) {
  const { t } = useI18n();
  const { colors, radius, shadow, text, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const profiles = useProfiles((s) => s.profiles);
  const addProfile = useProfiles((s) => s.addProfile);
  const updateProfile = useProfiles((s) => s.updateProfile);
  const deleteProfile = useProfiles((s) => s.deleteProfile);
  const select = useProfiles((s) => s.select);
  const selectedId = useProfiles((s) => s.selectedId);

  const [mode, setMode] = useState<'list' | 'form'>(profiles.length === 0 ? 'form' : 'list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('3-5');
  const [avatar, setAvatar] = useState<AvatarId>('fox');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setAgeBand('3-5');
    setAvatar('fox');
    setConfirmDelete(false);
    setMode('form');
  };

  const openEdit = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    setEditingId(id);
    setName(profile.name);
    setAgeBand(profile.ageBand);
    setAvatar(profile.avatar);
    setConfirmDelete(false);
    setMode('form');
  };

  const save = () => {
    const clean = name.trim();
    if (!clean) return;
    if (editingId) {
      updateProfile(editingId, { name: clean, ageBand, avatar });
      select(editingId);
    } else {
      addProfile({ name: clean, ageBand, avatar });
    }
    navigation.replace('Home');
  };

  const pickProfile = (id: string) => {
    select(id);
    navigation.replace('Home');
  };

  const columns = width > 700 ? 3 : 2;

  return (
    <Screen
      header={{
        title: mode === 'form' ? (editingId ? t('onboarding.edit') : t('profile.new')) : t('app.name'),
        // Aucune impasse : depuis la liste, on retrouve l'accueil du profil
        // déjà choisi ; depuis le formulaire, on revient à la liste.
        onBack:
          mode === 'form'
            ? profiles.length > 0
              ? () => setMode('list')
              : undefined
            : selectedId
              ? () => navigation.replace('Home')
              : undefined,
        centerTitle: true,
      }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {mode === 'list' ? (
            <>
              <View style={styles.hero}>
                <Mascot size={112} mood="happy" />
                <Text style={[text.h1, { color: colors.ink, textAlign: 'center' }]}>{t('onboarding.title')}</Text>
                <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>
                  {t('onboarding.subtitle')}
                </Text>
              </View>

              <View style={[styles.grid, { gap: spacing.md }]}>
                {profiles.map((profile) => (
                  <Pressable
                    key={profile.id}
                    onPress={() => pickProfile(profile.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('a11y.profile', {
                      name: profile.name,
                      age: t(ageBandKey[profile.ageBand]),
                    })}
                    style={({ pressed }) => [
                      styles.profileCard,
                      shadow.soft,
                      {
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        borderColor: colors.sand,
                        width: `${100 / columns - 3}%`,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <Avatar id={profile.avatar} size={78} ring />
                    <Text style={[text.h3, { color: colors.ink }]} numberOfLines={1}>
                      {profile.name}
                    </Text>
                    <Text style={[text.caption, { color: colors.inkFaint }]}>{t(ageBandKey[profile.ageBand])}</Text>
                    <Pressable
                      onPress={() => openEdit(profile.id)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={t('onboarding.edit')}
                      style={[styles.editChip, { backgroundColor: colors.creamDeep, borderRadius: radius.pill }]}
                    >
                      <Icon name="edit" size={15} color={colors.inkSoft} />
                    </Pressable>
                  </Pressable>
                ))}

                <Pressable
                  onPress={openCreate}
                  accessibilityRole="button"
                  accessibilityLabel={t('onboarding.addChild')}
                  style={[
                    styles.profileCard,
                    styles.addCard,
                    {
                      borderRadius: radius.lg,
                      borderColor: colors.inkFaint,
                      width: `${100 / columns - 3}%`,
                    },
                  ]}
                >
                  <View style={[styles.addCircle, { backgroundColor: colors.creamDeep }]}>
                    <Icon name="plus" size={30} color={colors.coral} />
                  </View>
                  <Text style={[text.label, { color: colors.inkSoft, textAlign: 'center' }]}>
                    {t('onboarding.addChild')}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.form}>
              <Text style={[text.h2, { color: colors.ink, marginBottom: 4 }]}>{t('profile.name')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={colors.inkFaint}
                maxLength={16}
                autoCapitalize="words"
                returnKeyType="done"
                accessibilityLabel={t('profile.name')}
                style={[
                  styles.input,
                  {
                    borderColor: colors.sand,
                    borderRadius: radius.md,
                    color: colors.ink,
                    backgroundColor: colors.surface,
                  },
                ]}
              />

              <Text style={[text.h3, { color: colors.ink, marginTop: spacing.lg }]}>{t('profile.age')}</Text>
              <View style={styles.chips}>
                {AGE_BANDS.map((band) => {
                  const active = band === ageBand;
                  return (
                    <Pressable
                      key={band}
                      onPress={() => setAgeBand(band)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.coral : colors.surface,
                          borderColor: active ? colors.coral : colors.sand,
                          borderRadius: radius.pill,
                        },
                      ]}
                    >
                      <Text style={[text.label, { color: active ? '#FFFFFF' : colors.inkSoft }]}>
                        {t(ageBandKey[band])}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[text.h3, { color: colors.ink, marginTop: spacing.lg }]}>{t('profile.avatar')}</Text>
              <View style={styles.avatars}>
                {AVATARS.map((item) => {
                  const active = item.id === avatar;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setAvatar(item.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.avatarOption,
                        {
                          borderColor: active ? colors.coral : 'transparent',
                          borderRadius: 999,
                          backgroundColor: active ? `${colors.coral}18` : 'transparent',
                        },
                      ]}
                    >
                      <Avatar id={item.id} size={58} />
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
                <Button label={t('common.save')} icon="check" onPress={save} disabled={!name.trim()} size="lg" fullWidth />
                {editingId ? (
                  <>
                    <Button
                      label={t('profile.delete')}
                      icon="trash"
                      variant="danger"
                      onPress={() => setConfirmDelete(true)}
                      fullWidth
                    />
                    {confirmDelete ? (
                      <View style={[styles.confirm, { borderColor: colors.sand, borderRadius: radius.md, backgroundColor: colors.surface }]}>
                        <Text style={[text.body, { color: colors.ink, textAlign: 'center' }]}>
                          {t('profile.deleteConfirm', { name: name || '—' })}
                        </Text>
                        <View style={styles.confirmRow}>
                          <Button label={t('common.cancel')} variant="ghost" onPress={() => setConfirmDelete(false)} />
                          <Button
                            label={t('common.delete')}
                            variant="danger"
                            onPress={() => {
                              deleteProfile(editingId);
                              setConfirmDelete(false);
                              if (profiles.length <= 1) {
                                openCreate();
                              } else {
                                setMode('list');
                              }
                            }}
                          />
                        </View>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    paddingTop: 8,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1.5,
    minHeight: 168,
    justifyContent: 'center',
  },
  editChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  addCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingTop: 8,
  },
  input: {
    height: 58,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  avatarOption: {
    padding: 4,
    borderWidth: 2.5,
  },
  confirm: {
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
});
