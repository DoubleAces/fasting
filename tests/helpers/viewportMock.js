/**
 * Test helper for mocking mobile viewports
 * Used by component tests to simulate responsive behavior
 */

/**
 * Mock window.innerWidth and window.innerHeight
 * @param {number} width - Viewport width in pixels
 * @param {number} height - Viewport height in pixels
 */
export function mockViewport(width, height) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Mock window.matchMedia for responsive queries
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @param {boolean} matches - Whether the query should match
 */
export function mockMatchMedia(query, matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((q) => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Common viewport sizes for testing
 */
export const VIEWPORTS = {
  // Mobile
  IPHONE_SE: { width: 375, height: 667 },
  IPHONE_12: { width: 390, height: 844 },
  IPHONE_12_PRO_MAX: { width: 428, height: 926 },
  ANDROID_SMALL: { width: 360, height: 640 },
  ANDROID_MEDIUM: { width: 412, height: 915 },
  
  // Tablet
  IPAD: { width: 768, height: 1024 },
  IPAD_PRO: { width: 1024, height: 1366 },
  
  // Desktop
  LAPTOP: { width: 1280, height: 720 },
  DESKTOP: { width: 1920, height: 1080 },
};

/**
 * Setup mobile viewport for tests
 * @param {string} device - Device name from VIEWPORTS
 */
export function setupMobileViewport(device = 'IPHONE_SE') {
  const { width, height } = VIEWPORTS[device];
  mockViewport(width, height);
  mockMatchMedia('(max-width: 768px)', width < 768);
}

/**
 * Setup desktop viewport for tests
 * @param {string} device - Device name from VIEWPORTS
 */
export function setupDesktopViewport(device = 'LAPTOP') {
  const { width, height } = VIEWPORTS[device];
  mockViewport(width, height);
  mockMatchMedia('(min-width: 768px)', width >= 768);
}

/**
 * Reset viewport mocks
 */
export function resetViewport() {
  delete window.innerWidth;
  delete window.innerHeight;
  delete window.matchMedia;
}
