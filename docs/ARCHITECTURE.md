# Architecture — Montessori Club

> Document de référence technique. Pour l'installation, voir le `README.md`.

---

## 1. Vue d'ensemble

L'application est un **client autonome** : aucune API, aucune base distante, aucun compte.
Tout l'état vit dans `AsyncStorage`, ce qui garantit trois propriétés structurantes :

1. **Mode hors ligne total** — l'application démarre et joue sans réseau.
2. **Conformité par conception** — aucune donnée d'enfant ne peut fuiter, puisqu'aucune ne sort.
3. **Coût d'exploitation nul** — pas de serveur à maintenir, pas de facture à l'usage.

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  SafeArea · GestureHandler · I18nProvider · Hydratation     │
│  Horloge de session (60 s → addMinutes)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 navigation/RootNavigator                    │
│  Onboarding → Home → Game → Rewards                         │
│                    ↘ ParentsGate → Parents                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    screens/ (6 écrans)                      │
│  Aucune logique de jeu : orchestration, navigation, rewards │
└───────────────────────────┬─────────────────────────────────┘
                            │  props : level / onFinish / onQuit
┌───────────────────────────▼─────────────────────────────────┐
│                     games/ (5 modules)                      │
│  colors · shapes · numbers · tracing · sensory              │
│  Chaque module = 1 objectif pédagogique + useGameSession    │
└───────┬───────────────────────────────┬─────────────────────┘
        │                               │
┌───────▼──────────────┐      ┌─────────▼──────────────────────┐
│  ui/ (design system) │      │ engine/ + audio/ + store/       │
│  Button, Mascot…     │      │ adaptation, sons, profils       │
└──────────────────────┘      └─────────────────────────────────┘
```

---

## 2. Arborescence commentée

```
montessoriclub/
├── App.tsx
│   ├── useHydrated()        attend la réhydratation AsyncStorage avant tout rendu
│   ├── useSessionClock()    +1 min / 60 s d'usage actif → limite parentale
│   └── dir/lang <html>      RTL et langue pour le Web
├── index.js                 registerRootComponent + gesture-handler en premier
├── app.json                 identifiants iOS/Android, splash, PWA, plugins
├── eas.json                 profils development / preview / production + submit
│
├── assets/
│   ├── images/
│   │   ├── icon-source.png  mascotte source (1024²) — sert à toutes les déclinaisons
│   │   ├── icon.png         icône iOS / Web
│   │   ├── adaptive-icon.png icône adaptative Android (zone sûre 62 %)
│   │   ├── splash-icon.png  logo de démarrage (cercle détouré)
│   │   └── favicon.png      favicon Web 64²
│   └── sounds/              8 WAV mono 44,1 kHz générés par tools/generate_sounds.py
│
├── src/
│   ├── constants.ts         APP_VERSION, paliers de limite quotidienne
│   │
│   ├── theme/
│   │   ├── palette.ts       couleurs sémantiques + couleurs d'objets + motifs daltonisme
│   │   ├── typography.ts    échelle typographique + taille tactile par tranche d'âge
│   │   └── index.ts         useTheme(ageBand) → thème mémoïsé et accessible
│   │
│   ├── i18n/
│   │   ├── translations/fr.ts   source de vérité des clés (as const)
│   │   ├── translations/en.ts   Record<keyof typeof fr, string> → complétude vérifiée
│   │   ├── translations/ar.ts   idem, + direction RTL
│   │   └── index.tsx        I18nProvider, useI18n(), translate(), speechLocale
│   │
│   ├── store/
│   │   ├── profiles.ts      profils, progression par jeu, journées de jeu, badges
│   │   └── settings.ts      langue, sons, sous-titres, daltonisme, animations
│   │
│   ├── engine/
│   │   └── adaptive.ts      adaptLevel(), computeStars(), sample(), shuffle(), randInt()
│   │
│   ├── audio/
│   │   ├── engine.ts        expo-audio : cache de lecteurs, SFX, warm-up
│   │   ├── speech.ts        expo-speech : voix de la mascotte (rate/pitch réglés)
│   │   └── haptics.ts       retours haptiques désactivables
│   │
│   ├── ui/
│   │   ├── Screen.tsx       fond dégradé, safe-area, en-tête, largeur max
│   │   ├── Button.tsx       Button + RoundButton (variantes, tailles, animation)
│   │   ├── Icon.tsx         24 icônes SVG dessinées à la main
│   │   ├── Mascot.tsx       renard Nino : dégradés, respiration, clignement, parole
│   │   ├── MascotGuide.tsx  mascotte + bulle + synthèse vocale + réécoute
│   │   ├── StarBurst.tsx    particules Reanimated (récompenses)
│   │   ├── RewardOverlay.tsx carte de récompense plein écran
│   │   ├── ProgressBar.tsx  barre et version « points » Montessori
│   │   ├── PatternBadge.tsx symbole daltonisme par couleur
│   │   ├── Avatar.tsx       8 avatars dégradés (v1 emoji, v2 illustrations)
│   │   ├── GameLayout.tsx   en-tête jeu + progression + mascotte + plateau
│   │   ├── DragDropBoard.tsx plateau glisser-déposer générique
│   │   └── illustrations/
│   │       ├── objects.tsx  16 objets semi-réalistes vectoriels
│   │       └── shapes.tsx   8 formes + géométrie partagée
│   │
│   ├── games/
│   │   ├── types.ts         GameProps, GameModule, RoundResult, PartialSession
│   │   ├── useGameSession.ts manches, erreurs, étoiles, fin de session
│   │   ├── index.ts         catalogue + gamesForAge() + getGame()
│   │   ├── colors/          ColorsGame.tsx
│   │   ├── shapes/          ShapesGame.tsx
│   │   ├── numbers/         NumbersGame.tsx
│   │   ├── tracing/         TracingGame.tsx
│   │   └── sensory/         SensoryGame.tsx
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.tsx  sélection / création / édition de profil
│   │   ├── HomeScreen.tsx        accueil adapté à la tranche d'âge
│   │   ├── GameScreen.tsx        hôte : niveau, résultats, bilan
│   │   ├── RewardsScreen.tsx     étoiles, badges, autocollants
│   │   ├── ParentsGateScreen.tsx porte mathématique
│   │   └── ParentsScreen.tsx     tableau de bord + réglages
│   │
│   └── navigation/
│       ├── RootNavigator.tsx pile unique, thème de navigation
│       └── types.ts          RootStackParamList
│
├── tools/
│   ├── lib/web-app.mjs       démarrage jsdom partagé + mise en page et gestes simulés
│   ├── smoke-web.mjs         parcours complet (clair / sombre)
│   ├── play-activities.mjs   une session entière par activité (36)
│   ├── test-sw.mjs           service worker, précache, version de cache, chemin de base
│   ├── test-layout.mjs       parcours en portrait puis en paysage
│   ├── check-i18n.mjs        parité des traductions fr / en / ar
│   ├── screenshots.mjs       captures docs/screenshots (Chrome requis)
│   └── generate_sounds.py    synthèse WAV (stdlib uniquement)
├── CHANGELOG.md              journal des versions
└── docs/                     ce document, assets, publication, roadmap
```

---

## 3. Contrats d'extension

### 3.1 Un module de jeu

```ts
// src/games/types.ts
export interface GameProps {
  level: number;                      // 1..maxLevel, fourni par le profil
  onFinish: (r: RoundResult) => void; // session terminée normalement
  onMistake?: () => void;             // à chaque erreur (pour l'encouragement)
  onQuit?: (p: PartialSession) => void; // retour volontaire de l'enfant
}
```

Tout module retourne un composant respectant ce contrat. Il ne connaît **ni** la navigation,
**ni** le stockage, **ni** la langue : il reçoit un niveau et émet des résultats.
C'est ce qui permet d'ajouter une activité sans toucher au reste de l'application.

### 3.2 Ajouter une activité en 6 étapes

```tsx
// 1. Créer src/games/fractions/FractionsGame.tsx
export function FractionsGame({ level, onFinish, onMistake, onQuit }: GameProps) {
  const session = useGameSession({ rounds: 4, onFinish });
  // 2. Construire le contenu en fonction de `level`
  // 3. Appeler session.registerMistake() / session.celebrate() / session.winRound()
  return (
    <GameLayout
      title={t('activity.fractions.title')}
      instruction={t('activity.fractions.instruction')}
      onBack={() => onQuit?.({ stars: session.starsEarned, mistakes: session.mistakes, rounds: session.round - 1 })}
      round={session.round} rounds={session.rounds}
      stars={session.starsEarned} fireKey={session.fireKey}
    >
      {/* plateau */}
      <RewardOverlay visible={session.phase === 'roundWon'} … />
    </GameLayout>
  );
}

// 4. Ajouter les clés de traduction dans les 3 dictionnaires
// 5. Enregistrer le module dans src/games/index.ts (GAME_MODULES)
// 6. Lancer `npm run typecheck` : TypeScript signale toute clé manquante
```

Aucune autre modification n'est nécessaire : l'accueil affiche automatiquement
le module pour les tranches d'âge déclarées dans `ageBands`.

---

## 4. Difficulté adaptative

`src/engine/adaptive.ts` — appliqué à la fin de chaque session complète :

| Condition | Effet | Intention Montessori |
|---|---|---|
| 0 erreur et ≥ 1 réussite | niveau **+1** (plafonné à `maxLevel`) | l'enfant maîtrise : on propose plus grand |
| erreurs ≥ réussites (min. 2) | niveau **−1** (plancher 1) | on revient à une difficulté confortable |
| sinon | niveau inchangé | on consolide sans pression |

Une session **interrompue** (`onQuit`) crédite les étoiles mais **ne change pas** le niveau
(`adaptLevel: false`) : quitter n'est jamais interprété comme un échec.

`computeStars()` = `min(5, manches + (0 erreur ? 1 : 0))`.

---

## 5. Persistance

Deux clés AsyncStorage, versionnées (`version: 1` dans les options `persist`) :

### `mc-profiles-v1`

```ts
Profile {
  id, name, ageBand: '0-2'|'3-5'|'6-8'|'9-12', avatar, createdAt,
  stars: number,
  progress: Record<gameId, {
    level, stars, sessions, successes, mistakes, lastPlayedAt
  }>,
  playDays: { date: 'YYYY-MM-DD', minutes }[],   // 14 derniers jours glissants
  dailyLimitMinutes: number | null
}
```

### `mc-settings-v1`

```ts
{
  language: 'fr'|'en'|'ar',
  sound, subtitles, colorBlind, reducedMotion, haptics: boolean
}
```

**Migration** : incrémenter `version` et fournir `migrate(persisted, version)` dans
chaque store. Les données restent lisibles d'une version à l'autre.

**Suppression** : `deleteProfile(id)` retire le profil et sa progression du stockage local
au prochain flush. Aucune copie n'existe ailleurs (pas de sauvegarde cloud).

---

## 6. Rendu et design system

- **Tout est vectoriel** (`react-native-svg`) : mascotte, objets, formes, icônes, paniers.
  Un seul jeu d'assets sert du téléphone 320 px à la tablette 2 048 px.
- **Ombres douces** centralisées (`theme.shadow`) : jamais de noir pur, toujours `palette.ink` à faible opacité.
- **Couleurs sémantiques** : `colors.coral`, `colors.teal`… jamais de hex dans les écrans.
- **Tailles tactiles** : `touchTarget(ageBand)` → 96 px (0-2), 72 px (3-5), 60 px (6-8), 48 px (9-12).
- **Animations** : `Animated` pour le tactile (compatible web), `Reanimated` pour les particules.
  Toutes respectent `settings.reducedMotion`.

## 7. i18n et RTL

- `fr.ts` est la **source de vérité** : `export const fr = {…} as const`.
- `en.ts` / `ar.ts` sont typés `Record<keyof typeof fr, string>` :
  une clé oubliée provoque une **erreur de compilation**, pas un texte manquant en production.
- `useI18n()` expose `t(key, vars)`, `language`, `dir`, `isRTL`, `align`.
- Le RTL est appliqué de trois façons :
  1. `I18nManager.forceRTL()` sur natif (au changement de langue) ;
  2. `document.documentElement.dir = 'rtl'` sur le Web ;
  3. `align` + `flexDirection` pilotés par la langue pour les rares cas où le miroir natif ne suffit pas.

## 8. Performance

| Contrainte | Réponse |
|---|---|
| Bundle initial | 1 seul chunk web (~2,1 Mo non compressé, ~520 Ko gzip) |
| Mascotte animée en permanence | animations `useNativeDriver: true` (transform/opacity uniquement) |
| Sons | lecteurs mis en cache, jamais recréés à chaque lecture |
| Listes | pas de `FlatList` virtuelle nécessaire (< 20 éléments), tout est rendu direct |
| Images | aucune : les illustrations SVG sont générées à la volée |

## 9. Sécurité et vie privée

- Pas de `fetch`, pas de `WebView`, pas de SDK tiers, pas de stockage d'identifiants.
- L'espace parents est protégé par une opération mathématique **et** un verrou temporaire
  30 s après 3 échecs (protection contre le tâtonnement d'un enfant de 9-12 ans).
- Aucun lien sortant dans l'espace enfant : impossible de quitter l'application par erreur.
- La suppression d'un profil efface ses données ; aucune corbeille serveur.

## 10. Décisions techniques (résumé)

| Décision | Raison |
|---|---|
| Zustand plutôt que Redux | 3 Ko, pas de boilerplate, `persist` intégré |
| SVG plutôt que PNG | net sur tous les écrans, thème dynamique, poids minimal |
| Voix = `expo-speech` | hors ligne, gratuite, multilingue, respecte les réglages système |
| WAV générés | aucun droit d'auteur, retouche possible par script, taille modeste |
| PanResponder plutôt que GestureDetector | fonctionne à l'identique sur Web (la cible web est prioritaire ici) |
| Pas de backend | conformité RGPD-K/COPPA par conception, coût nul |
