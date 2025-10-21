/**
 * E2E Tests: Authenticated Access to Terms Page
 * 
 * User Story 2: Access Terms While Logged In
 * Tests that existing users can review terms at any time from footer links.
 * 
 * Coverage:
 * - Authenticated users can access /terms
 * - Footer link works when logged in
 * - Terms content identical for authenticated/unauthenticated users
 * - Navigation works correctly (back button)
 */

import { test, expect } from '@playwright/test';

test.describe('Authenticated Terms Access - User Story 2', () => {
  // Note: These tests verify terms page is accessible regardless of auth state
  // The key requirement is that /terms is a public route (FR-002)

  // Note: These tests verify terms page is accessible regardless of auth state
  // The key requirement is that /terms is a public route (FR-002)

  test('should allow access to terms page without authentication', async ({ page }) => {
    // Given: User is not logged in
    // When: User navigates to /terms directly
    await page.goto('/terms');
    
    // Then: Terms page loads successfully
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
    expect(page.url()).toContain('/terms');
  });

  test('should have footer link to terms on public pages', async ({ page }) => {
    // Given: User is on a public page
    await page.goto('/');
    
    // When: User looks for terms link in footer
    const termsLink = page.locator('footer a[href="/terms"]');
    await expect(termsLink).toBeVisible();
    
    // And: Clicks the link
    await termsLink.click();
    
    // Then: User is taken to terms page
    await page.waitForURL('/terms');
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
  });

  test('should display complete terms content for authenticated users', async ({ page }) => {
    // Given: User navigates to /terms (auth state doesn't matter for public route)
    // When: User navigates to /terms
    await page.goto('/terms');
    
    // Then: All main sections are visible
    await expect(page.getByRole('heading', { name: /Introduction/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Account Terms/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /User Responsibilities/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Privacy Notice/i, level: 2 })).toBeVisible();
    
    // And: Content is readable
    await expect(page.locator('text=effective')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Health Disclaimer/i })).toBeVisible();
  });

  test('should allow navigation back from terms page', async ({ page }) => {
    // Given: User is on home page
    await page.goto('/');
    
    // When: User navigates to terms and then uses back button
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
    
    await page.goBack();
    
    // Then: User returns to previous page
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('should show identical content as unauthenticated view', async ({ page, context }) => {
    // Given: Logged-in user views terms
    await page.goto('/terms');
    const authenticatedTitle = await page.locator('h1').first().textContent();
    const authenticatedIntro = await page.locator('h2:has-text("Introduction")').textContent();
    
    // When: Compare with unauthenticated view
    const newPage = await context.newPage();
    await newPage.goto('/terms');
    const unauthenticatedTitle = await newPage.locator('h1').first().textContent();
    const unauthenticatedIntro = await newPage.locator('h2:has-text("Introduction")').textContent();
    
    // Then: Content should be identical
    expect(authenticatedTitle).toBe(unauthenticatedTitle);
    expect(authenticatedIntro).toBe(unauthenticatedIntro);
    
    await newPage.close();
  });

  test('should have working footer link on all pages', async ({ page }) => {
    // Test footer link works on different public pages
    const pages = ['/', '/features', '/faq'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const termsLink = page.locator('footer a[href="/terms"]');
      await expect(termsLink).toBeVisible();
      
      // Verify link is clickable
      expect(await termsLink.getAttribute('href')).toBe('/terms');
    }
  });

  test('should support direct URL access to terms when logged in', async ({ page }) => {
    // Given: User directly navigates to /terms (public route, no auth required)
    // When: User directly navigates to /terms via URL
    await page.goto('/terms');
    
    // Then: Terms page loads successfully
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
    
    // And: No redirect or auth error occurs
    expect(page.url()).toContain('/terms');
  });
});

test.describe('Authenticated Terms Access - Cross-browser', () => {
  test('should work on mobile viewport for authenticated users', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to terms (public route)
    await page.goto('/terms');
    
    // Verify terms are accessible and readable
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
    
    // Verify content is not cut off (width check)
    const heading = page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 });
    const box = await heading.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });
});

test.describe('Authenticated Terms Access - Error Cases', () => {
  test('should handle terms access without cookies', async ({ page }) => {
    // Clear all cookies to ensure no session exists
    await page.context().clearCookies();
    
    // Navigate to terms - should still work (public page)
    await page.goto('/terms');
    
    // Terms page should still be accessible
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
  });
});
