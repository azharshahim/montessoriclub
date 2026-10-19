// babel-preset-expo (SDK 58) configure automatiquement :
//  - le plugin react-native-worklets (Reanimated 4)
//  - la transformation JSX / TypeScript
// Aucun plugin supplémentaire n'est nécessaire.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
