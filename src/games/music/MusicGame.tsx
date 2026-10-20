import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { playSfx, type SfxName } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { useI18n } from '../../i18n';
import { objectColors, type ObjectColor } from '../../theme/palette';
import { BounceButton } from '../../ui/BounceButton';
import { useBoardArea } from '../../ui/GameLayout';
import { FreePlayShell } from '../FreePlayShell';
import type { GameProps } from '../types';

const BARS: { note: SfxName; color: ObjectColor }[] = [
  { note: 'note1', color: 'red' },
  { note: 'note2', color: 'orange' },
  { note: 'note3', color: 'yellow' },
  { note: 'note4', color: 'green' },
  { note: 'note5', color: 'blue' },
];

const TOUCHES_TO_FINISH = 12;

/**
 * Module « Petite musique » (0-2 ans).
 * Un xylophone en gamme pentatonique : toutes les notes sonnent juste ensemble,
 * l'enfant ne peut donc pas « se tromper ».
 */
export function MusicGame({ onFinish, onQuit }: GameProps) {
  const { t } = useI18n();
  return (
    <FreePlayShell
      title={t('activity.music.title')}
      instruction={t('activity.music.instruction')}
      goal={TOUCHES_TO_FINISH}
      onFinish={onFinish}
      onQuit={onQuit}
    >
      {({ touch, session }) => <Xylophone key={session} onTouch={touch} />}
    </FreePlayShell>
  );
}

function Xylophone({ onTouch }: { onTouch: () => void }) {
  const { t } = useI18n();
  const area = useBoardArea();
  const window = useWindowDimensions();

  const width = area?.width ?? window.width;
  const height = area?.height ?? window.height * 0.6;
  const gap = 10;
  const barWidth = Math.max(48, Math.min(110, Math.floor((width - gap * (BARS.length + 1)) / BARS.length)));
  // La barre la plus grave est la plus longue, comme sur un vrai xylophone.
  const maxHeight = Math.max(150, height - 90);

  const press = (note: SfxName) => {
    playSfx(note);
    haptic('light');
    onTouch();
  };

  return (
    <View style={[styles.row, { gap }]}>
      {BARS.map(({ note, color }, index) => {
        const c = objectColors[color];
        const barHeight = Math.round(maxHeight * (1 - index * 0.11));
        return (
          <BounceButton key={note} onPress={() => press(note)} accessibilityLabel={t('a11y.noteBar', { n: index + 1 })}>
            <View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: c.base,
                  borderColor: c.deep,
                },
              ]}
            >
              <View style={[styles.shine, { backgroundColor: c.light }]} />
              <View style={[styles.screw, { backgroundColor: c.deep }]} />
              <View style={[styles.screw, styles.screwBottom, { backgroundColor: c.deep }]} />
            </View>
          </BounceButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 36,
  },
  bar: {
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 10,
    bottom: 8,
    borderRadius: 6,
    opacity: 0.55,
  },
  screw: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  screwBottom: {
    marginTop: 'auto',
  },
});
