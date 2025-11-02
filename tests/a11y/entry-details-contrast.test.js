/**
 * Entry Details Contrast Accessibility Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T014 - Accessibility test for WCAG 2.1 AA contrast ratios
 * 
 * Validates that all text meets WCAG 2.1 AA contrast requirements.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Entry Details Page - WCAG 2.1 AA Contrast (US1)', () => {
  test('should meet WCAG 2.1 AA contrast requirements', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Should have no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have sufficient contrast for main heading', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Check heading contrast
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Run specific contrast check on heading
    const headingResults = await new AxeBuilder({ page })
      .include('h1')
      .withRules(['color-contrast'])
      .analyze();

    expect(headingResults.violations).toEqual([]);
  });

  test('should have sufficient contrast for fasting duration text', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Find duration value
    const durationValue = page.locator('text=/\\d+h \\d+m/').first();
    await expect(durationValue).toBeVisible();

    // Duration should have good contrast (it's prominent text)
    // Run axe on the parent container
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should have sufficient contrast for body text', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Check all body text for contrast
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should have sufficient contrast for labels and secondary text', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Find labels (e.g., "Fasting Duration", "Mood", etc.)
    const labels = page.locator('text=/Fasting Duration|Mood|Energy Level/').first();
    await expect(labels).toBeVisible();

    // Check contrast for all text
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should have sufficient contrast on gradient background', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Gradient background should not affect text contrast
    // Check the entire page for contrast issues
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    // No contrast violations should exist
    expect(results.violations).toEqual([]);
  });

  test('should have sufficient contrast for wellness indicators', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Wellness indicators should have proper contrast
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should have sufficient contrast for "Not logged" placeholders', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Check for any "N/A" or "Not logged" text
    const placeholders = page.locator('text=/N\\/A|Not logged/i');
    const count = await placeholders.count();

    if (count > 0) {
      // If placeholders exist, check their contrast
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test('should have accessible focus indicators', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Check that interactive elements have focus indicators
    const results = await new AxeBuilder({ page })
      .withRules(['focus-visible'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should meet all WCAG 2.1 Level AA requirements', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Comprehensive accessibility scan
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Log any violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
});

test.describe('Entry Details Page - Semantic HTML (US1)', () => {
  test('should use semantic HTML elements', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Check for semantic article element
    const article = page.locator('article').first();
    await expect(article).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have proper ARIA labels where needed', async ({ page }) => {
    await page.goto('/entries/test-entry-id');
    await page.waitForLoadState('networkidle');

    // Run ARIA-related checks
    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
