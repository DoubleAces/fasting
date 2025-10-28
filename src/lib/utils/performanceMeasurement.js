/**
 * Performance Measurement Utilities
 * 
 * Client-side utilities for measuring entry click-to-details-page performance.
 * Uses Browser Performance API (performance.now, PerformanceObserver, Navigation Timing).
 * 
 * Features:
 * - High-resolution timing (<1ms overhead)
 * - Web Vitals monitoring (LCP, FCP, FID)
 * - Navigation timing breakdown
 * - Graceful degradation if APIs unavailable
 * 
 * @module lib/utils/performanceMeasurement
 */

/**
 * Measure time from entry click to navigation start
 * 
 * @param {string} entryId - MongoDB ObjectId of clicked entry (required)
 * @param {string} [startMark] - Optional custom start mark name
 * @returns {Object|null} PerformanceMetric or null if unsupported
 * 
 * @example
 * const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
 * console.log('Click took:', metric.duration, 'ms');
 */
export function measureClickToNavigation(entryId, startMark = null) {
  // Validate entryId
  if (!entryId || typeof entryId !== 'string' || entryId.trim() === '') {
    throw new Error('entryId is required');
  }

  // Check Performance API support
  if (typeof performance === 'undefined' || !performance.now || !performance.mark || !performance.measure) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Performance API not supported');
    }
    return null;
  }

  try {
    const markName = startMark || `entry-click-start-${entryId}`;
    const endMarkName = `entry-click-end-${entryId}`;
    const measureName = `click-to-navigation-${entryId}`;

    // Create start mark if not provided
    if (!startMark) {
      performance.mark(markName);
    }

    // Create end mark
    performance.mark(endMarkName);

    // Measure duration from start to end
    const measurement = performance.measure(
      measureName,
      markName,
      endMarkName
    );

    // Return metric object
    return {
      metricName: 'click-to-navigation',
      entryId,
      duration: measurement.duration,
      timestamp: Date.now(),
      phase: 'client'
    };
  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('Error measuring click-to-navigation:', error);
    }
    return null;
  }
}

/**
 * Observe Web Vitals (LCP, FCP, FID) as they occur
 * 
 * Sets up PerformanceObserver to monitor key rendering metrics.
 * Calls callback for each metric as it becomes available.
 * 
 * @param {Function} callback - Called with { name, value, rating }
 * 
 * @example
 * observeWebVitals((vital) => {
 *   console.log(`${vital.name}: ${vital.value}ms (${vital.rating})`);
 * });
 */
export function observeWebVitals(callback) {
  if (typeof PerformanceObserver === 'undefined') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('PerformanceObserver not supported');
    }
    return;
  }

  try {
    // Observe Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            const value = entry.renderTime || entry.loadTime || entry.value;
            const rating = value < 2500 ? 'good' : 'poor';
            callback({
              name: entry.name || 'largest-contentful-paint',
              value,
              rating
            });
          }
        } catch (callbackError) {
          // Silently catch callback errors to prevent observer from breaking
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported, continue
    }

    // Observe First Contentful Paint (FCP)
    try {
      new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              const value = entry.startTime;
              const rating = value < 1800 ? 'good' : 'poor';
              callback({
                name: 'first-contentful-paint',
                value,
                rating
              });
            }
          }
        } catch (callbackError) {
          // Silently catch callback errors
        }
      }).observe({ entryTypes: ['paint'] });
    } catch (e) {
      // FCP not supported, continue
    }

    // Observe First Input Delay (FID)
    try {
      new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            const value = entry.processingStart - entry.startTime;
            const rating = value < 100 ? 'good' : 'poor';
            callback({
              name: 'first-input-delay',
              value,
              rating
            });
          }
        } catch (callbackError) {
          // Silently catch callback errors
        }
      }).observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported, continue
    }

  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('Error observing Web Vitals:', error);
    }
  }
}

/**
 * Get navigation timing breakdown
 * 
 * Uses Navigation Timing API to get detailed timing information
 * about page navigation and resource loading.
 * 
 * @returns {Object|null} Navigation timing data or null if unsupported
 * 
 * @example
 * const timing = getNavigationTiming();
 * console.log('Server response:', timing.serverResponseTime, 'ms');
 */
export function getNavigationTiming() {
  // Check Performance API support
  if (typeof performance === 'undefined') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Navigation Timing API not supported');
    }
    return null;
  }

  if (!performance.getEntriesByType) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Navigation Timing API not supported');
    }
    return null;
  }

  try {
    const [navigation] = performance.getEntriesByType('navigation');
    
    if (!navigation) {
      return null;
    }

    return {
      serverResponseTime: navigation.responseEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd,
      loadComplete: navigation.loadEventEnd,
      transferSize: navigation.transferSize,
      protocol: navigation.nextHopProtocol
    };
  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('Error getting navigation timing:', error);
    }
    return null;
  }
}
