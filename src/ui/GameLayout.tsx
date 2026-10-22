import React, { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { MascotMood } from './Mascot';
import { MascotGuide } from './MascotGuide';
import { ProgressBar } from './ProgressBar';
import { Screen } from './Screen';
import { StarBurst } from './StarBurst';
import { Icon } from './Icon';
import { useTheme } from '../theme';

/** Dimensions réelles de la zone de jeu (hors en-tête et mascotte). */
export type BoardArea = { width: number; height: number };

const BoardAreaContext = React.createContext<BoardArea | null>(null);

/**
 * Taille disponible pour le plateau.
 * Les modules s'en servent pour dimensionner leurs pièces : sur un petit
 * téléphone ou en paysage, le plateau doit tenir dans la place restante et
 * non dans une fraction arbitraire de la hauteur de l'écran.
 */
export function useBoardArea(): BoardArea | null {
  return React.useContext(BoardAreaContext);
}

interface GameLayoutProps {
  title: string;
  /** Consigne de base, énoncée par la mascotte. */
  instruction: string;
  /** Message temporaire (encouragement) qui remplace la consigne. */
  feedback?: string | null;
  mood?: MascotMood;
  onBack: () => void;
  round: number;
  rounds: number;
  stars: number;
  fireKey: number;
  children: React.ReactNode;
}

/** Pilule « étoiles gagnées » de l'en-tête. */
export function StarPill({ count }: { count: number }) {
  const { colors, text, shadow, radius } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        shadow.soft,
        { backgroundColor: colors.surface, borderRadius: radius.pill, borderColor: colors.sand },
      ]}
      accessibilityLabel={`${count}`}
    >
      <Icon name="star" size={16} color={colors.yellow} />
      <Text style={[text.label, { color: colors.ink }]}>{count}</Text>
    </View>
  );
}

/**
 * Mise en page commune des activités :
 * en-tête, progression en points (jamais de chrono), mascotte guide, plateau.
 */
export function GameLayout({
  title,
  instruction,
  feedback,
  mood = 'idle',
  onBack,
  round,
  rounds,
  stars,
  fireKey,
  children,
}: GameLayoutProps) {
  const { height } = useWindowDimensions();
  const compact = height < 540;
  const { colors } = useTheme();
  const [area, setArea] = useState<BoardArea | null>(null);

  const handleBoardLayout = (event: { nativeEvent: { layout: BoardArea } }) => {
    const { width, height: boardHeight } = event.nativeEvent.layout;
    if (width < 1 || boardHeight < 1) return;
    setArea((previous) =>
      previous && Math.abs(previous.width - width) < 1 && Math.abs(previous.height - boardHeight) < 1
        ? previous
        : { width, height: boardHeight }
    );
  };

  return (
    <Screen
      header={{
        title,
        onBack,
        centerTitle: false,
        right: <StarPill count={stars} />,
      }}
      scene="meadow"
      contentStyle={{ gap: compact ? 6 : 10 }}
    >
      <View style={styles.progress}>
        <ProgressBar dots dotsCount={rounds} value={round / rounds} color={colors.green} />
        <Text style={{ color: colors.inkFaint, fontSize: 12, fontWeight: '700' }}>
          {round}/{rounds}
        </Text>
      </View>

      <View style={styles.mascot}>
        <MascotGuide
          message={feedback ?? instruction}
          mood={mood}
          size={compact ? 54 : 84}
          hideBubble={false}
        />
      </View>

      <View style={styles.board} onLayout={handleBoardLayout}>
        <BoardAreaContext.Provider value={area}>{children}</BoardAreaContext.Provider>
      </View>
      <StarBurst fireKey={fireKey} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mascot: {
    alignItems: 'center',
  },
  board: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    minWidth: 54,
    justifyContent: 'center',
  },
});
