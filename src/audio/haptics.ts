import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettings } from '../store/settings';

type HapticKind = 'light' | 'medium' | 'success' | 'warning';

/** Retour haptique discret — désactivable dans l'espace parents. */
export function haptic(kind: HapticKind = 'light'): void {
  if (!useSettings.getState().haptics || Platform.OS === 'web') return;
  try {
    switch (kind) {
      case 'success':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'medium':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* Certains appareils ne supportent pas l'haptique. */
  }
}
