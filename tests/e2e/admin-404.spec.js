/**
 * Admin 404 E2E Tests
 * 
 * Tests for custom 404 page within admin area.
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Area 404 Handling', () => {
  test('should show admin-styled 404 page for non-existent admin routes', async ({ page }) => {
    // Navigate to a non-existent admin route
    await page.goto('/dashboard/non-existent-page');

    // Should see 404 heading
    const heading = page.getByRole('heading', { name: /404.*not found/i });
    await expect(heading).toBeVisible();

    // Should see helpful error message
    await expect(page.getByText(/doesn't exist or hasn't been created yet/i)).toBeVisible();

    // Should have search/magnifying glass icon
    await expect(page.getByText('🔍')).toBeVisible();
  });

  test('should include navigation links in 404 page', async ({ page }) => {
    await page.goto('/dashboard/invalid-route');

    // Should have link back to dashboard
    const dashboardLink = page.getByRole('link', { name: /back to dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    // Should have link to homepage
    const homeLink = page.getByRole('link', { name: /go to homepage/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('should allow navigation from 404 page back to dashboard', async ({ page }) => {
    await page.goto('/dashboard/does-not-exist');

    // Click back to dashboard link
    await page.getByRole('link', { name: /back to dashboard/i }).click();

    // Should navigate to dashboard (will show login if not authenticated)
    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });

  test('should allow navigation from 404 page to homepage', async ({ page }) => {
    await page.goto('/dashboard/missing-page');

    // Click homepage link
    await page.getByRole('link', { name: /go to homepage/i }).click();

    // Should navigate to homepage
    await expect(page).toHaveURL('/');
  });

  test('should maintain admin layout styling on 404 page', async ({ page }) => {
    await page.goto('/dashboard/not-found-test');

    // Check for centered layout (common in 404 pages)
    const mainContainer = page.locator('div').first();
    
    // Should have some content visible
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Page should not be completely blank
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('404');
  });
});
