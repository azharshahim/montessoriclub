import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { pick, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import { numberChoices } from '../math/mathHelpers';
import type { GameProps } from '../types';

type Lang = 'fr' | 'en' | 'ar';
type Id = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'box' | 'prism' | 'pyramid';

type Solid = {
  emoji: string;
  /** Objet de la vie courante qui ressemble au solide. */
  object: Record<Lang, string>;
  name: Record<Lang, string>;
  /** faces, arêtes, sommets (solides à faces planes uniquement). */
  fev?: [number, number, number];
};

const SOLIDS: Record<Id, Solid> = {
  cube: { emoji: '🎲', object: { fr: 'Un dé', en: 'A die', ar: 'حجر نرد' }, name: { fr: 'Cube', en: 'Cube', ar: 'مكعب' }, fev: [6, 12, 8] },
  sphere: { emoji: '⚽', object: { fr: 'Un ballon', en: 'A ball', ar: 'كرة' }, name: { fr: 'Sphère', en: 'Sphere', ar: 'كرة (مجسم)' } },
  cylinder: { emoji: '🥫', object: { fr: 'Une boîte de conserve', en: 'A tin can', ar: 'علبة معلبات' }, name: { fr: 'Cylindre', en: 'Cylinder', ar: 'أسطوانة' } },
  cone: { emoji: '🍦', object: { fr: 'Un cornet de glace', en: 'An ice-cream cone', ar: 'مخروط الآيس كريم' }, name: { fr: 'Cône', en: 'Cone', ar: 'مخروط' } },
  box: { emoji: '📦', object: { fr: 'Un carton', en: 'A cardboard box', ar: 'صندوق كرتون' }, name: { fr: 'Pavé droit', en: 'Cuboid', ar: 'متوازي مستطيلات' }, fev: [6, 12, 8] },
  prism: { emoji: '⛺', object: { fr: 'Une tente', en: 'A tent', ar: 'خيمة' }, name: { fr: 'Prisme triangulaire', en: 'Triangular prism', ar: 'منشور ثلاثي' }, fev: [5, 9, 6] },
  pyramid: { emoji: '🔺', object: { fr: 'Une pyramide', en: 'A pyramid', ar: 'هرم' }, name: { fr: 'Pyramide à base carrée', en: 'Square-based pyramid', ar: 'هرم قاعدته مربعة' }, fev: [5, 8, 5] },
};

const BY_LEVEL: Record<number, Id[]> = {
  1: ['cube', 'sphere', 'cylinder'],
  2: ['cube', 'sphere', 'cylinder', 'cone'],
  3: ['cube', 'sphere', 'cylinder', 'cone', 'box', 'prism'],
};

/**
 * Module « Les solides » (9-12 ans).
 * Niveaux 1-3 : relier un objet courant à son solide. 4 : compter les faces.
 * 5 : compter les arêtes ou les sommets.
 */
export function SolidsGame(props: GameProps) {
  const { t, language } = useI18n();
  const lang = language as Lang;

  const makeRound = (level: number): QuizRound => {
    if (level <= 3) {
      const ids = BY_LEVEL[Math.min(Math.max(level, 1), 3)];
      const id = pick(ids);
      const solid = SOLIDS[id];
      const wrongIds = shuffle(ids.filter((x) => x !== id)).slice(0, 2);
      const choices: QuizChoice[] = shuffle([id, ...wrongIds]).map((x) => ({
        id: x,
        correct: x === id,
        label: SOLIDS[x].name[lang],
        a11y: SOLIDS[x].name[lang],
      }));
      return {
        question: t('solids.nameQuestion'),
        prompt: <Show emoji={solid.emoji} caption={solid.object[lang]} />,
        choices,
        success: solid.name[lang],
      };
    }

    const flat = (['cube', 'box', 'prism', 'pyramid'] as Id[]);
    const id = pick(flat);
    const solid = SOLIDS[id];
    const kind = level === 4 ? 0 : pick([1, 2]);
    const value = solid.fev![kind];
    const questionKey = (['solids.facesQuestion', 'solids.edgesQuestion', 'solids.verticesQuestion'] as const)[kind];
    return {
      question: t(questionKey),
      prompt: <Show emoji={solid.emoji} caption={solid.name[lang]} />,
      choices: numberChoices(value, [1, 2, 3]),
      success: String(value),
    };
  };

  return <QuizGame {...props} title={t('activity.solids.title')} rounds={5} makeRound={makeRound} />;
}

function Show({ emoji, caption }: { emoji: string; caption: string }) {
  return (
    <View style={styles.wrap} accessible={false}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 84 },
  caption: { fontSize: 22, fontWeight: '800', color: '#33302E', textAlign: 'center' },
});
