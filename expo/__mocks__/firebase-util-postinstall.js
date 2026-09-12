// Stub CommonJS para @firebase/util/dist/postinstall.mjs.
// Ese archivo es ESM puro y jest-expo no lo transforma, lo que impedia
// que corriera la suite de AuthContext.
module.exports = { getDefaultsFromPostinstall: () => undefined };
