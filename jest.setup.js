let localStorageData = {};

// Mock Firebase to prevent ESM import errors
jest.mock('firebase/firestore');
jest.mock('firebase/auth');
jest.mock('firebase/database');
jest.mock('firebase/storage');
jest.mock('firebase/analytics');

const mockLocalStorage = {
  getItem(key) {
    return localStorageData[key] || null;
  },
  setItem(key, value) {
    localStorageData[key] = value;
  },
  removeItem(key) {
    delete localStorageData[key];
  },
  clear() {
    localStorageData = {};
  },
  get length() {
    return Object.keys(localStorageData).length;
  },
  key(index) {
    const keys = Object.keys(localStorageData);
    return keys[index] || null;
  },
  getAllKeys() {
    return Promise.resolve(Object.keys(localStorageData));
  },
  multiRemove(keys) {
    keys.forEach(key => delete localStorageData[key]);
    return Promise.resolve();
  },
};

global.window = {
  localStorage: mockLocalStorage,
};

global.localStorage = mockLocalStorage;

jest.mock('@react-native-async-storage/async-storage', () => mockLocalStorage);
