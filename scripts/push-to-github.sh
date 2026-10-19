#!/usr/bin/env bash
#
# Crée le dépôt GitHub (s'il n'existe pas) et pousse le projet.
#
# Utilisation :
#   GITHUB_TOKEN=ghp_xxx ./scripts/push-to-github.sh <compte> [nom-du-depot]
#
# Le token doit avoir la permission « Administration: write » (ou le scope
# classique `repo`) pour créer le dépôt. Il n'est jamais écrit sur le disque :
# il est passé au remote via un en-tête d'authentification à la volée.

set -euo pipefail

OWNER="${1:-}"
REPO="${2:-montessoriclub}"
TOKEN="${GITHUB_TOKEN:-}"

if [[ -z "$OWNER" || -z "$TOKEN" ]]; then
  echo "Usage : GITHUB_TOKEN=<token> $0 <compte-github> [nom-du-depot]"
  exit 1
fi

echo "→ Vérification du dépôt $OWNER/$REPO…"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$OWNER/$REPO")

if [[ "$STATUS" == "404" ]]; then
  echo "→ Création du dépôt public $OWNER/$REPO…"
  curl -sS -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO\",\"description\":\"Montessori Club — application éducative Montessori 0-12 ans (Expo / React Native / Web)\",\"private\":false,\"has_issues\":true,\"has_wiki\":false}" \
    > /dev/null
elif [[ "$STATUS" != "200" ]]; then
  echo "✗ Impossible de vérifier le dépôt (HTTP $STATUS)."
  exit 1
fi

echo "→ Configuration du remote…"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$REPO.git"

echo "→ Push de la branche main…"
git -c http.extraheader="AUTHORIZATION: bearer $TOKEN" push -u origin main

echo
echo "✓ Projet poussé : https://github.com/$OWNER/$REPO"
echo "→ Activez GitHub Pages : Settings → Pages → Source : « GitHub Actions »"
echo "  L'URL Web sera : https://$OWNER.github.io/$REPO/"
