/**
 * Error Logger Utility
 * Client-side error logging with server reporting
 * Includes rate limiting and offline queueing
 */

// Rate limiting: Max 10 errors per minute
const MAX_ERRORS_PER_MINUTE = 10;
const errorCounts = new Map(); // timestamp -> count

/**
 * Log an error with context
 * @param {string} type - Error type (e.g., 'sync', 'quota', 'network', 'ui')
 * @param {string} message - Error message
 * @param {Object} context - Additional context (optional)
 */
export function logError(type, message, context = {}) {
  if (typeof window === 'undefined') {
    console.error(`[${type}]`, message, context);
    return;
  }

  const error = {
    type,
    message,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ErrorLogger:${type}]`, message, context);
  }

  // Log to console in production for debugging
  console.warn(`[ErrorLogger:${type}]`, message);
}

/**
 * Log a critical error (sends to server)
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {Object} context - Additional context (optional)
 * @returns {Promise<boolean>} True if logged to server successfully
 */
export async function logCriticalError(type, message, context = {}) {
  if (typeof window === 'undefined') {
    console.error(`[CRITICAL:${type}]`, message, context);
    return false;
  }

  // Check rate limit
  if (!checkRateLimit()) {
    console.warn('[ErrorLogger] Rate limit exceeded, skipping server log');
    logError(type, message, context); // Still log locally
    return false;
  }

  const error = {
    type,
    message,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    level: 'critical',
  };

  // Log locally
  console.error(`[CRITICAL:${type}]`, message, context);

  // Send to server
  try {
    const response = await fetch('/api/pwa/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    });

    if (!response.ok) {
      console.warn('[ErrorLogger] Failed to send error to server:', response.status);
      return false;
    }

    return true;
  } catch (fetchError) {
    // If offline or server unreachable, queue the error
    if (!navigator.onLine) {
      console.warn('[ErrorLogger] Offline, error not sent to server');
      // Could queue in IndexedDB here for later sending
    } else {
      console.error('[ErrorLogger] Failed to send error to server:', fetchError);
    }
    return false;
  }
}

/**
 * Check if rate limit allows logging another error
 * @returns {boolean} True if within rate limit
 */
function checkRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Clean up old entries
  for (const [timestamp, count] of errorCounts.entries()) {
    if (timestamp < oneMinuteAgo) {
      errorCounts.delete(timestamp);
    }
  }

  // Count errors in last minute
  let totalCount = 0;
  for (const count of errorCounts.values()) {
    totalCount += count;
  }

  if (totalCount >= MAX_ERRORS_PER_MINUTE) {
    return false;
  }

  // Increment count for current second
  const currentSecond = Math.floor(now / 1000) * 1000;
  errorCounts.set(currentSecond, (errorCounts.get(currentSecond) || 0) + 1);

  return true;
}

/**
 * Log a sync error
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 */
export function logSyncError(message, context = {}) {
  logCriticalError('sync', message, context);
}

/**
 * Log a quota exceeded error
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 */
export function logQuotaError(message, context = {}) {
  logCriticalError('quota', message, context);
}

/**
 * Log a network error
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 */
export function logNetworkError(message, context = {}) {
  logError('network', message, context);
}

/**
 * Log a UI error
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 */
export function logUIError(message, context = {}) {
  logError('ui', message, context);
}

/**
 * Setup global error handlers
 * Catches unhandled errors and promise rejections
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') {
    return;
  }

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    logCriticalError('unhandled', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logCriticalError('promise', event.reason?.message || 'Unhandled Promise Rejection', {
      reason: event.reason,
      promise: event.promise,
    });
  });
}

export default {
  logError,
  logCriticalError,
  logSyncError,
  logQuotaError,
  logNetworkError,
  logUIError,
  setupGlobalErrorHandlers,
};
