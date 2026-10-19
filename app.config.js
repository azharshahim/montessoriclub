/**
 * Configuration Expo dynamique.
 *
 * `app.json` reste la source de vérité. Ce fichier ne fait qu'ajouter un
 * paramètre d'environnement, utile pour déployer le build Web sur un
 * sous-chemin (GitHub Pages : /nom-du-depot/).
 *
 *   EXPO_BASE_URL=/montessoriclub npx expo export --platform web
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL?.trim();
  if (!baseUrl || baseUrl === '/') return config;

  return {
    ...config,
    experiments: {
      ...(config.experiments ?? {}),
      baseUrl,
    },
  };
};
