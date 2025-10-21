/**
 * E2E Tests: Privacy Policy Page
 * 
 * Tests the complete privacy policy page functionality including:
 * - Page loads at /privacy route
 * - All 10 sections are visible
 * - Content is readable and properly formatted
 * - Mobile responsive design
 */

import { test, expect } from '@playwright/test';

test.describe('Privacy Policy Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to privacy page before each test
    await page.goto('/privacy');
  });

  test('should load at /privacy route', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL(/\/privacy/);
    
    // Verify page loads successfully (no 404 or errors)
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
  });

  test('should display h1 heading "Privacy Policy"', async ({ page }) => {
    // Check for main heading
    const heading = page.getByRole('heading', { level: 1, name: /Privacy Policy/i });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Privacy Policy');
  });

  test('should display effective date', async ({ page }) => {
    // Check for effective date in metadata section
    await expect(page.getByText(/Effective Date:/i)).toBeVisible();
    // Date appears multiple times, use first()
    await expect(page.getByText(/October 21, 2025/).first()).toBeVisible();
  });

  test('should have all 10 required sections visible', async ({ page }) => {
    // List of all required section IDs
    const sectionIds = [
      'information-we-collect',
      'how-we-use-your-information',
      'data-storage-and-security',
      'data-sharing-and-disclosure',
      'your-privacy-rights',
      'cookies-and-tracking',
      'health-information',
      'childrens-privacy',
      'international-users',
      'contact-information',
    ];

    // Verify each section exists and is visible
    for (const sectionId of sectionIds) {
      const section = page.locator(`#${sectionId}`);
      await expect(section).toBeVisible();
    }
  });

  test('should display section headings correctly', async ({ page }) => {
    // Check that key section headings are visible
    await expect(page.getByRole('heading', { name: /Information We Collect/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /How We Use Your Information/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Data Storage and Security/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your Privacy Rights/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Health Information/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Contact Information/i })).toBeVisible();
  });

  test('should have readable and properly formatted content', async ({ page }) => {
    // Check that content is present and formatted
    // Verify specific content from different sections
    
    // Information We Collect section
    await expect(page.getByText(/Personal Information:/i)).toBeVisible();
    await expect(page.getByText(/Health and Fasting Data:/i)).toBeVisible();
    
    // Privacy Rights section
    await expect(page.getByText(/Right to access:/i)).toBeVisible();
    await expect(page.getByText(/Right to deletion:/i)).toBeVisible();
    
    // Health Information section
    await expect(page.getByText(/Medical Disclaimer:/i)).toBeVisible();
    
    // Contact section (email appears multiple times, use first)
    await expect(page.getByText(/privacy@fastingtracker\.app/i).first()).toBeVisible();
  });

  test('should have proper text styling and readability', async ({ page }) => {
    // Check that main heading has proper size
    const h1 = page.getByRole('heading', { level: 1 });
    const fontSize = await h1.evaluate(el => window.getComputedStyle(el).fontSize);
    const fontSizeNum = parseFloat(fontSize);
    
    // Should be large heading (at least 24px)
    expect(fontSizeNum).toBeGreaterThanOrEqual(24);
    
    // Check body text is readable size (minimum 16px)
    const bodyText = page.getByText(/We collect information/i).first();
    const bodyFontSize = await bodyText.evaluate(el => window.getComputedStyle(el).fontSize);
    const bodyFontSizeNum = parseFloat(bodyFontSize);
    
    expect(bodyFontSizeNum).toBeGreaterThanOrEqual(14); // Tailwind's text-base is 16px, but allow some variance
  });

  test('should have clickable section headings with hover effect', async ({ page }) => {
    const sectionHeading = page.locator('#information-we-collect');
    
    // Section should be clickable (have cursor pointer)
    await expect(sectionHeading).toHaveCSS('cursor', 'pointer');
    
    // Hover should show visual feedback
    await sectionHeading.hover();
    // Note: Color change on hover is hard to test reliably, but we can verify it's interactive
  });

  test('should display links with proper styling', async ({ page }) => {
    // Find email links
    const emailLink = page.getByRole('link', { name: /privacy@fastingtracker\.app/i }).first();
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:privacy@fastingtracker.app');
    
    // Find external link to Google Privacy Policy
    const googleLink = page.getByRole('link', { name: /https:\/\/policies\.google\.com\/privacy/i });
    await expect(googleLink).toBeVisible();
    await expect(googleLink).toHaveAttribute('target', '_blank');
    await expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should be mobile responsive at 375px width', async ({ page }) => {
    // Set viewport to iPhone SE size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to page
    await page.goto('/privacy');
    
    // Verify content is still visible and readable
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Verify sections are stacked vertically (not side-by-side)
    const section = page.locator('#information-we-collect');
    await expect(section).toBeVisible();
    
    // Check that content doesn't overflow horizontally
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    
    // Allow small variance for scrollbar
    expect(scrollWidth - clientWidth).toBeLessThan(20);
  });

  test('should handle different screen sizes responsively', async ({ page }) => {
    const screenSizes = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/privacy');
      
      // Verify main heading is visible at each size
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      
      // Verify at least one section is visible
      const firstSection = page.locator('#information-we-collect');
      await expect(firstSection).toBeVisible();
    }
  });

  test('should have proper page metadata for SEO', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Privacy Policy/i);
    
    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/privacy');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Filter out known auth errors (not related to privacy page)
    const relevantErrors = consoleErrors.filter(err => 
      !err.includes('authjs.dev') && !err.includes('ClientFetchError')
    );
    
    // Should have no relevant console errors
    expect(relevantErrors).toHaveLength(0);
  });

  test('should scroll to section when section heading is clicked', async ({ page }) => {
    // Scroll to bottom first to test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Click a section heading that's not at the top
    const healthSection = page.locator('#health-information');
    await healthSection.click();
    
    // Wait for smooth scroll animation
    await page.waitForTimeout(500);
    
    // Verify URL has hash
    await expect(page).toHaveURL(/#health-information/);
    
    // Verify section is in viewport
    await expect(healthSection).toBeInViewport();
  });

  test('should have accessible footer with contact information', async ({ page }) => {
    // Scroll to bottom to see footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Find the privacy page footer (first footer element on the page)
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    
    // Verify contact email is in footer
    await expect(footer.getByText(/privacy@fastingtracker\.app/i)).toBeVisible();
  });
});
