// Configuracion estandar de Expo. Antes envolvia el config con withRorkMetro
// de @rork-ai/toolkit-sdk; se retiro para que el proyecto no dependa de Rork.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
