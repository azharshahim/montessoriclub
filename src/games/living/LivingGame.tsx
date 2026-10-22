import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { pick, shuffle } from '../../engine/adaptive';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { QuizGame, type QuizChoice, type QuizRound } from '../QuizGame';
import type { GameProps } from '../types';

type Lang = 'fr' | 'en' | 'ar';
type L3 = Record<Lang, string>;

const HABITATS = {
  farm: { fr: 'La ferme', en: 'The farm', ar: 'المزرعة' },
  sea: { fr: 'La mer', en: 'The sea', ar: 'البحر' },
  forest: { fr: 'La forêt', en: 'The forest', ar: 'الغابة' },
  desert: { fr: 'Le désert', en: 'The desert', ar: 'الصحراء' },
  ice: { fr: 'La banquise', en: 'The ice', ar: 'الجليد' },
} satisfies Record<string, L3>;
const CLASSES = {
  mammal: { fr: 'Mammifère', en: 'Mammal', ar: 'ثدييات' },
  bird: { fr: 'Oiseau', en: 'Bird', ar: 'طائر' },
  fish: { fr: 'Poisson', en: 'Fish', ar: 'سمكة' },
  insect: { fr: 'Insecte', en: 'Insect', ar: 'حشرة' },
  reptile: { fr: 'Reptile', en: 'Reptile', ar: 'زاحف' },
} satisfies Record<string, L3>;
const DIETS = {
  herbivore: { fr: 'Herbivore', en: 'Herbivore', ar: 'آكل أعشاب' },
  carnivore: { fr: 'Carnivore', en: 'Carnivore', ar: 'آكل لحوم' },
  omnivore: { fr: 'Omnivore', en: 'Omnivore', ar: 'آكل كل شيء' },
} satisfies Record<string, L3>;

type Animal = {
  emoji: string;
  name: L3;
  habitat: keyof typeof HABITATS;
  cls: keyof typeof CLASSES;
  diet: keyof typeof DIETS;
};

const ANIMALS: Animal[] = [
  { emoji: '🐄', name: { fr: 'La vache', en: 'The cow', ar: 'البقرة' }, habitat: 'farm', cls: 'mammal', diet: 'herbivore' },
  { emoji: '🐔', name: { fr: 'La poule', en: 'The hen', ar: 'الدجاجة' }, habitat: 'farm', cls: 'bird', diet: 'omnivore' },
  { emoji: '🐖', name: { fr: 'Le cochon', en: 'The pig', ar: 'الخنزير' }, habitat: 'farm', cls: 'mammal', diet: 'omnivore' },
  { emoji: '🐬', name: { fr: 'Le dauphin', en: 'The dolphin', ar: 'الدلفين' }, habitat: 'sea', cls: 'mammal', diet: 'carnivore' },
  { emoji: '🐠', name: { fr: 'Le poisson', en: 'The fish', ar: 'السمكة' }, habitat: 'sea', cls: 'fish', diet: 'omnivore' },
  { emoji: '🦈', name: { fr: 'Le requin', en: 'The shark', ar: 'القرش' }, habitat: 'sea', cls: 'fish', diet: 'carnivore' },
  { emoji: '🦌', name: { fr: 'Le cerf', en: 'The deer', ar: 'الأيل' }, habitat: 'forest', cls: 'mammal', diet: 'herbivore' },
  { emoji: '🦉', name: { fr: 'Le hibou', en: 'The owl', ar: 'البومة' }, habitat: 'forest', cls: 'bird', diet: 'carnivore' },
  { emoji: '🐻', name: { fr: 'L’ours', en: 'The bear', ar: 'الدب' }, habitat: 'forest', cls: 'mammal', diet: 'omnivore' },
  { emoji: '🐪', name: { fr: 'Le chameau', en: 'The camel', ar: 'الجمل' }, habitat: 'desert', cls: 'mammal', diet: 'herbivore' },
  { emoji: '🦎', name: { fr: 'Le lézard', en: 'The lizard', ar: 'السحلية' }, habitat: 'desert', cls: 'reptile', diet: 'carnivore' },
  { emoji: '🐧', name: { fr: 'Le manchot', en: 'The penguin', ar: 'البطريق' }, habitat: 'ice', cls: 'bird', diet: 'carnivore' },
  { emoji: '🐻‍❄️', name: { fr: 'L’ours polaire', en: 'The polar bear', ar: 'الدب القطبي' }, habitat: 'ice', cls: 'mammal', diet: 'carnivore' },
  { emoji: '🐝', name: { fr: 'L’abeille', en: 'The bee', ar: 'النحلة' }, habitat: 'forest', cls: 'insect', diet: 'herbivore' },
  { emoji: '🦋', name: { fr: 'Le papillon', en: 'The butterfly', ar: 'الفراشة' }, habitat: 'forest', cls: 'insect', diet: 'herbivore' },
  { emoji: '🐍', name: { fr: 'Le serpent', en: 'The snake', ar: 'الأفعى' }, habitat: 'desert', cls: 'reptile', diet: 'carnivore' },
];

/** Questions sur les plantes : réponse juste en premier, 2 distracteurs ensuite. */
const PLANT_QA: { q: L3; emoji: string; a: L3; wrong: L3[] }[] = [
  {
    q: { fr: 'Quelle partie de la plante boit l’eau dans la terre ?', en: 'Which part of the plant drinks water from the soil?', ar: 'أي جزء من النبات يشرب الماء من التربة؟' },
    emoji: '🌱',
    a: { fr: 'Les racines', en: 'The roots', ar: 'الجذور' },
    wrong: [
      { fr: 'Les feuilles', en: 'The leaves', ar: 'الأوراق' },
      { fr: 'La fleur', en: 'The flower', ar: 'الزهرة' },
    ],
  },
  {
    q: { fr: 'Quelle partie de la plante fabrique des graines ?', en: 'Which part of the plant makes seeds?', ar: 'أي جزء من النبات يصنع البذور؟' },
    emoji: '🌻',
    a: { fr: 'La fleur', en: 'The flower', ar: 'الزهرة' },
    wrong: [
      { fr: 'Les racines', en: 'The roots', ar: 'الجذور' },
      { fr: 'La tige', en: 'The stem', ar: 'الساق' },
    ],
  },
  {
    q: { fr: 'Quelle partie de la plante capte la lumière du soleil ?', en: 'Which part of the plant catches sunlight?', ar: 'أي جزء من النبات يلتقط ضوء الشمس؟' },
    emoji: '☀️',
    a: { fr: 'Les feuilles', en: 'The leaves', ar: 'الأوراق' },
    wrong: [
      { fr: 'Les racines', en: 'The roots', ar: 'الجذور' },
      { fr: 'La graine', en: 'The seed', ar: 'البذرة' },
    ],
  },
  {
    q: { fr: 'Que faut-il à une graine pour pousser ?', en: 'What does a seed need to grow?', ar: 'ماذا تحتاج البذرة لتنمو؟' },
    emoji: '🌰',
    a: { fr: 'De l’eau et de la lumière', en: 'Water and light', ar: 'ماء وضوء' },
    wrong: [
      { fr: 'Du sucre et du bruit', en: 'Sugar and noise', ar: 'سكر وضجيج' },
      { fr: 'Du sable et du vent fort', en: 'Sand and strong wind', ar: 'رمل وريح قوية' },
    ],
  },
  {
    q: { fr: 'Quelle partie de la plante la tient droite ?', en: 'Which part of the plant holds it upright?', ar: 'أي جزء من النبات يبقيه منتصبًا؟' },
    emoji: '🌿',
    a: { fr: 'La tige', en: 'The stem', ar: 'الساق' },
    wrong: [
      { fr: 'La fleur', en: 'The flower', ar: 'الزهرة' },
      { fr: 'La graine', en: 'The seed', ar: 'البذرة' },
    ],
  },
];

type Kind = 'habitat' | 'class' | 'diet' | 'plant';
const KINDS_BY_LEVEL: Record<number, Kind[]> = {
  1: ['habitat'],
  2: ['class'],
  3: ['diet', 'habitat'],
  4: ['plant', 'class'],
  5: ['habitat', 'class', 'diet', 'plant'],
};

/**
 * Module « Le vivant » (6-8 ans).
 * Animaux : où vivent-ils, à quelle famille appartiennent-ils, que mangent-ils ;
 * plantes : racines, tige, feuilles, fleur et graine.
 */
export function LivingGame(props: GameProps) {
  const { t, language } = useI18n();
  const lang = language as Lang;

  const texts = (cats: Record<string, L3>, correctId: string, ids: string[]): QuizChoice[] => {
    const wrong = shuffle(ids.filter((i) => i !== correctId)).slice(0, 2);
    return shuffle([correctId, ...wrong]).map((id) => ({
      id,
      correct: id === correctId,
      label: cats[id][lang],
      a11y: cats[id][lang],
    }));
  };

  const makeRound = (level: number): QuizRound => {
    const kind = pick(KINDS_BY_LEVEL[Math.min(Math.max(level, 1), 5)]);

    if (kind === 'plant') {
      const qa = pick(PLANT_QA);
      const choices = shuffle([qa.a, ...qa.wrong]).map((o) => ({
        id: o.fr,
        correct: o === qa.a,
        label: o[lang],
        a11y: o[lang],
      }));
      return { question: qa.q[lang], prompt: <Big emoji={qa.emoji} />, choices, success: qa.a[lang] };
    }

    const animal = pick(ANIMALS);
    const prompt = <Big emoji={animal.emoji} caption={animal.name[lang]} />;
    if (kind === 'habitat') {
      return {
        question: t('living.habitatQuestion'),
        prompt,
        choices: texts(HABITATS, animal.habitat, Object.keys(HABITATS)),
        success: HABITATS[animal.habitat][lang],
      };
    }
    if (kind === 'class') {
      return {
        question: t('living.classQuestion'),
        prompt,
        choices: texts(CLASSES, animal.cls, Object.keys(CLASSES)),
        success: CLASSES[animal.cls][lang],
      };
    }
    return {
      question: t('living.dietQuestion'),
      prompt,
      choices: texts(DIETS, animal.diet, Object.keys(DIETS)),
      success: DIETS[animal.diet][lang],
    };
  };

  return <QuizGame {...props} title={t('activity.living.title')} rounds={5} makeRound={makeRound} />;
}

function Big({ emoji, caption }: { emoji: string; caption?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      {caption ? <Text style={[styles.caption, { color: colors.ink }]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 84 },
  caption: { fontSize: 22, fontWeight: '800' },
});
