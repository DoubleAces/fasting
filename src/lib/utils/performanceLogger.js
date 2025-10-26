/**
 * Performance Logger Utility
 * 
 * Provides performance measurement and logging for API routes and pages.
 * Logs timing data when ENABLE_PERFORMANCE_LOGGING=true
 * 
 * Usage:
 * ```js
 * const logger = performanceLogger('API: GET /entries');
 * // ... do work ...
 * logger.end({ queryCount: 3, cacheHit: true });
 * ```
 */

const ENABLE_LOGGING = process.env.ENABLE_PERFORMANCE_LOGGING === 'true';

/**
 * Create a performance logger for a specific operation
 * @param {string} label - Operation label (e.g., "API: GET /entries")
 * @returns {Object} Logger with end() method
 */
function performanceLogger(label) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  return {
    /**
     * End performance measurement and log results
     * @param {Object} metadata - Additional metadata to log
     * @param {number} metadata.queryCount - Number of database queries
     * @param {boolean} metadata.cacheHit - Whether cache was hit
     * @param {number} metadata.cacheHitRate - Cache hit rate percentage
     * @param {string} metadata.userId - User ID for context
     */
    end: (metadata = {}) => {
      if (!ENABLE_LOGGING) {
        return;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      const logData = {
        label,
        duration: `${duration}ms`,
        durationMs: duration,
        memoryDelta: formatBytes(memoryDelta),
        memoryDeltaBytes: memoryDelta,
        timestamp: new Date().toISOString(),
        ...metadata,
      };

      // Log with appropriate level based on duration
      if (duration > 500) {
        console.warn('⚠️  [PERF SLOW]', JSON.stringify(logData));
      } else if (duration > 200) {
        console.log('⚡ [PERF]', JSON.stringify(logData));
      } else {
        console.log('✅ [PERF]', JSON.stringify(logData));
      }

      return logData;
    },

    /**
     * Get elapsed time without logging
     * @returns {number} Elapsed milliseconds
     */
    elapsed: () => {
      return Date.now() - startTime;
    },
  };
}

/**
 * Wrap an async function with performance logging
 * @param {string} label - Operation label
 * @param {Function} fn - Async function to wrap
 * @param {Object} metadata - Additional metadata
 * @returns {Function} Wrapped function
 */
function withPerformanceTracking(label, fn, metadata = {}) {
  return async (...args) => {
    const logger = performanceLogger(label);
    
    try {
      const result = await fn(...args);
      logger.end({ ...metadata, success: true });
      return result;
    } catch (error) {
      logger.end({ ...metadata, success: false, error: error.message });
      throw error;
    }
  };
}

/**
 * Log performance metrics for a specific operation
 * @param {string} label - Operation label
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
function logPerformance(label, duration, metadata = {}) {
  if (!ENABLE_LOGGING) {
    return;
  }

  const logData = {
    label,
    duration: `${duration}ms`,
    durationMs: duration,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  if (duration > 500) {
    console.warn('⚠️  [PERF SLOW]', JSON.stringify(logData));
  } else if (duration > 200) {
    console.log('⚡ [PERF]', JSON.stringify(logData));
  } else {
    console.log('✅ [PERF]', JSON.stringify(logData));
  }
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '-' + formatBytes(-bytes);
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if performance logging is enabled
 * @returns {boolean} True if logging enabled
 */
function isLoggingEnabled() {
  return ENABLE_LOGGING;
}

module.exports = {
  performanceLogger,
  withPerformanceTracking,
  logPerformance,
  isLoggingEnabled,
  formatBytes,
};
