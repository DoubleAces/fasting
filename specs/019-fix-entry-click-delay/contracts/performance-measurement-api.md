# API Contracts: Performance Measurement

**Feature**: 019-fix-entry-click-delay  
**Date**: October 28, 2025  
**Status**: Complete

## Overview

This document defines the API contracts for performance measurement utilities. These are **client-side JavaScript APIs** (not HTTP endpoints) used for measuring and reporting entry click-to-details-page performance.

---

## 1. Performance Measurement Utility API

### Module: `src/lib/utils/performanceMeasurement.js`

#### Function: `measureClickToNavigation(entryId, startMark?)`

**Purpose**: Measure time from entry click to navigation start.

**Parameters**:
- `entryId` (String, required): MongoDB ObjectId of clicked entry
- `startMark` (String, optional): Performance mark name (default: auto-generated)

**Returns**: 
```typescript
{
  entryId: string;
  metricName: string;
  duration: number;        // milliseconds
  timestamp: number;       // Unix ms
  phase: "client";
}
```

**Usage**:
```javascript
import { measureClickToNavigation } from '@/lib/utils/performanceMeasurement';

// In EntryList component onClick handler
const handleRowClick = (entryId) => {
  const metric = measureClickToNavigation(entryId);
  console.log('Click-to-navigation:', metric.duration, 'ms');
  
  // Proceed with navigation (router.push or Link)
};
```

**Side Effects**:
- Creates performance marks (`entry-click-start-{id}`, `entry-click-end-{id}`)
- Logs metric to console in development mode
- No network requests, no localStorage

**Error Handling**:
- Returns `null` if Performance API not supported
- Throws error if `entryId` is missing

---

#### Function: `observeWebVitals(callback)`

**Purpose**: Observe and report Web Vitals (LCP, FCP, FID) as they occur.

**Parameters**:
- `callback` (Function, required): Called with Web Vital data
  - Signature: `(vital: { name: string, value: number, rating: 'good' | 'poor' }) => void`

**Returns**: `void`

**Usage**:
```javascript
import { observeWebVitals } from '@/lib/utils/performanceMeasurement';

// In entry details page (_app.js or layout)
useEffect(() => {
  observeWebVitals((vital) => {
    console.log(`${vital.name}: ${vital.value}ms (${vital.rating})`);
  });
}, []);
```

**Observed Metrics**:
- **LCP** (Largest Contentful Paint): When largest element renders
- **FCP** (First Contentful Paint): When first content appears
- **FID** (First Input Delay): Time to first user interaction

**Side Effects**:
- Uses PerformanceObserver API
- Runs continuously after initialization
- No persistent storage

**Error Handling**:
- Silently fails if PerformanceObserver not supported
- Callback errors do not break observer

---

#### Function: `getNavigationTiming()`

**Purpose**: Get detailed navigation timing breakdown using Navigation Timing API.

**Parameters**: None

**Returns**:
```typescript
{
  serverResponseTime: number;    // Time waiting for server response
  domContentLoaded: number;      // Time to DOMContentLoaded event
  loadComplete: number;          // Time to load event complete
  transferSize: number;          // Bytes transferred
  protocol: string;              // HTTP protocol version
}
```

**Usage**:
```javascript
import { getNavigationTiming } from '@/lib/utils/performanceMeasurement';

// In entry details page after load
useEffect(() => {
  setTimeout(() => {
    const timing = getNavigationTiming();
    console.log('Server response:', timing.serverResponseTime, 'ms');
    console.log('DOM loaded:', timing.domContentLoaded, 'ms');
  }, 0);
}, []);
```

**Side Effects**:
- Reads `performance.getEntriesByType('navigation')[0]`
- Read-only, no mutations
- Must be called after page load (timing data not available immediately)

**Error Handling**:
- Returns `null` if Navigation Timing API not supported
- Returns `null` if called before navigation complete

---

## 2. Baseline Report Generator API

### Script: `scripts/generate-performance-baseline.js`

#### Function: `generateBaseline(options)`

**Purpose**: Run performance measurements 10x and generate baseline report.

**Parameters**:
```typescript
options: {
  iterations?: number;        // Default: 10
  outputFile?: string;        // Default: specs/019-fix-entry-click-delay/BASELINE-REPORT.md
  testUser?: {
    email: string;
    password: string;
  };                          // Default: uses env BASELINE_USER_EMAIL/PASSWORD
  headless?: boolean;         // Default: true (false for debugging)
}
```

**Returns**: Promise<PerformanceBaseline>

**CLI Usage**:
```bash
# Generate baseline report (default settings)
node scripts/generate-performance-baseline.js

# Custom iterations
node scripts/generate-performance-baseline.js --iterations 20

# With UI (non-headless for debugging)
node scripts/generate-performance-baseline.js --headed

# Custom output file
node scripts/generate-performance-baseline.js --output ./my-report.md
```

**Output**: Markdown file with performance baseline data (see data-model.md)

**Side Effects**:
- Launches Playwright browser
- Performs actual login and navigation
- Writes Markdown file to disk
- Logs progress to console

**Error Handling**:
- Exits with code 1 if Playwright not installed
- Exits with code 1 if test user credentials invalid
- Exits with code 1 if < 5 successful measurements (allows some failures)
- Logs detailed error messages for debugging

---

## 3. Performance Regression Test API

### File: `tests/e2e/entry-click-performance.spec.js`

#### Test: `should load entry details page in under 400ms`

**Purpose**: Automated regression test to catch performance degradation.

**Test Steps**:
1. Login as test user
2. Navigate to /entries page
3. Click first entry row
4. Wait for navigation + networkidle
5. Measure total time
6. Assert time < 400ms

**Playwright Usage**:
```bash
# Run performance test
npx playwright test tests/e2e/entry-click-performance.spec.js

# Run with UI
npx playwright test tests/e2e/entry-click-performance.spec.js --ui

# Run on specific browser
npx playwright test tests/e2e/entry-click-performance.spec.js --project=chromium
```

**Expected Behavior**:
- ✅ Pass: Total time < 400ms
- ❌ Fail: Total time >= 400ms (logs actual time in failure message)

**CI Integration**:
- Runs on every PR
- Blocks merge if failing
- Retries 3x to handle flakiness

---

## 4. Existing Server Performance Logger (No Changes)

### Module: `src/lib/utils/performanceLogger.js` (Feature 016)

This utility already exists and will be reused for server-side measurements.

**Usage** (existing pattern):
```javascript
import { performanceLogger } from '@/lib/utils/performanceLogger';

export default async function EntryDetailsPage({ params }) {
  const perfLogger = performanceLogger('Page: Entry Details');
  
  // ... fetch data ...
  
  perfLogger.end({
    userId,
    entryId,
    queryCount,
    cacheHit
  });
  
  // ... return JSX ...
}
```

**No modifications required** - already logs server-side performance metrics.

---

## 5. Contract Validation

### Type Definitions (JSDoc)

```javascript
/**
 * @typedef {Object} PerformanceMetric
 * @property {string} metricName - Name of the metric
 * @property {number} timestamp - Unix milliseconds
 * @property {number} duration - Duration in milliseconds
 * @property {string} entryId - MongoDB ObjectId of entry
 * @property {"client"|"server"|"network"|"rendering"} phase - Measurement phase
 */

/**
 * @typedef {Object} PerformanceBaseline
 * @property {Date} generatedAt - Report generation timestamp
 * @property {string} branch - Git branch name
 * @property {number} sampleSize - Number of iterations
 * @property {Object} metrics - Aggregated timing metrics
 * @property {Object} webVitals - Web Vitals data
 * @property {Object} bottleneck - Identified bottleneck
 */

/**
 * @typedef {Object} WebVital
 * @property {string} name - Metric name (LCP, FCP, FID)
 * @property {number} value - Metric value in milliseconds
 * @property {"good"|"poor"} rating - Performance rating
 */
```

### Runtime Validation

```javascript
/**
 * Validate PerformanceMetric structure
 * @param {PerformanceMetric} metric
 * @throws {Error} If validation fails
 */
export function validatePerformanceMetric(metric) {
  if (!metric.metricName || typeof metric.metricName !== 'string') {
    throw new Error('metricName must be a non-empty string');
  }
  if (typeof metric.duration !== 'number' || metric.duration < 0) {
    throw new Error('duration must be a positive number');
  }
  const validPhases = ['client', 'server', 'network', 'rendering'];
  if (!validPhases.includes(metric.phase)) {
    throw new Error(`phase must be one of: ${validPhases.join(', ')}`);
  }
  return true;
}
```

---

## 6. Browser Compatibility

All APIs tested and compatible with:
- ✅ Chrome 100+ (Performance API, Navigation Timing Level 2)
- ✅ Firefox 100+ (Performance API, PerformanceObserver)
- ✅ Safari 15+ (Performance API, limited PerformanceObserver)
- ✅ Edge 100+ (Same as Chrome)
- ✅ Mobile Chrome/Safari (iOS 15+, Android Chrome 100+)

**Graceful Degradation**:
- If Performance API unavailable: Return `null`, log warning
- If PerformanceObserver unavailable: Web Vitals not reported
- If Navigation Timing unavailable: Server metrics not available

---

## Summary

Performance measurement APIs are:
- **Client-side utilities**: Browser Performance API wrappers
- **No HTTP endpoints**: All measurements happen locally
- **No database storage**: Transient data (console logs) or file-based (reports)
- **Fully typed**: JSDoc annotations for IDE autocomplete
- **Tested**: Unit tests for utilities, E2E tests for regression

**Next**: See quickstart.md for step-by-step implementation guide.
