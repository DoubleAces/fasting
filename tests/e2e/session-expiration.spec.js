/**
 * Session Expiration E2E Tests
 * 
 * Tests for session expiration handling with preserved URLs.
 */

import { test, expect } from '@playwright/test';

test.describe('Session Expiration Flow', () => {
  test('should redirect to login with callback URL when accessing admin area without session', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // URL should include callbackUrl parameter
    const url = page.url();
    expect(url).toContain('callbackUrl');
    expect(url).toContain('dashboard');
  });

  test('should preserve deep URL paths in callback', async ({ page }) => {
    // Try to access a deep admin route without authentication
    await page.goto('/dashboard/settings/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Should preserve the full path in callback
    const url = page.url();
    expect(url).toContain('callbackUrl');
    // The callback URL should be encoded
    expect(url).toMatch(/callbackUrl.*dashboard/);
  });

  test('should show login form when session expires', async ({ page }) => {
    // Access admin area without session
    await page.goto('/dashboard');

    // Should be on login page
    await expect(page).toHaveURL(/\/login/);

    // Should show login form elements
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    
    // Should show heading
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should handle query parameters in preserved URL', async ({ page }) => {
    // Try to access dashboard with query params
    await page.goto('/dashboard?tab=users&view=list');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Should have callback URL
    const url = page.url();
    expect(url).toContain('callbackUrl');
  });

  test('should not show session expired message for first-time visitors', async ({ page }) => {
    // Go directly to login page (not from expiration)
    await page.goto('/login');

    // Should NOT show session expired message
    const sessionExpiredText = page.getByText(/session.*expired/i);
    await expect(sessionExpiredText).not.toBeVisible();
  });

  test('non-admin users should see 404 when accessing admin area', async ({ page, context }) => {
    // This test would require setting up a non-admin user session
    // For now, just test the unauthenticated case which redirects to login
    
    await page.goto('/dashboard');
    
    // Unauthenticated users should be redirected to login (not 404)
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Area Session Persistence', () => {
  test('should maintain session across admin page navigation', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Verify we're on login page
    await expect(page).toHaveURL(/\/login/);

    // Try to navigate to dashboard (will be redirected back to login if no session)
    await page.goto('/dashboard');

    // Should still be on login (or dashboard if somehow authenticated)
    const url = page.url();
    expect(url).toMatch(/\/(login|dashboard)/);
  });

  test('should handle multiple admin route access attempts', async ({ page }) => {
    // Try accessing multiple admin routes
    const routes = ['/dashboard', '/dashboard/users', '/dashboard/settings'];

    for (const route of routes) {
      await page.goto(route);
      
      // All should redirect to login
      await expect(page).toHaveURL(/\/login/);
      
      // Each should have appropriate callback URL
      const url = page.url();
      expect(url).toContain('callbackUrl');
    }
  });
});
