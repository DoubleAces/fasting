/**
 * E2E Test: Entry Navigation
 * 
 * Feature: 025-entry-details-enhancement
 * Tasks: T078-T081 - Entry navigation testing
 * 
 * Tests the Previous/Next navigation functionality on entry details pages.
 */

const { test, expect } = require('@playwright/test');

test.describe('Entry Navigation (Feature 025)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/entries');
  });

  test('should display navigation bar with position badge', async ({ page }) => {
    // Get all entry cards
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length === 0) {
      test.skip('No entries available for testing');
      return;
    }

    // Click on a middle entry
    const middleIndex = Math.floor(entryCards.length / 2);
    await entryCards[middleIndex].click();
    await page.waitForLoadState('networkidle');

    // Verify navigation bar is visible
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    await expect(navBar).toBeVisible();

    // Verify position badge is displayed
    const positionBadge = navBar.locator('text=/Entry \\d+ of \\d+/');
    await expect(positionBadge).toBeVisible();
  });

  test('should navigate to previous entry', async ({ page }) => {
    // Get all entry cards
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length < 2) {
      test.skip('Need at least 2 entries for navigation testing');
      return;
    }

    // Click on second entry
    await entryCards[1].click();
    await page.waitForLoadState('networkidle');

    // Get current entry ID from URL
    const currentUrl = page.url();
    const currentId = currentUrl.match(/\/entries\/([^/]+)/)[1];

    // Click Previous button
    const prevButton = page.locator('a[aria-label="Previous entry"]');
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    await page.waitForLoadState('networkidle');

    // Verify URL changed
    const newUrl = page.url();
    const newId = newUrl.match(/\/entries\/([^/]+)/)[1];
    expect(newId).not.toBe(currentId);

    // Verify navigation bar updated
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    await expect(navBar).toBeVisible();
  });

  test('should navigate to next entry', async ({ page }) => {
    // Get all entry cards
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length < 2) {
      test.skip('Need at least 2 entries for navigation testing');
      return;
    }

    // Click on first entry
    await entryCards[0].click();
    await page.waitForLoadState('networkidle');

    // Get current entry ID from URL
    const currentUrl = page.url();
    const currentId = currentUrl.match(/\/entries\/([^/]+)/)[1];

    // Click Next button
    const nextButton = page.locator('a[aria-label="Next entry"]');
    
    // Check if next button exists (might be on last entry)
    const nextExists = await nextButton.count() > 0;
    if (!nextExists) {
      test.skip('Already on last entry');
      return;
    }

    await nextButton.click();
    await page.waitForLoadState('networkidle');

    // Verify URL changed
    const newUrl = page.url();
    const newId = newUrl.match(/\/entries\/([^/]+)/)[1];
    expect(newId).not.toBe(currentId);

    // Verify navigation bar updated
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    await expect(navBar).toBeVisible();
  });

  test('should disable previous button on first entry', async ({ page }) => {
    // Get all entry cards sorted by date (newest first on page)
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length === 0) {
      test.skip('No entries available for testing');
      return;
    }

    // Click on last entry (oldest, chronologically first)
    await entryCards[entryCards.length - 1].click();
    await page.waitForLoadState('networkidle');

    // Check for disabled previous button
    const prevButton = page.locator('button:has-text("Previous"):disabled');
    await expect(prevButton).toBeVisible();

    // Verify it's not a link
    const prevLink = page.locator('a[aria-label="Previous entry"]');
    await expect(prevLink).not.toBeVisible();
  });

  test('should disable next button on last entry', async ({ page }) => {
    // Get all entry cards sorted by date (newest first on page)
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length === 0) {
      test.skip('No entries available for testing');
      return;
    }

    // Click on first entry (newest, chronologically last)
    await entryCards[0].click();
    await page.waitForLoadState('networkidle');

    // Check for disabled next button
    const nextButton = page.locator('button:has-text("Next"):disabled');
    await expect(nextButton).toBeVisible();

    // Verify it's not a link
    const nextLink = page.locator('a[aria-label="Next entry"]');
    await expect(nextLink).not.toBeVisible();
  });

  test('should verify position badge accuracy', async ({ page }) => {
    // Get all entry cards
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length === 0) {
      test.skip('No entries available for testing');
      return;
    }

    const totalEntries = entryCards.length;

    // Click on a middle entry
    const middleIndex = Math.floor(totalEntries / 2);
    await entryCards[middleIndex].click();
    await page.waitForLoadState('networkidle');

    // Get position badge text
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    const badgeText = await navBar.locator('span.bg-purple-100').first().textContent();

    // Extract numbers from "Entry X of Y"
    const match = badgeText.match(/Entry (\d+) of (\d+)/);
    expect(match).not.toBeNull();

    const displayedTotal = parseInt(match[2], 10);
    expect(displayedTotal).toBe(totalEntries);

    // Position should be between 1 and total
    const displayedPosition = parseInt(match[1], 10);
    expect(displayedPosition).toBeGreaterThanOrEqual(1);
    expect(displayedPosition).toBeLessThanOrEqual(totalEntries);
  });

  test('should maintain sticky positioning while scrolling', async ({ page }) => {
    // Get any entry
    const entryCard = page.locator('a[href*="/entries/"]').first();
    await entryCard.click();
    await page.waitForLoadState('networkidle');

    // Get navigation bar position
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    const initialBox = await navBar.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300); // Wait for scroll to complete

    // Navigation bar should still be visible at top
    const afterScrollBox = await navBar.boundingBox();
    
    // Y position should be at or near 0 (sticky at top)
    expect(afterScrollBox.y).toBeLessThan(10);
  });

  test('should display date in correct format', async ({ page }) => {
    // Get any entry
    const entryCard = page.locator('a[href*="/entries/"]').first();
    await entryCard.click();
    await page.waitForLoadState('networkidle');

    // Get date text from navigation bar
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    const dateText = await navBar.locator('text=/[A-Z][a-z]{2} \\d{1,2}, \\d{4}/').textContent();

    // Verify date format: "Oct 31, 2025"
    expect(dateText).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  test('should handle single entry scenario', async ({ page }) => {
    // This test assumes you might have a test user with only one entry
    // If you have multiple entries, this test will be skipped
    
    const entryCards = await page.locator('a[href*="/entries/"]').all();
    
    if (entryCards.length !== 1) {
      test.skip('Test requires exactly 1 entry');
      return;
    }

    // Click on the only entry
    await entryCards[0].click();
    await page.waitForLoadState('networkidle');

    // Verify both buttons are disabled
    const prevButton = page.locator('button:has-text("Previous"):disabled');
    await expect(prevButton).toBeVisible();

    const nextButton = page.locator('button:has-text("Next"):disabled');
    await expect(nextButton).toBeVisible();

    // Verify position shows "Entry 1 of 1"
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    const badgeText = await navBar.locator('span.bg-purple-100').first().textContent();
    expect(badgeText).toContain('Entry 1 of 1');
  });

  test('should have accessible navigation elements', async ({ page }) => {
    // Get any entry
    const entryCard = page.locator('a[href*="/entries/"]').first();
    await entryCard.click();
    await page.waitForLoadState('networkidle');

    // Verify nav element has aria-label
    const navBar = page.locator('nav[aria-label="Entry navigation"]');
    await expect(navBar).toBeVisible();

    // Check for aria-labels on buttons/links
    const prevControl = page.locator('[aria-label="Previous entry"]');
    const nextControl = page.locator('[aria-label="Next entry"]');

    // At least one should exist (even if disabled button)
    const prevCount = await prevControl.count();
    const nextCount = await nextControl.count();
    expect(prevCount + nextCount).toBeGreaterThan(0);
  });
});
