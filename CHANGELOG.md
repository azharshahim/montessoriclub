# Journal des versions

Toutes les évolutions notables de **Montessori Club**.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; versionnage [SemVer](https://semver.org/lang/fr/).

---

## [1.2.0] — 2026-10-22

Version « toutes tranches d'âge » : les 0-2, 6-8 et 9-12 ans ont enfin leurs activités,
l'application devient installable et se joue hors ligne, et chaque publication est
vérifiée par un banc de test automatisé.

**36 activités** réparties dans les quatre tranches d'âge (34 modules, « Les paires » et
« Puzzles » servant à la fois les 3-5 et les 6-8), contre 10 modules en 1.1.

### Ajouts — 0-2 ans (éveil sensoriel)
- **Les animaux** : quatre animaux tirés au hasard, le cri est énoncé à chaque toucher.
- **Touche les couleurs** : six grosses billes, le nom de la couleur reste écrit sous la bille.
- **Emboîte les formes** : quatre pièces de bois qui se rangent dans leur trou, sans glisser-déposer
  (geste trop difficile à cet âge).
- **Petite musique** : xylophone pentatonique de cinq notes, aucune fausse note possible.
- Toutes ces activités se terminent après un nombre fixe de touches, sans erreur possible.

### Ajouts — 3-5 ans
- Aucune nouvelle activité : la tranche était complète en 1.1 (couleurs, formes, chiffres,
  tracé, trier, paires, puzzles, verser, fermetures).
- Les jeux de cette tranche adoptent les nouveaux écrans illustrés et la barre d'onglets.

### Ajouts — 6-8 ans
- **Additions**, **soustractions** et **multiplications** : calcul avec quantités visibles
  (perles Montessori), sans chrono.
- **Syllabes** et **Lire un mot** : recomposer un mot, puis associer un mot écrit à son image.
- **L'horloge** : heures pleines, demies et quarts.
- **La monnaie** : composer une somme avec pièces et billets (euros).
- **Le vivant** : classer animaux et plantes, relier un être vivant à son milieu.
- Les activités « Les paires » et « Puzzles » démarrent au niveau 4 pour cette tranche,
  avec 6 paires et des grilles 3×3 / 4×3.

### Ajouts — 9-12 ans
- **Fractions** et **Fractions équivalentes** : comparer, puis trouver des équivalences.
- **La géométrie**, **Les angles**, **Les solides** : figures, mesures d'angles, noms des solides.
- **Le système solaire** : ordonner les planètes, associer une planète à sa particularité.
- **Le monde** et **La carte du monde** : situer continents et océans sur une carte interactive.
- **La grammaire**, **La conjugaison**, **Passé, présent, futur** : nature d'un mot, verbes, temps.
- **Code par blocs** : construire une suite d'instructions et guider un robot jusqu'à l'étoile.

### Ajouts — application
- **Mode sombre** complet, réglable depuis l'espace parents (Automatique / Clair / Sombre),
  y compris l'écran de démarrage et le thème du navigateur.
- **Code parental à 4 chiffres** : défini, modifié ou supprimé par l'adulte, verrouillage 30 s
  après trois erreurs. Sans code, la porte reste protégée par une multiplication à deux chiffres.
- **PWA** : manifeste, icônes maskables, service worker versionné (`CACHE_VERSION = 1.2.0`),
  installation sur l'écran d'accueil et fonctionnement hors ligne complet.
- **Barre d'onglets** en bas (Activités, Récompenses, Profil, Parents).
- **Décors illustrés** (ciel, prairie, coucher de soleil) et images réalistes des objets,
  avec repli vectoriel si une photo manque (`npm run photos`).

### Qualité et outillage
- Banc de test Web sans navigateur (`npm run test:web`) : profils, ouverture des 36 activités,
  additions jouées, récompenses, édition de profil, porte parentale, réglages, langue,
  réinitialisation.
- **Nouveau banc `npm run test:activities`** : chaque activité des quatre tranches est réellement
  jouée, manche après manche, jusqu'à la carte de fin de session (36/36).
- Test du service worker (`npm run test:sw`) : précache, purge des anciens caches, navigation et
  assets hors ligne, **et concordance entre `CACHE_VERSION` et la version de `package.json`**.
- Test des formats (`npm run test:layout`) : parcours complet en portrait 390×844 et paysage 844×390.
- Vérification des traductions (`npm run test:i18n`) : parité fr/en/ar, clés dynamiques et
  variables interpolées comprises.
- **Nouvel outil `npm run screenshots`** : régénère les captures du dossier `docs/screenshots`
  dans un vrai Chrome (portrait/paysage, clair/sombre). Le workflow « Captures » les produit
  sur GitHub Actions et les commite.
- Intégration continue : typage, export Web, service worker, parcours clair **et** sombre,
  formats de téléphone et activités jouées à chaque push et chaque pull request.

### Correctifs
- Sessions 0-2 créditées une seule fois : plus de double fenêtre de récompense ni d'impasse
  en fin d'activité.
- Cibles tactiles portées à 48 px minimum et jeux resserrés en paysage sur téléphone.
- Consigne lisible et fenêtre de récompense contenue en paysage (mascotte et étoiles réduites).
- Plateaux dimensionnés sur la place réellement disponible : le tracé et le dénombrement ne
  débordent plus sous l'écran.
- Cartes de profil : le crayon d'édition ne déclenche plus l'ouverture de l'accueil.
- Titres d'écran sur deux lignes et récompenses accessibles même sans profil actif.
- Libellés d'accessibilité traduits (plus de texte français codé en dur en anglais ou en arabe).
- Erreurs React éliminées de la console Web ; images des objets ignorées si le nom est inconnu.

### Limites connues
- **Captures** : elles sont produites par `npm run screenshots`, qui exige un Chrome installé ;
  dans l'environnement de préparation de cette version, aucun navigateur ne pouvait démarrer,
  les images ont donc été générées par la CI GitHub (workflow « Captures »).
- **Arabe** : « Les syllabes » devient « la première lettre » (découper un mot arabe déformerait
  l'écriture) ; le sens RTL est appliqué au document Web, un redémarrage est nécessaire sur natif.
- **Monnaie** : euros uniquement, pas encore de devise configurable.
- **Activités 6-8 ans** : à choix multiple, sans manipulation au doigt (contrairement aux 3-5).
- **Voix off** : synthèse native du système (pas d'enregistrements studio embarqués).
- **Code parental** : stocké en clair dans le stockage local ; c'est une protection contre les
  fausses manœuvres, pas un secret cryptographique (l'écran le précise).
- **Tests** : le banc Web simule jsdom et un geste souris ; il ne remplace pas un essai sur un
  vrai téléphone (retour haptique, audio, lecteurs d'écran).

---

## [1.1.0] — 2026-10-20

### Ajouts
- Cinq activités de vie pratique pour les 3-5 ans : **Trier**, **Les paires**, **Puzzles**,
  **Verser**, **Les fermetures** — gestes guidés, sans chrono ni sanction.
- Fonds d'écran colorés et illustrés, images réalistes des objets avec repli SVG.

### Correctifs
- Cibles tactiles et glisser-déposer fiables sur mobile.
- Plateaux dimensionnés sur l'espace réellement disponible.
- Libellés d'accessibilité encore codés en dur traduits.

---

## [1.0.0] — 2026-10-19

### Ajouts
- Socle complet : navigation, thème, i18n FR/EN/AR + RTL, profils multiples, persistance locale,
  récompenses, espace parents protégé, difficulté adaptative, mode hors ligne, accessibilité
  (mode daltonisme, animations réduites, sous-titres de la mascotte).
- Activités : **Éveil sensoriel** (0-2) et **Les couleurs**, **Les formes**, **Les chiffres**,
  **Tracer les chiffres** (3-5).
- Publication Web sur GitHub Pages (workflow de déploiement continu).
