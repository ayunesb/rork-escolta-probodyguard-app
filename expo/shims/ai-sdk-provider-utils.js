/**
 * Metro shim for `@ai-sdk/provider-utils`.
 *
 * The real package contains a dynamic `import(id)` (dist/index.mjs line ~410)
 * that Metro cannot statically analyze, which fails the bundle with
 * "Invalid call at line 410: import(id)".
 *
 * The app does not use the AI SDK directly (it is only a transitive
 * dependency of @rork-ai/toolkit-sdk), so this Proxy-based no-op shim is a
 * safe stand-in: any named export resolves to a callable stub.
 */

const handler = {
  get(_target, prop) {
    if (prop === "__esModule") {
      return true;
    }
    if (prop === "default") {
      return stubValue;
    }
    return stubFn;
  },
};

function stubFn() {
  return stubValue;
}

function stubValue() {
  return stubFn;
}

// Make the stub safe if it is awaited or iterated by accident.
Object.defineProperties(stubFn, {
  then: { value: (onFulfilled) => Promise.resolve({}).then(onFulfilled) },
  [Symbol.iterator]: {
    value: function* () {
      yield stubFn;
    },
  },
});

Object.defineProperties(stubValue, {
  then: { value: (onFulfilled) => Promise.resolve({}).then(onFulfilled) },
});

module.exports = new Proxy({}, handler);
