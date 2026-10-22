import React from 'react';
import { StyleSheet, View } from 'react-native';

import { randInt, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';
import { RectangleFigure, RegularPolygon } from './Figures';

/** Noms des polygones à 3-8 côtés, par langue. */
const POLYGON_NAMES: Record<'fr' | 'en' | 'ar', Record<number, string>> = {
  fr: { 3: 'triangle', 4: 'quadrilatère', 5: 'pentagone', 6: 'hexagone', 7: 'heptagone', 8: 'octogone' },
  en: { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon' },
  ar: {
    3: 'مثلث',
    4: 'رباعي الأضلاع',
    5: 'خماسي الأضلاع',
    6: 'سداسي الأضلاع',
    7: 'سباعي الأضلاع',
    8: 'ثماني الأضلاع',
  },
};

function textChoices(correct: string, wrong: string[]): QuizChoice[] {
  return shuffle([correct, ...wrong]).map((value) => ({
    id: value,
    correct: value === correct,
    label: value,
    a11y: value,
  }));
}

/** Distincts, strictement positifs, et différents de la bonne réponse. */
function pickWrong(correct: number, candidates: number[]): number[] {
  const unique = Array.from(new Set(candidates.filter((c) => c > 0 && c !== correct)));
  const wrong = shuffle(unique).slice(0, 2);
  let delta = 1;
  while (wrong.length < 2) {
    const value = correct + delta;
    if (value !== correct && !wrong.includes(value)) wrong.push(value);
    delta += 1;
  }
  return wrong;
}

/**
 * Module « La géométrie » (9-12 ans).
 * Niveau 1 : compter les côtés. 2 : nommer le polygone. 3 : périmètre d'un rectangle.
 * 4 : aire avec quadrillage. 5 : périmètre ou aire sans quadrillage.
 * Les fausses réponses reprennent les confusions classiques (aire ↔ périmètre).
 */
export function GeometryGame(props: GameProps) {
  const { t, language } = useI18n();

  const makeRound = (level: number): QuizRound => {
    if (level <= 1) {
      const sides = randInt(3, 6);
      const wrong = pickWrong(sides, [sides - 1, sides + 1, sides + 2]);
      return {
        question: t('geometry.sidesQuestion'),
        prompt: <Figure><RegularPolygon sides={sides} /></Figure>,
        choices: textChoices(String(sides), wrong.map(String)),
        success: String(sides),
      };
    }

    if (level === 2) {
      const sides = randInt(3, 8);
      const names = POLYGON_NAMES[language];
      const wrongSides = pickWrong(sides, [sides - 1, sides + 1, sides - 2, sides + 2].filter((s) => s >= 3 && s <= 8));
      return {
        question: t('geometry.nameQuestion'),
        prompt: <Figure><RegularPolygon sides={sides} /></Figure>,
        choices: textChoices(names[sides], wrongSides.map((s) => names[s] ?? String(s))),
        success: names[sides],
      };
    }

    const wantArea = level === 4 || (level === 5 && Math.random() < 0.5);
    const max = level === 3 ? 9 : level === 4 ? 6 : 12;
    const width = randInt(3, max);
    let height = randInt(2, Math.min(max, 8));
    if (height === width) height = height === 2 ? 3 : height - 1; // un rectangle, pas un carré

    const perimeter = 2 * (width + height);
    const area = width * height;
    const correct = wantArea ? area : perimeter;
    const wrong = pickWrong(correct, wantArea ? [perimeter, width + height, area + width] : [area, width + height, perimeter + 2]);
    const unit = wantArea ? 'cm²' : 'cm';

    return {
      question: t(wantArea ? 'geometry.areaQuestion' : 'geometry.perimeterQuestion'),
      prompt: <Figure><RectangleFigure width={width} height={height} grid={wantArea && level === 4} /></Figure>,
      choices: textChoices(`${correct} ${unit}`, wrong.map((w) => `${w} ${unit}`)),
      success: `${correct} ${unit}`,
    };
  };

  return <QuizGame {...props} title={t('activity.geometry.title')} rounds={5} makeRound={makeRound} />;
}

function Figure({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
