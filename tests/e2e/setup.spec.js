import { test, expect } from '@playwright/test';

/**
 * Sample E2E test to verify Playwright setup
 * This test can be deleted once real E2E tests are implemented
 */

test.describe('Playwright Setup', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the correct page
    await expect(page).toHaveTitle(/Next.js/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads on mobile viewport
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate using keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Press Tab to focus on first interactive element
    await page.keyboard.press('Tab');
    
    // Verify some element has focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
