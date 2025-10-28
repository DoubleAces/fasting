# Data Model: Fix Entry Click Delay

**Feature**: 019-fix-entry-click-delay  
**Date**: October 28, 2025  
**Status**: Complete

## Overview

This document defines the data structures for performance measurement and baseline reporting. This feature does not create persistent database entities; all structures are transient (logged to console or saved as files). No changes to existing Entry or UserSettings schemas are required.

---

## 1. PerformanceMetric (Transient)

### Description
Individual timing measurement captured during a single entry click-to-details-page navigation. Used for real-time logging and baseline report generation.

### Structure
```javascript
{
  // Identification
  metricName: String,          // e.g., "click-to-navigation", "server-response-time"
  timestamp: Number,            // Unix milliseconds when measurement captured
  
  // Timing data
  duration: Number,             // Duration in milliseconds (high-resolution)
  startTime: Number,            // performance.now() start time
  endTime: Number,              // performance.now() end time
  
  // Context
  userId: String,               // User ID for filtering (optional, for logging)
  entryId: String,              // Entry ID that was clicked
  phase: String,                // "client" | "server" | "network" | "rendering"
  
  // Environment
  browser: String,              // User agent (optional, for debugging)
  viewport: Object              // { width: Number, height: Number }
}
```

### Validation Rules
- `metricName` MUST be non-empty string
- `duration` MUST be positive number
- `timestamp` MUST be valid Unix milliseconds
- `phase` MUST be one of: "client", "server", "network", "rendering"

### Example
```javascript
{
  metricName: "click-to-navigation",
  timestamp: 1730073600000,
  duration: 45.3,
  startTime: 12345.67,
  endTime: 12390.97,
  userId: "507f1f77bcf86cd799439011",
  entryId: "507f1f77bcf86cd799439012",
  phase: "client",
  browser: "Chrome 120.0.0",
  viewport: { width: 1920, height: 1080 }
}
```

---

## 2. PerformanceBaseline (File Storage)

### Description
Aggregated performance report generated from multiple measurement iterations. Stored as Markdown file for version control and comparison.

### Structure
```javascript
{
  // Metadata
  generatedAt: Date,            // When report was generated
  branch: String,               // Git branch name
  commit: String,               // Git commit SHA (optional)
  environment: String,          // "development" | "ci" | "production"
  
  // Test configuration
  sampleSize: Number,           // Number of measurement iterations
  testUser: String,             // Test user email (for reproducibility)
  
  // Aggregated timing metrics
  metrics: {
    totalTime: {
      average: Number,          // Mean of all measurements
      p50: Number,              // 50th percentile (median)
      p95: Number,              // 95th percentile
      p99: Number,              // 99th percentile
      min: Number,              // Fastest measurement
      max: Number               // Slowest measurement
    },
    clickToNavigation: { /* same structure */ },
    navigationToResponse: { /* same structure */ },
    serializationTime: { /* same structure */ },
    responseToLCP: { /* same structure */ }
  },
  
  // Web Vitals
  webVitals: {
    lcp: { average: Number, p95: Number },  // Largest Contentful Paint
    fcp: { average: Number, p95: Number },  // First Contentful Paint
    fid: { average: Number, p95: Number }   // First Input Delay (if measured)
  },
  
  // Analysis
  bottleneck: {
    phase: String,              // Identified slowest phase
    duration: Number,           // Duration of bottleneck
    percentage: Number,         // Percentage of total time
    recommendation: String      // Optimization recommendation
  }
}
```

### Storage Format
Markdown file stored at: `specs/019-fix-entry-click-delay/BASELINE-REPORT.md`

### Example (Markdown Output)
```markdown
# Performance Baseline Report

**Generated**: 2025-10-28 14:30:00 UTC  
**Branch**: 019-fix-entry-click-delay  
**Commit**: abc123def456  
**Environment**: development  
**Sample Size**: 10 iterations

## Entry Click-to-Load Performance

| Metric | Average | p50 | p95 | p99 | Min | Max |
|--------|---------|-----|-----|-----|-----|-----|
| Total Time | 687ms | 650ms | 890ms | 950ms | 520ms | 980ms |
| Click → Navigation | 45ms | 42ms | 58ms | 65ms | 35ms | 68ms |
| Navigation → Response | 98ms | 95ms | 115ms | 125ms | 85ms | 130ms |
| Serialization | 18ms | 16ms | 22ms | 24ms | 12ms | 26ms |
| Response → LCP | 526ms | 497ms | 695ms | 736ms | 388ms | 756ms |

## Web Vitals

| Metric | Average | p95 | Target | Status |
|--------|---------|-----|--------|--------|
| LCP | 450ms | 620ms | <2500ms | ✅ Pass |
| FCP | 280ms | 340ms | <1800ms | ✅ Pass |

## Bottleneck Analysis

**Identified Bottleneck**: Client-side rendering/hydration

- **Phase**: Response → LCP (rendering)
- **Duration**: 526ms average (76% of total time)
- **Root Cause**: Cold navigation without prefetching, React hydration overhead

**Recommendation**: Implement Next.js Link component with `prefetch={true}` to eliminate cold navigation overhead. Expected improvement: 300-400ms reduction in total time.

## Success Criteria Assessment

| Criteria | Target | Current | Status |
|----------|--------|---------|--------|
| Click-to-navigation | <100ms | 45ms | ✅ Pass |
| Full page load (p95) | <300ms | 890ms | ❌ Fail |
| Desktop 90% < 300ms | 90% | 20% | ❌ Fail |

**Next Steps**: Implement Link prefetching optimization (Phase 2).
```

---

## 3. Existing Entities (No Changes)

### Entry
Existing entity from Feature 001. No schema changes required.

**Referenced by**: Performance measurements (entryId field) to identify which entry was clicked.

**Attributes** (relevant to this feature):
- `_id`: ObjectId - Used in navigation URL
- `date`: Date - Displayed in entries list
- `fastingDuration`: Number - Displayed in entries list

### UserSettings
Existing entity from Feature 002. No schema changes required.

**Referenced by**: Server-side performance logging may include user preferences for context.

**Attributes** (relevant to this feature):
- `userId`: ObjectId - Links to user making measurements
- `timeFormat`: String - Affects rendering time slightly
- `measurementSystem`: String - Affects rendering time slightly

---

## 4. Performance Measurement Lifecycle

```
┌─────────────────┐
│ User clicks     │
│ entry row       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Capture         │
│ PerformanceMetric│ ← phase: "client"
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Browser         │
│ navigates       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Server receives │
│ request         │ ← phase: "network"
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ DB query +      │
│ serialization   │ ← phase: "server"
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Browser renders │
│ + hydrates      │ ← phase: "rendering"
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Log to console  │
│ (development)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Aggregate 10x   │
│ measurements    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Generate        │
│ PerformanceBaseline│
│ (Markdown file) │
└─────────────────┘
```

---

## 5. Data Retention

- **PerformanceMetric**: Transient - logged to console in development, not persisted
- **PerformanceBaseline**: Persisted as Markdown file in git repository for historical comparison
- No database storage required
- No user PII exposed in measurements (only IDs)

---

## 6. Data Validation

### PerformanceMetric Validation
```javascript
function validatePerformanceMetric(metric) {
  if (!metric.metricName || typeof metric.metricName !== 'string') {
    throw new Error('metricName must be a non-empty string');
  }
  if (typeof metric.duration !== 'number' || metric.duration < 0) {
    throw new Error('duration must be a positive number');
  }
  if (typeof metric.timestamp !== 'number' || metric.timestamp < 0) {
    throw new Error('timestamp must be a valid Unix milliseconds');
  }
  const validPhases = ['client', 'server', 'network', 'rendering'];
  if (!validPhases.includes(metric.phase)) {
    throw new Error(`phase must be one of: ${validPhases.join(', ')}`);
  }
  return true;
}
```

### PerformanceBaseline Validation
```javascript
function validatePerformanceBaseline(baseline) {
  if (typeof baseline.sampleSize !== 'number' || baseline.sampleSize < 1) {
    throw new Error('sampleSize must be at least 1');
  }
  if (!baseline.metrics || !baseline.metrics.totalTime) {
    throw new Error('metrics.totalTime is required');
  }
  const { average, p50, p95 } = baseline.metrics.totalTime;
  if (typeof average !== 'number' || typeof p50 !== 'number' || typeof p95 !== 'number') {
    throw new Error('metrics must contain valid numbers');
  }
  return true;
}
```

---

## Summary

This feature uses **transient data structures** for performance measurement and reporting:

- **PerformanceMetric**: Captured during navigation, logged to console
- **PerformanceBaseline**: Aggregated report saved as Markdown file in git

**No database changes required**. All data is ephemeral (measurements) or file-based (reports). Existing Entry and UserSettings entities are referenced but not modified.
