# Lancer, tester et publier

> Checklist opérationnelle, de `npm install` à la mise en ligne sur l'App Store,
> Google Play et le Web.

---

## 1. Prérequis

| Outil | Version | Notes |
|---|---|---|
| Node.js | **≥ 22.13** (requis par Expo SDK 58) | Node 20 fonctionne mais affiche un avertissement |
| npm | ≥ 10 | |
| Git | — | |
| Compte Expo | gratuit | `npx expo login` |
| Compte Apple Developer | 99 $/an | pour l'App Store |
| Compte Google Play | 25 $ une fois | pour le Play Store |
| EAS CLI | `npm i -g eas-cli` | builds cloud, sans Mac pour iOS |

---

## 2. Lancer en local

```bash
cd montessoriclub
npm install
npm run typecheck      # TypeScript strict : doit afficher 0 erreur
npm start              # QR code → Expo Go (iOS/Android)
npm run web            # http://localhost:8081
```

### Vérifier que tout fonctionne

1. Créer un profil « Lina », tranche 3-5 ans.
2. Ouvrir **Les couleurs**, glisser les 4 objets dans les paniers → écran « Bravo ».
3. **Les chiffres** : compter, toucher le bon chiffre.
4. **Tracer les chiffres** : suivre les points lumineux jusqu'à 100 %.
5. Accueil → **Récompenses** : les étoiles ont augmenté.
6. Accueil → **Parents** : résoudre la multiplication, vérifier la progression,
   changer la langue en arabe (l'interface passe en RTL).
7. Couper le réseau : l'application continue de fonctionner (mode hors ligne).

### Export Web statique

```bash
npm run build:web          # génère dist/
npx serve dist             # ou : python3 -m http.server 8080 --directory dist
```

---

## 3. Build natif avec EAS

```bash
npm i -g eas-cli
eas login
eas init                   # crée le projet, ajoute extra.eas.projectId dans app.json
```

`eas.json` fournit déjà trois profils : `development` (client de dev), `preview` (APK interne),
`production` (AAB + IPA).

```bash
# Builds de test
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Builds de production
eas build --platform all --profile production
```

### Identifiants à personnaliser avant publication

| Fichier | Champ | Valeur |
|---|---|---|
| `app.json` | `expo.ios.bundleIdentifier` | `com.VOTRE_SOCIETE.montessoriclub` |
| `app.json` | `expo.android.package` | idem, format Java inversé |
| `app.json` | `expo.name`, `expo.slug` | nom affiché / slug unique |
| `eas.json` | `submit.production.ios.appleId` | votre Apple ID |
| `eas.json` | `submit.production.ios.ascAppId` | App Store Connect → ID de l'app |
| `eas.json` | `submit.production.android.serviceAccountKeyPath` | JSON du compte de service Play |

---

## 4. App Store (iOS)

### 4.1 Créer l'application

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → *New App*.
2. Plateforme iOS, nom « Montessori Club », langue principale **Français**,
   Bundle ID = celui de `app.json`, SKU libre.
3. Renseigner :
   - **Catégorie** : Éducation (primaire) + Enfants si la tranche 0-5 domine.
   - **Âge** : 4+ (aucun contenu sensible, aucun achat, aucune publicité).
   - **Politique de confidentialité** : URL obligatoire (voir §7).
   - **Support** : URL ou e-mail de contact.

### 4.2 Captures et textes (obligatoires)

| Élément | Dimensions | Contenu recommandé |
|---|---|---|
| Capture iPhone 6,9″ | 1290×2796 | Accueil + 3 activités |
| Capture iPhone 6,5″ | 1242×2688 | idem |
| Capture iPad 12,9″ | 2048×2732 | accueil en paysage |
| Icône | 1024×1024 | `assets/images/icon.png` |
| Sous-titre | 30 car. | « Apprendre en manipulant, 0–12 ans » |
| Mots-clés | 100 car. | montessori, éducation, enfant, formes, chiffres, lecture |
| Description | 4 000 car. | bénéfices, tranches d'âge, sans pub, hors ligne |

### 4.3 Enfants et confidentialité — points à cocher

- **"Made for Kids"** n'existe pas sur l'App Store : utiliser la catégorie Enfants
  et renseigner l'âge 4+.
- **Privacy Nutrition Label** : cocher **« Data Not Collected »** (exact pour cette app :
  rien ne quitte l'appareil).
- **App Tracking Transparency** : non requis (aucun tracking).
- **Guideline 1.3 (Kids)** : aucune publicité comportementale, aucun lien sortant —
  l'application respecte ces règles par construction.
- **Guideline 5.1.1** : la création de profil est locale, sans compte ni e-mail.
- Exiger l'accord parental pour tout achat : il n'y en a aucun.
- Renseigner `ITSAppUsesNonExemptEncryption = false` (déjà dans `app.json`).

### 4.4 Soumettre

```bash
eas submit --platform ios --profile production
```
Puis dans App Store Connect : sélectionner le build, remplir « What's New », soumettre.
Délai de revue habituel : 24–48 h.

---

## 5. Google Play (Android)

### 5.1 Créer l'application

1. [Play Console](https://play.google.com/console) → **Create app**.
2. Nom, langue par défaut **Français**, type **App**, **Gratuit**.
3. Déclarations obligatoires :
   - **Application destinée aux enfants** : oui → respecter la *Families Policy*
     (pas de pub, pas de collecte d'ID publicitaire, pas de liens externes non approuvés).
   - **Sécurité des données** : « Aucune donnée collectée ni partagée ».
   - **Publicités** : non.
   - **Achats intégrés** : non.
   - **Contenu** : Éducation.

### 5.2 Fiche Play Store

| Élément | Dimension | Contenu |
|---|---|---|
| Icône | 512×512 PNG | `icon.png` redimensionné |
| Bannière | 1024×500 | mascotte + titre |
| Captures téléphone | ≥ 2, 16:9 ou 9:16 | 4 à 8 captures |
| Captures 7″ / 10″ | recommandé | mode paysage |
| Vidéo | YouTube, 30 s | optionnel mais fortement conseillé |

**Classification** : remplir le questionnaire IARC (aucune violence, aucun contenu sensible
→ « Everyone / 3+ »).

### 5.3 Compte de service et publication

1. Google Cloud → créer un compte de service → rôle *Release manager* dans Play Console.
2. Télécharger la clé JSON → `secrets/play-service-account.json` (git-ignoré).
3. Build + envoi :

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

4. Première version : elle part en **revue interne**, puis il faut la promouvoir
   manuellement en production depuis la Play Console.
   Pour les mises à jour suivantes, un *track* de test interne → fermé → ouvert → production
   est recommandé.

### 5.4 Politique Familles — pièges fréquents

- Ne **jamais** utiliser d'ID publicitaire (aucune dépendance de ce type ici).
- L'espace parents doit être **derrière une barrière adulte** : c'est le cas (porte mathématique).
- Aucune sortie web non approuvée depuis l'espace enfant : il n'y a aucun lien sortant.
- Déclarer les permissions réellement utilisées. Cette app n'en demande aucune de sensible.

---

## 6. Web (PWA)

### 6.1 Build et déploiement

```bash
npm run build:web        # → dist/
```

| Hébergeur | Commande / réglage |
|---|---|
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **Vercel** | `vercel --prod` (framework « Other », output `dist`) |
| **Cloudflare Pages** | build `npm run build:web`, output `dist` |
| **S3 + CloudFront** | upload `dist/`, index `index.html`, error `index.html` |

### 6.2 Réglages recommandés

```
Cache-Control: max-age=31536000, immutable   → /_expo/static/** et /assets/**
Cache-Control: no-cache                       → /index.html
Content-Type: application/wasm                → si ajout de WASM plus tard
```

En-têtes de sécurité :

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src 'self';
  style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 6.3 PWA

`app.json → expo.web` configure déjà nom, couleurs, `display: standalone` et favicon.
Pour un service worker complet (installation + cache hors ligne), ajouter `expo-pwa` ou
un `sw.js` généré à la main dans `public/` :

```js
const CACHE = 'mc-v1';
self.addEventListener('install', (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/index.html'])))
);
self.addEventListener('fetch', (e) =>
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)))
);
```

> Attention : sur le Web, l'audio ne démarre qu'après une interaction utilisateur.
> L'application initialise son moteur audio au premier toucher (comportement natif des navigateurs).

---

## 7. Pages légales obligatoires

Les deux stores exigent une **URL de politique de confidentialité accessible sans compte**.
Modèle adapté à cette application (à héberger sur votre domaine) :

```markdown
# Politique de confidentialité — Montessori Club

Dernière mise à jour : {date}

## Principe
Montessori Club ne collecte, ne transmet et ne partage aucune donnée personnelle.

## Données stockées sur l'appareil
- Prénom ou pseudonyme de l'enfant (choisi librement par le parent)
- Tranche d'âge, avatar, progression, temps d'utilisation
Ces données restent dans l'espace de stockage local de l'application. Elles sont
supprimées lorsque le parent supprime le profil ou désinstalle l'application.

## Absence de collecte en ligne
L'application ne contient ni publicité, ni achat intégré, ni outil de mesure d'audience,
ni identifiant publicitaire. Aucune information n'est envoyée à nos serveurs : l'application
n'a pas de serveur.

## Enfants (RGPD-K / COPPA)
Aucun consentement parental n'est requis pour l'utilisation, car aucune donnée personnelle
d'enfant n'est collectée au sens du RGPD (art. 8) ni du COPPA (16 CFR Part 312).

## Droits
Le parent peut consulter, modifier ou supprimer l'intégralité des données depuis
l'espace parents protégé (Réglages → Réinitialiser la progression / Supprimer le profil).

## Contact
{adresse e-mail}
```

Prévoir également une **page d'assistance** avec FAQ + e-mail de contact.

---

## 8. Versioning et mises à jour

- `app.json → version` = version marketing (ex. `1.2.0`).
- `ios.buildNumber` et `android.versionCode` : incrémentés automatiquement
  par `eas.json → production.autoIncrement: true`.
- `runtimeVersion: { policy: "appVersion" }` : les mises à jour OTA (`expo-updates`)
  ne s'appliquent qu'entre builds de même version native.
- Procédure de release :

```bash
npm run typecheck && npm run build:web
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## 9. Tests avant chaque mise en production

| Test | Comment |
|---|---|
| TypeScript | `npm run typecheck` → 0 erreur |
| Build web | `npm run build:web` → export sans erreur |
| Parcours enfant | créer un profil, jouer une activité complète, voir les étoiles |
| Mode hors ligne | activer le mode avion, relancer l'app |
| Accessibilité | VoiceOver / TalkBack : chaque bouton est annoncé ; cibles ≥ 44 px |
| Daltonisme | activer le mode, vérifier que chaque couleur porte un motif |
| Arabe | passer en arabe, vérifier le RTL et la lisibilité |
| Limite d'écran | régler 10 min, vérifier le message « C'est l'heure de se reposer » |
| Porte parentale | 3 mauvaises réponses → verrouillage 30 s |
| Tablette / paysage | iPad 10″, Android 10″, iPhone SE (petit écran) |

---

## 10. Coûts et délais indicatifs

| Poste | Coût | Délai |
|---|---|---|
| Compte Apple Developer | 99 $/an | immédiat |
| Compte Google Play | 25 $ une fois | 24–48 h de vérification |
| EAS Build | gratuit (file d'attente) ou 99 $/mois | 10–30 min / build |
| Revue App Store | inclus | 24–48 h |
| Revue Play Store (nouveau compte) | inclus | 3–7 jours |
| Hébergement Web | gratuit (Netlify/Vercel) | immédiat |
