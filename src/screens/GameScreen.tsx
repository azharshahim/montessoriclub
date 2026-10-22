import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { playSfx } from '../audio/engine';
import { stopSpeaking } from '../audio/speech';
import { computeStars } from '../engine/adaptive';
import { getGame } from '../games';
import type { PartialSession, RoundResult } from '../games/types';
import { useI18n } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import { dayKey, useActiveProfile, useProfiles } from '../store/profiles';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { RewardOverlay } from '../ui/RewardOverlay';
import { Screen } from '../ui/Screen';

interface Summary {
  stars: number;
  mistakes: number;
  rounds: number;
}

/**
 * Hôte d'une activité : injecte le niveau adaptatif du profil, enregistre le
 * résultat de la session et affiche le bilan (toujours positif).
 *
 * Il veille aussi à la limite de temps choisie par les parents : lorsque la
 * limite est atteinte en cours de jeu, l'activité se termine proprement sur un
 * message de repos, sans jamais couper brutalement l'enfant.
 */
export function GameScreen({ route, navigation }: ScreenProps<'Game'>) {
  const { t } = useI18n();
  const { colors, text } = useTheme();
  const profile = useActiveProfile();
  const recordSession = useProfiles((s) => s.recordSession);
  const game = useMemo(() => getGame(route.params.gameId), [route.params.gameId]);

  const [runId, setRunId] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const summaryOpen = useRef(false);
  summaryOpen.current = summary !== null;

  const limit = profile?.dailyLimitMinutes ?? null;

  // Contrôle régulier : la limite peut être atteinte pendant une partie.
  useEffect(() => {
    if (!profile || limit === null) return;
    let stopped = false;
    const check = () => {
      if (stopped || summaryOpen.current) return;
      const minutes = useProfiles.getState().profiles.find((p) => p.id === profile.id)?.playDays.find((d) => d.date === dayKey())?.minutes ?? 0;
      if (minutes >= limit) {
        stopped = true;
        stopSpeaking();
        setTimeUp(true);
      }
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [limit, profile]);

  // Niveau de départ : progression enregistrée, jamais en dessous du plancher
  // défini pour la tranche d'âge (ex. 6-8 ans sur les puzzles).
  const rawLevel = profile && game ? profile.progress[game.id]?.level ?? 1 : 1;
  const minLevel = profile && game ? game.minLevelByAge?.[profile.ageBand] ?? 1 : 1;
  const level = Math.min(game?.maxLevel ?? 1, Math.max(rawLevel, minLevel));

  const handleFinish = useCallback(
    (result: RoundResult) => {
      if (!profile || !game) return;
      const stars = computeStars(result);
      recordSession({
        profileId: profile.id,
        gameId: game.id,
        stars,
        mistakes: result.mistakes,
        successes: result.rounds,
        maxLevel: game.maxLevel,
        minLevel,
      });
      setSummary({ stars, mistakes: result.mistakes, rounds: result.rounds });
      playSfx('celebrate');
    },
    [game, minLevel, profile, recordSession]
  );

  // Filet de sécurité : une route inconnue ou un profil supprimé ne doit jamais
  // laisser un écran blanc.
  if (!game || !profile) {
    return (
      <Screen header={{ title: t('app.name'), onBack: () => navigation.goBack() }} centered>
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>
            {t('game.unavailable')}
          </Text>
          <Button label={t('game.backHome')} onPress={() => navigation.goBack()} size="lg" />
        </View>
      </Screen>
    );
  }

  const Game = game.Component;

  return (
    <View style={{ flex: 1 }}>
      <Game
        key={`${game.id}-${runId}`}
        level={level}
        onFinish={handleFinish}
        onMistake={() => undefined}
        onQuit={(partial: PartialSession) => {
          if (partial.stars > 0 || partial.mistakes > 0) {
            recordSession({
              profileId: profile.id,
              gameId: game.id,
              stars: partial.stars,
              mistakes: partial.mistakes,
              successes: partial.rounds,
              maxLevel: game.maxLevel,
              adaptLevel: false,
            });
          }
          navigation.goBack();
        }}
      />

      <RewardOverlay
        visible={summary !== null}
        title={t('game.sessionDoneTitle')}
        subtitle={
          summary
            ? `${t('game.sessionStars', { count: summary.stars })}${
                summary.mistakes === 0 ? ` • ${t('game.noMistakes')}` : ''
              }`
            : undefined
        }
        stars={summary ? Math.min(5, summary.stars) : 0}
        primaryLabel={t('game.replay')}
        onPrimary={() => {
          setSummary(null);
          setRunId((id) => id + 1);
        }}
        secondaryLabel={t('game.backHome')}
        onSecondary={() => {
          setSummary(null);
          navigation.goBack();
        }}
        fireKey={runId + 1}
      />

      <RewardOverlay
        visible={timeUp && summary === null}
        title={t('home.restTitle')}
        subtitle={t('home.restText')}
        primaryLabel={t('game.backHome')}
        onPrimary={() => {
          setTimeUp(false);
          navigation.goBack();
        }}
        emojiFallback
        speakOnOpen
      />
    </View>
  );
}
