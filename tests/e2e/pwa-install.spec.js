/**
 * E2E tests for PWA installation flow
 * Tests the complete install experience including beforeinstallprompt
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Installation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Enable service workers in the browser context
    await context.grantPermissions(['notifications']);
  });

  test('should display install prompt after engagement criteria met', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();

    // Verify service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    expect(swRegistered).toBe(true);

    // Simulate page views by navigating to different pages
    await page.goto('/features');
    await page.waitForTimeout(1000);
    
    await page.goto('/faq');
    await page.waitForTimeout(1000);

    // Go back to homepage
    await page.goto('/');

    // Wait up to 35 seconds for install prompt to appear
    // (30s engagement + 5s buffer)
    const installPrompt = page.locator('text=Install Fasting Tracker');
    await expect(installPrompt).toBeVisible({ timeout: 35000 });

    // Verify prompt contains expected text
    await expect(page.locator('text=Install our app for quick access')).toBeVisible();

    // Check for Install and Not Now buttons
    const installButton = page.locator('button:has-text("Install")');
    const dismissButton = page.locator('button:has-text("Not Now")');

    await expect(installButton).toBeVisible();
    await expect(dismissButton).toBeVisible();
  });

  test('should dismiss install prompt when user clicks Not Now', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to trigger install prompt quickly
    await page.goto('/features');
    await page.goto('/faq');
    await page.goto('/');

    // Wait for prompt
    const installPrompt = page.locator('text=Install Fasting Tracker');
    await expect(installPrompt).toBeVisible({ timeout: 35000 });

    // Click Not Now
    await page.click('button:has-text("Not Now")');

    // Verify prompt is dismissed
    await expect(installPrompt).not.toBeVisible();

    // Verify sessionStorage flag is set
    const isDismissed = await page.evaluate(() => {
      return sessionStorage.getItem('installPromptDismissed');
    });

    expect(isDismissed).toBe('true');
  });

  test('should not show install prompt if already dismissed in session', async ({ page }) => {
    await page.goto('/');

    // Set dismissed flag
    await page.evaluate(() => {
      sessionStorage.setItem('installPromptDismissed', 'true');
    });

    // Navigate to meet criteria
    await page.goto('/features');
    await page.goto('/faq');
    await page.goto('/');

    // Wait the full engagement time
    await page.waitForTimeout(31000);

    // Prompt should not appear
    const installPrompt = page.locator('text=Install Fasting Tracker');
    await expect(installPrompt).not.toBeVisible();
  });

  test('should show manifest.json with correct properties', async ({ page, request }) => {
    // Fetch manifest
    const response = await request.get('/manifest.json');
    expect(response.ok()).toBe(true);

    const manifest = await response.json();

    // Verify critical manifest properties
    expect(manifest.name).toBe('Fasting Tracker');
    expect(manifest.short_name).toBe('Fasting');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#9333EA');
    expect(manifest.background_color).toBe('#ffffff');

    // Verify icons
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Check for both any and maskable icons
    const anyIcon = manifest.icons.find(icon => icon.purpose === 'any');
    const maskableIcon = manifest.icons.find(icon => icon.purpose === 'maskable');

    expect(anyIcon).toBeDefined();
    expect(maskableIcon).toBeDefined();
  });

  test('should load icons successfully', async ({ page, request }) => {
    // Test regular icon
    const icon192 = await request.get('/icons/icon-192x192.png');
    expect(icon192.ok()).toBe(true);
    expect(icon192.headers()['content-type']).toContain('image/png');

    // Test larger icon
    const icon512 = await request.get('/icons/icon-512x512.png');
    expect(icon512.ok()).toBe(true);

    // Test maskable icons
    const maskable = await request.get('/icons/icon-maskable-192x192.png');
    expect(maskable.ok()).toBe(true);
  });

  test('should have valid service worker', async ({ page }) => {
    await page.goto('/');

    // Check if service worker exists and is active
    const swStatus = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return { supported: false };
      }

      const registration = await navigator.serviceWorker.ready;
      return {
        supported: true,
        active: !!registration.active,
        scope: registration.scope,
        state: registration.active?.state,
      };
    });

    expect(swStatus.supported).toBe(true);
    expect(swStatus.active).toBe(true);
    expect(swStatus.state).toBe('activated');
  });

  test('should track page views correctly', async ({ page }) => {
    await page.goto('/');

    // Check initial page view count
    let pageViews = await page.evaluate(() => {
      return parseInt(sessionStorage.getItem('pageViews') || '0');
    });

    expect(pageViews).toBeGreaterThanOrEqual(1);

    // Navigate to another page
    await page.goto('/features');
    
    pageViews = await page.evaluate(() => {
      return parseInt(sessionStorage.getItem('pageViews') || '0');
    });

    expect(pageViews).toBeGreaterThanOrEqual(2);

    // Navigate again
    await page.goto('/faq');
    
    pageViews = await page.evaluate(() => {
      return parseInt(sessionStorage.getItem('pageViews') || '0');
    });

    expect(pageViews).toBeGreaterThanOrEqual(3);
  });
});
