/**
 * FAQ Page E2E Tests
 * Tests for search functionality, expand/collapse, navigation, and performance
 */

import { test, expect } from '@playwright/test';

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
  });

  test.describe('Page Loading and SEO', () => {
    test('should load FAQ page with correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/FAQ.*Fasting Tracker/);
    });

    test('should have proper heading structure', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toContainText('Frequently Asked');
      await expect(h1).toContainText('Questions');
    });

    test('should load in under 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/faq');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
  });

  test.describe('FAQ Content', () => {
    test('should display multiple FAQ categories', async ({ page }) => {
      const categories = page.locator('h2');
      const count = await categories.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should display FAQ questions', async ({ page }) => {
      const questions = page.locator('button').filter({ hasText: '?' });
      const count = await questions.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should have Getting Started category', async ({ page }) => {
      await expect(page.locator('h2', { hasText: 'Getting Started' })).toBeVisible();
    });

    test('should have Account & Security category', async ({ page }) => {
      await expect(page.locator('h2', { hasText: 'Account & Security' })).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should have search input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should filter questions based on search query', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      // Type search query
      await searchInput.fill('fasting');
      
      // Wait a bit for filtering
      await page.waitForTimeout(300);
      
      // Should show questions with "fasting" in them
      const questionText = page.locator('text=/fasting/i').first();
      await expect(questionText).toBeVisible();
    });

    test('should show result count', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      await searchInput.fill('password');
      await page.waitForTimeout(300);
      
      const resultCount = page.locator('text=/Found \\d+ question/');
      await expect(resultCount).toBeVisible();
    });

    test('should show no results message for invalid search', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      await searchInput.fill('xyznonexistentquery123');
      await page.waitForTimeout(300);
      
      await expect(page.locator('text=No questions found')).toBeVisible();
    });

    test('should have clear search button in no results state', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      await searchInput.fill('nonexistent');
      await page.waitForTimeout(300);
      
      const clearButton = page.locator('button', { hasText: 'Clear Search' });
      await expect(clearButton).toBeVisible();
    });

    test('should clear search and show all questions', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      // Search for specific term
      await searchInput.fill('password');
      await page.waitForTimeout(300);
      
      // Clear search (using X button in input)
      const clearIcon = searchInput.locator('..').locator('button[aria-label="Clear search"]');
      if (await clearIcon.isVisible()) {
        await clearIcon.click();
      } else {
        await searchInput.fill('');
      }
      
      await page.waitForTimeout(300);
      
      // Should show multiple categories again
      const categories = page.locator('h2');
      const count = await categories.count();
      expect(count).toBeGreaterThan(1);
    });

    test('should filter in real-time (< 500ms response)', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      const startTime = Date.now();
      await searchInput.fill('account');
      
      // Wait for filtering to complete
      await page.waitForTimeout(100);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
    });

    test('should be case-insensitive', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      await searchInput.fill('FASTING');
      await page.waitForTimeout(300);
      
      const results = page.locator('button').filter({ hasText: /fasting/i });
      const count = await results.count();
      
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Expand/Collapse Functionality', () => {
    test('should expand FAQ when clicked', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      
      await firstQuestion.click();
      
      // Answer should be visible
      await page.waitForTimeout(300); // Wait for animation
      const answer = firstQuestion.locator('..').locator('p').first();
      await expect(answer).toBeVisible();
    });

    test('should collapse FAQ when clicked again', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      
      // Expand
      await firstQuestion.click();
      await page.waitForTimeout(300);
      
      // Collapse
      await firstQuestion.click();
      await page.waitForTimeout(300);
      
      // Answer should not be visible
      const answer = firstQuestion.locator('..').locator('p').first();
      await expect(answer).not.toBeVisible();
    });

    test('should rotate chevron icon when expanded', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      const chevron = firstQuestion.locator('svg');
      
      // Check initial state
      const initialClass = await chevron.getAttribute('class');
      
      // Click to expand
      await firstQuestion.click();
      await page.waitForTimeout(300);
      
      // Check rotated state
      const expandedClass = await chevron.getAttribute('class');
      expect(expandedClass).toContain('rotate-180');
    });

    test('should animate smoothly', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      
      await firstQuestion.click();
      
      // Should have transition classes
      const answer = firstQuestion.locator('..').locator('[id^="faq-answer-"]');
      const classes = await answer.getAttribute('class');
      
      expect(classes).toContain('transition');
      expect(classes).toContain('duration');
    });
  });

  test.describe('Call-to-Action', () => {
    test('should display CTA section', async ({ page }) => {
      const cta = page.locator('text=Still have questions?');
      await expect(cta).toBeVisible();
    });

    test('should have Get Started button', async ({ page }) => {
      const ctaButton = page.locator('a', { hasText: 'Get Started Free' });
      await expect(ctaButton).toBeVisible();
    });

    test('should link to registration page', async ({ page }) => {
      const ctaButton = page.locator('a', { hasText: 'Get Started Free' });
      await expect(ctaButton).toHaveAttribute('href', '/register');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      const h2 = page.locator('h2');
      const h2Count = await h2.count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab to search input
      await page.keyboard.press('Tab');
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeFocused();
      
      // Should be able to type
      await page.keyboard.type('test');
      await expect(searchInput).toHaveValue('test');
    });

    test('should have aria-expanded on FAQ buttons', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      
      // Should have aria-expanded attribute
      await expect(firstQuestion).toHaveAttribute('aria-expanded');
    });

    test('should support Enter key to expand FAQ', async ({ page }) => {
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      
      await firstQuestion.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      const ariaExpanded = await firstQuestion.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('true');
    });

    test('should have focus indicators', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.focus();
      
      // Focus should be visible (focus-visible CSS)
      const focused = await searchInput.evaluate((el) => {
        return window.getComputedStyle(el).outlineWidth !== '0px' ||
               el.matches(':focus-visible');
      });
      
      expect(focused).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/faq');
      
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
      
      const firstQuestion = page.locator('button').filter({ hasText: '?' }).first();
      await expect(firstQuestion).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/faq');
      
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/faq');
      
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have navbar', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should have footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should navigate to other pages from navbar', async ({ page }) => {
      const homeLink = page.locator('nav a', { hasText: 'Home' });
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
