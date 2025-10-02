let localStorageData = {};

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
