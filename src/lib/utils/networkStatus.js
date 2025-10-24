/**
 * Network Status Utility
 * Utility functions for network detection and monitoring
 * Wraps Navigator API with safe defaults for SSR
 */

/**
 * Check if browser is currently online
 * @returns {boolean} True if online (or unknown in SSR)
 */
export function isOnline() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true; // Assume online in SSR
  }

  return navigator.onLine;
}

/**
 * Wait for browser to be online
 * Resolves immediately if already online
 * @param {number} timeout - Optional timeout in milliseconds
 * @returns {Promise<void>} Resolves when online
 * @throws {Error} If timeout exceeded
 */
export function waitForOnline(timeout = 0) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(); // Resolve immediately in SSR
      return;
    }

    if (navigator.onLine) {
      resolve(); // Already online
      return;
    }

    let timeoutId = null;

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      if (timeoutId) clearTimeout(timeoutId);
      resolve();
    };

    window.addEventListener('online', handleOnline);

    // Set timeout if specified
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        window.removeEventListener('online', handleOnline);
        reject(new Error(`Timeout waiting for online: ${timeout}ms`));
      }, timeout);
    }
  });
}

/**
 * Get connection type using Network Information API
 * @returns {string | null} Connection type or null if not supported
 */
export function getConnectionType() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null; // Not available in SSR
  }

  // Network Information API (limited browser support)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return null; // API not supported
  }

  return connection.effectiveType || connection.type || null;
}

/**
 * Get connection information object
 * Includes online status, type, and effective type
 * @returns {Object} Connection information
 */
export function getConnectionInfo() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      online: true,
      type: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
    };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return {
    online: navigator.onLine,
    type: connection ? (connection.type || null) : null,
    effectiveType: connection ? (connection.effectiveType || null) : null,
    downlink: connection ? (connection.downlink || null) : null, // Mbps
    rtt: connection ? (connection.rtt || null) : null, // Round-trip time in ms
  };
}

/**
 * Check if connection is fast enough for heavy operations
 * Uses Network Information API if available
 * @returns {boolean} True if connection is fast (or unknown)
 */
export function isFastConnection() {
  if (typeof window === 'undefined') {
    return true; // Assume fast in SSR
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection || !connection.effectiveType) {
    return true; // Assume fast if unknown
  }

  // Consider '4g' and 'wifi' as fast
  // '3g', '2g', 'slow-2g' as slow
  const fastTypes = ['4g', 'wifi'];
  return fastTypes.includes(connection.effectiveType);
}

/**
 * Add listener for online/offline events
 * @param {Function} callback - Called with boolean (true = online, false = offline)
 * @returns {Function} Cleanup function to remove listeners
 */
export function onNetworkChange(callback) {
  if (typeof window === 'undefined') {
    return () => {}; // No-op in SSR
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Add listener for connection type changes
 * Uses Network Information API if available
 * @param {Function} callback - Called with connection info object
 * @returns {Function} Cleanup function to remove listener
 */
export function onConnectionChange(callback) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return () => {}; // No-op in SSR
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return () => {}; // API not supported
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  const handleChange = () => {
    callback(getConnectionInfo());
  };

  connection.addEventListener('change', handleChange);

  // Return cleanup function
  return () => {
    connection.removeEventListener('change', handleChange);
  };
}

export default {
  isOnline,
  waitForOnline,
  getConnectionType,
  getConnectionInfo,
  isFastConnection,
  onNetworkChange,
  onConnectionChange,
};
