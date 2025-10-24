/**
 * Cache Strategy Helpers
 * Helper functions for Workbox runtime caching configurations
 * Makes next.config.mjs cleaner and more maintainable
 */

/**
 * Get CacheFirst strategy configuration
 * Best for: Static assets, fonts, images
 * @param {string} cacheName - Name of the cache
 * @param {number} maxAgeSeconds - Max age in seconds (default: 365 days)
 * @param {number} maxEntries - Max number of entries (default: 60)
 * @returns {Object} Workbox strategy configuration
 */
export function getCacheFirstConfig(cacheName, maxAgeSeconds = 365 * 24 * 60 * 60, maxEntries = 60) {
  return {
    handler: 'CacheFirst',
    options: {
      cacheName,
      expiration: {
        maxEntries,
        maxAgeSeconds,
      },
    },
  };
}

/**
 * Get NetworkFirst strategy configuration
 * Best for: API routes, dynamic content
 * @param {string} cacheName - Name of the cache
 * @param {number} networkTimeoutSeconds - Network timeout (default: 10s)
 * @param {number} maxAgeSeconds - Max age in seconds (default: 1 day)
 * @param {number} maxEntries - Max number of entries (default: 50)
 * @returns {Object} Workbox strategy configuration
 */
export function getNetworkFirstConfig(
  cacheName,
  networkTimeoutSeconds = 10,
  maxAgeSeconds = 24 * 60 * 60,
  maxEntries = 50
) {
  return {
    handler: 'NetworkFirst',
    options: {
      cacheName,
      networkTimeoutSeconds,
      expiration: {
        maxEntries,
        maxAgeSeconds,
      },
    },
  };
}

/**
 * Get StaleWhileRevalidate strategy configuration
 * Best for: JS/CSS, frequently updated but cacheable content
 * @param {string} cacheName - Name of the cache
 * @param {number} maxAgeSeconds - Max age in seconds (default: 1 day)
 * @param {number} maxEntries - Max number of entries (default: 60)
 * @returns {Object} Workbox strategy configuration
 */
export function getStaleWhileRevalidateConfig(
  cacheName,
  maxAgeSeconds = 24 * 60 * 60,
  maxEntries = 60
) {
  return {
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName,
      expiration: {
        maxEntries,
        maxAgeSeconds,
      },
    },
  };
}

/**
 * Get CacheOnly strategy configuration
 * Best for: Pre-cached assets that never change
 * @param {string} cacheName - Name of the cache
 * @returns {Object} Workbox strategy configuration
 */
export function getCacheOnlyConfig(cacheName) {
  return {
    handler: 'CacheOnly',
    options: {
      cacheName,
    },
  };
}

/**
 * Get NetworkOnly strategy configuration
 * Best for: APIs that should never be cached
 * @returns {Object} Workbox strategy configuration
 */
export function getNetworkOnlyConfig() {
  return {
    handler: 'NetworkOnly',
  };
}

/**
 * Create runtime caching array for next-pwa
 * Default configuration for Fasting Tracker app
 * @returns {Array} Array of runtime caching rules
 */
export function getDefaultRuntimeCaching() {
  return [
    // Google Fonts - Cache for 1 year
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      ...getCacheFirstConfig('google-fonts', 365 * 24 * 60 * 60, 20),
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      ...getStaleWhileRevalidateConfig('google-fonts-stylesheets', 365 * 24 * 60 * 60, 20),
    },

    // API: Entries (NetworkFirst with 10s timeout)
    {
      urlPattern: /^\/api\/entries.*/i,
      ...getNetworkFirstConfig('api-entries', 10, 24 * 60 * 60, 50),
    },

    // API: Settings (StaleWhileRevalidate)
    {
      urlPattern: /^\/api\/settings.*/i,
      ...getStaleWhileRevalidateConfig('api-settings', 24 * 60 * 60, 20),
    },

    // Images - Cache for 1 day
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      ...getCacheFirstConfig('images', 24 * 60 * 60, 60),
    },

    // Static JS/CSS - StaleWhileRevalidate for 1 day
    {
      urlPattern: /\.(?:js|css)$/i,
      ...getStaleWhileRevalidateConfig('static-resources', 24 * 60 * 60, 60),
    },
  ];
}

export default {
  getCacheFirstConfig,
  getNetworkFirstConfig,
  getStaleWhileRevalidateConfig,
  getCacheOnlyConfig,
  getNetworkOnlyConfig,
  getDefaultRuntimeCaching,
};
