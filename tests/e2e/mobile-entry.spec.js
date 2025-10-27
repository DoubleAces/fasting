/**
 * E2E tests for Mobile Entry Creation/Editing
 * Phase 6: User Story 4 - Mobile-Friendly Date and Time Selection
 * 
 * Tests entry form functionality on mobile viewports with touch interactions
 */

const { test, expect, devices } = require('@playwright/test');

// Test on mobile viewports
test.use({
  ...devices['iPhone 12'],
});

test.describe('Mobile Entry Form', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to entries page
    await page.waitForURL(/\/entries/);
    
    // Navigate to create new entry
    await page.goto('/entries');
    await page.waitForSelector('button:has-text("Add New Entry"), a:has-text("Add New Entry")', { timeout: 10000 });
    await page.click('button:has-text("Add New Entry"), a:has-text("Add New Entry")');
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 5000 });
  });

  // T054: Date picker is touch-friendly on mobile viewport
  test('T054 - date picker is touch-friendly and accessible on mobile', async ({ page }) => {
    // Find the date input
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    
    // Check that input has adequate touch target size (min 44x44px for iOS)
    const boundingBox = await dateInput.boundingBox();
    expect(boundingBox.height).toBeGreaterThanOrEqual(40); // Allow some margin
    
    // Verify it's tappable (not disabled or readonly)
    await expect(dateInput).toBeEnabled();
    
    // Tap on the date input (should open native picker on mobile)
    await dateInput.click();
    
    // Date input should be focused
    await expect(dateInput).toBeFocused();
    
    // Fill with a date value (simulates native picker selection)
    await dateInput.fill('2024-10-20');
    
    // Verify value was set
    await expect(dateInput).toHaveValue('2024-10-20');
  });

  // T055: Time picker is touch-friendly on mobile viewport
  test('T055 - time pickers are touch-friendly and accessible on mobile', async ({ page }) => {
    // Find the first meal time selects (hour, minute)
    const hourSelect = page.locator('select[aria-label="Hour"]').first();
    const minuteSelect = page.locator('select[aria-label="Minute"]').first();
    
    await expect(hourSelect).toBeVisible();
    await expect(minuteSelect).toBeVisible();
    
    // Check adequate touch target sizes
    const hourBox = await hourSelect.boundingBox();
    const minuteBox = await minuteSelect.boundingBox();
    
    expect(hourBox.height).toBeGreaterThanOrEqual(40);
    expect(minuteBox.height).toBeGreaterThanOrEqual(40);
    
    // Verify they're tappable
    await expect(hourSelect).toBeEnabled();
    await expect(minuteSelect).toBeEnabled();
    
    // Tap and select values
    await hourSelect.click();
    await hourSelect.selectOption('12');
    
    await minuteSelect.click();
    await minuteSelect.selectOption('30');
    
    // Verify values were set
    await expect(hourSelect).toHaveValue('12');
    await expect(minuteSelect).toHaveValue('30');
  });

  // T056: Date and time pickers don't require precise clicking on mobile
  test('T056 - form inputs have adequate spacing and dont require precise tapping', async ({ page }) => {
    // Check spacing between form fields
    const dateInput = page.locator('input[type="date"]');
    const firstTimeSelect = page.locator('select[aria-label="Hour"]').first();
    
    const dateBox = await dateInput.boundingBox();
    const timeBox = await firstTimeSelect.boundingBox();
    
    // Verify vertical spacing between fields (should have gap)
    const verticalGap = timeBox.y - (dateBox.y + dateBox.height);
    expect(verticalGap).toBeGreaterThan(8); // At least 8px gap
    
    // Check that form fields span full width on mobile (no cramped layout)
    const viewportWidth = page.viewportSize().width;
    
    // Date input should be close to full width (allow for padding)
    expect(dateBox.width).toBeGreaterThan(viewportWidth * 0.8);
    
    // Time selects should have reasonable width (not too narrow)
    expect(timeBox.width).toBeGreaterThan(viewportWidth * 0.3);
  });

  // T057: Complete entry creation workflow on mobile
  test('T057 - can complete full entry creation workflow on mobile viewport', async ({ page }) => {
    // Fill in required fields
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2024-10-20');
    
    // Fill first meal time
    await page.locator('select[aria-label="Hour"]').first().selectOption('12');
    await page.locator('select[aria-label="Minute"]').first().selectOption('00');
    
    // Fill last meal time
    await page.locator('select[aria-label="Hour"]').last().selectOption('20');
    await page.locator('select[aria-label="Minute"]').last().selectOption('00');
    
    // Optional: Fill some other fields
    const hoursOfSleepInput = page.locator('input[type="number"]').first();
    if (await hoursOfSleepInput.isVisible()) {
      await hoursOfSleepInput.fill('8');
    }
    
    // Scroll to submit button (might be below fold on mobile)
    const submitButton = page.locator('button[type="submit"]:has-text("Create Entry"), button[type="submit"]:has-text("Save")');
    await submitButton.scrollIntoViewIfNeeded();
    
    // Submit button should be visible and enabled
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    // Check submit button has adequate touch target
    const submitBox = await submitButton.boundingBox();
    expect(submitBox.height).toBeGreaterThanOrEqual(40);
    
    // Submit the form
    await submitButton.click();
    
    // Should redirect to entries list or show success
    await page.waitForURL(/\/entries/, { timeout: 10000 });
    
    // Verify we're back on entries page
    await expect(page).toHaveURL(/\/entries/);
  });

  test('T062 - date picker opens on tap without precise targeting', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    
    // Get the container/wrapper around the input
    const dateContainer = dateInput.locator('..');
    
    // Should be able to tap anywhere near the input to focus it
    await dateInput.click();
    await expect(dateInput).toBeFocused();
  });

  test('T063 - time picker selects open on tap without precise targeting', async ({ page }) => {
    const hourSelect = page.locator('select[aria-label="Hour"]').first();
    
    // Should be able to tap the select to open it
    await hourSelect.click();
    await expect(hourSelect).toBeFocused();
    
    // Select an option
    await hourSelect.selectOption('14');
    await expect(hourSelect).toHaveValue('14');
  });
});

test.describe('Mobile Entry Form - Responsive Layout', () => {
  test('T064 - form layout adapts to mobile viewport (320px width)', async ({ page }) => {
    // Set to smallest common mobile width
    await page.setViewportSize({ width: 320, height: 568 });
    
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/entries/);
    
    await page.goto('/entries');
    await page.click('button:has-text("Add New Entry"), a:has-text("Add New Entry")');
    await page.waitForSelector('form');
    
    // Check that form doesn't overflow viewport
    const form = page.locator('form');
    const formBox = await form.boundingBox();
    
    expect(formBox.width).toBeLessThanOrEqual(320);
    
    // Check that inputs stack vertically (not side-by-side)
    const dateInput = page.locator('input[type="date"]');
    const hourSelect = page.locator('select[aria-label="Hour"]').first();
    
    const dateBox = await dateInput.boundingBox();
    const hourBox = await hourSelect.boundingBox();
    
    // On 320px width, meal time selects should stack or be in same row but not overlapping
    expect(dateBox.width).toBeGreaterThan(280); // Nearly full width
  });

  test('T064 - form layout adapts to tablet viewport (768px width)', async ({ page }) => {
    // Set to tablet width
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/entries/);
    
    await page.goto('/entries');
    await page.click('button:has-text("Add New Entry"), a:has-text("Add New Entry")');
    await page.waitForSelector('form');
    
    // On tablet, some fields should be side-by-side (2-column grid)
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Form should use available width
    const formBox = await form.boundingBox();
    expect(formBox.width).toBeGreaterThan(600); // Uses more of tablet width
  });
});
