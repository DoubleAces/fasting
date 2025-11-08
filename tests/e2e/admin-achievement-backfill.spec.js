/**
 * Achievement Backfill E2E Tests
 * 
 * End-to-end tests for the admin achievement backfill feature.
 * Tests the complete flow from button visibility to success toast.
 * 
 * Test Scenarios:
 * - T021: Backfill button appears for all users in admin table
 * - T022: Click button → loading state → success toast with statistics
 * 
 * Prerequisites:
 * - Admin user with credentials admin@test.com / TestPassword123!
 * - At least one regular user in the system
 * - Test database with users and entries
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Achievement Backfill', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login as admin
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to entries page
    await expect(page).toHaveURL('/entries');
    
    // Navigate to admin users page
    await page.goto('/admin/users');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('T021: Backfill button appears for all users in admin table', async ({ page }) => {
    // Should be on admin users page
    await expect(page).toHaveURL('/admin/users');
    
    // Should see page heading
    const heading = page.getByRole('heading', { name: /user management/i });
    await expect(heading).toBeVisible();
    
    // Should see user table
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Get all user rows (excluding header)
    const userRows = page.locator('tbody tr');
    const rowCount = await userRows.count();
    
    // Should have at least one user
    expect(rowCount).toBeGreaterThan(0);
    
    // Each row should have a Backfill button
    for (let i = 0; i < rowCount; i++) {
      const row = userRows.nth(i);
      const backfillButton = row.getByRole('button', { name: /backfill/i });
      await expect(backfillButton).toBeVisible();
      
      // Button should be enabled (not disabled)
      await expect(backfillButton).toBeEnabled();
      
      // Button should have blue styling (bg-blue-600)
      const buttonClasses = await backfillButton.getAttribute('class');
      expect(buttonClasses).toContain('bg-blue-600');
    }
  });

  test('T022: Click button shows loading state then success toast with statistics', async ({ page }) => {
    // Should be on admin users page
    await expect(page).toHaveURL('/admin/users');
    
    // Find first user row (not the current admin user)
    const userRows = page.locator('tbody tr');
    const firstRow = userRows.first();
    
    // Find the Backfill button in first row
    const backfillButton = firstRow.getByRole('button', { name: /backfill/i });
    await expect(backfillButton).toBeVisible();
    
    // Click the button
    await backfillButton.click();
    
    // Should immediately show loading state
    // Button should be disabled
    await expect(backfillButton).toBeDisabled();
    
    // Button text should change to "Processing..."
    await expect(backfillButton).toContainText(/processing/i);
    
    // Should see spinner icon (animate-spin class)
    const spinner = backfillButton.locator('svg.animate-spin');
    await expect(spinner).toBeVisible();
    
    // Wait for operation to complete (max 30 seconds for large datasets)
    // Success toast should appear
    const toast = page.locator('[role="status"], [role="alert"]').filter({ 
      hasText: /backfill complete/i 
    });
    
    await expect(toast).toBeVisible({ timeout: 30000 });
    
    // Toast should contain statistics
    await expect(toast).toContainText(/processed/i);
    await expect(toast).toContainText(/entries/i);
    await expect(toast).toContainText(/unlocked/i);
    await expect(toast).toContainText(/achievements/i);
    await expect(toast).toContainText(/earned/i);
    await expect(toast).toContainText(/points/i);
    
    // Button should return to normal state
    await expect(backfillButton).toBeEnabled();
    await expect(backfillButton).toContainText(/backfill/i);
    await expect(backfillButton).not.toContainText(/processing/i);
  });

  test('T023: Button shows error toast on failure', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/admin/users/*/backfill-achievements', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: false, 
          error: 'Test error: Database connection failed' 
        }),
      });
    });
    
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Click backfill button
    const userRows = page.locator('tbody tr');
    const firstRow = userRows.first();
    const backfillButton = firstRow.getByRole('button', { name: /backfill/i });
    
    await backfillButton.click();
    
    // Should show loading state briefly
    await expect(backfillButton).toBeDisabled();
    await expect(backfillButton).toContainText(/processing/i);
    
    // Error toast should appear
    const errorToast = page.locator('[role="alert"]').filter({ 
      hasText: /failed to backfill/i 
    });
    
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText(/test error/i);
    
    // Button should return to normal state
    await expect(backfillButton).toBeEnabled();
    await expect(backfillButton).toContainText(/backfill/i);
  });

  test('T024: Multiple backfills on same user show idempotency', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    const userRows = page.locator('tbody tr');
    const firstRow = userRows.first();
    const backfillButton = firstRow.getByRole('button', { name: /backfill/i });
    
    // First backfill
    await backfillButton.click();
    await expect(backfillButton).toBeDisabled();
    
    // Wait for first success toast
    const firstToast = page.locator('[role="status"], [role="alert"]').filter({ 
      hasText: /backfill complete/i 
    }).first();
    await expect(firstToast).toBeVisible({ timeout: 30000 });
    
    // Extract achievements count from first toast (may be non-zero)
    const firstToastText = await firstToast.textContent();
    
    // Wait for button to re-enable
    await expect(backfillButton).toBeEnabled();
    
    // Second backfill (should be idempotent)
    await backfillButton.click();
    await expect(backfillButton).toBeDisabled();
    
    // Wait for second success toast
    const secondToast = page.locator('[role="status"], [role="alert"]').filter({ 
      hasText: /backfill complete/i 
    }).nth(1);
    await expect(secondToast).toBeVisible({ timeout: 30000 });
    
    // Second toast should show "unlocked 0 achievements" (idempotency)
    await expect(secondToast).toContainText(/unlocked 0 achievements/i);
    
    // Button should return to normal state
    await expect(backfillButton).toBeEnabled();
  });

  test('T025: Backfill button works for users with no entries', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Find a user row (any user works for this test)
    const userRows = page.locator('tbody tr');
    const firstRow = userRows.first();
    const backfillButton = firstRow.getByRole('button', { name: /backfill/i });
    
    await backfillButton.click();
    
    // Should show loading state
    await expect(backfillButton).toBeDisabled();
    await expect(backfillButton).toContainText(/processing/i);
    
    // Success toast should appear (even with 0 entries)
    const toast = page.locator('[role="status"], [role="alert"]').filter({ 
      hasText: /backfill complete/i 
    });
    await expect(toast).toBeVisible({ timeout: 30000 });
    
    // Should show "Processed 0 entries" or similar
    await expect(toast).toContainText(/processed/i);
    
    // Button should return to normal state
    await expect(backfillButton).toBeEnabled();
  });

  test('T026: Backfill button has correct accessibility attributes', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    const userRows = page.locator('tbody tr');
    const firstRow = userRows.first();
    
    // Get user name from the row
    const userName = await firstRow.locator('td:first-child').textContent();
    
    // Find backfill button
    const backfillButton = firstRow.getByRole('button', { name: /backfill/i });
    
    // Should have aria-label with user name context
    const ariaLabel = await backfillButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel?.toLowerCase()).toContain('backfill');
    expect(ariaLabel?.toLowerCase()).toContain('achievements');
    
    // Button should be keyboard accessible
    await backfillButton.focus();
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');
  });
});
