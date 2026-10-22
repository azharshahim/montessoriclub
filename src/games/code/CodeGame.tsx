import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { playSfx } from '../../audio/engine';
import { haptic } from '../../audio/haptics';
import { randInt } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { GameLayout, useBoardArea } from '../../ui/GameLayout';
import { RewardOverlay } from '../../ui/RewardOverlay';
import type { GameProps } from '../types';
import { useGameSession } from '../useGameSession';

/** 0 = nord, 1 = est, 2 = sud, 3 = ouest. */
type Dir = 0 | 1 | 2 | 3;
type Cmd = 'F' | 'L' | 'R';
type Pose = { x: number; y: number; d: Dir };
type Level = { n: number; start: Pose; star: { x: number; y: number }; rocks: { x: number; y: number }[]; maxBlocks: number };

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const FORWARDS_BY_LEVEL = [2, 3, 4, 5, 6];
const SIZE_BY_LEVEL = [3, 4, 4, 5, 5];
const ROCKS_BY_LEVEL = [0, 1, 2, 3, 4];

const CMD_META: Record<Cmd, { glyph: string; color: string; key: 'code.forward' | 'code.left' | 'code.right' }> = {
  F: { glyph: '⬆', color: '#4FBF8B', key: 'code.forward' },
  L: { glyph: '↺', color: '#4E8FE0', key: 'code.left' },
  R: { glyph: '↻', color: '#F59A4B', key: 'code.right' },
};

function step(pose: Pose, cmd: Cmd, n: number, rocks: Set<string>): Pose & { blocked: boolean } {
  if (cmd === 'L') return { ...pose, d: ((pose.d + 3) % 4) as Dir, blocked: false };
  if (cmd === 'R') return { ...pose, d: ((pose.d + 1) % 4) as Dir, blocked: false };
  const x = pose.x + DX[pose.d];
  const y = pose.y + DY[pose.d];
  if (x < 0 || y < 0 || x >= n || y >= n || rocks.has(`${x},${y}`)) return { ...pose, blocked: true };
  return { x, y, d: pose.d, blocked: false };
}

/**
 * Génère un parcours TOUJOURS solvable : on tire au hasard une marche du robot,
 * l'étoile est placée à son arrivée et les rochers hors du chemin.
 */
function makeLevel(level: number): Level {
  const lv = Math.min(Math.max(level, 1), 5);
  const n = SIZE_BY_LEVEL[lv - 1];
  const wantedForwards = FORWARDS_BY_LEVEL[lv - 1];
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const start: Pose = { x: 0, y: n - 1, d: 0 };
    let pose = start;
    const visited = new Set<string>([`${pose.x},${pose.y}`]);
    const program: Cmd[] = [];
    let forwards = 0;
    let guard = 0;
    while (forwards < wantedForwards && guard < 60) {
      guard += 1;
      const wantForward = Math.random() < 0.62;
      const ahead = step(pose, 'F', n, new Set());
      if (wantForward && !ahead.blocked) {
        pose = { x: ahead.x, y: ahead.y, d: pose.d };
        visited.add(`${pose.x},${pose.y}`);
        program.push('F');
        forwards += 1;
      } else {
        const turn: Cmd = Math.random() < 0.5 ? 'L' : 'R';
        const last = program[program.length - 1];
        if ((last === 'L' && turn === 'R') || (last === 'R' && turn === 'L')) continue;
        pose = step(pose, turn, n, new Set());
        program.push(turn);
      }
    }
    if (forwards < wantedForwards || (pose.x === start.x && pose.y === start.y)) continue;
    const free: { x: number; y: number }[] = [];
    for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) if (!visited.has(`${x},${y}`)) free.push({ x, y });
    const rocks: { x: number; y: number }[] = [];
    while (rocks.length < Math.min(ROCKS_BY_LEVEL[lv - 1], free.length)) {
      const cell = free.splice(randInt(0, free.length - 1), 1)[0];
      rocks.push(cell);
    }
    return { n, start, star: { x: pose.x, y: pose.y }, rocks, maxBlocks: program.length + (lv >= 4 ? 2 : 6) };
  }
  // Repli : trajet droit.
  return { n: 3, start: { x: 0, y: 2, d: 0 }, star: { x: 0, y: 0 }, rocks: [], maxBlocks: 8 };
}

/**
 * Module « Code par blocs » (9-12 ans).
 * Objectif unique : programmer une suite de blocs pour guider le robot jusqu'à l'étoile.
 * Aucune pénalité : si le robot n'y arrive pas, il revient au départ et l'enfant corrige son programme.
 */
export function CodeGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const { t } = useI18n();
  const { colors, radius, shadow, text } = useTheme();
  const area = useBoardArea();
  const session = useGameSession({ rounds: 5, onFinish });

  const [lvl, setLvl] = useState<Level>(() => makeLevel(level));
  const [program, setProgram] = useState<Cmd[]>([]);
  const [pose, setPose] = useState<Pose>(lvl.start);
  const [running, setRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const first = useRef(true);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    clearTimers();
    const next = makeLevel(level);
    setLvl(next);
    setPose(next.start);
    setProgram([]);
    setRunning(false);
    setActiveIndex(null);
    setFeedback(null);
  }, [session.round, level]);

  const rockSet = useMemo(() => new Set(lvl.rocks.map((r) => `${r.x},${r.y}`)), [lvl]);

  const add = (cmd: Cmd) => {
    if (running || session.phase !== 'play' || program.length >= lvl.maxBlocks) return;
    playSfx('drop', { volume: 0.4 });
    haptic('light');
    setFeedback(null);
    setProgram((p) => [...p, cmd]);
  };

  const run = useCallback(() => {
    if (running || program.length === 0 || session.phase !== 'play') return;
    setRunning(true);
    setFeedback(null);
    let current = lvl.start;
    setPose(current);
    const poses: Pose[] = [];
    program.forEach((cmd) => {
      const next = step(current, cmd, lvl.n, rockSet);
      current = { x: next.x, y: next.y, d: next.d };
      poses.push(current);
    });
    poses.forEach((p, i) => {
      timers.current.push(
        setTimeout(() => {
          setActiveIndex(i);
          setPose(p);
          playSfx('drop', { volume: 0.25 });
        }, 450 * (i + 1))
      );
    });
    const reached = poses.findIndex((p) => p.x === lvl.star.x && p.y === lvl.star.y);
    const endAt = reached >= 0 ? reached : poses.length - 1;
    timers.current.push(
      setTimeout(() => {
        setActiveIndex(null);
        if (reached >= 0) {
          setPose(poses[reached]);
          playSfx('success');
          haptic('success');
          session.celebrate();
          session.winRound();
        } else {
          playSfx('error', { volume: 0.4 });
          haptic('warning');
          session.registerMistake();
          onMistake?.();
          setFeedback(t('code.tryAgain'));
          setPose(lvl.start);
          setRunning(false);
        }
      }, 450 * (endAt + 1) + 500)
    );
  }, [lvl, onMistake, program, rockSet, running, session, t]);

  const boardAvail = Math.min((area?.width ?? 340) - 8, (area?.height ?? 520) * 0.5);
  const cell = Math.max(40, Math.min(84, Math.floor(boardAvail / lvl.n)));
  const boardPx = cell * lvl.n;

  return (
    <>
      <GameLayout
        title={t('activity.code.title')}
        instruction={feedback ?? t('activity.code.instruction')}
        feedback={feedback}
        mood={feedback ? 'thinking' : 'idle'}
        onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: Math.max(0, session.round - 1) })}
        round={session.round}
        rounds={session.rounds}
        stars={session.starsEarned}
        fireKey={session.fireKey}
      >
        <View style={styles.area}>
          {/* Terrain */}
          <View style={[styles.board, shadow.soft, { width: boardPx, height: boardPx, borderRadius: radius.md }]}>
            {Array.from({ length: lvl.n * lvl.n }).map((_, i) => {
              const x = i % lvl.n;
              const y = Math.floor(i / lvl.n);
              const isStar = x === lvl.star.x && y === lvl.star.y;
              const isRock = rockSet.has(`${x},${y}`);
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x * cell,
                    top: y * cell,
                    width: cell,
                    height: cell,
                    backgroundColor: (x + y) % 2 === 0 ? '#BDF0C4' : '#9EE5A9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isStar ? <Text style={{ fontSize: cell * 0.6 }}>⭐</Text> : null}
                  {isRock ? <Text style={{ fontSize: cell * 0.55 }}>🪨</Text> : null}
                </View>
              );
            })}
            <View
              style={{
                position: 'absolute',
                left: pose.x * cell,
                top: pose.y * cell,
                width: cell,
                height: cell,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="robot"
            >
              <Text style={{ fontSize: cell * 0.58 }}>🤖</Text>
              <View
                style={{
                  position: 'absolute',
                  width: cell,
                  height: cell,
                  transform: [{ rotate: `${pose.d * 90}deg` }],
                  alignItems: 'center',
                }}
              >
                <View style={[styles.nose, { borderBottomColor: colors.coral }]} />
              </View>
            </View>
          </View>

          {/* Programme */}
          <View style={[styles.program, { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.lg, borderColor: colors.sand }]}>
            {program.length === 0 ? (
              <Text style={[text.caption, { color: colors.inkFaint }]}>{t('code.empty')}</Text>
            ) : (
              program.map((cmd, i) => (
                <View
                  key={i}
                  style={[
                    styles.chip,
                    { backgroundColor: CMD_META[cmd].color, borderColor: activeIndex === i ? colors.ink : 'transparent' },
                  ]}
                >
                  <Text style={styles.chipText}>{CMD_META[cmd].glyph}</Text>
                </View>
              ))
            )}
          </View>

          {/* Blocs + actions */}
          <View style={styles.row}>
            {(['F', 'L', 'R'] as Cmd[]).map((cmd) => (
              <Pressable
                key={cmd}
                onPress={() => add(cmd)}
                accessibilityRole="button"
                accessibilityLabel={t(CMD_META[cmd].key)}
                style={({ pressed }) => [
                  styles.block,
                  shadow.soft,
                  { backgroundColor: CMD_META[cmd].color, opacity: running ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <Text style={styles.blockGlyph}>{CMD_META[cmd].glyph}</Text>
                <Text style={styles.blockLabel}>{t(CMD_META[cmd].key)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <Pressable
              onPress={() => !running && setProgram((p) => p.slice(0, -1))}
              accessibilityRole="button"
              accessibilityLabel={t('code.undo')}
              style={[styles.small, { backgroundColor: colors.surface, borderColor: colors.sand }]}
            >
              <Text style={[text.label, { color: colors.ink }]}>↶ {t('code.undo')}</Text>
            </Pressable>
            <Pressable
              onPress={() => !running && setProgram([])}
              accessibilityRole="button"
              accessibilityLabel={t('code.clear')}
              style={[styles.small, { backgroundColor: colors.surface, borderColor: colors.sand }]}
            >
              <Text style={[text.label, { color: colors.ink }]}>✕ {t('code.clear')}</Text>
            </Pressable>
            <Pressable
              onPress={run}
              accessibilityRole="button"
              accessibilityLabel={t('code.go')}
              style={({ pressed }) => [
                styles.go,
                shadow.soft,
                { backgroundColor: colors.coral, opacity: running || program.length === 0 ? 0.5 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Text style={styles.goText}>▶ {t('code.go')}</Text>
            </Pressable>
          </View>
        </View>
      </GameLayout>

      <RewardOverlay
        visible={session.phase === 'roundWon'}
        title={t('game.correct')}
        subtitle={t('code.reached')}
        stars={Math.min(5, session.starsEarned)}
        primaryLabel={session.isLastRound ? t('game.levelDone') : t('game.nextRound')}
        onPrimary={session.goNextRound}
        fireKey={session.fireKey}
      />
    </>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', gap: 6 },
  board: { overflow: 'hidden', backgroundColor: '#9EE5A9', borderWidth: 3, borderColor: '#62D084' },
  nose: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 1,
  },
  program: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    minHeight: 48,
    width: '100%',
    maxWidth: 520,
    padding: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  chipText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
  block: { minWidth: 92, minHeight: 66, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  blockGlyph: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  blockLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  small: { minHeight: 48, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  go: { minHeight: 52, paddingHorizontal: 22, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  goText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
