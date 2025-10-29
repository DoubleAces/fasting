/**
 * Playwright E2E viewport utilities for Feature 022: Mobile UX
 */

/**
 * Common viewport sizes for E2E testing
 */
export const E2E_VIEWPORTS = {
  // Mobile (< 768px)
  IPHONE_SE: { width: 375, height: 667 },
  IPHONE_12: { width: 390, height: 844 },
  ANDROID_SMALL: { width: 360, height: 640 },
  
  // Tablet (≥ 768px)
  IPAD: { width: 768, height: 1024 },
  
  // Desktop (≥ 1024px)
  LAPTOP: { width: 1280, height: 720 },
  DESKTOP: { width: 1920, height: 1080 },
};

/**
 * Set viewport to specific size
 * @param {Page} page - Playwright page object
 * @param {string} device - Device name from E2E_VIEWPORTS
 */
export async function setViewport(page, device) {
  const viewport = E2E_VIEWPORTS[device];
  if (!viewport) {
    throw new Error(`Unknown device: ${device}`);
  }
  await page.setViewportSize(viewport);
}

/**
 * Verify no horizontal scrolling on page
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if no horizontal scroll
 */
export async function verifyNoHorizontalScroll(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  return scrollWidth <= clientWidth;
}

/**
 * Verify element has minimum touch target size (44px × 44px)
 * @param {Locator} locator - Playwright locator
 * @returns {Promise<{width: number, height: number, passes: boolean}>}
 */
export async function verifyTouchTarget(locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }
  
  const MIN_SIZE = 44;
  const passes = box.width >= MIN_SIZE && box.height >= MIN_SIZE;
  
  return {
    width: box.width,
    height: box.height,
    passes,
  };
}

/**
 * Count visible elements on screen (without scrolling)
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @returns {Promise<number>} Number of visible elements in viewport
 */
export async function countVisibleInViewport(page, selector) {
  return await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    const viewportHeight = window.innerHeight;
    let count = 0;
    
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      // Element is fully visible in viewport
      if (rect.top >= 0 && rect.bottom <= viewportHeight) {
        count++;
      }
    }
    
    return count;
  }, selector);
}

/**
 * Get computed style property value
 * @param {Locator} locator - Playwright locator
 * @param {string} property - CSS property name
 * @returns {Promise<string>} Computed style value
 */
export async function getComputedStyle(locator, property) {
  return await locator.evaluate((el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }, property);
}

/**
 * Verify element is hidden on mobile (display: none or visibility: hidden)
 * @param {Locator} locator - Playwright locator
 * @returns {Promise<boolean>} True if element is hidden
 */
export async function isHiddenOnMobile(locator) {
  const display = await getComputedStyle(locator, 'display');
  const visibility = await getComputedStyle(locator, 'visibility');
  return display === 'none' || visibility === 'hidden';
}

/**
 * Wait for page to be fully loaded (including fonts and images)
 * @param {Page} page - Playwright page object
 */
export async function waitForFullyLoaded(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
}
