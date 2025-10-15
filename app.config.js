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
      favicon: './assets/favicon.png',
      bundler: 'metro',
      config: {
        // Content Security Policy for web
        meta: {
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.braintreegateway.com https://checkout.paypal.com https://www.paypal.com",
            "style-src 'self' 'unsafe-inline' https://checkout.paypal.com https://fonts.googleapis.com",
            "img-src 'self' data: https: https://checkout.paypal.com https://assets.braintreegateway.com",
            "connect-src 'self' https://api.braintreegateway.com https://api.sandbox.braintreegateway.com https://firestore.googleapis.com https://firebase.googleapis.com wss://*.firebaseio.com",
            "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
            "frame-src https://checkout.paypal.com https://assets.braintreegateway.com",
            "object-src 'none'",
            "base-uri 'self'"
          ].join('; ')
        }
      }
    },
    owner: 'ayunesb',
    extra: {
      braintreeEnv: process.env.EXPO_PUBLIC_BRAINTREE_ENV,
      braintreeMerchantId: process.env.EXPO_PUBLIC_BRAINTREE_MERCHANT_ID,
      braintreePublicKey: process.env.EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY,
      braintreePrivateKey: process.env.EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY,
      testNonces: process.env.EXPO_PUBLIC_BRAINTREE_TEST_NONCES ? process.env.EXPO_PUBLIC_BRAINTREE_TEST_NONCES.split(',') : [],

      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,

      // === EAS PROJECT LINK ===
      eas: {
        projectId: '7cee6c31-9a1c-436d-9baf-57fc8a43b651'
      }
    }
  }
  ,
  scheme: 'nobodyguard'
};
