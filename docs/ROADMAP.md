# Feuille de route

> Chaque version est un incrément **jouable et testable**. Les modules s'ajoutent au
> catalogue `src/games/index.ts` sans modifier le reste de l'application.

---

## v1.0 — Socle et tranche 3-5 ans ✅ (livrée)

**Socle** : navigation, thème, i18n FR/EN/AR + RTL, profils multiples, persistance locale,
récompenses, espace parents protégé, difficulté adaptative, mode hors ligne, accessibilité.

**Activités**
- 0-2 : éveil sensoriel (bulles, cause à effet)
- 3-5 : couleurs · formes · chiffres 1-10 · tracé des chiffres

**Qualité** : TypeScript strict 0 erreur, build Web validé, 8 sons générés, icônes vectorielles,
mascotte animée, mode daltonisme, animations réduites.

---

## v1.1 — Vie pratique 3-5 ans *(3 semaines)* — ✅ livrée

| Activité | Objectif unique | Mécanique |
|---|---|---|
| **Verser** | transvaser sans renverser | glisser un récipient au-dessus d'un autre, jauge de précision |
| **Trier** | classer par critère unique | glisser vers 2-3 bacs (couleur, taille, ou nature) |
| **Associer les paires** | appariement visuel | retourner 6 cartes, mémoire immédiate |
| **Puzzles simples** | compléter une image | 4 → 9 pièces aimantées |
| **La fermeture** | boutons, scratchs, lacets | gestes guidés au doigt |

**Technique** : pièces de puzzle rendues en SVG et aimantées (`PuzzleGame`), paires avec
retournement `Animated` et état local (`MemoryGame`), verser et fermeture éclair à appui maintenu
(`PouringGame`, `DressingGame`), tri avec cibles colorées (`SortingGame`).
**Critère d'acceptation** : ✅ chaque activité est terminable sans aide, aucune erreur bloquante,
3 manches par activité, 5 niveaux de difficulté adaptative.
**Vérifié le 2026-10-20** : 9 activités jouables de bout en bout au navigateur (mobile 430×932 et
paysage 1180×820), en FR, EN et AR, sans erreur JavaScript.

---

## v1.2 — Éveil 0-2 ans, lecture et mathématiques 6-8 ans ✅ (livrée)

**0-2 ans** : animaux (cri énoncé), couleurs, formes à emboîter, xylophone pentatonique.
**Graphismes** : système d'images réalistes avec repli SVG (`npm run photos`) ; les images restent à générer (`docs/ASSETS.md`, section 7).
**Limites connues** : en arabe, « Les syllabes » devient « la première lettre » (couper un mot arabe déforme l'écriture) ; la monnaie est en euros uniquement ; les activités 6-8 ans sont à choix multiple (pas encore de manipulation au doigt).

*Prévu à l'origine :*

| Activité | Contenu |
|---|---|
| **Les syllabes** | fusionner 2 syllabes pour former un mot (audio + étiquettes mobiles) |
| **Lire un mot** | associer image ↔ mot écrit (mots de 1 à 3 syllabes) |
| **Additions** | bandes de perles Montessori, sommes jusqu'à 20 puis 100 |
| **Soustractions** | retirer des perles, résultat visible |
| **Tables de multiplication** | table de Pythagore interactive, 1 à 10 |
| **L'horloge** | heure pleine, demi, quart ; aiguilles manipulables |
| **La monnaie** | payer une somme avec pièces et billets (€, puis devise configurable) |

**Technique** : générateur d'exercices paramétré (`engine/generator.ts`), nouveau type de
clavier numérique enfant, gestion des réponses écrites.
**Contenu pédagogique** : séquences validées par un enseignant Montessori (à prévoir en amont).

---

## v1.3 — Sciences, géographie et code 6-12 ans *(6 semaines)*

| Activité | Âge | Contenu |
|---|---|---|
| **Sciences du vivant** | 6-8 | cycle de vie (grenouille, papillon, plante), parties du corps |
| **Géographie simple** | 6-8 | continents, océans, drapeaux, planisphère puzzle |
| **Fractions** | 9-12 | barres de fractions, équivalences, comparaisons |
| **Géométrie** | 9-12 | angles, périmètre, aire, solides |
| **Grammaire** | 9-12 | nature des mots (symboles Montessori), analyse de phrase |
| **Conjugaison** | 9-12 | présent, imparfait, futur, passé composé |
| **Cartes du monde** | 9-12 | pays, capitales, reliefs (niveau 1 : Europe) |
| **Système solaire** | 9-12 | planètes, orbites, échelles relatives |
| **Code par blocs** | 9-12 | séquences, boucles, conditions ; exécution d'un petit robot sur grille |

**Technique** : mode paysage privilégié pour la carte du monde, éditeur de blocs maison
(pas de dépendance externe), `MapView` en SVG interactif.

---

## v2.0 — Profondeur et personnalisation *(8 semaines)*

- **Parcours guidés** : séquences de 4 activités ordonnées (« ma journée Montessori »).
- **Rapport de fin de semaine** pour les parents (PDF local, jamais envoyé).
- **Objectifs personnalisés** : le parent choisit une compétence à travailler.
- **Mode école** : 30 profils, export local, verrouillage des activités.
- **Voix studio** : les 40 phrases enregistrées par une comédienne (voir `ASSETS.md`).
- **Illustrations 3D** : remplacement des SVG par les rendus clay (même interface de composant).
- **Musique d'ambiance** douce et optionnelle (6-12 ans uniquement).
- **Mode sombre** (préférence système), décliné de la palette existante.

---

## v2.1 — Confort et accessibilité avancée

- **Synthèse vocale des consignes dans les 3 langues** pour chaque activité (déjà le cas).
- **Police adaptée dyslexie** (OpenDyslexic) en option.
- **Boutons à balayage** (switch access) pour les enfants à mobilité réduite.
- **Contraste renforcé** niveau AAA.
- **Sous-titres agrandis** et option langue des signes en vidéo (v3).

---

## v3.0 — Écosystème (hors périmètre actuel)

> Ces éléments nécessitent un backend : ils ne sont proposés que s'ils sont
> compatibles avec la promesse « zéro collecte » pour les enfants.

- **Sauvegarde chiffrée optionnelle** déclenchée par le parent (compte adulte, e-mail vérifié,
  consentement RGPD explicite, chiffrement côté client).
- **Synchronisation multi-appareils** pour un même enfant.
- **Contenus téléchargeables** par pack (saisons, thèmes) avec validation parentale.
- **Portail enseignant** distinct de l'application enfant.
- **Localisations supplémentaires** : espagnol, allemand, italien, portugais, darija.

---

## Priorités de travail transverses

| Chantier | Quand | Pourquoi |
|---|---|---|
| Validation pédagogique par un éducateur Montessori | avant v1.2 | crédibilité et justesse des progressions |
| Tests utilisateurs enfants (5 par tranche) | à chaque version majeure | détecter les blocages moteurs réels |
| Audit d'accessibilité (WCAG 2.2 AA) | v1.2 | conformité et inclusion |
| Revue juridique RGPD-K / COPPA | avant publication | sécuriser la mise en ligne |
| Optimisation du bundle Web (< 400 Ko gzip) | v1.2 | temps de chargement sur mobile |
| Localisation des fiches stores | par pays visé | conversion |

---

## Indicateurs de réussite (sans mesure intrusive)

Aucune télémétrie dans l'application. Les indicateurs se mesurent par retour direct
(tests utilisateurs, avis stores, entretiens parents) :

- un enfant termine une activité **sans aide** en moins de 3 minutes (3-5 ans) ;
- le taux de reprise volontaire (« Encore ! ») dépasse 60 % ;
- les parents comprennent l'espace parents sans documentation ;
- zéro avis mentionnant une difficulté de manipulation sur téléphone.
