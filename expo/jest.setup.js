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

// No reemplazar window. jest-expo ya provee uno con temporizadores; sustituirlo
// por un objeto que solo tiene localStorage hacia que Firebase resolviera su
// `globalObj` a ese objeto pelado y reventara con
// "globalObj.setTimeout is not a function". Esa era la causa de los 12 fallos
// de AuthContext, y estaba en la configuracion de pruebas, no en la app.
if (typeof global.window === 'undefined' || global.window === null) {
  global.window = global;
}
global.window.localStorage = mockLocalStorage;
for (const nombre of ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']) {
  if (typeof global.window[nombre] !== 'function' && typeof global[nombre] === 'function') {
    global.window[nombre] = global[nombre].bind(global);
  }
}

global.localStorage = mockLocalStorage;

jest.mock('@react-native-async-storage/async-storage', () => mockLocalStorage);


// El automock de firebase/auth hace que onAuthStateChanged devuelva undefined.
// AuthContext guarda ese retorno para darse de baja al desmontar, asi que al
// desmontar reventaba con "unsubscribe is not a function" y se llevaba por
// delante las 12 pruebas del contexto. El contrato real de Firebase es
// devolver una funcion de baja; el mock ahora la devuelve.
const mockFirebaseAuth = require('firebase/auth');
for (const nombre of ['onAuthStateChanged', 'onIdTokenChanged']) {
  const fn = mockFirebaseAuth[nombre];
  if (fn && typeof fn.mockImplementation === 'function') {
    fn.mockImplementation(() => () => {});
  }
}
