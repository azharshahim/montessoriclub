import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { playSfx } from '../audio/engine';
import { computeStars } from '../engine/adaptive';
import { getGame } from '../games';
import type { PartialSession, RoundResult } from '../games/types';
import { useI18n } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import { useActiveProfile, useProfiles } from '../store/profiles';
import { RewardOverlay } from '../ui/RewardOverlay';

interface Summary {
  stars: number;
  mistakes: number;
  rounds: number;
}

/**
 * Hôte d'une activité : injecte le niveau adaptatif du profil, enregistre le
 * résultat de la session et affiche le bilan (toujours positif).
 */
export function GameScreen({ route, navigation }: ScreenProps<'Game'>) {
  const { t } = useI18n();
  const profile = useActiveProfile();
  const recordSession = useProfiles((s) => s.recordSession);
  const game = useMemo(() => getGame(route.params.gameId), [route.params.gameId]);

  const [runId, setRunId] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

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

  if (!game || !profile) return null;
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
    </View>
  );
}
