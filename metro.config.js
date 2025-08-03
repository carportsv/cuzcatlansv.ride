// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configurar resolver para módulos problemáticos
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-webview': false,
  '@gorhom/bottom-sheet': false,
  'react-native-country-picker-modal': './src/components/CountryPickerWrapper.tsx',
};

module.exports = config;
