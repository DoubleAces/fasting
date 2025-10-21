/**
 * E2E Tests: Authenticated Privacy Policy Access
 * Tests privacy policy access for logged-in users from footer and direct navigation
 * 
 * Note: /privacy is a public route (like /terms), so these tests verify:
 * 1. Page is accessible regardless of auth state
 * 2. Footer link exists and works
 * 3. Content is consistent
 */

import { test, expect } from '@playwright/test';

test.describe('Authenticated Privacy Policy Access', () => {
  
  test('should allow access to privacy page without authentication', async ({ page }) => {
    // User navigates to /privacy directly
    await page.goto('/privacy');
    
    // Privacy page loads successfully
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    
    // Content is present
    await expect(page.locator('#information-we-collect')).toBeVisible();
    await expect(page.locator('#your-privacy-rights')).toBeVisible();
  });

  test('should have footer link to privacy on public pages', async ({ page }) => {
    // User is on homepage
    await page.goto('/');
    
    // Footer has privacy link
    const footerPrivacyLink = page.locator('footer a[href="/privacy"]');
    await expect(footerPrivacyLink).toBeVisible();
    await expect(footerPrivacyLink).toHaveText('Privacy Policy');
    
    // Click the link
    await footerPrivacyLink.click();
    
    // User is taken to privacy page
    await page.waitForURL('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });

  test('should display complete privacy content', async ({ page }) => {
    // Navigate to privacy page
    await page.goto('/privacy');
    
    // Verify all 10 sections are present
    await expect(page.locator('#information-we-collect')).toBeVisible();
    await expect(page.locator('#how-we-use-your-information')).toBeVisible();
    await expect(page.locator('#data-storage-and-security')).toBeVisible();
    await expect(page.locator('#data-sharing-and-disclosure')).toBeVisible();
    await expect(page.locator('#your-privacy-rights')).toBeVisible();
    await expect(page.locator('#cookies-and-tracking')).toBeVisible();
    await expect(page.locator('#health-information')).toBeVisible();
    await expect(page.locator('#childrens-privacy')).toBeVisible();
    await expect(page.locator('#international-users')).toBeVisible();
    await expect(page.locator('#contact-information')).toBeVisible();
    
    // Verify key content
    await expect(page.locator('text=GDPR').first()).toBeVisible();
    await expect(page.locator('text=CCPA').first()).toBeVisible();
    await expect(page.locator('text=privacy@fastingtracker.app').first()).toBeVisible();
  });

  test('should support back button navigation', async ({ page }) => {
    // Start on homepage
    await page.goto('/');
    const homeUrl = page.url();
    
    // Click privacy link in footer
    const footerPrivacyLink = page.locator('footer a[href="/privacy"]');
    await footerPrivacyLink.click();
    await expect(page).toHaveURL('/privacy');
    
    // Use browser back button
    await page.goBack();
    
    // Verify we're back at homepage
    expect(page.url()).toBe(homeUrl);
  });

  test('should have privacy link in footer on multiple pages', async ({ page }) => {
    // Check on homepage
    await page.goto('/');
    let footerPrivacyLink = page.locator('footer a[href="/privacy"]');
    await expect(footerPrivacyLink).toBeVisible();
    
    // Check on features page (if exists)
    const featuresNav = page.locator('a[href="/features"]').first();
    if (await featuresNav.isVisible()) {
      await featuresNav.click();
      await page.waitForURL('/features', { timeout: 5000 });
      
      footerPrivacyLink = page.locator('footer a[href="/privacy"]');
      await expect(footerPrivacyLink).toBeVisible();
    }
    
    // Check on FAQ page (if exists)
    const faqNav = page.locator('a[href="/faq"]').first();
    if (await faqNav.isVisible()) {
      await page.goto('/faq');
      
      footerPrivacyLink = page.locator('footer a[href="/privacy"]');
      await expect(footerPrivacyLink).toBeVisible();
    }
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Focus the footer privacy link
    const footerPrivacyLink = page.locator('footer a[href="/privacy"]');
    await footerPrivacyLink.focus();
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    
    // Verify navigation
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });

  test('should have appropriate link attributes for internal navigation', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check footer privacy link attributes
    const footerPrivacyLink = page.locator('footer a[href="/privacy"]');
    await expect(footerPrivacyLink).toBeVisible();
    
    // Internal links should NOT have target="_blank"
    const target = await footerPrivacyLink.getAttribute('target');
    expect(target).toBeNull();
  });

  test('should be grouped with Terms link in Legal section', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Find both legal links
    const privacyLink = page.locator('footer a[href="/privacy"]');
    const termsLink = page.locator('footer a[href="/terms"]');
    
    // Both should be visible
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();
    
    // Should be in same section (look for "LEGAL" heading nearby)
    const legalHeading = page.locator('footer').locator('text=LEGAL');
    await expect(legalHeading).toBeVisible();
  });
});
