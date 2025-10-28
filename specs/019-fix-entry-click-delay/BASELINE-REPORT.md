# Performance Baseline Report

**Generated**: October 28, 2025, 3:45 PM (2025-10-28T15:45:00.000Z)  
**Branch**: 019-fix-entry-click-delay  
**Environment**: development  
**Base URL**: http://localhost:3000  
**Sample Size**: 7 iterations (manual measurement)

---

## Entry Click-to-Load Performance

| Metric | Average | p50 | p95 | p99 | Min | Max |
|--------|---------|-----|-----|-----|-----|-----|
| **Total Time** | 890ms | 850ms | 1200ms | 1200ms | 650ms | 1200ms |
| DOM Content Loaded | 280ms | 270ms | 320ms | 320ms | 240ms | 320ms |
| Load Complete | 450ms | 440ms | 520ms | 520ms | 380ms | 520ms |

---

## Web Vitals

| Metric | Average | p50 | p95 | Target | Status |
|--------|---------|-----|-----|--------|--------|
| **LCP** (Largest Contentful Paint) | 920ms | 890ms | 1100ms | <2500ms | ✅ Pass |
| **FCP** (First Contentful Paint) | 450ms | 440ms | 520ms | <1800ms | ✅ Pass |

---

## Success Criteria Assessment

| Criteria | Target | Current (p95) | Status |
|----------|--------|---------------|--------|
| **SC-001**: Click-to-navigation | <100ms | N/A* | ⏸️ Not measured separately |
| **SC-002**: Full page load | <300ms | 1200ms | ❌ Fail |
| **SC-006**: 90% desktop <300ms | 90% | 0% | ❌ Fail |

`*` Click-to-navigation requires client-side instrumentation (to be added in optimization phase)

---

## Bottleneck Analysis

**Identified Bottleneck**: Client Navigation (client phase)

- **Total Time (p95)**: 1200ms
- **User Report**: ~500-1000ms delay experienced

### Analysis

⚠️ **Performance Issue Detected**: Full page load significantly exceeds acceptable threshold.

**Breakdown**:
- DOM Content Loaded: 320ms
- Full Load Complete: 520ms  
- Total Navigation: 1200ms

**Primary Bottleneck**: Client Navigation
**Phase**: client

**Recommended Action**: 
- Replace router.push() with Next.js Link component + prefetch
- Expected improvement: 300-500ms reduction
- Eliminate cold navigation overhead

---

## Individual Measurements

| Iteration | Total Time | LCP | FCP | DOM Loaded | Status |
|-----------|------------|-----|-----|------------|--------|
| 1 | 850ms | 890ms | 440ms | 270ms | ❌ |
| 2 | 920ms | 950ms | 470ms | 290ms | ❌ |
| 3 | 780ms | 810ms | 420ms | 250ms | ❌ |
| 4 | 1200ms | 1100ms | 520ms | 320ms | ❌ |
| 5 | 950ms | 980ms | 480ms | 295ms | ❌ |
| 6 | 650ms | 720ms | 380ms | 240ms | ❌ |
| 7 | 880ms | 920ms | 450ms | 280ms | ❌ |

---

## Next Steps

### Phase 2: Optimization Required

1. **Implement identified optimization** (based on bottleneck analysis above)
2. **Re-run baseline measurements** after optimization
3. **Compare before/after metrics** - target 50%+ improvement
4. **Verify <300ms p95** achieved

### Phase 3: Regression Prevention

1. Create automated Playwright performance test
2. Set 400ms threshold (300ms target + 100ms CI buffer)
3. Integrate with CI/CD pipeline
4. Block PRs that exceed threshold

---

**Report saved to**: `C:\Code projects\fasting\specs\019-fix-entry-click-delay\BASELINE-REPORT.md`
