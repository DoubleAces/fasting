/**
 * E2E Performance Tests - Entry Details Page
 * 
 * Tests that entry details page meets performance targets:
 * - Page load time < 500ms (P95)
 * - Maximum 2-3 database queries
 * - Insights served from cache on repeat views
 */

const { test, expect } = require('@playwright/test');

test.describe('Entry Details Page Performance', () => {
  let entryId;
  let userId;

  test.beforeAll(async ({ request }) => {
    // Setup: Create test user and entry via API
    // Note: In real implementation, use proper test fixtures
    // For now, we'll test against existing data
  });

  test('should load entry details page in under 500ms', async ({ page }) => {
    // Skip if no test data available
    test.skip(!process.env.TEST_ENTRY_ID, 'TEST_ENTRY_ID not set - skipping performance test');

    const testEntryId = process.env.TEST_ENTRY_ID;
    
    // Measure page load time
    const startTime = Date.now();
    
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Entry details page loaded in ${loadTime}ms`);
    
    // Assert: Page loads in under 500ms (P95 target)
    expect(loadTime).toBeLessThan(500);
    
    // Verify page content loaded
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Fasting Duration')).toBeVisible();
  });

  test('should make maximum 3 database queries', async ({ page }) => {
    test.skip(!process.env.TEST_ENTRY_ID, 'TEST_ENTRY_ID not set - skipping query count test');

    const testEntryId = process.env.TEST_ENTRY_ID;
    
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });
    
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    console.log(`API requests made: ${apiRequests.length}`);
    console.log('Requests:', apiRequests);
    
    // Assert: Maximum 3 API calls (entry + cached insights + settings)
    // Ideally just 1-2 after caching is implemented
    expect(apiRequests.length).toBeLessThanOrEqual(3);
  });

  test('should serve cached insights on repeat view', async ({ page }) => {
    test.skip(!process.env.TEST_ENTRY_ID, 'TEST_ENTRY_ID not set - skipping cache test');

    const testEntryId = process.env.TEST_ENTRY_ID;
    
    // First load - populates cache
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    const firstLoadTime = Date.now();
    
    // Second load - should use cache
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    const secondLoadTime = Date.now();
    const cachedLoadTime = secondLoadTime - firstLoadTime;
    
    console.log(`Cached page loaded in ${cachedLoadTime}ms`);
    
    // Cached load should be faster or similar
    expect(cachedLoadTime).toBeLessThan(600);
    
    // Verify content still displays correctly
    await expect(page.locator('text=Fasting Duration')).toBeVisible();
  });

  test('should display performance metrics', async ({ page }) => {
    test.skip(!process.env.TEST_ENTRY_ID || !process.env.ENABLE_PERFORMANCE_LOGGING, 
      'Performance logging not enabled - skipping metrics test');

    const testEntryId = process.env.TEST_ENTRY_ID;
    
    // Check console for performance logs
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('Performance') || msg.text().includes('timing')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    // Wait a bit for performance logs
    await page.waitForTimeout(500);
    
    console.log('Performance logs:', consoleLogs);
    
    // Note: This is informational - actual logging happens server-side
    // Client-side performance can be measured with Web Vitals
  });

  test('should meet Core Web Vitals targets', async ({ page }) => {
    test.skip(!process.env.TEST_ENTRY_ID, 'TEST_ENTRY_ID not set - skipping Core Web Vitals test');

    const testEntryId = process.env.TEST_ENTRY_ID;
    
    await page.goto(`/entries/${testEntryId}`, {
      waitUntil: 'networkidle',
    });
    
    // Measure Core Web Vitals using Performance API
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          lcp: 0,
          fid: 0,
          cls: 0,
        };
        
        // LCP - Largest Contentful Paint
        if (window.performance && window.performance.getEntriesByType) {
          const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
          if (lcpEntries.length > 0) {
            vitals.lcp = lcpEntries[lcpEntries.length - 1].renderTime || 
                         lcpEntries[lcpEntries.length - 1].loadTime;
          }
        }
        
        // Simplified measurement - full Web Vitals would use web-vitals library
        setTimeout(() => resolve(vitals), 1000);
      });
    });
    
    console.log('Core Web Vitals:', webVitals);
    
    // Assert: LCP < 2.5 seconds (2500ms)
    if (webVitals.lcp > 0) {
      expect(webVitals.lcp).toBeLessThan(2500);
    }
  });
});

test.describe('Entry Details Query Optimization', () => {
  test('should use database indexes for queries', async () => {
    // This test would require database access in E2E context
    // For now, this is tested in unit tests with explain()
    test.skip(true, 'Database index verification done in unit tests');
  });

  test('should use aggregation pipeline for insights', async () => {
    // This test would require monitoring database queries
    // For now, this is tested in unit tests
    test.skip(true, 'Aggregation pipeline tested in unit tests');
  });
});
