const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** Metro default port (used by dev clients and bundler) */
const METRO_PORT = parseInt(process.env.RCT_METRO_PORT || '8081', 10);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: METRO_PORT,
    // Listen on all interfaces so devices/tunnels can connect
    enhanceMiddleware: (middleware) => middleware,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
