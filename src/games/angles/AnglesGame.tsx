import React from 'react';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { pick, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

type Kind = 'acute' | 'right' | 'obtuse';
const NAMES: Record<'fr' | 'en' | 'ar', Record<Kind, string>> = {
  fr: { acute: 'Aigu', right: 'Droit', obtuse: 'Obtus' },
  en: { acute: 'Acute', right: 'Right', obtuse: 'Obtuse' },
  ar: { acute: 'حاد', right: 'قائم', obtuse: 'منفرج' },
};

function kindOf(deg: number): Kind {
  return deg < 90 ? 'acute' : deg === 90 ? 'right' : 'obtuse';
}

/** Angle dessiné : sommet en bas à gauche, un bras à l'horizontale, l'autre tourné de `deg`. */
function AngleFigure({ deg, rotation }: { deg: number; rotation: number }) {
  const size = 200;
  const cx = 100;
  const cy = 120;
  const len = 78;
  const rad = (a: number) => (a * Math.PI) / 180;
  const a0 = -rotation; // bras de départ
  const a1 = -(rotation + deg); // bras tourné
  const p0 = { x: cx + len * Math.cos(rad(a0)), y: cy + len * Math.sin(rad(a0)) };
  const p1 = { x: cx + len * Math.cos(rad(a1)), y: cy + len * Math.sin(rad(a1)) };
  const r = 26;
  const s = { x: cx + r * Math.cos(rad(a0)), y: cy + r * Math.sin(rad(a0)) };
  const e = { x: cx + r * Math.cos(rad(a1)), y: cy + r * Math.sin(rad(a1)) };
  const isRight = deg === 90;
  const u0 = { x: Math.cos(rad(a0)), y: Math.sin(rad(a0)) };
  const u1 = { x: Math.cos(rad(a1)), y: Math.sin(rad(a1)) };
  const q = 16;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}>
      <Rect x="4" y="4" width="192" height="192" rx="22" fill="#FFFFFF" opacity={0.7} />
      {isRight ? (
        <Path
          d={`M${cx + q * u0.x} ${cy + q * u0.y} L${cx + q * (u0.x + u1.x)} ${cy + q * (u0.y + u1.y)} L${cx + q * u1.x} ${cy + q * u1.y}`}
          stroke="#F59A4B"
          strokeWidth="4"
          fill="none"
        />
      ) : (
        <Path d={`M${s.x} ${s.y} A${r} ${r} 0 0 0 ${e.x} ${e.y}`} stroke="#F59A4B" strokeWidth="4" fill="none" />
      )}
      <Line x1={cx} y1={cy} x2={p0.x} y2={p0.y} stroke="#4E8FE0" strokeWidth="7" strokeLinecap="round" />
      <Line x1={cx} y1={cy} x2={p1.x} y2={p1.y} stroke="#4E8FE0" strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Module « Les angles » (9-12 ans).
 * Niveaux 1-3 : reconnaître angle aigu, droit ou obtus (le carré marque l'angle droit).
 * Niveaux 4-5 : estimer la mesure en degrés parmi trois propositions.
 */
export function AnglesGame(props: GameProps) {
  const { t, language } = useI18n();
  const lang = language as 'fr' | 'en' | 'ar';

  const makeRound = (level: number): QuizRound => {
    const rotation = pick([0, 20, 160, 200, 340]);

    if (level >= 4) {
      const step = level === 4 ? 30 : 15;
      const candidates: number[] = [];
      for (let v = 30; v <= 150; v += step) candidates.push(v);
      const deg = pick(candidates);
      const gap = level === 4 ? 30 : 30;
      const wrong = shuffle([deg - gap, deg + gap, deg - 2 * gap, deg + 2 * gap].filter((v) => v >= 15 && v <= 175)).slice(0, 2);
      const choices: QuizChoice[] = shuffle([deg, ...wrong]).map((v) => ({
        id: String(v),
        correct: v === deg,
        label: `${v}°`,
        a11y: `${v}°`,
      }));
      return {
        question: t('angles.degQuestion'),
        prompt: <AngleFigure deg={deg} rotation={rotation} />,
        choices,
        success: `${deg}°`,
      };
    }

    const pools: Record<number, number[]> = {
      1: [45, 90, 135],
      2: [30, 60, 90, 120, 150],
      3: [40, 75, 90, 105, 140],
    };
    const deg = pick(pools[Math.min(Math.max(level, 1), 3)]);
    const correct = kindOf(deg);
    const choices: QuizChoice[] = shuffle(['acute', 'right', 'obtuse'] as Kind[]).map((k) => ({
      id: k,
      correct: k === correct,
      label: NAMES[lang][k],
      a11y: NAMES[lang][k],
    }));
    return {
      question: t('angles.kindQuestion'),
      prompt: <AngleFigure deg={deg} rotation={rotation} />,
      choices,
      success: NAMES[lang][correct],
    };
  };

  return <QuizGame {...props} title={t('activity.angles.title')} rounds={5} makeRound={makeRound} />;
}
