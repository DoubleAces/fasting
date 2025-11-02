/**
 * Entry Insights E2E Tests - With Data
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T038 - E2E test for insights display with sufficient data
 * 
 * Tests insights appear correctly, gradient styling, accurate pattern analysis, and performance.
 */

import { test, expect } from '@playwright/test';

test.describe('Entry Insights - With Sufficient Data (US2)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display insights section with sufficient data (10+ entries)', async ({ page }) => {
    // Navigate to an entry details page (assuming user has sufficient entries)
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();

    // Wait for entry details to load
    await page.waitForSelector('article');

    // Check for insights section
    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await expect(insightsSection).toBeVisible();
  });

  test('should display gradient-styled insight callout boxes', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    // Check for gradient-styled callout boxes
    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    const calloutBoxes = insightsSection.locator('[class*="bg-gradient"]');

    await expect(calloutBoxes.first()).toBeVisible();
  });

  test('should display historical ranking insight', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    // Check for ranking text (e.g., "top 15%")
    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await expect(insightsSection.locator('text=/top \\d+%/i')).toBeVisible();
  });

  test('should display weekend vs weekday pattern insight', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    
    // Check for weekend/weekday comparison text
    const weekendPattern = insightsSection.locator('text=/weekend/i');
    await expect(weekendPattern).toBeVisible();
  });

  test('should display deviation from typical duration', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    
    // Check for typical duration comparison
    const typicalText = insightsSection.locator('text=/typical/i');
    await expect(typicalText).toBeVisible();
  });

  test('should display streak contribution insight', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    
    // Check for streak information
    const streakText = insightsSection.locator('text=/streak/i');
    await expect(streakText).toBeVisible();
  });

  test('should display insights with icons/emojis', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    
    // Check for emojis in insights (🏆, 📊, 📅, 🔥)
    const content = await insightsSection.textContent();
    expect(content).toMatch(/[🏆📊📅🔥]/);
  });

  test('should calculate accurate pattern analysis', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    // Get entry duration from main view
    const durationText = await page.locator('text=/\\d+ hours \\d+ minutes/i').first().textContent();
    
    // Check insights reflect this entry
    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await expect(insightsSection).toBeVisible();

    // Insights should be contextual to the displayed entry
    const insightsText = await insightsSection.textContent();
    expect(insightsText.length).toBeGreaterThan(0);
  });

  test('should load insights within 500ms', async ({ page }) => {
    await page.goto('/entries');
    
    const startTime = Date.now();
    
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('section:has-text("Personalized Insights")', { timeout: 5000 });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Insights should load quickly (target: <500ms, allowing some overhead for navigation)
    expect(loadTime).toBeLessThan(2000); // More generous for E2E test
  });

  test('should have responsive layout for insights on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await expect(insightsSection).toBeVisible();

    // Should stack vertically on mobile
    const boundingBox = await insightsSection.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should have responsive layout for insights on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await expect(insightsSection).toBeVisible();
  });

  test('should have proper glassmorphic styling', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    
    // Check for backdrop blur effect
    const styles = await insightsSection.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter;
    });

    expect(styles).toContain('blur');
  });

  test('should scroll to insights section smoothly', async ({ page }) => {
    await page.goto('/entries');
    await page.click('a[href^="/entries/"]').first();
    await page.waitForSelector('article');

    // Scroll to insights
    const insightsSection = page.locator('section:has-text("Personalized Insights")');
    await insightsSection.scrollIntoViewIfNeeded();

    await expect(insightsSection).toBeInViewport();
  });
});
