/**
 * E2E Tests: Homepage
 * 
 * Test coverage:
 * - Homepage loads successfully
 * - Navigation menu works
 * - Hero section and CTAs
 * - Features section
 * - Responsive design (mobile/desktop)
 * - Link navigation
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage - Public Marketing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Fasting Tracker/i);
      
      // Check main content is visible
      const hero = page.locator('section').first();
      await expect(hero).toBeVisible();
    });

    test('should display navigation menu', async ({ page }) => {
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      // Check navigation links
      await expect(navbar.getByRole('link', { name: /home/i })).toBeVisible();
      await expect(navbar.getByRole('link', { name: /features/i })).toBeVisible();
      await expect(navbar.getByRole('link', { name: /faq/i })).toBeVisible();
    });

    test('should display logo', async ({ page }) => {
      const logo = page.getByRole('img', { name: /fasting tracker/i });
      await expect(logo).toBeVisible();
    });

    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      
      // Check copyright notice
      await expect(footer).toContainText(/© 2025/i);
    });
  });

  test.describe('Hero Section', () => {
    test('should display hero headline', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(/fasting journey/i);
    });

    test('should display hero description', async ({ page }) => {
      await expect(page.getByText(/track your fasting windows/i)).toBeVisible();
    });

    test('should have Get Started CTA button', async ({ page }) => {
      const getStartedBtn = page.getByRole('link', { name: /get started free/i });
      await expect(getStartedBtn).toBeVisible();
      await expect(getStartedBtn).toHaveAttribute('href', '/signup');
    });

    test('should have Learn More CTA button', async ({ page }) => {
      const learnMoreBtn = page.getByRole('link', { name: /learn more/i });
      await expect(learnMoreBtn).toBeVisible();
      await expect(learnMoreBtn).toHaveAttribute('href', '/features');
    });

    test('should navigate to signup page when Get Started is clicked', async ({ page }) => {
      const getStartedBtn = page.getByRole('link', { name: /get started free/i });
      
      // Click and check navigation
      await getStartedBtn.click();
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should navigate to features page when Learn More is clicked', async ({ page }) => {
      const learnMoreBtn = page.getByRole('link', { name: /learn more/i });
      
      // Click and check navigation
      await learnMoreBtn.click();
      await expect(page).toHaveURL(/\/features/);
    });
  });

  test.describe('Features Section', () => {
    test('should display features section heading', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /everything you need to succeed/i });
      await expect(heading).toBeVisible();
    });

    test('should display features subheading', async ({ page }) => {
      await expect(page.getByText(/powerful features designed to help you/i)).toBeVisible();
    });

    test('should display all 6 feature cards', async ({ page }) => {
      const featureCards = page.locator('article');
      await expect(featureCards).toHaveCount(6);
      
      // Check all cards are visible
      for (let i = 0; i < 6; i++) {
        await expect(featureCards.nth(i)).toBeVisible();
      }
    });

    test('should display Timer Tracking feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Timer Tracking' })).toBeVisible();
      await expect(page.getByText(/start and stop your fasting timer/i)).toBeVisible();
    });

    test('should display Progress History feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Progress History' })).toBeVisible();
      await expect(page.getByText(/view your complete fasting history/i)).toBeVisible();
    });

    test('should display Custom Goals feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Custom Goals' })).toBeVisible();
      await expect(page.getByText(/set personalized fasting goals/i)).toBeVisible();
    });

    test('should display Ratings & Notes feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Ratings & Notes' })).toBeVisible();
    });

    test('should display User Preferences feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();
    });

    test('should display Secure & Private feature', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Secure & Private' })).toBeVisible();
    });
  });

  test.describe('Navigation Menu Links', () => {
    test('should navigate to features page from nav menu', async ({ page }) => {
      await page.getByRole('link', { name: /^features$/i }).click();
      await expect(page).toHaveURL(/\/features/);
    });

    test('should navigate to FAQ page from nav menu', async ({ page }) => {
      await page.getByRole('link', { name: /^faq$/i }).click();
      await expect(page).toHaveURL(/\/faq/);
    });

    test('should show login link in navigation', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /log in/i });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('should show signup link in navigation', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: /sign up/i });
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  test.describe('Responsive Design - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display mobile menu toggle button', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /menu/i });
      await expect(menuButton).toBeVisible();
    });

    test('should open mobile menu when toggle clicked', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /menu/i });
      await menuButton.click();
      
      // Navigation links should be visible after clicking
      const homeLink = page.getByRole('link', { name: /^home$/i });
      await expect(homeLink).toBeVisible();
    });

    test('should display hero section on mobile', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();
    });

    test('should display features in single column on mobile', async ({ page }) => {
      const featureCards = page.locator('article');
      await expect(featureCards.first()).toBeVisible();
      
      // Features should stack vertically (not in a row)
      const firstCard = featureCards.first();
      const secondCard = featureCards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      // Second card should be below first card (higher y position)
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    });
  });

  test.describe('Responsive Design - Desktop', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should display full navigation menu without toggle', async ({ page }) => {
      // Menu button should not be visible on desktop
      const menuButton = page.getByRole('button', { name: /menu/i });
      await expect(menuButton).not.toBeVisible();
      
      // All navigation links should be visible
      await expect(page.getByRole('link', { name: /^home$/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /^features$/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /^faq$/i })).toBeVisible();
    });

    test('should display features in grid layout on desktop', async ({ page }) => {
      const featureCards = page.locator('article');
      
      // Get positions of first few cards
      const firstBox = await featureCards.first().boundingBox();
      const secondBox = await featureCards.nth(1).boundingBox();
      
      // On desktop, cards should be in a row (similar y position)
      expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
    });

    test('should have larger hero text on desktop', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      const fontSize = await h1.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // Font size should be reasonably large on desktop
      const fontSizeValue = parseFloat(fontSize);
      expect(fontSizeValue).toBeGreaterThan(30); // At least 30px
    });
  });

  test.describe('SEO and Metadata', () => {
    test('should have proper page title', async ({ page }) => {
      await expect(page).toHaveTitle(/Fasting Tracker.*Track Your Intermittent Fasting Journey/i);
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /track your fasting windows/i);
    });

    test('should have Open Graph metadata', async ({ page }) => {
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogType = page.locator('meta[property="og:type"]');
      
      await expect(ogTitle).toHaveAttribute('content', /.+/);
      await expect(ogDescription).toHaveAttribute('content', /.+/);
      await expect(ogType).toHaveAttribute('content', 'website');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Should have h2 for features section
      const h2 = page.locator('h2');
      await expect(h2).toHaveCount(1);
      
      // Should have h3 for each feature (6 total)
      const h3Count = await page.locator('h3').count();
      expect(h3Count).toBe(6);
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible name for logo', async ({ page }) => {
      const logo = page.locator('img').first();
      const alt = await logo.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt.length).toBeGreaterThan(0);
    });

    test('should have accessible navigation landmarks', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toHaveCount(1);
    });

    test('should have accessible main content area', async ({ page }) => {
      const main = page.locator('main');
      await expect(main).toHaveCount(1);
    });

    test('should have accessible footer landmark', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveCount(1);
    });

    test('should have accessible buttons with proper labels', async ({ page }) => {
      const getStarted = page.getByRole('link', { name: /get started free/i });
      await expect(getStarted).toHaveAccessibleName();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Focus first interactive element
      await page.keyboard.press('Tab');
      
      // Check if an element is focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Page Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      
      // Should have no console errors
      expect(errors).toHaveLength(0);
    });
  });
});
