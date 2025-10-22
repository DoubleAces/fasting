/**
 * Admin Access E2E Tests
 * 
 * End-to-end tests for admin area access control flow.
 * 
 * Test Scenarios:
 * - Admin user login and dashboard access
 * - Non-admin user blocked from dashboard
 * - Unauthenticated user redirected to login
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Area Access', () => {
  test.describe('Admin User Access', () => {
    test('admin user can log in and access dashboard', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill in admin credentials
      // Note: Test user should be created in test setup
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Should be redirected to entries page after login
      await expect(page).toHaveURL('/entries');
      
      // Navigate to admin dashboard
      await page.goto('/dashboard');
      
      // Should see admin dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
      await expect(page.locator('text=Welcome')).toBeVisible();
    });
    
    test('admin dashboard displays sidebar and header', async ({ page }) => {
      // Assuming user is already logged in as admin
      await page.goto('/dashboard');
      
      // Check for sidebar navigation
      const sidebar = page.locator('nav[aria-label*="sidebar"]');
      await expect(sidebar).toBeVisible();
      
      // Check for header
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Check for user info in header
      await expect(page.locator('text=admin@test.com')).toBeVisible();
    });
    
    test('admin dashboard shows "Coming Soon" placeholders', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should see "Coming Soon" cards
      const comingSoonCards = page.locator('text=Coming Soon');
      await expect(comingSoonCards.first()).toBeVisible();
      
      // Should see at least 3 placeholder cards
      const cardCount = await comingSoonCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(3);
    });
  });
  
  test.describe('Non-Admin User Blocked', () => {
    test('non-admin user sees 404 page (security through obscurity)', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill in non-admin credentials
      await page.fill('input[name="email"]', 'user@test.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Should be redirected to entries page
      await expect(page).toHaveURL('/entries');
      
      // Attempt to access admin dashboard
      await page.goto('/dashboard');
      
      // Should see 404 page (not access-denied)
      // URL stays as /dashboard but content is 404
      await expect(page.locator('text=/404|not found|page not found/i')).toBeVisible();
    });
    
    test('404 page does not reveal admin area existence', async ({ page }) => {
      // Assuming user is logged in as non-admin
      await page.goto('/dashboard');
      
      // Should see generic 404 page
      await expect(page.locator('text=/404|not found|page not found/i')).toBeVisible();
      
      // Should NOT see admin-specific error messages
      const adminText = page.locator('text=/admin|administrator|privileges/i');
      await expect(adminText).not.toBeVisible();
    });
  });
  
  test.describe('Unauthenticated User', () => {
    test('unauthenticated user redirected to login with callback URL', async ({ page }) => {
      // Attempt to access admin dashboard without logging in
      await page.goto('/dashboard');
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/);
      
      // URL should contain callbackUrl parameter
      const url = page.url();
      expect(url).toContain('callbackUrl');
      expect(url).toContain(encodeURIComponent('/dashboard'));
    });
    
    test('after login, user redirected to original requested admin page', async ({ page }) => {
      // Attempt to access specific admin page
      await page.goto('/dashboard/users');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
      
      // Login as admin
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      // Should be redirected back to originally requested page
      // Note: This depends on callbackUrl implementation
      await expect(page).toHaveURL('/dashboard/users');
    });
  });
  
  test.describe('Direct URL Access', () => {
    test('admin can access dashboard via direct URL', async ({ page }) => {
      // Assuming admin is logged in
      await page.goto('/dashboard');
      
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    });
    
    test('non-admin sees 404 via direct URL', async ({ page }) => {
      // Assuming non-admin is logged in
      await page.goto('/dashboard');
      
      // URL stays as /dashboard but shows 404 content
      await expect(page.locator('text=/404|not found/i')).toBeVisible();
    });
  });
});
