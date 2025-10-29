/**
 * Visual Regression Baseline Capture - Feature 022
 * 
 * Captures baseline screenshots for mobile (375×667) and desktop (1024×768)
 * viewports to enable visual regression testing of mobile UX improvements.
 * 
 * Usage:
 *   npm run test:visual-baseline
 * 
 * Or with Playwright directly:
 *   npx playwright test tests/visual/capture-baselines.spec.js
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// Screenshot configuration
const SCREENSHOTS_DIR = path.join(process.cwd(), 'tests', 'screenshots', 'baselines');

const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'mobile-375x667' },
  desktop: { width: 1024, height: 768, name: 'desktop-1024x768' },
};

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/entries', name: 'entry-list' },
  { path: '/entries/new', name: 'entry-form-new' },
  // Note: /entries/[id] and /entries/[id]/edit require specific entry ID
  // These will be captured manually or with dynamic data setup
  { path: '/settings', name: 'settings-form' },
];

test.describe('Visual Regression Baselines - Feature 022', () => {
  
  test.beforeEach(async ({ page }) => {
    // Optional: Set up authentication if required
    // await page.goto('/login');
    // await page.fill('#email', 'test@example.com');
    // await page.fill('#password', 'password');
    // await page.click('button[type="submit"]');
  });

  for (const viewport of Object.values(VIEWPORTS)) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const pageConfig of PAGES) {
        test(`Capture baseline: ${pageConfig.name}`, async ({ page }) => {
          // Navigate to page
          await page.goto(pageConfig.path);

          // Wait for page to be fully loaded
          await page.waitForLoadState('networkidle');

          // Optional: Wait for specific elements to be visible
          // Example: await page.waitForSelector('table', { state: 'visible' });

          // Capture full page screenshot
          const screenshotPath = path.join(
            SCREENSHOTS_DIR,
            viewport.name,
            `${pageConfig.name}.png`
          );

          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          console.log(`✅ Captured: ${viewport.name}/${pageConfig.name}.png`);
        });
      }
    });
  }

  // Special case: Capture entry details page (requires creating test entry)
  test.describe('Dynamic pages (with test data)', () => {
    test.skip('Capture entry details page', async ({ page, request }) => {
      // This test requires:
      // 1. Authentication
      // 2. Creating a test entry via API
      // 3. Navigating to /entries/[id]
      // 4. Capturing screenshots
      // 5. Cleaning up test data

      // Example implementation:
      // const response = await request.post('/api/entries', {
      //   data: { /* test entry data */ }
      // });
      // const { id } = await response.json();
      // await page.goto(`/entries/${id}`);
      // await page.screenshot({ path: `${SCREENSHOTS_DIR}/mobile-375x667/entry-details.png` });
      // await request.delete(`/api/entries/${id}`);
    });

    test.skip('Capture entry edit form', async ({ page, request }) => {
      // Similar to entry details test
    });
  });
});

test.describe('Visual Regression - Component Snapshots', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Entry table - 3 columns mobile', async ({ page }) => {
    await page.goto('/entries');
    await page.waitForLoadState('networkidle');

    // Capture just the table element
    const table = page.locator('table');
    await table.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-375x667', 'component-entry-table.png'),
    });
  });

  test('Entry form - vertical stacking', async ({ page }) => {
    await page.goto('/entries/new');
    await page.waitForLoadState('networkidle');

    // Capture the form
    const form = page.locator('form');
    await form.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-375x667', 'component-entry-form.png'),
    });
  });

  test('Settings form - full-width buttons', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await form.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-375x667', 'component-settings-form.png'),
    });
  });
});

// Desktop viewport component snapshots
test.describe('Visual Regression - Desktop Components', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('Entry table - 8 columns desktop', async ({ page }) => {
    await page.goto('/entries');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table');
    await table.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'desktop-1024x768', 'component-entry-table.png'),
    });
  });

  test('Entry form - horizontal buttons', async ({ page }) => {
    await page.goto('/entries/new');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await form.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'desktop-1024x768', 'component-entry-form.png'),
    });
  });
});
