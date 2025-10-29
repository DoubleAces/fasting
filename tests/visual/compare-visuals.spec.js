/**
 * Visual Regression Validation - Feature 022
 * 
 * Compares current screenshots against baseline to detect visual regressions.
 * Uses Playwright's built-in visual comparison with configurable thresholds.
 * 
 * Usage:
 *   npm run test:visual-compare
 * 
 * Or with Playwright directly:
 *   npx playwright test tests/visual/compare-visuals.spec.js
 */

import { test, expect } from '@playwright/test';

// Visual comparison configuration
const VISUAL_CONFIG = {
  // Maximum allowed pixel difference (0-1, where 0 = identical, 1 = completely different)
  maxDiffPixelRatio: 0.01, // 1% difference allowed

  // Visual comparison threshold (0-1)
  threshold: 0.2, // How different pixels need to be to count as different

  // Animations to disable
  animations: 'disabled',
};

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/entries', name: 'entry-list' },
  { path: '/entries/new', name: 'entry-form-new' },
  { path: '/settings', name: 'settings-form' },
];

test.describe('Visual Regression - Mobile (375×667)', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    ...VISUAL_CONFIG,
  });

  for (const pageConfig of PAGES) {
    test(`${pageConfig.name} matches baseline`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // Compare full page screenshot
      await expect(page).toHaveScreenshot(`mobile-${pageConfig.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
        threshold: VISUAL_CONFIG.threshold,
      });
    });
  }

  test('Entry table - 3 columns', async ({ page }) => {
    await page.goto('/entries');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table');
    await expect(table).toHaveScreenshot('mobile-entry-table.png', {
      maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
    });

    // Verify only 3 columns visible
    const columns = await page.locator('thead th').count();
    expect(columns).toBe(3); // Date, Duration, Actions
  });

  test('Entry form - vertical stacking', async ({ page }) => {
    await page.goto('/entries/new');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await expect(form).toHaveScreenshot('mobile-entry-form.png', {
      maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
    });

    // Verify button is full-width
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Button width should be close to viewport width (allowing for padding)
    expect(buttonBox.width).toBeGreaterThan(viewportSize.width * 0.8);
  });
});

test.describe('Visual Regression - Desktop (1024×768)', () => {
  test.use({ 
    viewport: { width: 1024, height: 768 },
    ...VISUAL_CONFIG,
  });

  for (const pageConfig of PAGES) {
    test(`${pageConfig.name} matches baseline`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`desktop-${pageConfig.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
        threshold: VISUAL_CONFIG.threshold,
      });
    });
  }

  test('Entry table - 8 columns', async ({ page }) => {
    await page.goto('/entries');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table');
    await expect(table).toHaveScreenshot('desktop-entry-table.png', {
      maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
    });

    // Verify all 8 columns visible
    const columns = await page.locator('thead th').count();
    expect(columns).toBe(8); // All columns
  });

  test('Entry form - horizontal buttons', async ({ page }) => {
    await page.goto('/entries/new');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await expect(form).toHaveScreenshot('desktop-entry-form.png', {
      maxDiffPixelRatio: VISUAL_CONFIG.maxDiffPixelRatio,
    });

    // Verify button is NOT full-width (auto width)
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Button width should be much smaller than viewport
    expect(buttonBox.width).toBeLessThan(viewportSize.width * 0.3);
  });
});

test.describe('Visual Regression - Typography Scale', () => {
  test('Mobile typography (14px body)', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/entries');

    // Check body text size
    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );

    expect(fontSize).toBe('14px');
  });

  test('Desktop typography (16px body)', async ({ page }) => {
    page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/entries');

    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );

    expect(fontSize).toBe('16px');
  });
});

test.describe('Visual Regression - Touch Targets', () => {
  test('Mobile buttons ≥ 44px height', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/entries/new');

    const submitButton = page.locator('button[type="submit"]');
    const box = await submitButton.boundingBox();

    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('Mobile inputs ≥ 44px height', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/entries/new');

    const input = page.locator('input').first();
    const box = await input.boundingBox();

    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
