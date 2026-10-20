import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak, stopSpeaking } from '../../audio/speech';
import { useI18n, type TranslationKey } from '../../i18n';
import { objectColors, type ObjectColor } from '../../theme/palette';
import { useTheme } from '../../theme';
import { BounceButton } from '../../ui/BounceButton';
import { useBoardArea } from '../../ui/GameLayout';
import { FreePlayShell } from '../FreePlayShell';
import type { GameProps } from '../types';

const COLORS: { id: ObjectColor; key: TranslationKey }[] = [
  { id: 'red', key: 'color.red' },
  { id: 'blue', key: 'color.blue' },
  { id: 'yellow', key: 'color.yellow' },
  { id: 'green', key: 'color.green' },
  { id: 'orange', key: 'color.orange' },
  { id: 'purple', key: 'color.purple' },
];

const TOUCHES_TO_FINISH = 8;

/**
 * Module « Touche les couleurs » (0-2 ans).
 * De grosses billes colorées : chaque toucher énonce la couleur, sans erreur possible.
 * Le nom écrit reste affiché sous chaque bille (la couleur n'est jamais le seul indice).
 */
export function ColorTouchGame({ onFinish, onQuit }: GameProps) {
  const { t } = useI18n();
  return (
    <FreePlayShell
      title={t('activity.colortouch.title')}
      instruction={t('activity.colortouch.instruction')}
      goal={TOUCHES_TO_FINISH}
      onFinish={onFinish}
      onQuit={onQuit}
    >
      {({ touch, session }) => <ColorBoard key={session} onTouch={touch} />}
    </FreePlayShell>
  );
}

function ColorBoard({ onTouch }: { onTouch: () => void }) {
  const { t, language } = useI18n();
  const { text, colors } = useTheme();
  const area = useBoardArea();
  const window = useWindowDimensions();
  const [active, setActive] = useState<ObjectColor | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopSpeaking();
    },
    []
  );

  const gap = 12;
  const width = area?.width ?? window.width;
  const height = area?.height ?? window.height * 0.6;
  // 3 colonnes x 2 lignes ; 100 px réservés aux libellés et au compteur.
  const ball = Math.max(76, Math.min(150, Math.floor(Math.min((width - gap * 4) / 3, (height - gap * 3 - 100) / 2))));

  const press = (id: ObjectColor, key: TranslationKey) => {
    playSfx('pop');
    haptic('light');
    speak(t(key), language);
    setActive(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 1400);
    onTouch();
  };

  return (
    <View style={[styles.grid, { gap }]}>
      {COLORS.map(({ id, key }) => (
        <View key={id} style={styles.cell}>
          <BounceButton onPress={() => press(id, key)} accessibilityLabel={t('a11y.touchItem', { name: t(key) })}>
            <ColorBall color={id} size={ball} highlighted={active === id} />
          </BounceButton>
          <Text style={[text.label, { color: active === id ? colors.coral : colors.inkSoft, marginTop: 6 }]}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );
}

function ColorBall({ color, size, highlighted }: { color: ObjectColor; size: number; highlighted: boolean }) {
  const c = objectColors[color];
  const gradientId = `cb-${color}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={gradientId} cx="0.35" cy="0.3" r="0.85">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.55" stopColor={c.base} />
          <Stop offset="1" stopColor={c.deep} />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="54" r="40" fill="#000000" opacity="0.1" />
      <Circle
        cx="50"
        cy="50"
        r="42"
        fill={`url(#${gradientId})`}
        stroke={highlighted ? '#FFFFFF' : c.deep}
        strokeWidth={highlighted ? 5 : 2}
      />
      <Ellipse cx="36" cy="32" rx="14" ry="9" fill="#FFFFFF" opacity="0.5" transform="rotate(-28 36 32)" />
    </Svg>
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
});
