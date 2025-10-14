import 'dotenv/config';

export default {
  expo: {
    name: 'Escolta Pro',
    slug: 'escolta-pro',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
  supportsTablet: true,
  bundleIdentifier: "com.escolta.pro"
},
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.escolta.pro'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    owner: 'ayunesb',
    extra: {
      // === BRAINTREE SANDBOX ===
      BRAINTREE_ENV: process.env.BRAINTREE_ENV,
      BRAINTREE_MERCHANT_ID: process.env.BRAINTREE_MERCHANT_ID,
      BRAINTREE_PUBLIC_KEY: process.env.BRAINTREE_PUBLIC_KEY,
      BRAINTREE_PRIVATE_KEY: process.env.BRAINTREE_PRIVATE_KEY,
      EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY: process.env.EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY,
      EXPO_PUBLIC_BRAINTREE_CSE_KEY: process.env.EXPO_PUBLIC_BRAINTREE_CSE_KEY,

      // === FIREBASE CONFIG ===
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,

      // === GENERAL CONFIG ===
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN: process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN,

      // === EAS PROJECT LINK ===
      eas: {
        projectId: '7cee6c31-9a1c-436d-9baf-57fc8a43b651'
      }
    }
  }
};
