import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { playSfx } from '../audio/engine';
import { haptic } from '../audio/haptics';
import { speak } from '../audio/speech';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { GameLayout } from '../ui/GameLayout';
import { RewardOverlay } from '../ui/RewardOverlay';
import type { GameProps } from './types';
import { useGameSession } from './useGameSession';

export interface QuizChoice {
  id: string;
  correct: boolean;
  /** Texte affiché dans le bouton (ou `node` pour un contenu graphique). */
  label?: string;
  node?: React.ReactNode;
  /** Libellé lu par les lecteurs d'écran. */
  a11y: string;
}

export interface QuizRound {
  /** Consigne affichée par la mascotte pour cette manche. */
  question: string;
  /** Matériel de la manche (perles, horloge, pièces, mot…). */
  prompt: React.ReactNode;
  choices: QuizChoice[];
  /** Phrase lue à voix haute et affichée quand la manche est réussie. */
  success?: string;
}

interface QuizGameProps extends GameProps {
  title: string;
  rounds: number;
  /** Génère une manche selon le niveau (1-5) ; appelé à chaque nouvelle manche. */
  makeRound: (level: number) => QuizRound;
}

/**
 * Socle des activités à choix multiple (6-8 ans).
 * - Aucun chronomètre : l'enfant réfléchit aussi longtemps qu'il veut.
 * - Une erreur n'est jamais punie : la réponse se grise, un message doux encourage,
 *   et l'enfant peut réessayer jusqu'à trouver.
 */
export function QuizGame({ title, rounds, makeRound, level, onFinish, onMistake, onQuit }: QuizGameProps) {
  const { t, language } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const { width, height } = useWindowDimensions();
  const compact = height < 540;
  const session = useGameSession({ rounds, onFinish });

  const makeRoundRef = useRef(makeRound);
  makeRoundRef.current = makeRound;

  const [round, setRound] = useState<QuizRound>(() => makeRound(level));
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  // Nouvelle manche : nouveau matériel, aucune erreur en mémoire.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setRound(makeRoundRef.current(level));
    setWrong([]);
    setFeedback(null);
  }, [session.round, level]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  // Balancement doux du matériel en cas d'erreur (jamais de rouge agressif).
  useEffect(() => {
    if (shake === 0) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.5, duration: 90, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [anim, shake]);

  const answer = useCallback(
    (choice: QuizChoice) => {
      if (session.phase !== 'play' || wrong.includes(choice.id)) return;

      if (!choice.correct) {
        playSfx('error', { volume: 0.45 });
        haptic('warning');
        session.registerMistake();
        onMistake?.();
        setWrong((previous) => [...previous, choice.id]);
        setShake((s) => s + 1);
        setFeedback(t('game.almost'));
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setFeedback(null), 2200);
        return;
      }

      playSfx('success');
      haptic('success');
      if (round.success) speak(round.success, language);
      session.celebrate();
      session.winRound();
    },
    [language, onMistake, round.success, session, t, wrong]
  );

  const translateX = anim.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  return (
    <>
      <GameLayout
        title={title}
        instruction={round.question}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() =>
          onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })
        }
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.playArea}>
          <Animated.View style={[styles.prompt, { transform: [{ translateX }], maxWidth: Math.min(width, 860) }]}>
            {round.prompt}
          </Animated.View>

          <View style={[styles.options, { maxWidth: Math.min(width, 720) }]}>
            {round.choices.map((choice) => {
              const isWrong = wrong.includes(choice.id);
              return (
                <Pressable
                  key={choice.id}
                  onPress={() => answer(choice)}
                  disabled={isWrong || session.phase !== 'play'}
                  accessibilityRole="button"
                  accessibilityLabel={choice.a11y}
                  accessibilityState={{ disabled: isWrong }}
                  style={({ pressed }) => [
                    styles.option,
                    compact && styles.optionCompact,
                    shadow.soft,
                    {
                      backgroundColor: isWrong ? colors.sand : colors.surface,
                      borderColor: colors.sand,
                      borderRadius: radius.lg,
                      opacity: isWrong ? 0.45 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  {choice.node ?? <Text style={[text.h2, { color: colors.ink, fontSize: 26 }]}>{choice.label}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={round.success}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

const styles = StyleSheet.create({
  playArea: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 6,
  },
  option: {
    minWidth: 92,
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  optionCompact: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
