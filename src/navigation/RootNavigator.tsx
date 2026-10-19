import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useProfiles } from '../store/profiles';
import { palette } from '../theme/palette';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ParentsGateScreen } from '../screens/ParentsGateScreen';
import { ParentsScreen } from '../screens/ParentsScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.cream,
    card: palette.cream,
    text: palette.ink,
    primary: palette.coral,
    border: palette.sand,
  },
};

/**
 * Pile de navigation unique (iOS / Android / Web).
 * L'accueil s'ouvre directement si un profil a déjà été choisi :
 * un enfant de 2 ans n'a pas à refaire d'étape.
 */
export function RootNavigator() {
  const selectedId = useProfiles((s) => s.selectedId);

  return (
    <NavigationContainer theme={navigationTheme} documentTitle={{ enabled: false }}>
      <Stack.Navigator
        initialRouteName={selectedId ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: palette.cream },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="ParentsGate" component={ParentsGateScreen} />
        <Stack.Screen name="Parents" component={ParentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
