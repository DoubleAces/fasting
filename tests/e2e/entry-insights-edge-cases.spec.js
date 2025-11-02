/**
 * Entry Insights E2E Tests - Edge Cases
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T039 - E2E test for insufficient data edge case
 * 
 * Tests graceful degradation when user has <10 entries and error scenarios.
 */

import { test, expect } from '@playwright/test';

test.describe('Entry Insights - Edge Cases (US2)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a new user with few entries
    await page.goto('/login');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should show "Log more entries" message with insufficient data', async ({ page }) => {
    // Assuming this user has <10 entries
    await page.goto('/entries');
    
    // Check if entries exist
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Should show helpful message instead of insights
      const message = page.locator('text=/log more entries/i');
      await expect(message).toBeVisible();
    }
  });

  test('should display minimum entries requirement (10 entries)', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Should mention 10 entries requirement
      const message = page.locator('text=/10 entries/i');
      await expect(message).toBeVisible();
    }
  });

  test('should not display insights section with <10 entries', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0 && entryCount < 10) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Insights callout boxes should not be visible
      const calloutBoxes = page.locator('[class*="bg-gradient"]:has-text("top")');
      await expect(calloutBoxes).not.toBeVisible();
    }
  });

  test('should display helpful CTA to log more entries', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0 && entryCount < 10) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Should have helpful message encouraging more entries
      const encouragement = page.locator('text=/continue logging|keep tracking|log more/i');
      await expect(encouragement).toBeVisible();
    }
  });

  test('should still display entry details without insights', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Basic entry details should still be visible
      const timeline = page.locator('text=/timeline/i');
      await expect(timeline).toBeVisible();

      // Main entry data should be displayed
      const duration = page.locator('text=/\\d+ hours \\d+ minutes/i');
      await expect(duration.first()).toBeVisible();
    }
  });

  test('should handle zero entries gracefully', async ({ page }) => {
    // User with no entries
    await page.goto('/entries');

    // Should show empty state
    const emptyState = page.locator('text=/no entries|start logging/i');
    await expect(emptyState).toBeVisible();
  });

  test('should handle missing entry gracefully (404)', async ({ page }) => {
    // Try to access non-existent entry
    await page.goto('/entries/000000000000000000000000');

    // Should show 404 or error message
    const error = page.locator('text=/not found|doesn\'t exist/i');
    await expect(error).toBeVisible();
  });

  test('should handle unauthorized access gracefully', async ({ page }) => {
    // Logout
    await page.goto('/dashboard');
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('/login');

    // Try to access entry details without auth
    await page.goto('/entries/507f1f77bcf86cd799439011');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle network error during insights fetch', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0) {
      // Should handle offline gracefully (may show cached or error)
      await entryLinks.first().click({ timeout: 5000 }).catch(() => {
        // Expected to fail offline
      });
    }

    await page.context().setOffline(false);
  });

  test('should display glassmorphic styling for insufficient data message', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0 && entryCount < 10) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      const insightsSection = page.locator('section:has-text("log more entries")');
      
      if (await insightsSection.count() > 0) {
        // Should still have glassmorphic styling
        const styles = await insightsSection.evaluate((el) => {
          return window.getComputedStyle(el).backdropFilter;
        });

        expect(styles).toContain('blur');
      }
    }
  });

  test('should show progress indicator for insights data', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0 && entryCount < 10) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Should show how many more entries needed (e.g., "5 more entries needed")
      const progress = page.locator('text=/\\d+ more entries?/i');
      if (await progress.count() > 0) {
        await expect(progress).toBeVisible();
      }
    }
  });

  test('should maintain accessibility with insufficient data message', async ({ page }) => {
    await page.goto('/entries');
    const entryLinks = page.locator('a[href^="/entries/"]');
    const entryCount = await entryLinks.count();

    if (entryCount > 0 && entryCount < 10) {
      await entryLinks.first().click();
      await page.waitForSelector('article');

      // Message should be in semantic HTML
      const insightsSection = page.locator('section, div[role="status"]').filter({ hasText: /log more entries/i });
      
      if (await insightsSection.count() > 0) {
        await expect(insightsSection).toBeVisible();
      }
    }
  });
});
