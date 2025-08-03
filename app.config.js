import 'dotenv/config';

export default {
  expo: {
    name: 'cuzcatlansv.ride (OpenStreet)',
    slug: 'sv-tazkt-openstreet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'taxizkt',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.carposv.taxizkt',
      runtimeVersion: {
        policy: "appVersion"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.carposv.taxizkt',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'INTERNET',
      ],
      runtimeVersion: "1.0.0"
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'webpack',
    },
    extra: {
      eas: {
        projectId: "289efbd4-c735-426e-a091-39c0b2d7d02b"
      }
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.'
        }
      ]
    ],
  },
};
