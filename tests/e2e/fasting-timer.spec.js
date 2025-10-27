/**
 * E2E Tests for Fasting Timer Feature
 * Tests timer display, updates, persistence, and milestone detection
 */

import { test, expect } from '@playwright/test';

// Helper to create a test user and login
async function loginAsTestUser(page) {
  // Assuming test user exists or create one
  await page.goto('/login');
  await page.fill('input[type="email"]', 'timer-test@example.com');
  await page.fill('input[type="password"]', 'Test123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/entries');
}

// Helper to create an entry with lastMealTime
async function createEntryWithLastMeal(page, lastMealTime) {
  await page.click('text=Create New Entry');
  
  // Fill in date (today)
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[name="date"]', today);
  
  // Fill in last meal time
  await page.fill('input[name="lastMealTime"]', lastMealTime);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for form to close
  await page.waitForSelector('text=Create New Entry', { state: 'visible' });
}

test.describe('Fasting Timer - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('T029: Timer appears when entry with lastMealTime is created', async ({ page }) => {
    // Calculate a lastMealTime that's 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const lastMealTime = `${String(twoHoursAgo.getHours()).padStart(2, '0')}:${String(twoHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    // Create entry with lastMealTime
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify timer card appears
    await expect(page.locator('text=Fasting for')).toBeVisible();
    
    // Verify time display shows approximately 2 hours
    await expect(page.locator('text=/2.*hours?/i')).toBeVisible();
    
    // Verify timer has semantic time element
    const timeElement = page.locator('time[datetime]');
    await expect(timeElement).toBeVisible();
    
    // Verify datetime attribute is present
    const datetimeAttr = await timeElement.getAttribute('datetime');
    expect(datetimeAttr).toMatch(/PT\d+H\d+M/); // ISO 8601 duration format
  });

  test('T030: Timer updates after 60 seconds', async ({ page }) => {
    // Set last meal time to exactly 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastMealTime = `${String(oneHourAgo.getHours()).padStart(2, '0')}:${String(oneHourAgo.getMinutes()).padStart(2, '0')}`;
    
    // Create entry
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Get initial minute display
    const initialMinutes = await page.locator('time[datetime] span:has-text("minute")').first().textContent();
    
    // Wait 61 seconds (60s interval + 1s buffer)
    await page.waitForTimeout(61000);
    
    // Get updated minute display
    const updatedMinutes = await page.locator('time[datetime] span:has-text("minute")').first().textContent();
    
    // Minutes should have increased by 1
    expect(updatedMinutes).not.toBe(initialMinutes);
  });

  test('T031: Timer shows correct elapsed time after page refresh', async ({ page }) => {
    // Create entry with lastMealTime 3 hours ago
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const lastMealTime = `${String(threeHoursAgo.getHours()).padStart(2, '0')}:${String(threeHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify initial display shows ~3 hours
    await expect(page.locator('text=/3.*hours?/i')).toBeVisible();
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify timer still shows ~3 hours (persistence)
    await expect(page.locator('text=Fasting for')).toBeVisible();
    await expect(page.locator('text=/3.*hours?/i')).toBeVisible();
    
    // Verify time element still has proper datetime attribute
    const timeElement = page.locator('time[datetime]');
    await expect(timeElement).toBeVisible();
    const datetimeAttr = await timeElement.getAttribute('datetime');
    expect(datetimeAttr).toMatch(/PT3H\d+M/);
  });

  test('T032: Milestone badge appears when 12-hour mark is reached', async ({ page }) => {
    // Create entry with lastMealTime exactly 12 hours ago
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const lastMealTime = `${String(twelveHoursAgo.getHours()).padStart(2, '0')}:${String(twelveHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify timer displays
    await expect(page.locator('text=Fasting for')).toBeVisible();
    
    // Verify 12 hours is displayed
    await expect(page.locator('text=/12.*hours?/i')).toBeVisible();
    
    // Verify milestone badge appears
    await expect(page.locator('text=12-Hour Fast')).toBeVisible();
    
    // Verify badge has proper styling (gradient background)
    const badge = page.locator('text=12-Hour Fast').locator('..');
    await expect(badge).toHaveClass(/bg-gradient/);
    await expect(badge).toHaveClass(/rounded-full/);
    
    // Verify emoji is present
    await expect(page.locator('text=🎉')).toBeVisible();
  });

  test('Timer stops and shows "Fast Completed" when firstMealTime is added', async ({ page }) => {
    // Create entry with lastMealTime 16 hours ago
    const sixteenHoursAgo = new Date(Date.now() - 16 * 60 * 60 * 1000);
    const lastMealTime = `${String(sixteenHoursAgo.getHours()).padStart(2, '0')}:${String(sixteenHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify timer is active
    await expect(page.locator('text=Fasting for')).toBeVisible();
    await expect(page.locator('text=16-Hour Fast')).toBeVisible();
    
    // Edit entry to add firstMealTime (breaking the fast)
    await page.click('button:has-text("Edit")');
    
    const now = new Date();
    const firstMealTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await page.fill('input[name="firstMealTime"]', firstMealTime);
    
    await page.click('button[type="submit"]');
    
    // Wait for form to close
    await page.waitForSelector('text=Edit Entry', { state: 'hidden' });
    
    // Verify timer shows "Fast Completed"
    await expect(page.locator('text=Fast Completed')).toBeVisible();
    
    // Verify "Fasting for" is no longer visible
    await expect(page.locator('text=Fasting for')).not.toBeVisible();
    
    // Verify milestone badge still shows
    await expect(page.locator('text=16-Hour Fast')).toBeVisible();
  });

  test('Timer disappears when today\'s entry is deleted', async ({ page }) => {
    // Create entry with lastMealTime
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const lastMealTime = `${String(twoHoursAgo.getHours()).padStart(2, '0')}:${String(twoHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify timer appears
    await expect(page.locator('text=Fasting for')).toBeVisible();
    
    // Delete the entry
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify timer no longer appears
    await expect(page.locator('text=Fasting for')).not.toBeVisible();
    await expect(page.locator('time[datetime]')).not.toBeVisible();
  });

  test('Timer handles overnight fasts correctly', async ({ page }) => {
    // Create entry with lastMealTime at 22:00 (10 PM)
    const lastMealTime = '22:00';
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Current time should be after midnight for this test to be meaningful
    // Assuming test runs during daytime, this will show the overnight calculation
    const now = new Date();
    const lastMeal = new Date();
    lastMeal.setHours(22, 0, 0, 0);
    
    // If current time is before 22:00, lastMeal was yesterday
    if (now.getHours() < 22) {
      lastMeal.setDate(lastMeal.getDate() - 1);
    }
    
    const expectedHours = Math.floor((now - lastMeal) / (1000 * 60 * 60));
    
    // Verify timer appears
    await expect(page.locator('text=Fasting for')).toBeVisible();
    
    // Verify hours display matches calculation (within 1 hour tolerance)
    const hoursText = await page.locator('time[datetime]').textContent();
    expect(hoursText).toMatch(new RegExp(`${expectedHours}|${expectedHours - 1}|${expectedHours + 1}`, 'i'));
  });

  test('Multiple milestone badges appear for longer fasts', async ({ page }) => {
    // Create entry with lastMealTime 25 hours ago (should show 24-hour milestone)
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const lastMealTime = `${String(twentyFiveHoursAgo.getHours()).padStart(2, '0')}:${String(twentyFiveHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify timer displays
    await expect(page.locator('text=Fasting for')).toBeVisible();
    
    // Verify 1 day is displayed
    await expect(page.locator('text=/1.*day/i')).toBeVisible();
    
    // Verify highest milestone badge (24-Hour Fast)
    await expect(page.locator('text=24-Hour Fast')).toBeVisible();
    
    // Note: detectMilestone returns the HIGHEST milestone reached,
    // so only one badge should show at a time
    const badges = await page.locator('.rounded-full:has-text("Fast")').count();
    expect(badges).toBe(1); // Only one milestone badge
  });

  test('Timer card has proper accessibility attributes', async ({ page }) => {
    // Create entry
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const lastMealTime = `${String(twoHoursAgo.getHours()).padStart(2, '0')}:${String(twoHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Verify semantic time element
    const timeElement = page.locator('time[datetime][role="time"]');
    await expect(timeElement).toBeVisible();
    
    // Verify card structure is accessible
    const timerCard = page.locator('.bg-white:has-text("Fasting for")');
    await expect(timerCard).toBeVisible();
    
    // Verify ARIA attributes or semantic HTML
    const heading = page.locator('h2:has-text("Fasting for")');
    await expect(heading).toBeVisible();
  });

  test('Page load: Timer appears for active fast on page load', async ({ page }) => {
    // Create entry with lastMealTime 5 hours ago
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const lastMealTime = `${String(fiveHoursAgo.getHours()).padStart(2, '0')}:${String(fiveHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    await createEntryWithLastMeal(page, lastMealTime);
    
    // Reload the page to test page load detection
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify timer appears on page load
    await expect(page.locator('text=Fasting for')).toBeVisible();
    await expect(page.locator('text=/5.*hours?/i')).toBeVisible();
  });

  test('Page load: Timer shows completed state for fast with firstMealTime', async ({ page }) => {
    // Create entry with both meal times
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const lastMealTime = `${String(eightHoursAgo.getHours()).padStart(2, '0')}:${String(eightHoursAgo.getMinutes()).padStart(2, '0')}`;
    
    // Create entry with lastMealTime
    await page.click('text=Create New Entry');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="date"]', today);
    await page.fill('input[name="lastMealTime"]', lastMealTime);
    
    // Add firstMealTime (breaking the fast)
    const now = new Date();
    const firstMealTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await page.fill('input[name="firstMealTime"]', firstMealTime);
    
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Create New Entry', { state: 'visible' });
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify completed fast appears on page load
    await expect(page.locator('text=Fast Completed')).toBeVisible();
    await expect(page.locator('text=/8.*hours?/i')).toBeVisible();
  });

  test('Page load: No timer when no entry exists for today', async ({ page }) => {
    // Don't create any entries, just load the page
    await page.goto('/entries');
    await page.waitForLoadState('networkidle');
    
    // Verify no timer appears
    await expect(page.locator('text=Fasting for')).not.toBeVisible();
    await expect(page.locator('time[datetime]')).not.toBeVisible();
  });

  test('Page load: No timer for yesterday\'s incomplete fast', async ({ page }) => {
    // Create entry for yesterday with lastMealTime only
    await page.click('text=Create New Entry');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    await page.fill('input[name="date"]', yesterdayDate);
    await page.fill('input[name="lastMealTime"]', '22:00');
    
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Create New Entry', { state: 'visible' });
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify no timer appears (yesterday's fast shouldn't show)
    await expect(page.locator('text=Fasting for')).not.toBeVisible();
    await expect(page.locator('time[datetime]')).not.toBeVisible();
  });
});

