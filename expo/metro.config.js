const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

const withAiSdkShim = (cfg) => ({
  ...cfg,
  resolver: {
    ...cfg.resolver,
    resolveRequest: (context, moduleName, platform) => {
      // `@ai-sdk/provider-utils` ships an ESM build with a dynamic
      // `import(id)` call that Metro cannot statically analyze
      // ("Invalid call at line 410: import(id)"). The app never uses the
      // AI SDK directly, so swap in a safe no-op shim.
      if (moduleName === "@ai-sdk/provider-utils") {
        return {
          filePath: path.resolve(__dirname, "shims/ai-sdk-provider-utils.js"),
          type: "sourceFile",
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
});

module.exports = withRorkMetro(withAiSdkShim(config));
