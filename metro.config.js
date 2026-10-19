// Configuration Metro par défaut d'Expo, avec support des .wav / .mp3 pour les sons.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'wav', 'mp3', 'ogg'])
);

module.exports = config;
