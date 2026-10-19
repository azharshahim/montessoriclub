# Publication GitHub — état : ✅ TERMINÉ

Le projet a été poussé et déployé.

| | |
|---|---|
| **Dépôt** | https://github.com/azharshahim/montessoriclub |
| **Démo HTTPS** | https://azharshahim.github.io/montessoriclub/ |
| **CI/CD** | https://github.com/azharshahim/montessoriclub/actions/workflows/deploy-web.yml |
| **Branche** | `main` — 5 commits, 84 fichiers |
| **Pages** | source `GitHub Actions`, HTTPS forcé |

---

## Déploiement continu

`.github/workflows/deploy-web.yml` s'exécute à chaque `git push` sur `main` :

1. `npm ci`
2. `npx tsc --noEmit` — échec du déploiement si une erreur de type est introduite
3. `npx expo export --platform web` avec `EXPO_BASE_URL=/montessoriclub`
4. copie `index.html → 404.html` (routage SPA) et `.nojekyll`
5. publication sur GitHub Pages (≈ 3 min)

Pour mettre à jour le site en ligne :

```bash
git add -A
git commit -m "feat: ..."
git push
```

Aucune commande de déploiement supplémentaire : tout est automatique.

---

## Si vous devez refaire la configuration sur un nouveau dépôt

1. Créer le dépôt : [github.com/new](https://github.com/new?name=montessoriclub&visibility=public)
   — **Public**, sans README ni .gitignore.
2. Pousser :

```bash
git remote add origin https://github.com/<compte>/montessoriclub.git
git push -u origin main
```

3. Activer Pages : **Settings → Pages → Source : GitHub Actions**
   (ou via l'API : `POST /repos/{owner}/{repo}/pages` avec `{"build_type":"workflow"}`).
4. Suivre le premier run dans l'onglet **Actions**.

> Push manuel : GitHub n'accepte plus le mot de passe du compte. Utiliser un
> **Personal Access Token** (fine-grained : *Contents Read/write* + *Administration Read/write*)
> comme mot de passe, ou `gh auth login`.

---

## Recommandations de sécurité

- Le **Personal Access Token** utilisé pour ce déploiement a été supprimé du sandbox
  juste après le push. S'il a circulé par un autre canal (chat, e-mail…),
  **révoquez-le** : GitHub → Settings → Developer settings → Personal access tokens.
- Pour les prochaines publications, préférez `gh auth login` (stockage sécurisé par le
  système) ou un token fine-grained restreint à ce seul dépôt.
- `.gitignore` exclut déjà `node_modules/`, `dist/`, `.expo/`, les clés de signature
  (`*.jks`, `*.p8`, `*.p12`) et les fichiers `.env*.local`.
