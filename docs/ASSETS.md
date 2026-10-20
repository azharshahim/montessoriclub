# Assets — charte, liste et prompts de génération

> Cette version fonctionne **sans aucun asset externe** : mascotte, objets, formes, icônes et sons
> sont générés en SVG ou synthétisés. Ce document décrit la direction artistique de référence
> et permet de produire une version « studio » (illustrations 3D, voix enregistrée) sans
> modifier le code : il suffit de remplacer les composants concernés.

---

## 1. Direction artistique

| Principe | Traduction |
|---|---|
| **3D douce / semi-réaliste** | volumes ronds, matière « pâte à modeler », aucun angle dur |
| **Couleurs vives mais harmonieuses** | saturation élevée, luminosité moyenne, une dominante par écran |
| **Chaleur** | fond crème (#FFF9F0), ombres brun chaud, jamais de noir ni de gris froid |
| **Lisibilité enfantine** | formes larges, détails secondaires atténués, contour implicite par la lumière |
| **Calme** | pas de néon, pas de dégradé arc-en-ciel sur un même élément, pas de texture criarde |

### Palette officielle

| Rôle | Hex | Usage |
|---|---|---|
| Fond crème | `#FFF9F0` | fond d'écran principal |
| Crème profond | `#FDEFDF` | dégradé de fond, cartes secondaires |
| Sable | `#F3E3D2` | contours, séparateurs, pistes |
| Encre | `#33302E` | texte principal |
| Encre douce | `#6E645C` | texte secondaire |
| Corail | `#EE6C5B` | action principale, mascotte (fox) |
| Orange | `#F59A4B` | accents chauds |
| Jaune | `#F7C948` | étoiles, récompenses |
| Vert | `#4FBF8B` | réussite, nature |
| Turquoise | `#3FB1B5` | calme, eau |
| Bleu | `#4E8FE0` | formes, ciel |
| Indigo | `#6C6FDB` | réglages parents |
| Violet | `#9C7BE0` | fruits |
| Rose | `#EE8FB1` | douceur, pâtisserie |
| Brun | `#9A6B4F` | bois, biscuits, ours |

### Règles de composition

- Rayons : 16 px (petit), 24 px (carte), 32 px (grande carte), 999 px (pilule).
- Ombres : `rgba(74,55,42,0.12–0.18)`, flou 12–22 px, décalage bas 6–12 px.
- Un écran = **un** accent dominant + la palette neutre. Deux accents maximum.
- Les personnages regardent l'utilisateur ; les objets flottent à 1 ombre portée près.

---

## 2. Illustrations à produire (version studio)

### 2.1 Mascotte « Nino » le renard

| Asset | Format | Rôle |
|---|---|---|
| `mascot-idle.png` | 1024×1024 PNG alpha | état neutre |
| `mascot-happy.png` | 1024×1024 PNG alpha | récompense |
| `mascot-thinking.png` | 1024×1024 PNG alpha | hésitation, encouragement |
| `mascot-speaking.png` | 1024×1024 PNG alpha | bouche ouverte (variante) |
| `mascot-idle.lottie` | Lottie JSON | respiration + clignements en boucle |
| `mascot-celebrate.lottie` | Lottie JSON | saut + pluie d'étoiles |

**Prompt (image)** :
```
Cute 3D render of a baby fox mascot for a Montessori app for children, soft clay material,
warm orange fur (#F59A4B) with cream muzzle (#FFF3E0), big friendly brown eyes with highlights,
small rounded ears, gentle smile, sitting upright, full body, isolated on transparent background,
soft studio lighting, subtle rim light, no shadows on background, claymation style, Pixar-like,
high detail, centered, 1:1
```
**Negative prompt** :
```
realistic photo, scary teeth, sharp claws, dark background, neon colors, text, logo, watermark,
multiple characters, extra limbs, low resolution
```
**Prompt (animation)** : « Boucle de respiration : translation verticale de 6 px, easing in-out,
3,2 s par cycle ; clignement des yeux toutes les 2,6–5,2 s ; balancement de la queue de ±4°. »

### 2.2 Icônes de l'application

| Asset | Format | Contrainte |
|---|---|---|
| `icon.png` | 1024×1024 | pas de transparence, mascotte centrée |
| `adaptive-icon.png` | 1024×1024 | mascotte dans 62 % central (Android rogne) |
| `splash-icon.png` | 512×512 transparent | logo seul, fond géré par `app.json` |
| `favicon.png` | 64×64 | lisible à très petite taille, pas de détail fin |

**Prompt** :
```
App icon, adorable 3D baby fox face, warm cream background (#FFF9F0) with soft coral radial glow,
rounded shapes, soft studio light, generous margins, no text, no border, square
```
> Déjà généré dans `assets/images/icon-source.png` (décliné en 4 tailles).

### 2.3 Avatars enfants (8)

`fox · owl · panda · frog · cat · bunny · bear · penguin`

**Prompt générique** :
```
3D clay-style avatar portrait of a {ANIMAL} for a children's app, head and shoulders,
{COLOR} palette, big friendly eyes, soft smile, cream background (#FFF9F0), soft studio lighting,
rounded silhouette, sticker style, 1:1
```
Déclinaisons : fox `#F58B4E`, owl `#9C7BE0`, panda `#B9C6D2`, frog `#4FBF8B`, cat `#EE8FB1`,
bunny `#F5C33B`, bear `#A5765A`, penguin `#4E8FE0`.
> v1 : emoji système dans un cercle dégradé (aucun téléchargement). v2 : remplacer dans `ui/Avatar.tsx`.

### 2.4 Objets manipulables (16)

| Objet | Couleur | Objet | Couleur |
|---|---|---|---|
| pomme | rouge | carotte | orange |
| ballon | rouge | orange | orange |
| poisson | bleu | raisin | violet |
| tasse | bleu | fleur | violet |
| banane | jaune | papillon | rose |
| étoile | jaune | glace | rose |
| feuille | vert | biscuit | brun |
| balle | vert | ours | brun |

**Prompt générique** :
```
Single {OBJECT} for a children's educational game, soft 3D clay render, {COLOR} as main color,
rounded friendly shape, subtle studio lighting, soft shadow under the object,
isolated on transparent background, centered, no text, 1:1, 512px
```
**Prompt de planche de référence (style)** :
```
Contact sheet of 16 children's toys and fruits, soft clay 3D, warm palette, consistent lighting,
each object isolated with transparent background, same camera angle, catalog style
```
> v1 : SVG dans `ui/illustrations/objects.tsx`. Pour passer en 3D : exporter en PNG 512²
> et remplacer `ObjectIllustration` par un `<Image>` (même signature `{ id, size }`).

### 2.5 Formes et matériel Montessori

Formes : cercle, carré, triangle, rectangle, étoile, hexagone, ovale, cœur.
Matériel : panier tissé, plateau en bois, écriteau à cadre, chiffres rugueux (tracé guide).

**Prompt** :
```
Montessori wooden shape puzzle piece, {SHAPE}, warm beech wood texture, soft rounded edges,
natural wood grain, clay 3D render, isolated on transparent background, top-down slight angle
```
> v1 : `ui/illustrations/shapes.tsx` avec dégradé « bois » (#F0B878 → #C58549).

### 2.6 Décor et particules

- Fond d'écran doux (aquarelle crème) pour l'accueil — optionnel, les dégradés suffisent.
- Particules d'étoiles : déjà générées en code (`ui/StarBurst.tsx`), 14 particules, 900 ms.
- Confettis de fin de niveau : déclinaison de `StarBurst` avec 24 particules.

---

## 3. Sons

### 3.1 Effets livrés (générés, libres de droits)

`tools/generate_sounds.py` synthétise 8 fichiers WAV mono 44,1 kHz 16 bits :

| Fichier | Durée | Description | Timbre |
|---|---|---|---|
| `tap.wav` | 0,09 s | toucher | sinus 660 Hz, attaque douce |
| `drop.wav` | 0,28 s | objet déposé | marimba do5 |
| `pop.wav` | 0,10 s | bulle éclatée | glissando 1 100 → 320 Hz |
| `success.wav` | 0,68 s | manche réussie | arpège do–mi–sol |
| `error.wav` | 0,43 s | encouragement | deux notes descendantes, mineur doux |
| `star.wav` | 0,45 s | étoile gagnée | clochette 1 046 Hz |
| `levelup.wav` | 0,85 s | niveau supérieur | montée do–mi–sol–do |
| `celebrate.wav` | 1,30 s | fin de session | fanfare chaleureuse |

**Principes de sound design** :

- attaque ≥ 8 ms (jamais de « clic »), décroissance exponentielle ;
- aucun son au-dessus de 2 kHz à fort volume (protection auditive des tout-petits) ;
- le son d'erreur **n'est jamais dissonant** : c'est un intervalle descendant consonant ;
- volume global des SFX ≤ −12 dBFS, voix ≥ −6 dBFS.

**Pour une version studio** (banque de sons ou sound designer) :
```
Demande : 8 effets UI pour application enfantine 0-12 ans, style acoustique doux (marimba, célesta,
wood block, verre frotté). Contraintes : < 1,5 s, aucune dissonance, aucune percussion agressive,
aucun aigu strident, fade-in ≥ 8 ms. Formats : WAV 48 kHz + MP3 128k. Livrables nommés
tap/drop/pop/success/error/star/levelup/celebrate.
```

### 3.2 Musique d'ambiance (v1.2)

Recommandation : **aucune musique continue en 0-5 ans** (charge cognitive).
Pour 6-12 ans : boucle instrumentale douce de 60–90 s, volume −20 dB sous la voix, coupure
automatique pendant la parole et pendant les consignes.

```
Prompt musical : ambient marimba and felt piano loop, 70 BPM, C major, warm and calm,
no drums, no melody hooks, seamless loop, children's app background, 90 seconds
```

### 3.3 Voix de la mascotte

**v1** : synthèse vocale native (`expo-speech`) — gratuite, hors ligne, FR/EN/AR,
pitch 1,15 et rate 0,94 pour un timbre doux et lent.

**v2 « voix studio »** : enregistrer les phrases ci-dessous avec une comédienne,
puis remplacer `audio/speech.ts::speak()` par un lecteur de fichiers indexés.
Spec : 48 kHz / 24 bits, −16 LUFS, silence de 200 ms en fin de fichier, voix féminine
chaleureuse et posée, débit 140 mots/min, sourire audible.

| Code | Texte français | Contexte |
|---|---|---|
| `hello` | Bonjour {prénom} ! Je suis Nino, ton guide. Choisis une activité ! | accueil |
| `cheer` | Bravo ! Tu progresses à merveille. | réussite |
| `encourage` | Ce n'est pas grave. On recommence tranquillement. | erreur |
| `levelup` | Nouveau niveau ! Un défi un peu plus grand t'attend. | niveau +1 |
| `bye` | À très bientôt ! | sortie |
| `colors.instruction` | Glisse chaque objet dans le panier de sa couleur. | consigne |
| `shapes.instruction` | Glisse chaque forme dans son emplacement. | consigne |
| `numbers.instruction` | Compte les objets, puis touche le bon chiffre. | consigne |
| `tracing.instruction` | Suis le chiffre avec ton doigt, sans lever la main. | consigne |
| `trace.start` | Commence au point lumineux. | tracé |
| `round.won` | Manche terminée, bravo ! | fin de manche |
| `session.done` | Quel beau travail ! | fin de session |
| `rest` | C'est l'heure de se reposer. On continue demain ! | limite atteinte |
| `numbers.1..10` | un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix | dénombrement |
| `colors.red..teal` | rouge, bleu, jaune, vert, orange, violet, rose, marron, turquoise | couleurs |
| `shapes.*` | cercle, carré, triangle, rectangle, étoile, hexagone, ovale, cœur | formes |
| `leave` | À tout à l'heure ! | retour menu |

> Pour les 0-2 ans, privilégier des **onomatopées** et des **sons de bouche** doux
> plutôt que du texte : « pop ! », « hop ! », « wouah ! ».

**Prompt TTS si vous préférez une voix de synthèse haut de gamme** :
```
French female voice, early 30s, warm, smiling, gentle and slow, playful storyteller,
children's app narrator, neutral French accent, no vocal fry, articulate, 135 wpm
```

---

## 4. Nomenclature et export

```
assets/
├── images/
│   ├── icon.png                      1024²
│   ├── adaptive-icon.png             1024² (contenu dans 635² centrés)
│   ├── splash-icon.png               512² transparent
│   ├── favicon.png                   64²
│   └── avatars/{fox,owl,…}.png       512² transparent
├── illustrations/
│   ├── objects/{apple,balloon,…}.png 512² transparent
│   ├── shapes/{circle,square,…}.png  512² transparent
│   └── mascot/{idle,happy,thinking}.png 1024² transparent
└── sounds/
    ├── sfx/{tap,drop,pop,…}.mp3
    └── voice/fr/{hello,cheer,…}.mp3
```

**Export image** : PNG-24, sRGB, transparence conservée, marges transparentes de 4 px minimum.
**Export son** : MP3 128 kbps mono pour les SFX, WAV 48 kHz pour les archives.
**Poids cible** : < 12 Mo pour l'ensemble des assets du store (hors voix).

---

## 5. Accessibilité visuelle

- Chaque couleur d'objet est doublée d'un **motif** en mode daltonisme
  (`theme/palette.ts → colorBlindPatterns`) : point, rayure, étoile, croix, vague, anneau.
- Contraste texte/fond ≥ 4,5:1 ; éléments graphiques ≥ 3:1.
- Ne jamais coder une information **uniquement** par la couleur (WCAG 1.4.1) :
  les corbeilles portent leur nom écrit + motif, les formes ont une silhouette distincte.

---

## 7. Brancher les images réalistes des objets (v1.2)

Les 16 objets du jeu (pommes, ours, poisson…) sont dessinés en SVG. Pour passer à un rendu
**réaliste 3D douce**, il suffit de déposer des images : aucune modification du code.

1. Générer chaque image (Midjourney, Ideogram, Firefly…) avec le prompt de base ci-dessous.
2. Exporter en **WebP 512×512, fond transparent, moins de 150 Ko**, nommée exactement comme dans le tableau.
3. Les déposer dans `assets/photos/objects/`.
4. Lancer `npm run photos` : le registre `src/ui/illustrations/photoRegistry.ts` est régénéré.
5. Un objet sans image garde son illustration vectorielle (repli automatique).

**Prompt de base** (remplacer `<SUJET>`) :
```
Photorealistic soft 3D render of <SUJET>, child-friendly, vivid but harmonious colors, gentle studio
lighting, soft contact shadow, subtle glossy highlights, centered, isolated on a transparent
background, no text, no hands, no clutter, square 1:1, high detail
```
**Negative prompt** : `text, watermark, logo, hands, people, dark, gloomy, scary, cluttered background`

| Fichier | `<SUJET>` |
|---|---|
| `apple.webp` | a shiny red apple with a small green leaf |
| `balloon.webp` | a red party balloon with a thin string |
| `fish.webp` | a friendly blue tropical fish |
| `cup.webp` | a blue ceramic cup |
| `banana.webp` | a ripe yellow banana |
| `star.webp` | a golden star-shaped toy |
| `leaf.webp` | a fresh green leaf |
| `ball.webp` | a green rubber ball |
| `carrot.webp` | an orange carrot with green top |
| `orange.webp` | a whole orange fruit |
| `grapes.webp` | a bunch of purple grapes |
| `flower.webp` | a purple flower with a short stem |
| `butterfly.webp` | a pink butterfly with open wings |
| `icecream.webp` | a pink strawberry ice cream cone |
| `cookie.webp` | a chocolate chip cookie |
| `bear.webp` | a cute brown teddy bear sitting |
