/**
 * Visual regression testing utilities for Feature 022: Mobile UX
 * Captures and compares screenshots across viewports
 */

import { E2E_VIEWPORTS } from './viewport.js';

/**
 * Capture baseline screenshot for mobile viewport
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
export async function captureBaselineMobile(page, name, options = {}) {
  await page.setViewportSize(E2E_VIEWPORTS.IPHONE_SE);
  await page.waitForLoadState('networkidle');
  
  return await page.screenshot({
    path: `tests/e2e/screenshots/baseline/${name}-mobile.png`,
    fullPage: options.fullPage ?? false,
    ...options,
  });
}

/**
 * Capture baseline screenshot for desktop viewport
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
export async function captureBaselineDesktop(page, name, options = {}) {
  await page.setViewportSize(E2E_VIEWPORTS.LAPTOP);
  await page.waitForLoadState('networkidle');
  
  return await page.screenshot({
    path: `tests/e2e/screenshots/baseline/${name}-desktop.png`,
    fullPage: options.fullPage ?? false,
    ...options,
  });
}

/**
 * Capture screenshots for all viewport sizes
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
export async function captureAllViewports(page, name, options = {}) {
  const screenshots = {};
  
  for (const [device, viewport] of Object.entries(E2E_VIEWPORTS)) {
    await page.setViewportSize(viewport);
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({
      path: `tests/e2e/screenshots/${name}-${device.toLowerCase()}.png`,
      fullPage: options.fullPage ?? false,
      ...options,
    });
    
    screenshots[device] = screenshot;
  }
  
  return screenshots;
}

/**
 * Compare element screenshots between mobile and desktop
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {string} name - Screenshot name
 */
export async function compareResponsiveElement(page, selector, name) {
  const locator = page.locator(selector);
  
  // Mobile screenshot
  await page.setViewportSize(E2E_VIEWPORTS.IPHONE_SE);
  await page.waitForLoadState('networkidle');
  const mobileScreenshot = await locator.screenshot({
    path: `tests/e2e/screenshots/compare/${name}-mobile.png`,
  });
  
  // Desktop screenshot
  await page.setViewportSize(E2E_VIEWPORTS.LAPTOP);
  await page.waitForLoadState('networkidle');
  const desktopScreenshot = await locator.screenshot({
    path: `tests/e2e/screenshots/compare/${name}-desktop.png`,
  });
  
  return {
    mobile: mobileScreenshot,
    desktop: desktopScreenshot,
  };
}

/**
 * Capture screenshot with element highlight (for debugging)
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {string} name - Screenshot name
 */
export async function captureWithHighlight(page, selector, name) {
  // Highlight element with red border
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.style.outline = '3px solid red';
      element.style.outlineOffset = '2px';
    }
  }, selector);
  
  await page.screenshot({
    path: `tests/e2e/screenshots/debug/${name}-highlighted.png`,
    fullPage: true,
  });
  
  // Remove highlight
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }
  }, selector);
}

/**
 * Create visual regression test suite for a page
 * @param {Test} test - Playwright test object
 * @param {string} pagePath - Page path (e.g., '/entries')
 * @param {string} pageName - Page name for screenshots
 */
export function createVisualRegressionSuite(test, pagePath, pageName) {
  test(`${pageName} - Mobile viewport snapshot`, async ({ page }) => {
    await page.goto(pagePath);
    await page.setViewportSize(E2E_VIEWPORTS.IPHONE_SE);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot(`${pageName}-mobile.png`, {
      maxDiffPixels: 100, // Allow minor rendering differences
    });
  });
  
  test(`${pageName} - Desktop viewport snapshot`, async ({ page }) => {
    await page.goto(pagePath);
    await page.setViewportSize(E2E_VIEWPORTS.LAPTOP);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot(`${pageName}-desktop.png`, {
      maxDiffPixels: 100,
    });
  });
}
