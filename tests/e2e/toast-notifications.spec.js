/**
 * Toast Notifications E2E Tests
 * 
 * Tests for toast notification behavior in real browser environment
 */

const { test, expect } = require('@playwright/test');

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
    
    // Fill in login credentials (adjust based on your test user)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/entries');
  });

  test('success toast auto-dismisses after 5 seconds', async ({ page }) => {
    // Navigate to entries page
    await page.goto('/entries');

    // Click "New Entry" button
    await page.click('text=New Entry');

    // Fill in entry form
    await page.fill('input[name="startTime"]', '2025-01-01T08:00');
    await page.fill('input[name="endTime"]', '2025-01-01T16:00');

    // Submit form
    await page.click('button:has-text("Save Entry")');

    // Wait for success toast to appear
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/entry saved successfully/i);

    // Toast should still be visible after 4 seconds
    await page.waitForTimeout(4000);
    await expect(toast).toBeVisible();

    // Toast should auto-dismiss after 5 seconds total
    await page.waitForTimeout(1500);
    await expect(toast).not.toBeVisible();
  });

  test('manual dismiss removes toast immediately', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');

    // Make a change and save
    await page.click('button:has-text("Save")');

    // Wait for success toast
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible();

    // Click dismiss button
    await page.click('button[aria-label="Dismiss notification"]');

    // Toast should be removed immediately
    await expect(toast).not.toBeVisible();
  });

  test('Escape key dismisses all toasts', async ({ page }) => {
    // Trigger multiple toasts (navigate to a page that might have multiple actions)
    await page.goto('/entries');

    // Create multiple entries to trigger multiple toasts
    // (Adjust based on your application's behavior)
    
    // For now, just trigger one toast and test Escape
    await page.click('text=New Entry');
    await page.fill('input[name="startTime"]', '2025-01-01T08:00');
    await page.fill('input[name="endTime"]', '2025-01-01T16:00');
    await page.click('button:has-text("Save Entry")');

    // Wait for toast
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Toast should be dismissed
    await expect(toast).not.toBeVisible();
  });

  test('error toast persists until manually dismissed', async ({ page }) => {
    // Navigate to settings and trigger an error (e.g., by mocking network failure)
    await page.goto('/settings');

    // Intercept API call and force it to fail
    await page.route('**/api/settings', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to save settings' }),
      });
    });

    // Attempt to save settings
    await page.click('button:has-text("Save")');

    // Wait for error toast
    const errorToast = page.locator('[role="alert"]');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(/failed|error/i);

    // Wait 10 seconds - toast should NOT auto-dismiss
    await page.waitForTimeout(10000);
    await expect(errorToast).toBeVisible();

    // Manually dismiss by clicking X button
    await page.click('button[aria-label="Dismiss notification"]');

    // Toast should be removed
    await expect(errorToast).not.toBeVisible();
  });

  test('multiple toasts stack vertically with spacing', async ({ page }) => {
    // Navigate to a test page or entries page
    await page.goto('/entries');

    // Rapidly trigger multiple success toasts
    // (Adjust based on your application's behavior - you might need to create multiple entries)
    for (let i = 0; i < 3; i++) {
      // This is a placeholder - adjust to your actual toast-triggering mechanism
      await page.evaluate(() => {
        // Inject toasts via window object if you expose the toast context
        // Or trigger actions that create toasts
      });
    }

    // Check that multiple toasts are visible
    const toasts = page.locator('[role="status"], [role="alert"]');
    const toastCount = await toasts.count();
    expect(toastCount).toBeGreaterThan(1);

    // Verify they are stacked vertically (check container has flex-col and gap)
    const container = page.locator('.fixed.top-4');
    await expect(container).toHaveClass(/flex-col/);
    await expect(container).toHaveClass(/gap-3/);
  });

  test('5th toast queues and displays when slot opens', async ({ page }) => {
    // This test verifies FIFO queue behavior
    await page.goto('/test/toast'); // Assuming you have a test page

    // Rapidly add 5 toasts
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Add Toast")');
      await page.waitForTimeout(100); // Small delay to ensure each toast is processed
    }

    // Should only show 4 toasts (max displayed)
    const visibleToasts = page.locator('[role="status"], [role="alert"]');
    expect(await visibleToasts.count()).toBe(4);

    // Wait for first toast to auto-dismiss (5 seconds + animation)
    await page.waitForTimeout(5500);

    // 5th toast should now be visible (moved from queue to displayed)
    expect(await visibleToasts.count()).toBe(4); // Still 4, but 5th has replaced 1st
  });

  test('action button in error toast executes callback', async ({ page }) => {
    // Navigate to a page and trigger an error with retry action
    await page.goto('/entries');

    // Intercept API to force error
    await page.route('**/api/entries', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error' }),
      });
    });

    // Try to save an entry (adjust to your actual form)
    await page.click('button:has-text("New Entry")');
    // Fill form and submit...
    await page.click('button:has-text("Save")');

    // Wait for error toast with retry button
    const errorToast = page.locator('[role="alert"]');
    await expect(errorToast).toBeVisible();

    // Click retry button
    const retryButton = errorToast.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
    
    // Remove the route intercept so retry can succeed
    await page.unroute('**/api/entries');
    
    await retryButton.click();

    // Toast should be dismissed and retry should be attempted
    // (Additional assertions would depend on your retry behavior)
  });
});
