// CommonJS shim to re-export @nkzw/create-context-hook in environments that expect CJS
try {
  const mod = require('@nkzw/create-context-hook');
  module.exports = mod && mod.default ? mod.default : mod;
} catch (e) {
  // If require fails, export a placeholder that throws when invoked so failures are explicit
  module.exports = function createContextHookPlaceholder() {
    throw new Error('Failed to load @nkzw/create-context-hook. Error: ' + (e && e.message));
  };
}
