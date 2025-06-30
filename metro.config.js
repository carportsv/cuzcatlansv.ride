// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver configuration for path aliases
config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@/app': path.resolve(__dirname, 'app'),
  '@/src': path.resolve(__dirname, 'src'),
};

module.exports = config;
