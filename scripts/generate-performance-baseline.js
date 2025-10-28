/**
 * Baseline Performance Report Generator
 * 
 * Measures entry click-to-details-page performance using Playwright.
 * Generates statistical report with p50/p95/p99 metrics and bottleneck analysis.
 * 
 * Usage:
 *   node scripts/generate-performance-baseline.js [--iterations 20] [--headed] [--output file]
 * 
 * Environment Variables:
 *   BASELINE_USER_EMAIL - Test user email (default: test@example.com)
 *   BASELINE_USER_PASSWORD - Test user password (default: TestPass123)
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const iterations = parseInt(args.find(arg => arg.startsWith('--iterations='))?.split('=')[1]) || 10;
const headed = args.includes('--headed');
const customOutput = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

// Test user credentials
const TEST_USER = {
  email: process.env.BASELINE_USER_EMAIL || 'test@example.com',
  password: process.env.BASELINE_USER_PASSWORD || 'TestPass123'
};

// Base URL for the application
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Measure entry click-to-load performance
 */
async function measureEntryClickPerformance(iterations = 10) {
  console.log(`\n🚀 Starting performance baseline measurement...`);
  console.log(`   Iterations: ${iterations}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   User: ${TEST_USER.email}\n`);
  
  const browser = await chromium.launch({ headless: !headed });
  const measurements = [];
  
  for (let i = 0; i < iterations; i++) {
    console.log(`  📊 Iteration ${i + 1}/${iterations}`);
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      
      const loginClickTime = Date.now();
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(entries|dashboard)/);
      const loginLoadTime = Date.now() - loginClickTime;
      
      // Navigate to entries page if not already there
      if (!page.url().includes('/entries')) {
        await page.goto(`${BASE_URL}/entries`);
      }
      
      // Wait for entries to load
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
      
      // Measure click-to-load
      const startTime = Date.now();
      
      // Click first entry row
      await page.click('table tbody tr:first-child');
      
      // Wait for navigation to entry details
      await page.waitForURL(/\/entries\/[a-f0-9]{24}/, { timeout: 10000 });
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Get Web Vitals from the page
      const vitals = await page.evaluate(() => {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        const fcpEntries = performance.getEntriesByType('paint')
          .filter(e => e.name === 'first-contentful-paint');
        
        const lcp = lcpEntries.length > 0 
          ? (lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime)
          : 0;
        const fcp = fcpEntries.length > 0 ? fcpEntries[0].startTime : 0;
        
        return { lcp, fcp };
      });
      
      // Get navigation timing
      const navTiming = await page.evaluate(() => {
        const [nav] = performance.getEntriesByType('navigation');
        if (!nav) return null;
        
        return {
          domContentLoaded: nav.domContentLoadedEventEnd,
          loadComplete: nav.loadEventEnd,
          transferSize: nav.transferSize,
        };
      });
      
      measurements.push({
        iteration: i + 1,
        totalTime,
        loginLoadTime,
        lcp: Math.round(vitals.lcp),
        fcp: Math.round(vitals.fcp),
        domContentLoaded: navTiming ? Math.round(navTiming.domContentLoaded) : 0,
        loadComplete: navTiming ? Math.round(navTiming.loadComplete) : 0,
        transferSize: navTiming ? navTiming.transferSize : 0,
      });
      
      console.log(`     ✓ Total: ${totalTime}ms | LCP: ${Math.round(vitals.lcp)}ms | FCP: ${Math.round(vitals.fcp)}ms`);
      
    } catch (error) {
      console.error(`     ✗ Iteration ${i + 1} failed:`, error.message);
    } finally {
      await context.close();
    }
  }
  
  await browser.close();
  
  if (measurements.length < Math.min(5, iterations)) {
    throw new Error(`Only ${measurements.length} successful measurements (need at least ${Math.min(5, iterations)})`);
  }
  
  console.log(`\n✅ Completed ${measurements.length}/${iterations} successful measurements\n`);
  
  return measurements;
}

/**
 * Calculate statistical metrics (average, p50, p95, p99, min, max)
 */
function calculateStats(measurements, field) {
  const values = measurements
    .map(m => m[field])
    .filter(v => v > 0)
    .sort((a, b) => a - b);
  
  if (values.length === 0) return null;
  
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);
  
  const p50Index = Math.floor(values.length * 0.5);
  const p95Index = Math.floor(values.length * 0.95);
  const p99Index = Math.floor(values.length * 0.99);
  
  return {
    average: avg,
    p50: values[p50Index],
    p95: values[p95Index],
    p99: values[p99Index],
    min: values[0],
    max: values[values.length - 1]
  };
}

/**
 * Identify performance bottleneck
 */
function identifyBottleneck(stats) {
  const phases = [
    { name: 'Client Navigation', time: stats.totalTime.p95 - stats.loadComplete.p95, phase: 'client' },
    { name: 'Page Load', time: stats.loadComplete.p95, phase: 'rendering' },
    { name: 'DOM Processing', time: stats.domContentLoaded.p95, phase: 'server' },
  ];
  
  const slowest = phases.reduce((prev, curr) => 
    curr.time > prev.time ? curr : prev
  );
  
  return slowest;
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(measurements, outputPath) {
  const stats = {
    totalTime: calculateStats(measurements, 'totalTime'),
    loginLoadTime: calculateStats(measurements, 'loginLoadTime'),
    lcp: calculateStats(measurements, 'lcp'),
    fcp: calculateStats(measurements, 'fcp'),
    domContentLoaded: calculateStats(measurements, 'domContentLoaded'),
    loadComplete: calculateStats(measurements, 'loadComplete'),
  };
  
  const bottleneck = identifyBottleneck(stats);
  
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleString('en-US', { 
    dateStyle: 'long', 
    timeStyle: 'short' 
  });
  
  const report = `# Performance Baseline Report

**Generated**: ${date} (${timestamp})  
**Branch**: 019-fix-entry-click-delay  
**Environment**: ${process.env.NODE_ENV || 'development'}  
**Base URL**: ${BASE_URL}  
**Sample Size**: ${measurements.length} iterations

---

## Entry Click-to-Load Performance

| Metric | Average | p50 | p95 | p99 | Min | Max |
|--------|---------|-----|-----|-----|-----|-----|
| **Total Time** | ${stats.totalTime.average}ms | ${stats.totalTime.p50}ms | ${stats.totalTime.p95}ms | ${stats.totalTime.p99}ms | ${stats.totalTime.min}ms | ${stats.totalTime.max}ms |
| DOM Content Loaded | ${stats.domContentLoaded.average}ms | ${stats.domContentLoaded.p50}ms | ${stats.domContentLoaded.p95}ms | ${stats.domContentLoaded.p99}ms | ${stats.domContentLoaded.min}ms | ${stats.domContentLoaded.max}ms |
| Load Complete | ${stats.loadComplete.average}ms | ${stats.loadComplete.p50}ms | ${stats.loadComplete.p95}ms | ${stats.loadComplete.p99}ms | ${stats.loadComplete.min}ms | ${stats.loadComplete.max}ms |

---

## Web Vitals

| Metric | Average | p50 | p95 | Target | Status |
|--------|---------|-----|-----|--------|--------|
| **LCP** (Largest Contentful Paint) | ${stats.lcp.average}ms | ${stats.lcp.p50}ms | ${stats.lcp.p95}ms | <2500ms | ${stats.lcp.p95 < 2500 ? '✅ Pass' : '❌ Fail'} |
| **FCP** (First Contentful Paint) | ${stats.fcp.average}ms | ${stats.fcp.p50}ms | ${stats.fcp.p95}ms | <1800ms | ${stats.fcp.p95 < 1800 ? '✅ Pass' : '❌ Fail'} |

---

## Success Criteria Assessment

| Criteria | Target | Current (p95) | Status |
|----------|--------|---------------|--------|
| **SC-001**: Click-to-navigation | <100ms | N/A* | ⏸️ Not measured separately |
| **SC-002**: Full page load | <300ms | ${stats.totalTime.p95}ms | ${stats.totalTime.p95 < 300 ? '✅ Pass' : '❌ Fail'} |
| **SC-006**: 90% desktop <300ms | 90% | ${Math.round((measurements.filter(m => m.totalTime < 300).length / measurements.length) * 100)}% | ${(measurements.filter(m => m.totalTime < 300).length / measurements.length) >= 0.9 ? '✅ Pass' : '❌ Fail'} |

\`*\` Click-to-navigation requires client-side instrumentation (to be added in optimization phase)

---

## Bottleneck Analysis

**Identified Bottleneck**: ${bottleneck.name} (${bottleneck.phase} phase)

- **Total Time (p95)**: ${stats.totalTime.p95}ms
- **User Report**: ~500-1000ms delay experienced

### Analysis

${stats.totalTime.p95 > 400 ? `
⚠️ **Performance Issue Detected**: Full page load exceeds acceptable threshold.

**Breakdown**:
- DOM Content Loaded: ${stats.domContentLoaded.p95}ms
- Full Load Complete: ${stats.loadComplete.p95}ms  
- Total Navigation: ${stats.totalTime.p95}ms

**Primary Bottleneck**: ${bottleneck.name}
**Phase**: ${bottleneck.phase}

**Recommended Action**: 
${bottleneck.phase === 'client' 
  ? '- Replace router.push() with Next.js Link component + prefetch\n- Expected improvement: 300-500ms reduction\n- Eliminate cold navigation overhead' 
  : bottleneck.phase === 'server'
  ? '- Review database query performance\n- Verify indexes from Feature 016\n- Check cache hit rates'
  : '- Optimize component rendering\n- Consider lazy-loading heavy components\n- Review bundle size'
}
` : `
✅ **Performance Acceptable**: Full page load within acceptable range.

However, still above optimal target of <300ms. Minor optimization recommended.
`}

---

## Individual Measurements

| Iteration | Total Time | LCP | FCP | DOM Loaded | Status |
|-----------|------------|-----|-----|------------|--------|
${measurements.map(m => 
  `| ${m.iteration} | ${m.totalTime}ms | ${m.lcp}ms | ${m.fcp}ms | ${m.domContentLoaded}ms | ${m.totalTime < 300 ? '✅' : '❌'} |`
).join('\n')}

---

## Next Steps

${stats.totalTime.p95 > 300 ? `
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
` : `
### Phase 3: Regression Prevention

1. Create automated Playwright performance test
2. Set 400ms threshold (300ms target + 100ms CI buffer)  
3. Integrate with CI/CD pipeline
4. Monitor for future degradation
`}

---

**Report saved to**: \`${outputPath}\`
`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('═'.repeat(70));
    console.log('  PERFORMANCE BASELINE REPORT GENERATOR');
    console.log('  Feature 019: Fix Entry Click Delay');
    console.log('═'.repeat(70));
    
    // Run measurements
    const measurements = await measureEntryClickPerformance(iterations);
    
    // Determine output path
    const defaultOutput = path.join(
      __dirname,
      '..',
      'specs',
      '019-fix-entry-click-delay',
      'BASELINE-REPORT.md'
    );
    const outputPath = customOutput ? path.resolve(customOutput) : defaultOutput;
    
    // Generate report
    const report = generateMarkdownReport(measurements, outputPath);
    
    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write report to file
    fs.writeFileSync(outputPath, report, 'utf-8');
    
    console.log('\n═'.repeat(70));
    console.log('  ✅ BASELINE REPORT GENERATED');
    console.log('═'.repeat(70));
    console.log(`\n📄 Report saved to: ${outputPath}\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
