import 'dotenv/config';

export default {
  expo: {
    name: 'Escolta Pro',
    slug: 'escolta-pro',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'escoltapro',
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
      bundleIdentifier: "com.escolta.pro",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            'localhost': {
              NSExceptionAllowsInsecureHTTPLoads: true
            },
            'exp.direct': {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            },
            '127.0.0.1': {
              NSExceptionAllowsInsecureHTTPLoads: true
            }
          }
        }
      }
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
      // === BRAINTREE CONFIGURATION (CLIENT-SAFE) ===
      // Only expose environment and tokenization key - never private credentials!
      braintreeEnv: process.env.EXPO_PUBLIC_BRAINTREE_ENV || 'sandbox',
      braintreeTokenizationKey: process.env.EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY,

      // === FIREBASE CONFIGURATION ===
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,

      // === EAS PROJECT LINK ===
      eas: {
        projectId: '7cee6c31-9a1c-436d-9baf-57fc8a43b651'
      }
    },
    plugins: [
      'expo-web-browser'
    ]
  }
  ,
  scheme: 'nobodyguard'
};
