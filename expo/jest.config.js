export default {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'utils/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'backend/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/constants/(.*)$': '<rootDir>/constants/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
  },
};
