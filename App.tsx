import React, { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { initAudio } from './src/audio/engine';
import { I18nProvider, useI18n } from './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { registerServiceWorker } from './src/pwa';
import { useProfiles } from './src/store/profiles';
import { palette } from './src/theme/palette';

// L'écran de démarrage reste visible tant que les profils ne sont pas chargés.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Attend la réhydratation d'AsyncStorage pour éviter tout clignotement. */
function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() => useProfiles.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useProfiles.persist.onFinishHydration(() => setHydrated(true));
    if (useProfiles.persist.hasHydrated()) setHydrated(true);
    return unsubscribe;
  }, []);

  return hydrated;
}

/**
 * Horloge de session : +1 minute toutes les 60 s d'utilisation réelle,
 * stockée localement pour alimenter la limite quotidienne des parents.
 */
function useSessionClock() {
  const selectedId = useProfiles((s) => s.selectedId);
  const addMinutes = useProfiles((s) => s.addMinutes);

  useEffect(() => {
    if (!selectedId) return;
    let active = AppState.currentState === 'active';
    const subscription = AppState.addEventListener('change', (state) => {
      active = state === 'active';
    });
    const interval = setInterval(() => {
      if (active) addMinutes(selectedId, 1);
    }, 60_000);
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [addMinutes, selectedId]);
}

function AppContent() {
  const hydrated = useHydrated();
  const { dir, language } = useI18n();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  // Direction RTL + fond de page sur le Web.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.style.backgroundColor = palette.cream;
    document.body.style.margin = '0';
    // Les gestes de glisser-déposer ne doivent pas sélectionner le texte.
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    // La navigation ne doit pas écraser le nom de l'application dans l'onglet.
    document.title = 'Montessori Club';
  }, [dir, language]);

  useEffect(() => {
    void initAudio();
    void registerServiceWorker();
  }, []);

  useSessionClock();

  if (!hydrated) {
    return <View style={styles.splash} />;
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <I18nProvider>
          <StatusBar style="dark" />
          <AppContent />
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, backgroundColor: palette.cream },
});
