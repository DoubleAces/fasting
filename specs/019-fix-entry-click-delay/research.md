# Phase 0: Research & Technical Decisions

**Feature**: 019-fix-entry-click-delay  
**Date**: October 28, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing performance measurement and optimization for entry click-to-details-page navigation. Research focuses on Browser Performance API usage, Next.js Link prefetching patterns, performance measurement best practices, and regression testing approaches.

---

## Research Areas

### 1. Browser Performance API for Client-Side Measurements

**Decision**: Use Performance API with PerformanceObserver for LCP/FCP/TTI, Navigation Timing API for navigation metrics

**Rationale**:
- **Native browser support**: All modern browsers (Chrome 80+, Firefox 75+, Safari 14+) support Performance API
- **Minimal overhead**: Performance.now() and performance.mark() add <1ms overhead
- **Precise timestamps**: High-resolution time (microsecond precision) for accurate measurements
- **Standard Web Vitals**: PerformanceObserver can track LCP, FCP, FID automatically
- **Navigation Timing**: Performance.getEntriesByType('navigation') provides server response time, DOM load time

**Implementation Approach**:
```javascript
// Client-side measurement utility
export function measureClickToNavigation(entryId) {
  const clickTime = performance.now();
  performance.mark('entry-click-start');
  
  // After router.push() or Link click
  performance.mark('entry-click-end');
  const duration = performance.measure(
    'click-to-navigation',
    'entry-click-start',
    'entry-click-end'
  );
  
  return {
    entryId,
    duration: duration.duration,
    timestamp: Date.now()
  };
}

// Observe Web Vitals
export function observeWebVitals(callback) {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      callback({
        name: entry.name,
        value: entry.value,
        rating: entry.value < 2500 ? 'good' : 'poor'
      });
    }
  }).observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
}
```

**Alternatives Considered**:
- **Date.now()**: Lower precision (millisecond vs microsecond), no mark/measure API
- **console.time()**: Good for debugging but not for programmatic analysis
- **External library (web-vitals npm)**: Adds 3KB dependency, overkill for our simple needs

**References**:
- MDN Performance API: https://developer.mozilla.org/en-US/docs/Web/API/Performance
- Web Vitals Guide: https://web.dev/vitals/

---

### 2. Next.js Link Component with Prefetching

**Decision**: Replace router.push() with Next.js Link component using prefetch={true}

**Rationale**:
- **Automatic prefetching**: Next.js Link prefetches linked pages on viewport appearance or hover
- **Router-optimized**: Link component integrates with Next.js router for optimal performance
- **Client-side navigation**: Instant transitions without full page reload
- **Minimal code change**: Drop-in replacement for router.push() click handlers
- **Zero bundle increase**: Link is part of Next.js core, no additional dependencies

**Implementation Pattern**:
```javascript
// BEFORE (slow)
<tr onClick={() => router.push(`/entries/${entry._id}`)}>
  <td>{entry.date}</td>
</tr>

// AFTER (fast with prefetch)
<tr>
  <Link href={`/entries/${entry._id}`} prefetch={true} className="table-row-link">
    <td>{entry.date}</td>
  </Link>
</tr>
```

**Prefetch Behavior**:
- `prefetch={true}` (production): Prefetches on link visibility in viewport
- `prefetch={false}`: Only prefetches on hover
- Default: `true` in production, `false` in development

**Performance Impact** (expected):
- **Before**: router.push() triggers navigation → server request → data fetch (cold)
- **After**: Prefetched data cached → instant navigation (<50ms)
- **Savings**: ~300-500ms saved on navigation start

**Alternatives Considered**:
- **router.prefetch() manually**: Requires tracking all entry IDs, complex state management
- **Intersection Observer custom**: Reinventing Next.js Link prefetch, unnecessary complexity
- **Keep router.push()**: Miss 90% of quick win opportunity

**References**:
- Next.js Link docs: https://nextjs.org/docs/app/api-reference/components/link
- Prefetching behavior: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching

---

### 3. Performance Baseline Report Generation

**Decision**: Create Node.js script that runs Playwright measurements 10x, calculates p50/p95/p99, outputs Markdown report

**Rationale**:
- **Automated and repeatable**: Script can run before/after optimization for comparison
- **Statistical validity**: 10 iterations provide reliable averages and percentiles
- **Playwright integration**: Reuses existing E2E infrastructure, measures real browser performance
- **Markdown output**: Easy to commit to git, readable in PRs, version controlled
- **Baseline for regression tests**: Documented thresholds inform automated test limits

**Implementation Approach**:
```javascript
// scripts/generate-performance-baseline.js
import { chromium } from '@playwright/test';

async function measureEntryClickPerformance(iterations = 10) {
  const browser = await chromium.launch();
  const measurements = [];
  
  for (let i = 0; i < iterations; i++) {
    const page = await browser.newPage();
    
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/entries');
    
    // Measure click-to-load
    const startTime = Date.now();
    await page.click('[data-testid="entry-row"]:first-child a');
    await page.waitForURL(/\/entries\/[a-f0-9]{24}/);
    
    // Wait for page interactive
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    // Get Web Vitals from browser
    const vitals = await page.evaluate(() => {
      return {
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.renderTime,
        fcp: performance.getEntriesByType('paint')
          .find(e => e.name === 'first-contentful-paint')?.startTime
      };
    });
    
    measurements.push({
      totalTime: endTime - startTime,
      lcp: vitals.lcp,
      fcp: vitals.fcp
    });
    
    await page.close();
  }
  
  await browser.close();
  return calculateStats(measurements);
}

function calculateStats(measurements) {
  const sorted = measurements.map(m => m.totalTime).sort((a, b) => a - b);
  return {
    average: sorted.reduce((a, b) => a + b) / sorted.length,
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}
```

**Output Format** (Markdown):
```markdown
# Performance Baseline Report

**Generated**: 2025-10-28  
**Branch**: 019-fix-entry-click-delay  
**Iterations**: 10

## Entry Click-to-Load Performance

| Metric | Value |
|--------|-------|
| Average | 687ms |
| p50 (Median) | 650ms |
| p95 | 890ms |
| p99 | 950ms |
| Min | 520ms |
| Max | 980ms |

## Web Vitals

| Metric | Average | Target | Status |
|--------|---------|--------|--------|
| LCP (Largest Contentful Paint) | 450ms | <2500ms | ✅ Pass |
| FCP (First Contentful Paint) | 280ms | <1800ms | ✅ Pass |

## Bottleneck Analysis

Based on measurements:
- **Navigation Start**: ~50ms (acceptable)
- **Server Response**: ~100ms (Feature 016 optimized, acceptable)
- **Client Hydration**: ~450ms (⚠️ bottleneck identified)

**Recommendation**: Implement Link prefetching to eliminate cold navigation overhead.
```

**Alternatives Considered**:
- **Manual testing with DevTools**: Not repeatable, no statistical analysis
- **Real User Monitoring (RUM)**: Requires infrastructure, out of scope for MVP
- **Lighthouse CI**: Measures full page load, not specific click interaction

---

### 4. Automated Performance Regression Testing

**Decision**: Create Playwright test that fails if entry click-to-load exceeds 400ms (with 100ms CI buffer over 300ms target)

**Rationale**:
- **Catches regressions early**: Runs on every PR, prevents performance degradation before merge
- **Clear pass/fail**: Binary threshold (400ms) aligns with success criteria (300ms + buffer)
- **Playwright infrastructure**: Reuses existing E2E setup, no new tools
- **CI-friendly**: Consistent timing in GitHub Actions (less variable than local)
- **Actionable failures**: Test output shows actual time, easy to debug

**Implementation**:
```javascript
// tests/e2e/entry-click-performance.spec.js
import { test, expect } from '@playwright/test';

test.describe('Entry Click Performance', () => {
  test('should load entry details page in under 400ms', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/entries');
    
    // Measure click-to-load
    const startTime = Date.now();
    
    await page.click('[data-testid="entry-row"]:first-child a');
    await page.waitForURL(/\/entries\/[a-f0-9]{24}/);
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Entry click-to-load time: ${duration}ms`);
    
    // Assert performance threshold
    expect(duration).toBeLessThan(400); // 300ms target + 100ms CI buffer
  });
  
  test('should maintain performance on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Same test as above
    await page.goto('/login');
    // ... login flow
    
    const startTime = Date.now();
    await page.click('[data-testid="entry-row"]:first-child a');
    await page.waitForURL(/\/entries\/[a-f0-9]{24}/);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    console.log(`Mobile entry click-to-load time: ${duration}ms`);
    
    // Mobile allows slightly more time (500ms per spec SC-007)
    expect(duration).toBeLessThan(500);
  });
});
```

**Threshold Justification**:
- **300ms target**: Spec success criteria SC-002 (90% < 300ms desktop)
- **+100ms buffer**: Account for CI environment variability vs local dev
- **400ms final threshold**: Fails at 2x target, catches significant regressions

**CI Integration**:
```yaml
# .github/workflows/test.yml (add to existing)
- name: Performance Regression Tests
  run: npx playwright test tests/e2e/entry-click-performance.spec.js
  continue-on-error: false  # Block merge on failure
```

**Alternatives Considered**:
- **Lighthouse CI**: Too broad, measures entire page not specific interaction
- **WebPageTest**: External service, requires API key, overkill
- **Manual testing**: Not automated, doesn't catch regressions

---

### 5. Identifying Bottleneck Through Measurements

**Decision**: Instrument 4 measurement points: (1) click event, (2) router.push/Link, (3) server response, (4) render complete

**Rationale**:
- **Data-driven optimization**: Measurements reveal actual bottleneck (no guessing)
- **Targeted fixes**: Only optimize the slowest phase (avoid premature optimization)
- **Validation**: Before/after comparison proves optimization worked
- **Comprehensive coverage**: 4 phases cover full click-to-interactive flow

**Measurement Points**:

1. **Click Event → Router Navigation** (Client)
   - Start: onClick handler invoked
   - End: router.push() or Link click processed
   - Expected: 5-20ms
   - Bottleneck if: >50ms

2. **Navigation Start → Server Response** (Network + Server)
   - Start: Browser initiates request
   - End: Server sends response
   - Expected: 50-150ms (Feature 016 optimized)
   - Bottleneck if: >200ms

3. **Server Response → Data Serialization** (Server)
   - Start: Entry fetched from DB
   - End: JSON response sent
   - Expected: 10-30ms
   - Bottleneck if: >50ms

4. **Hydration → Render Complete** (Client)
   - Start: HTML received
   - End: React hydration complete, LCP rendered
   - Expected: 100-200ms
   - Bottleneck if: >300ms

**Analysis Logic**:
```javascript
function identifyBottleneck(measurements) {
  const phases = {
    client: measurements.clickToNavigation,
    network: measurements.navigationToResponse,
    serialization: measurements.serializationTime,
    rendering: measurements.responseToLCP
  };
  
  const slowest = Object.entries(phases)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    bottleneck: slowest[0],
    duration: slowest[1],
    recommendation: getRecommendation(slowest[0])
  };
}

function getRecommendation(phase) {
  const recommendations = {
    client: 'Implement Link prefetching, check event handler overhead',
    network: 'Verify server response time, check API route performance',
    serialization: 'Optimize MongoDB ObjectId conversions, reduce data payload',
    rendering: 'Lazy-load EntryInsights component, reduce initial bundle size'
  };
  return recommendations[phase];
}
```

**Expected Bottleneck** (based on Feature 016 completion):
- Server queries: ✅ Optimized (indexes, caching, <100ms)
- Serialization: ✅ Minimal (simple ObjectId.toString())
- **Most likely**: Client-side router.push() or React hydration (cold navigation)

**Alternatives Considered**:
- **Single end-to-end timing**: Doesn't identify where delay occurs
- **More granular (10+ points)**: Diminishing returns, increased complexity
- **Server-only metrics**: Misses client-side bottleneck (likely culprit)

---

## Implementation Priorities

Based on research findings:

**Phase 1 (Measurement - P1)**: 
1. Create performanceMeasurement.js utility with Browser Performance API
2. Add measurement points to EntryList and entry details page
3. Create baseline report generation script
4. Document current timings and identify bottleneck

**Phase 2 (Optimization - P1)**:
5. Implement most likely quick win: Link component with prefetch
6. If insufficient, apply targeted optimization for identified bottleneck
7. Re-run baseline measurements, verify 50%+ improvement

**Phase 3 (Regression Prevention - P2)**:
8. Create Playwright performance regression test (400ms threshold)
9. Add to CI/CD pipeline
10. Document performance characteristics in README

---

## Risk Mitigation

### Performance Measurement Overhead
- **Risk**: Measurements slow down user experience
- **Mitigation**: Use performance.now() (<1ms overhead), only in development mode
- **Test**: Measure with/without instrumentation, verify <5ms difference

### CI Environment Variability
- **Risk**: Tests flaky due to CI performance variance
- **Mitigation**: 400ms threshold (100ms buffer), run 3x and take median
- **Test**: Run 30 iterations in CI, verify <10% variance

### Premature Optimization
- **Risk**: Optimize wrong bottleneck without data
- **Mitigation**: Phase 1 measurement mandatory before Phase 2 optimization
- **Test**: Baseline report shows clear bottleneck with timing data

### Regression After Merge
- **Risk**: Future changes degrade performance
- **Mitigation**: Automated Playwright test in CI, fails PR if >400ms
- **Test**: Intentionally slow down code, verify test catches it

---

**Research Phase Complete** | Ready for Phase 1: Design & Contracts
