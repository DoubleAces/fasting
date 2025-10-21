/**
 * E2E Tests: Section Anchors in Terms Page
 * 
 * User Story 3: Reference Specific Sections
 * Tests that users can link to specific sections via URL anchors.
 * 
 * Coverage:
 * - Clicking section headings updates URL with anchor
 * - URL with anchor scrolls to correct section on page load
 * - Anchor links can be shared and work correctly
 * - Keyboard navigation works for section headings
 * - Smooth scroll behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Terms Page - Section Anchors (User Story 3)', () => {
  test('should update URL when clicking on section heading', async ({ page }) => {
    // Given: User is on terms page
    await page.goto('/terms');
    
    // When: User clicks on "Health Disclaimer" heading
    const healthHeading = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await expect(healthHeading).toBeVisible();
    await healthHeading.click();
    
    // Then: URL should update with anchor
    await page.waitForTimeout(500); // Wait for URL update
    expect(page.url()).toContain('#health-disclaimer');
  });

  test('should scroll to section when URL contains anchor', async ({ page }) => {
    // Given: URL contains anchor for Health Disclaimer
    // When: User navigates to that URL
    await page.goto('/terms#health-disclaimer');
    
    // Wait for scroll to complete
    await page.waitForTimeout(1000);
    
    // Then: Health Disclaimer section should be visible in viewport
    const healthHeading = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await expect(healthHeading).toBeInViewport();
  });

  test('should show hover effect on section headings', async ({ page }) => {
    await page.goto('/terms');
    
    // Get a section heading
    const heading = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    await expect(heading).toBeVisible();
    
    // Hover over heading
    await heading.hover();
    
    // Should show # symbol on hover
    const linkIcon = heading.locator('span').filter({ hasText: '#' });
    await expect(linkIcon).toBeVisible();
  });

  test('should update URL for multiple section clicks', async ({ page }) => {
    await page.goto('/terms');
    
    // Click on first section
    const introHeading = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    await introHeading.click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('#introduction');
    
    // Click on another section
    const accountHeading = page.getByRole('heading', { name: /Account Terms/i, level: 2 });
    await accountHeading.click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('#account-terms');
    
    // Click on third section
    const healthHeading = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await healthHeading.click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('#health-disclaimer');
  });

  test('should work with keyboard navigation (Enter key)', async ({ page }) => {
    await page.goto('/terms');
    
    // Focus on a heading using Tab
    const heading = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    await heading.focus();
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    // URL should update
    expect(page.url()).toContain('#introduction');
  });

  test('should work with keyboard navigation (Space key)', async ({ page }) => {
    await page.goto('/terms');
    
    // Focus on a heading
    const heading = page.getByRole('heading', { name: /Account Terms/i, level: 2 });
    await heading.focus();
    
    // Press Space to activate
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    // URL should update
    expect(page.url()).toContain('#account-terms');
  });

  test('should scroll to correct section for all major sections', async ({ page }) => {
    const sections = [
      { id: 'introduction', name: /Introduction/i },
      { id: 'account-terms', name: /Account Terms/i },
      { id: 'user-responsibilities', name: /User Responsibilities/i },
      { id: 'health-disclaimer', name: /Health Disclaimer/i },
      { id: 'privacy-notice', name: /Privacy Notice/i },
    ];
    
    for (const section of sections) {
      // Navigate to section via anchor
      await page.goto(`/terms#${section.id}`);
      await page.waitForTimeout(800);
      
      // Verify section heading is in viewport
      const heading = page.getByRole('heading', { name: section.name, level: 2 });
      await expect(heading).toBeInViewport();
    }
  });

  test('should handle shared anchor links correctly', async ({ page, context }) => {
    // Simulate sharing a link with anchor
    const sharedUrl = '/terms#health-disclaimer';
    
    // Open in new tab (as if someone clicked shared link)
    const newPage = await context.newPage();
    await newPage.goto(sharedUrl);
    await newPage.waitForTimeout(1000);
    
    // Health Disclaimer should be visible in viewport
    const healthHeading = newPage.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await expect(healthHeading).toBeInViewport();
    
    // URL should include anchor
    expect(newPage.url()).toContain('#health-disclaimer');
    
    await newPage.close();
  });

  test('should maintain scroll position after clicking heading', async ({ page }) => {
    await page.goto('/terms');
    
    // Scroll down to Health Disclaimer section
    const healthHeading = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await healthHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Click the heading
    await healthHeading.click();
    await page.waitForTimeout(500);
    
    // Should still be visible (not scrolled away)
    await expect(healthHeading).toBeInViewport();
  });

  test('should have proper ARIA attributes for accessibility', async ({ page }) => {
    await page.goto('/terms');
    
    const heading = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    
    // Should be keyboard focusable
    expect(await heading.getAttribute('tabIndex')).toBe('0');
    
    // Should have aria-label
    const ariaLabel = await heading.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Introduction');
  });
});

test.describe('Terms Page - Section Anchors Cross-browser', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate with anchor
    await page.goto('/terms#health-disclaimer');
    await page.waitForTimeout(1000);
    
    // Section should be visible
    const healthHeading = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    await expect(healthHeading).toBeInViewport();
    
    // Click another heading
    await page.goto('/terms');
    const introHeading = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    await introHeading.click();
    await page.waitForTimeout(300);
    
    expect(page.url()).toContain('#introduction');
  });
});

test.describe('Terms Page - Section Anchors Error Cases', () => {
  test('should handle invalid anchor gracefully', async ({ page }) => {
    // Navigate to URL with non-existent anchor
    await page.goto('/terms#non-existent-section');
    
    // Page should still load normally (no error)
    await expect(page.getByRole('heading', { name: /Terms and Conditions/i, level: 1 })).toBeVisible();
    
    // Should be at top of page (default position)
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('should handle rapid clicking of different headings', async ({ page }) => {
    await page.goto('/terms');
    
    // Rapidly click different headings
    const intro = page.getByRole('heading', { name: /Introduction/i, level: 2 });
    const account = page.getByRole('heading', { name: /Account Terms/i, level: 2 });
    const health = page.getByRole('heading', { name: /Health Disclaimer/i, level: 2 });
    
    await intro.click();
    await account.click();
    await health.click();
    
    // Should end up at last clicked section
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#health-disclaimer');
  });
});
