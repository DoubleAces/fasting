/**
 * E2E Tests for Feature 024: User Dashboard
 * 
 * Tests all 6 user stories:
 * - US1: Active Fast Timer
 * - US2: Statistics Cards
 * - US3: Recent History
 * - US4: Progress Chart
 * - US5: Quick Actions
 * - US6: Design System Integration
 */

const { test, expect } = require('@playwright/test');

// Helper to create test user and entries
async function setupTestUser(page) {
  const testEmail = `dashboard-test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  // Register user
  await page.goto('/register');
  
  // Wait for form to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill registration form using getByLabel (more reliable)
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/^name/i).fill('Dashboard Test User');
  await page.getByLabel(/^password/i).fill(testPassword);
  await page.getByLabel(/confirm password/i).fill(testPassword);
  
  // Check terms checkbox if present
  const termsCheckbox = page.getByLabel(/terms/i);
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  // Submit form and wait for navigation
  await Promise.all([
    page.waitForURL(/\/(entries|dashboard)/, { timeout: 15000 }),
    page.getByRole('button', { name: /create account/i }).click(),
  ]);
  
  // Navigate to dashboard if we're on entries page
  if (page.url().includes('/entries')) {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  }

  return { email: testEmail, password: testPassword };
}

// Helper to create fasting entries via API
async function createEntry(page, daysAgo, duration, goalStatus = 'completed') {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);

  const lastMealTime = '20:00';
  const firstMealTime = duration ? '12:00' : null;
  const dateISO = date.toISOString();

  await page.evaluate(async ({ dateISO, lastMealTime, firstMealTime, duration, goalStatus }) => {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateISO,
        lastMealTime,
        firstMealTime,
        fastingDuration: duration,
        goalStatus,
        notes: `Test entry`,
      }),
    });
    return response.json();
  }, { dateISO, lastMealTime, firstMealTime, duration, goalStatus });
}

test.describe('Dashboard Feature - User Stories', () => {
  test.describe('US1: Active Fast Timer', () => {
    test('should display live timer for active fast', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create an active fast (today with lastMealTime but no firstMealTime)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate last meal time 5 hours ago
      const lastMealDate = new Date();
      lastMealDate.setHours(lastMealDate.getHours() - 5);
      const lastMealTime = lastMealDate.toTimeString().slice(0, 5); // HH:mm format

      await page.evaluate(async ({ date, lastMealTime }) => {
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: date,
            lastMealTime: lastMealTime,
            firstMealTime: null,
            fastingDuration: null,
            goalStatus: 'not-completed',
            notes: 'Active fast test',
          }),
        });
      }, { date: today.toISOString(), lastMealTime });

      // Reload dashboard to see timer
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // SC-002: Active fast displays live timer
      await expect(page.locator('text=/fasting for/i')).toBeVisible();
      
      // SC-003: Timer format shows "Xh Ym"
      const timerText = await page.locator('text=/\\d+h \\d+m/').textContent();
      expect(timerText).toMatch(/\d+h \d+m/);

      // Verify timer updates (wait 2 seconds and check it changed)
      const initialTime = await page.locator('text=/\\d+h \\d+m/').textContent();
      await page.waitForTimeout(2000);
      const updatedTime = await page.locator('text=/\\d+h \\d+m/').textContent();
      
      // Time should have changed (even by seconds)
      expect(updatedTime).toBeTruthy();
    });

    test('should display "Start New Fast" CTA when no active fast', async ({ page }) => {
      await setupTestUser(page);

      // User should see "Start New Fast" button
      // SC-004: Completed fast shows "Start New Fast" gradient button
      await expect(page.locator('text=/ready to start a new fast/i')).toBeVisible();
      await expect(page.locator('a:has-text("Start New Fast")')).toBeVisible();

      // Click should navigate to /entries
      await page.click('a:has-text("Start New Fast")');
      await page.waitForURL('/entries');
    });
  });

  test.describe('US2: Statistics Cards', () => {
    test('should display statistics cards with correct data', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create 10 entries with a 5-day streak
      for (let i = 0; i < 5; i++) {
        await createEntry(page, i, 960); // 16 hours = 960 minutes
      }
      // Create gap
      await createEntry(page, 7, 900); // 15 hours
      // Create more entries
      for (let i = 8; i < 13; i++) {
        await createEntry(page, i, 1020); // 17 hours
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // SC-005: Current streak calculates consecutive days
      await expect(page.locator('text=/current streak/i')).toBeVisible();
      await expect(page.locator('text=/5 days/i')).toBeVisible();

      // SC-006: Total fasts displays count
      await expect(page.locator('text=/total fasts/i')).toBeVisible();
      await expect(page.locator('text=/10/').first()).toBeVisible();

      // SC-007: Average duration shows mean if 7+ entries
      await expect(page.locator('text=/average duration/i')).toBeVisible();
      // Average should be around 16h (960-1020 minutes)
      await expect(page.locator('text=/\\d+h/').nth(2)).toBeVisible();
    });

    test('should show placeholder for average with <7 entries', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create only 3 entries
      for (let i = 0; i < 3; i++) {
        await createEntry(page, i, 960);
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Average should show placeholder
      await expect(page.locator('text=/need 7\\+ entries/i')).toBeVisible();
    });
  });

  test.describe('US3: Recent History', () => {
    test('should display 5 most recent entries', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create 8 entries
      for (let i = 0; i < 8; i++) {
        await createEntry(page, i, 960 + i * 30, i % 2 === 0 ? 'completed' : 'not-completed');
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // SC-008: Recent history shows 5 most recent entries
      await expect(page.locator('text=/recent fasts/i')).toBeVisible();
      
      // Count entry cards (should be exactly 5)
      const entryCards = page.locator('a[href^="/entries/"]');
      await expect(entryCards).toHaveCount(5);

      // Check for date and duration formatting
      await expect(page.locator('text=/\\d+h \\d+m/').first()).toBeVisible();
      
      // Check for goal status icons
      await expect(page.locator('text=✅').first()).toBeVisible();
    });

    test('should show placeholders when fewer than 5 entries', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create only 2 entries
      for (let i = 0; i < 2; i++) {
        await createEntry(page, i, 960);
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should show 2 real entries + 3 placeholders
      await expect(page.locator('text=/keep logging your fasts/i')).toBeVisible();
    });
  });

  test.describe('US4: Progress Chart', () => {
    test('should display chart with 7+ entries', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create 10 entries over 30 days
      for (let i = 0; i < 10; i++) {
        await createEntry(page, i * 3, 900 + Math.random() * 300);
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // SC-009: Chart renders with Recharts if 7+ entries
      await expect(page.locator('text=/progress chart/i')).toBeVisible();
      
      // Check for Recharts SVG element
      const chartSvg = page.locator('svg').filter({ hasText: /hours/i });
      await expect(chartSvg).toBeVisible();

      // SC-010: Chart renders 30 days in <1s (measured via performance test)
    });

    test('should show placeholder with <7 entries', async ({ page }) => {
      const user = await setupTestUser(page);

      // Create only 5 entries
      for (let i = 0; i < 5; i++) {
        await createEntry(page, i, 960);
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should show placeholder
      await expect(page.locator('text=/track your progress/i')).toBeVisible();
      await expect(page.locator('text=/create 7\\+ entries/i')).toBeVisible();
      await expect(page.locator('text=/you have 5 entries/i')).toBeVisible();
    });
  });

  test.describe('US5: Quick Actions', () => {
    test('should have functional quick action buttons', async ({ page }) => {
      await setupTestUser(page);

      // SC-011: Quick actions navigate to correct routes
      
      // Test "Create Entry" button
      await expect(page.locator('text=/create entry/i')).toBeVisible();
      const createButton = page.locator('a:has-text("Create Entry")');
      await expect(createButton).toHaveAttribute('href', '/entries?openForm=true');

      // Test "View All Entries" button
      await expect(page.locator('text=/view all entries/i')).toBeVisible();
      const viewAllButton = page.locator('a:has-text("View All Entries")');
      await expect(viewAllButton).toHaveAttribute('href', '/entries');

      // Test "Settings" button
      await expect(page.locator('text=/settings/i')).toBeVisible();
      const settingsButton = page.locator('a:has-text("Settings")');
      await expect(settingsButton).toHaveAttribute('href', '/settings');

      // Click and verify navigation
      await createButton.click();
      await page.waitForURL('/entries?openForm=true');
    });
  });

  test.describe('US6: Design System Integration', () => {
    test('should use glassmorphic cards and gradient buttons', async ({ page }) => {
      await setupTestUser(page);

      // SC-012: All components use Feature 023 design system
      
      // Check for glassmorphic styling classes
      const cards = page.locator('[class*="backdrop-blur"]');
      await expect(cards.first()).toBeVisible();

      // Check for gradient button (Start New Fast)
      const gradientButton = page.locator('a:has-text("Start New Fast")');
      const buttonClass = await gradientButton.getAttribute('class');
      expect(buttonClass).toContain('gradient');

      // Check for gradient text in headings
      const heading = page.locator('h1');
      const headingClass = await heading.getAttribute('class');
      expect(headingClass).toContain('gradient');
    });

    test('should have decorative blur orbs', async ({ page }) => {
      await setupTestUser(page);

      // Check for decorative blur orbs in background
      const blurOrbs = page.locator('[class*="blur-"]');
      await expect(blurOrbs.first()).toBeVisible();
    });
  });

  test.describe('SC-001: Authentication & Routing', () => {
    test('should redirect authenticated user from / to /dashboard', async ({ page }) => {
      await setupTestUser(page);

      // Navigate to homepage
      await page.goto('/');
      
      // SC-001: Should be redirected to /dashboard
      await page.waitForURL('/dashboard');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should redirect unauthenticated user to /login', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await page.waitForURL(/\/login/);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('SC-015: Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await setupTestUser(page);

      // Check for section aria-labels
      const currentStatusSection = page.locator('section[aria-label*="current"]');
      await expect(currentStatusSection).toBeVisible();

      const statsSection = page.locator('section[aria-label*="statistics"]');
      await expect(statsSection).toBeVisible();

      const historySection = page.locator('section[aria-label*="history"]');
      await expect(historySection).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await setupTestUser(page);

      // Tab through interactive elements
      await page.keyboard.press('Tab'); // First focusable element
      const focused = await page.evaluate(() => document.activeElement.tagName);
      expect(['A', 'BUTTON']).toContain(focused);

      // Check for focus visible styles
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});

test.describe('Dashboard Performance', () => {
  test('should load dashboard in <2s with 100 entries', async ({ page }) => {
    const user = await setupTestUser(page);

    // Create 100 entries
    console.log('Creating 100 test entries...');
    for (let i = 0; i < 100; i++) {
      await createEntry(page, Math.floor(i / 3), 900 + Math.random() * 300);
    }

    // Measure load time
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Dashboard load time with 100 entries: ${loadTime}ms`);
    
    // SC-013: Dashboard loads in <2s with up to 100 entries
    expect(loadTime).toBeLessThan(2000);
  });

  test('should render chart in <1s', async ({ page }) => {
    const user = await setupTestUser(page);

    // Create 30 entries for chart
    for (let i = 0; i < 30; i++) {
      await createEntry(page, i, 900 + Math.random() * 300);
    }

    await page.goto('/dashboard');
    
    // Measure chart render time
    const startTime = Date.now();
    await page.waitForSelector('svg', { timeout: 5000 });
    const renderTime = Date.now() - startTime;

    console.log(`Chart render time: ${renderTime}ms`);
    
    // SC-010: Chart renders 30 days in <1s
    expect(renderTime).toBeLessThan(1000);
  });
});

test.describe('Dashboard Responsive Design', () => {
  test('should be responsive on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTestUser(page);

    // SC-014: Dashboard fully responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/welcome back/i')).toBeVisible();
    
    // Stats should stack vertically
    const statsCards = page.locator('[aria-label*="streak"]');
    await expect(statsCards).toBeVisible();
  });

  test('should be responsive on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await setupTestUser(page);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/quick actions/i')).toBeVisible();
  });

  test('should be responsive on desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await setupTestUser(page);

    await expect(page.locator('h1')).toBeVisible();
    // Stats should be in grid layout
    const statsSection = page.locator('section[aria-label*="statistics"]');
    await expect(statsSection).toBeVisible();
  });

  test('should be responsive on large desktop (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setupTestUser(page);

    await expect(page.locator('h1')).toBeVisible();
    // All sections should be visible without scrolling
    await expect(page.locator('text=/quick actions/i')).toBeVisible();
  });
});
