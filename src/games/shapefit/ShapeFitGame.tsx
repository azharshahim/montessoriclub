import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak, stopSpeaking } from '../../audio/speech';
import { shuffle } from '../../engine/adaptive';
import { useI18n, type TranslationKey } from '../../i18n';
import { useTheme } from '../../theme';
import { BounceButton } from '../../ui/BounceButton';
import { useBoardArea } from '../../ui/GameLayout';
import { SHAPE_LABEL_KEYS, ShapeSVG, type ShapeId } from '../../ui/illustrations/shapes';
import { FreePlayShell } from '../FreePlayShell';
import type { GameProps } from '../types';

const SHAPES_IN_PLAY: ShapeId[] = ['circle', 'square', 'triangle', 'star'];
const WOOD = { fill: '#F0B878', deep: '#C58549', stroke: '#A96C36' };
const SLOT = { deep: '#8C7B69' };

/**
 * Module « Emboîte les formes » (0-2 ans).
 * Pas de glisser-déposer (trop difficile à cet âge) : l'enfant touche une pièce
 * et elle se range seule dans le trou de sa forme. Aucune erreur possible.
 */
export function ShapeFitGame({ onFinish, onQuit }: GameProps) {
  const { t } = useI18n();
  return (
    <FreePlayShell
      title={t('activity.shapefit.title')}
      instruction={t('activity.shapefit.instruction')}
      goal={SHAPES_IN_PLAY.length}
      onFinish={onFinish}
      onQuit={onQuit}
    >
      {({ touch, session }) => <FitBoard key={session} onTouch={touch} />}
    </FreePlayShell>
  );
}

function FitBoard({ onTouch }: { onTouch: () => void }) {
  const { t, language } = useI18n();
  const { text, colors } = useTheme();
  const area = useBoardArea();
  const window = useWindowDimensions();
  const [pieces] = useState(() => shuffle(SHAPES_IN_PLAY));
  const [placed, setPlaced] = useState<ShapeId[]>([]);

  useEffect(() => () => stopSpeaking(), []);

  const width = area?.width ?? window.width;
  const height = area?.height ?? window.height * 0.6;
  const gap = 12;
  // Deux rangées (trous + pièces), 4 formes par rangée ; place pour les libellés et le compteur.
  const size = Math.max(64, Math.min(130, Math.floor(Math.min((width - gap * 5) / 4, (height - 140) / 2))));

  const place = (shape: ShapeId) => {
    if (placed.includes(shape)) return;
    playSfx('drop');
    haptic('light');
    speak(t(SHAPE_LABEL_KEYS[shape] as TranslationKey), language);
    setPlaced((previous) => [...previous, shape]);
    onTouch();
  };

  return (
    <View style={styles.board}>
      <View style={[styles.row, { gap }]}>
        {SHAPES_IN_PLAY.map((shape) => (
          <View key={`hole-${shape}`} style={[styles.slot, { width: size, height: size }]}>
            <ShapeSVG
              shape={shape}
              size={size}
              fill="transparent"
              fillDeep="transparent"
              stroke={SLOT.deep}
              dashed
              strokeWidth={3}
            />
            {placed.includes(shape) ? <PlacedShape shape={shape} size={size} /> : null}
          </View>
        ))}
      </View>

      <View style={[styles.row, { gap }]}>
        {pieces.map((shape) => {
          const done = placed.includes(shape);
          return (
            <View key={`piece-${shape}`} style={{ width: size, alignItems: 'center' }}>
              <View style={{ opacity: done ? 0 : 1 }} pointerEvents={done ? 'none' : 'auto'}>
                <BounceButton
                  onPress={() => place(shape)}
                  accessibilityLabel={t('a11y.touchItem', { name: t(SHAPE_LABEL_KEYS[shape] as TranslationKey) })}
                >
                  <ShapeSVG shape={shape} size={size} fill={WOOD.fill} fillDeep={WOOD.deep} stroke={WOOD.stroke} glossy />
                </BounceButton>
              </View>
              <Text style={[text.label, { color: colors.inkSoft, marginTop: 4, opacity: done ? 0 : 1 }]}>
                {t(SHAPE_LABEL_KEYS[shape] as TranslationKey)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Pièce qui apparaît dans son trou avec un petit rebond. */
function PlacedShape({ shape, size }: { shape: ShapeId; size: number }) {
  const { reducedMotion } = useTheme();
  const scale = useRef(new Animated.Value(reducedMotion ? 1 : 0.4)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [reducedMotion, scale]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]} pointerEvents="none">
      <ShapeSVG shape={shape} size={size} fill={WOOD.fill} fillDeep={WOOD.deep} stroke={WOOD.stroke} glossy />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
