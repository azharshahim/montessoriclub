import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../i18n';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

export type TabId = 'home' | 'rewards' | 'profile' | 'parents';

interface TabDef {
  id: TabId;
  icon: IconName;
  labelKey: 'nav.activities' | 'home.rewards' | 'nav.profile' | 'home.parents';
  color: string;
  route: keyof RootStackParamList;
}

/**
 * Barre d'onglets en bas de l'écran (accueil, récompenses, profil, parents).
 * Les onglets remplacent la pile de navigation : aucun empilement d'écrans.
 */
export function TabBar({ active }: { active: TabId }) {
  const { t } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const tabs: TabDef[] = [
    { id: 'home', icon: 'home', labelKey: 'nav.activities', color: colors.coral, route: 'Home' },
    { id: 'rewards', icon: 'trophy', labelKey: 'home.rewards', color: colors.yellow, route: 'Rewards' },
    { id: 'profile', icon: 'user', labelKey: 'nav.profile', color: colors.blue, route: 'Onboarding' },
    { id: 'parents', icon: 'lock', labelKey: 'home.parents', color: colors.purple, route: 'ParentsGate' },
  ];

  const go = (tab: TabDef) => {
    if (tab.id === active) return;
    navigation.reset({ index: 0, routes: [{ name: tab.route as never }] });
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[styles.bar, shadow.lifted, { borderRadius: radius.xl }]}>
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              onPress={() => go(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(tab.labelKey)}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[styles.iconWrap, on && { backgroundColor: `${tab.color}33` }]}>
                <Icon name={tab.icon} size={24} color={on ? tab.color : colors.inkFaint} />
              </View>
              <Text
                numberOfLines={1}
                style={[text.caption, { color: on ? colors.ink : colors.inkFaint, fontWeight: on ? '800' : '600' }]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 6, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 2, minHeight: 56 },
  iconWrap: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999 },
});
