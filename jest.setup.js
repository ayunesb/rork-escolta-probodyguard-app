const localStorageData = {};

global.window = {
  localStorage: {
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
      Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
    },
    get length() {
      return Object.keys(localStorageData).length;
    },
    key(index) {
      const keys = Object.keys(localStorageData);
      return keys[index] || null;
    },
  },
};

global.localStorage = global.window.localStorage;
