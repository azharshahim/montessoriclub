import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { speak, stopSpeaking } from '../../audio/speech';
import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import { useTheme } from '../../theme';
import { BounceButton } from '../../ui/BounceButton';
import { useBoardArea } from '../../ui/GameLayout';
import { FreePlayShell } from '../FreePlayShell';
import type { GameProps } from '../types';

const ANIMALS = [
  { id: 'dog', emoji: '🐶', tint: '#F5C33B' },
  { id: 'cat', emoji: '🐱', tint: '#EE8FB1' },
  { id: 'cow', emoji: '🐮', tint: '#4FBF8B' },
  { id: 'duck', emoji: '🦆', tint: '#4E8FE0' },
  { id: 'sheep', emoji: '🐑', tint: '#9C7BE0' },
  { id: 'frog', emoji: '🐸', tint: '#3FB1B5' },
] as const;

type AnimalId = (typeof ANIMALS)[number]['id'];

const NAME_KEYS: Record<AnimalId, TranslationKey> = {
  dog: 'animal.dog',
  cat: 'animal.cat',
  cow: 'animal.cow',
  duck: 'animal.duck',
  sheep: 'animal.sheep',
  frog: 'animal.frog',
};

const CRY_KEYS: Record<AnimalId, TranslationKey> = {
  dog: 'animal.dog.cry',
  cat: 'animal.cat.cry',
  cow: 'animal.cow.cry',
  duck: 'animal.duck.cry',
  sheep: 'animal.sheep.cry',
  frog: 'animal.frog.cry',
};

const TOUCHES_TO_FINISH = 8;

/**
 * Module « Les animaux » (0-2 ans).
 * Cause à effet : l'enfant touche un animal, la mascotte énonce son cri.
 * Quatre animaux tirés au hasard à chaque partie, aucune erreur possible.
 */
export function AnimalsGame({ onFinish, onQuit }: GameProps) {
  const { t } = useI18n();
  return (
    <FreePlayShell
      title={t('activity.animals.title')}
      instruction={t('activity.animals.instruction')}
      goal={TOUCHES_TO_FINISH}
      onFinish={onFinish}
      onQuit={onQuit}
    >
      {({ touch, session }) => <AnimalBoard key={session} onTouch={touch} />}
    </FreePlayShell>
  );
}

function AnimalBoard({ onTouch }: { onTouch: () => void }) {
  const { t, language } = useI18n();
  const { radius, shadow, text, colors } = useTheme();
  const area = useBoardArea();
  const window = useWindowDimensions();
  const [animals] = useState(() => shuffle(ANIMALS).slice(0, 4));
  const [active, setActive] = useState<AnimalId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopSpeaking();
    },
    []
  );

  const gap = 14;
  const width = area?.width ?? window.width;
  const height = area?.height ?? window.height * 0.6;
  // 80 px réservés aux libellés et au compteur de progression.
  const card = Math.max(96, Math.min(190, Math.floor(Math.min((width - gap * 3) / 2, (height - gap * 3 - 80) / 2))));

  const press = (id: AnimalId) => {
    playSfx('tap');
    haptic('light');
    speak(t(CRY_KEYS[id]), language);
    setActive(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 1800);
    onTouch();
  };

  return (
    <View style={[styles.grid, { gap }]}>
      {animals.map((animal) => (
        <View key={animal.id} style={styles.cell}>
          <BounceButton onPress={() => press(animal.id)} accessibilityLabel={t('a11y.touchItem', { name: t(NAME_KEYS[animal.id]) })}>
            <View
              style={[
                styles.card,
                shadow.soft,
                {
                  width: card,
                  height: card,
                  borderRadius: radius.xl,
                  backgroundColor: '#FFFFFF',
                  borderColor: animal.tint,
                },
              ]}
            >
              <Text style={{ fontSize: card * 0.55 }} accessible={false}>
                {animal.emoji}
              </Text>
            </View>
          </BounceButton>
          <Text style={[text.label, { color: active === animal.id ? colors.coral : colors.inkSoft, marginTop: 6 }]}>
            {active === animal.id ? t(CRY_KEYS[animal.id]) : t(NAME_KEYS[animal.id])}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    paddingBottom: 40,
  },
  cell: {
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
});
