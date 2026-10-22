import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { ObjectIllustration } from '../../ui/illustrations/objects';
import type { ReadingWord } from './words';

interface WordPromptProps {
  word: ReadingWord;
  /** Syllabes affichées en cases ; la case `hiddenIndex` est cachée (« ? »). */
  showSyllables?: boolean;
  hiddenIndex?: number;
}

/** Image du mot, avec ses syllabes en cases quand l'activité le demande. */
export function WordPrompt({ word, showSyllables = false, hiddenIndex }: WordPromptProps) {
  const { colors, radius, text } = useTheme();
  return (
    <View style={styles.wrap}>
      <ObjectIllustration id={word.id} size={110} />
      {showSyllables ? (
        <View style={styles.row} accessible={false}>
          {word.syllables.map((syllable, index) => {
            const hidden = index === hiddenIndex;
            return (
              <View
                key={`${syllable}-${index}`}
                style={[
                  styles.cell,
                  {
                    borderRadius: radius.md,
                    borderColor: hidden ? colors.coral : colors.sand,
                    borderStyle: hidden ? 'dashed' : 'solid',
                    backgroundColor: hidden ? 'transparent' : colors.surface,
                  },
                ]}
              >
                <Text style={[text.h2, { color: hidden ? colors.coral : colors.ink, fontSize: 26 }]}>
                  {hidden ? '?' : syllable}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  cell: {
    minWidth: 56,
    minHeight: 52,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
