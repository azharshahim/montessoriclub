import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { speak } from '../../audio/speech';
import { pick } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { GameLayout, useBoardArea } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';
import { MAP_COLORS, MAP_H, MAP_NAMES, MAP_W, OUTLINES, outlinePath, type MapContinent } from './continents';

const POOL_BY_LEVEL: Record<number, MapContinent[]> = {
  1: ['africa', 'europe', 'oceania', 'southAmerica'],
  2: ['africa', 'europe', 'oceania', 'southAmerica', 'asia', 'northAmerica'],
  3: ['africa', 'europe', 'oceania', 'southAmerica', 'asia', 'northAmerica', 'antarctica'],
};
const ALL = Object.keys(OUTLINES) as MapContinent[];
const PATHS = Object.fromEntries(ALL.map((id) => [id, outlinePath(OUTLINES[id])])) as Record<MapContinent, string>;

/**
 * Module « La carte du monde » (9-12 ans).
 * L'enfant touche le continent demandé sur une carte colorée.
 * Niveaux 1-3 : de plus en plus de continents ; niveaux 4-5 : carte sans couleurs (tous les continents identiques).
 * Une erreur n'est jamais punie : le continent touché s'estompe et l'enfant réessaie.
 */
export function WorldMapGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t, language } = useI18n();
  const area = useBoardArea();
  const { width } = useWindowDimensions();
  const session = useGameSession({ rounds: 5, onFinish });

  const pool = POOL_BY_LEVEL[Math.min(Math.max(level, 1), 3)];
  const colored = level <= 3;
  const lastTarget = useRef<MapContinent | null>(null);

  const nextTarget = useCallback(() => {
    const options = pool.filter((c) => c !== lastTarget.current);
    const target = pick(options.length ? options : pool);
    lastTarget.current = target;
    return target;
  }, [pool]);

  const [target, setTarget] = useState<MapContinent>(() => nextTarget());
  const [wrong, setWrong] = useState<MapContinent[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setTarget(nextTarget());
    setWrong([]);
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.round, level]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const names = MAP_NAMES[language];

  const tap = (id: MapContinent) => {
    if (session.phase !== 'play' || wrong.includes(id)) return;
    if (id !== target) {
      playSfx('error', { volume: 0.4 });
      haptic('warning');
      session.registerMistake();
      onMistake?.();
      setWrong((w) => [...w, id]);
      setFeedback(t('game.almost'));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setFeedback(null), 2200);
      return;
    }
    playSfx('success');
    haptic('success');
    speak(names[target], language);
    session.celebrate();
    session.winRound();
  };

  const mapWidth = Math.min((area?.width ?? width) - 8, 760);
  const mapHeight = (mapWidth * MAP_H) / MAP_W;
  const question = useMemo(() => t('worldmap.question', { name: names[target] }), [names, t, target]);

  return (
    <>
      <GameLayout
        title={t('activity.worldmap.title')}
        instruction={feedback ?? question}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          <View style={[styles.mapBox, { width: mapWidth, height: mapHeight }]}>
            <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
              <Rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#BFE3FF" />
              {ALL.map((id) => {
                const isWrong = wrong.includes(id);
                const isTarget = session.phase === 'roundWon' && id === target;
                return (
                  <Path
                    key={id}
                    d={PATHS[id]}
                    fill={isWrong ? '#D8D2CB' : colored || isTarget ? MAP_COLORS[id] : '#8FD3A5'}
                    stroke="#FFFFFF"
                    strokeWidth={isTarget ? 2.4 : 1.2}
                    strokeLinejoin="round"
                    opacity={isWrong ? 0.6 : 1}
                    onPress={() => tap(id)}
                    accessibilityLabel={names[id]}
                  />
                );
              })}
            </Svg>
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={names[target]}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapBox: { borderRadius: 20, overflow: 'hidden', borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: '#BFE3FF' },
});
