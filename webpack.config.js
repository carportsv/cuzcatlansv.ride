const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Alias para módulos problemáticos
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-webview': false,
    '@gorhom/bottom-sheet': false,
    'react-native-country-picker-modal': path.resolve(__dirname, 'src/components/CountryPickerWrapper.tsx'),
  };

  // Configuración adicional para evitar problemas de compatibilidad
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
  };

  // Configurar plugins para webpack 5
  config.plugins = config.plugins || [];
  
  return config;
}; 