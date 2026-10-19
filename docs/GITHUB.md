# Publier sur GitHub

Le dépôt local est **prêt et committé** (branche `main`, 80 fichiers, historique propre).
Il ne manque qu'une authentification GitHub pour créer le dépôt distant et pousser.

---

## Option A — en une commande (recommandé)

```bash
cd montessoriclub
export GITHUB_TOKEN=ghp_votre_token     # ne jamais committer ce token
./scripts/push-to-github.sh azharshahim
```

Le script :
1. vérifie si `montessoriclub` existe déjà sur le compte ;
2. le crée en **public** si nécessaire (API GitHub) ;
3. configure `origin` et pousse `main`.

### Créer le token (2 minutes)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. **Generate new token**
   - *Repository access* : **All repositories** (nécessaire pour créer un dépôt)
   - *Permissions* → *Repository permissions* → **Administration : Read and write**
   - *Permissions* → *Repository permissions* → **Contents : Read and write**
3. Copier le token (affiché une seule fois), l'utiliser dans la commande ci-dessus,
   puis **le révoquer** une fois le push terminé.

---

## Option B — dépôt créé à la main

1. Ouvrir **[github.com/new](https://github.com/new?name=montessoriclub&visibility=public)**
   → nom `montessoriclub` → **Public** → *sans* README ni .gitignore → **Create repository**.
2. Puis, dans le dossier du projet :

```bash
cd montessoriclub
git remote add origin https://github.com/azharshahim/montessoriclub.git
git push -u origin main
```

> GitHub demande un mot de passe ? Utilisez un **token** comme mot de passe
> (le mot de passe du compte ne fonctionne plus depuis 2021).
> Ou lancez `gh auth login` si GitHub CLI est installé.

---

## Activer la démo permanente (GitHub Pages)

Le workflow `.github/workflows/deploy-web.yml` est déjà en place : il installe,
vérifie les types, exporte le build Web et le publie.

1. Dépôt → **Settings** → **Pages**
2. **Source** : `GitHub Actions`
3. Aller dans l'onglet **Actions**, attendre la fin du job « Déploiement Web ».
4. URL finale : **https://azharshahim.github.io/montessoriclub/**

À chaque `git push` sur `main`, le site est reconstruit et republié automatiquement.
`app.config.js` adapte le chemin de base (`/montessoriclub`) pour que les assets
soient correctement servis depuis un sous-dossier.

---

## Vérifier le dépôt local

```bash
cd montessoriclub
git log --oneline          # 1 commit : v1.0
git ls-files | wc -l       # 80 fichiers suivis
git status                 # propre
```

`.gitignore` exclut déjà `node_modules/`, `dist/`, `.expo/`, les clés de signature
(`*.jks`, `*.p8`, `*.p12`) et les fichiers `.env*.local`.
