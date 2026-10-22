import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { playSfx } from '../audio/engine';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { GameLayout } from '../ui/GameLayout';
import type { GameProps } from './types';

interface FreePlayShellProps extends Pick<GameProps, 'onFinish' | 'onQuit'> {
  title: string;
  instruction: string;
  /** Nombre de touches qui terminent la session (aucune erreur possible). */
  goal: number;
  children: (api: { touch: () => void; session: number }) => React.ReactNode;
}

/**
 * Coque commune des activités « jeu libre » des 0-2 ans.
 * Chaque touche compte pour la progression ; il n'y a ni erreur, ni chrono.
 * `session` change à chaque nouvelle partie : à utiliser comme `key` pour
 * remettre le plateau à zéro.
 *
 * La fin de session est signalée à l'hôte (`onFinish`) : c'est GameScreen qui
 * affiche l'unique écran de récompense et propose « Rejouer ». La coque ne
 * superpose donc jamais deux fenêtres de félicitations.
 */
export function FreePlayShell({ title, instruction, goal, onFinish, onQuit, children }: FreePlayShellProps) {
  const { t } = useI18n();
  const { radius, colors, shadow } = useTheme();
  const [touches, setTouches] = useState(0);
  const [burst, setBurst] = useState(0);
  const touchesRef = useRef(0);
  const finishedRef = useRef(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(
    () => () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
    },
    []
  );

  const touch = useCallback(() => {
    if (finishedRef.current) return;
    touchesRef.current += 1;
    const count = touchesRef.current;
    setTouches(count);
    setBurst((b) => b + 1);
    if (count >= goal) {
      // Petite respiration avant la récompense : l'enfant voit son dernier geste.
      finishedRef.current = true;
      playSfx('star', { volume: 0.5 });
      finishTimer.current = setTimeout(() => {
        playSfx('celebrate');
        onFinishRef.current({ mistakes: 0, rounds: goal });
      }, 750);
    }
  }, [goal]);

  const stars = Math.min(5, Math.floor((touches * 5) / goal));

  return (
    <GameLayout
      title={title}
      instruction={instruction}
      onBack={() => onQuit?.({ stars, mistakes: 0, rounds: 0 })}
      round={Math.min(touches + 1, goal)}
      rounds={goal}
      stars={stars}
      fireKey={burst}
    >
      <View style={styles.area}>
        {children({ touch, session: 0 })}
        <View
          pointerEvents="none"
          style={[
            styles.counter,
            { backgroundColor: colors.surfaceTranslucent, borderRadius: radius.pill, borderColor: colors.sand, ...shadow.soft },
          ]}
        >
          {Array.from({ length: goal }).map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i < touches ? colors.coral : colors.sand }]} />
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  counter: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
});
